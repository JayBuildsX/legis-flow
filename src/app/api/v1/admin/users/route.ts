import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Extract user from JWT token and check admin permissions
 */
async function getAdminUserFromToken(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string; 
      email: string; 
      username: string; 
    };
    
    // Check if user has admin permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!user) return null;
    
    // Check if user has admin role or admin.access permission
    const hasAdminAccess = user.userRoles.some(userRole => 
      userRole.role.name === 'admin' || 
      userRole.role.rolePermissions.some(rp => rp.permission.code === 'admin.access')
    );
    
    if (!hasAdminAccess) return null;
    
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    console.error('[ADMIN] Token verification failed:', error);
    return null;
  }
}

/**
 * GET /api/v1/admin/users - Get all users with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromToken(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get users with their roles and organizations
    const users = await prisma.user.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        userRoles: {
          include: {
            role: true
          }
        },
        organizations: {
          include: {
            organization: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get total count for pagination
    const totalUsers = await prisma.user.count({ where });

    // Format response
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      phoneNumber: user.phoneNumber,
      lastLogin: user.lastLogin?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      mfaEnabled: user.mfaEnabled,
      role: user.userRoles.length > 0 ? user.userRoles[0].role.name : null,
      organization: user.organizations.length > 0 ? user.organizations[0].organization.name : null
    }));

    // Apply role filter after formatting (since it's not directly in the user table)
    const filteredUsers = role && role !== 'ALL' 
      ? formattedUsers.filter(user => user.role === role)
      : formattedUsers;

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });

  } catch (error) {
    console.error('[ADMIN] Error fetching users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromToken(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, email, password, firstName, lastName, role, organization, status } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        status: status || 'ACTIVE'
      }
    });

    // Assign role if provided
    if (role) {
      const roleRecord = await prisma.role.findUnique({
        where: { name: role }
      });

      if (roleRecord) {
        await prisma.userRole.create({
          data: {
            userId: newUser.id,
            roleId: roleRecord.id,
            assignedBy: adminUser.userId
          }
        });
      }
    }

    // Assign organization if provided
    if (organization) {
      const orgRecord = await prisma.organization.findFirst({
        where: { name: organization }
      });

      if (orgRecord) {
        await prisma.organizationUser.create({
          data: {
            userId: newUser.id,
            organizationId: orgRecord.id,
            position: 'Member'
          }
        });
      }
    }

    console.log(`[ADMIN] Created user: ${newUser.username} by admin: ${adminUser.userId}`);

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        status: newUser.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('[ADMIN] Error creating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
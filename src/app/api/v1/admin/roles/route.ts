import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
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
 * GET /api/v1/admin/roles - Get all roles with their permissions
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

    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt.toISOString(),
      permissions: role.rolePermissions.map(rp => ({
        id: rp.permission.id,
        code: rp.permission.code,
        description: rp.permission.description,
        resourceType: rp.permission.resourceType,
        action: rp.permission.action
      })),
      userCount: role.userRoles.length,
      users: role.userRoles.map(ur => ({
        id: ur.user.id,
        username: ur.user.username,
        email: ur.user.email,
        assignedAt: ur.assignedAt.toISOString()
      }))
    }));

    return NextResponse.json({ roles: formattedRoles });

  } catch (error) {
    console.error('[ADMIN] Error fetching roles:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch roles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/roles - Create a new role
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
    const { name, description, permissions } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 }
      );
    }

    // Create role
    const newRole = await prisma.role.create({
      data: {
        name,
        description: description || null
      }
    });

    // Assign permissions if provided
    if (permissions && Array.isArray(permissions)) {
      for (const permissionCode of permissions) {
        const permission = await prisma.permission.findUnique({
          where: { code: permissionCode }
        });

        if (permission) {
          await prisma.rolePermission.create({
            data: {
              roleId: newRole.id,
              permissionId: permission.id,
              assignedBy: adminUser.userId
            }
          });
        }
      }
    }

    console.log(`[ADMIN] Created role: ${newRole.name} by admin: ${adminUser.userId}`);

    return NextResponse.json({
      message: 'Role created successfully',
      role: {
        id: newRole.id,
        name: newRole.name,
        description: newRole.description
      }
    }, { status: 201 });

  } catch (error) {
    console.error('[ADMIN] Error creating role:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create role',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
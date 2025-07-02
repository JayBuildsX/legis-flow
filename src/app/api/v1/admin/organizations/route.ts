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
 * GET /api/v1/admin/organizations - Get all organizations with their members
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

    const organizations = await prisma.organization.findMany({
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formattedOrganizations = organizations.map(org => ({
      id: org.id,
      name: org.name,
      description: org.description,
      orgType: org.orgType,
      status: org.status,
      createdAt: org.createdAt.toISOString(),
      parent: org.parent,
      children: org.children,
      memberCount: org.users.length,
      members: org.users.map(ou => ({
        id: ou.user.id,
        username: ou.user.username,
        email: ou.user.email,
        name: `${ou.user.firstName || ''} ${ou.user.lastName || ''}`.trim() || ou.user.username,
        position: ou.position,
        isAdmin: ou.isAdmin,
        assignedAt: ou.assignedAt.toISOString()
      }))
    }));

    return NextResponse.json({ organizations: formattedOrganizations });

  } catch (error) {
    console.error('[ADMIN] Error fetching organizations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch organizations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/organizations - Create a new organization
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
    const { name, description, orgType, parentId, status } = body;

    // Validate required fields
    if (!name || !orgType) {
      return NextResponse.json(
        { error: 'Organization name and type are required' },
        { status: 400 }
      );
    }

    // Validate orgType
    const validOrgTypes = ['MINISTRY', 'PARLIAMENT', 'COUNCIL', 'COURT', 'OTHER'];
    if (!validOrgTypes.includes(orgType)) {
      return NextResponse.json(
        { error: 'Invalid organization type' },
        { status: 400 }
      );
    }

    // Check if organization already exists
    const existingOrg = await prisma.organization.findFirst({
      where: { name }
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization with this name already exists' },
        { status: 409 }
      );
    }

    // Validate parent organization if provided
    if (parentId) {
      const parentOrg = await prisma.organization.findUnique({
        where: { id: parentId }
      });

      if (!parentOrg) {
        return NextResponse.json(
          { error: 'Parent organization not found' },
          { status: 400 }
        );
      }
    }

    // Create organization
    const newOrganization = await prisma.organization.create({
      data: {
        name,
        description: description || null,
        orgType,
        parentId: parentId || null,
        status: status || 'ACTIVE'
      }
    });

    console.log(`[ADMIN] Created organization: ${newOrganization.name} by admin: ${adminUser.userId}`);

    return NextResponse.json({
      message: 'Organization created successfully',
      organization: {
        id: newOrganization.id,
        name: newOrganization.name,
        description: newOrganization.description,
        orgType: newOrganization.orgType,
        status: newOrganization.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('[ADMIN] Error creating organization:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create organization',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
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
 * GET /api/v1/admin/users/[id] - Get specific user details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUserFromToken(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const formattedUser = {
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
      roles: user.userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        assignedAt: ur.assignedAt.toISOString()
      })),
      organizations: user.organizations.map(ou => ({
        id: ou.organization.id,
        name: ou.organization.name,
        position: ou.position,
        isAdmin: ou.isAdmin,
        assignedAt: ou.assignedAt.toISOString()
      }))
    };

    return NextResponse.json({ user: formattedUser });

  } catch (error) {
    console.error('[ADMIN] Error fetching user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/admin/users/[id] - Update user details
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUserFromToken(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admins from modifying their own status (safety measure)
    if (id === adminUser.userId && body.status) {
      return NextResponse.json(
        { error: 'Cannot modify your own status' },
        { status: 400 }
      );
    }

    // Update user
    const updateData: any = {};
    
    if (body.status) updateData.status = body.status;
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // Handle role updates
    if (body.role) {
      // Remove existing roles
      await prisma.userRole.deleteMany({
        where: { userId: id }
      });

      // Add new role
      const roleRecord = await prisma.role.findUnique({
        where: { name: body.role }
      });

      if (roleRecord) {
        await prisma.userRole.create({
          data: {
            userId: id,
            roleId: roleRecord.id,
            assignedBy: adminUser.userId
          }
        });
      }
    }

    // Handle organization updates
    if (body.organization) {
      // Remove existing organization memberships
      await prisma.organizationUser.deleteMany({
        where: { userId: id }
      });

      // Add new organization
      const orgRecord = await prisma.organization.findFirst({
        where: { name: body.organization }
      });

      if (orgRecord) {
        await prisma.organizationUser.create({
          data: {
            userId: id,
            organizationId: orgRecord.id,
            position: body.position || 'Member',
            isAdmin: body.isOrgAdmin || false
          }
        });
      }
    }

    console.log(`[ADMIN] Updated user ${id} by admin: ${adminUser.userId}`);

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        status: updatedUser.status
      }
    });

  } catch (error) {
    console.error('[ADMIN] Error updating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admin/users/[id] - Delete user (soft delete by setting status to INACTIVE)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUserFromToken(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admins from deleting themselves
    if (id === adminUser.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Soft delete by setting status to INACTIVE
    await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });

    console.log(`[ADMIN] Deactivated user ${id} by admin: ${adminUser.userId}`);

    return NextResponse.json({
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('[ADMIN] Error deactivating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to deactivate user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
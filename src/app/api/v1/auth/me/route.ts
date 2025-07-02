import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  console.log('ME endpoint called with:', request.headers.get('authorization'));
  
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Unauthorized - missing or invalid auth header');
      return NextResponse.json(
        { message: 'Unauthorized', isAuthenticated: false },
        { status: 401 }
      );
    }
    
    // Get the token
    const token = authHeader.split(' ')[1];
    console.log('Token received:', token.substring(0, 20) + '...');
    
    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      console.log('Token verified for user:', decoded.userId);
    } catch (error) {
      console.log('Token verification failed:', error);
      return NextResponse.json(
        { message: 'Invalid token', isAuthenticated: false },
        { status: 401 }
      );
    }
    
    // Get user from database with roles and permissions
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
    
    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      return NextResponse.json(
        { message: 'User not found', isAuthenticated: false },
        { status: 404 }
      );
    }
    
    // Get user's primary role and collect all permissions
    const primaryRole = user.userRoles.length > 0 ? user.userRoles[0].role.name : 'user';
    const permissions: string[] = [];
    
    // Collect all permissions from all user roles
    user.userRoles.forEach(userRole => {
      userRole.role.rolePermissions.forEach(rolePermission => {
        if (!permissions.includes(rolePermission.permission.code)) {
          permissions.push(rolePermission.permission.code);
        }
      });
    });
    
    console.log('Found user:', user.firstName, 'with role:', primaryRole, 'and permissions:', permissions);
    
    // Return user info
    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        email: user.email,
        role: primaryRole,
        organization: 'Demo Organization',
        permissions: permissions
      },
      isAuthenticated: true
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: 'Authentication error', isAuthenticated: false },
      { status: 500 }
    );
  }
} 
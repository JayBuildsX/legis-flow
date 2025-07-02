import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'login') {
      return await handleLogin(body);
    } else if (action === 'register') {
      return await handleRegister(body);
    } else if (action === 'logout') {
      return handleLogout();
    } else {
      return NextResponse.json(
        { message: 'Action not supported' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: 'Authentication error' },
      { status: 500 }
    );
  }
}

async function handleLogin(body: { email: string; password: string }) {
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email and password are required' },
      { status: 400 }
    );
  }

  try {
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password against passwordHash field
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user's primary role
    const primaryRole = user.userRoles.length > 0 ? user.userRoles[0].role.name : 'user';

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: primaryRole
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        email: user.email,
        role: primaryRole,
        organization: 'Demo Organization'
      },
      token,
      token_type: 'Bearer',
      expires_in: 86400
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Database error' },
      { status: 500 }
    );
  }
}

async function handleRegister(body: { name: string; email: string; password: string; organization?: string }) {
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: 'Name, email and password are required' },
      { status: 400 }
    );
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Split name into firstName and lastName
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create username from email
    const username = email.split('@')[0];

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        status: 'ACTIVE'
      }
    });

    // Get default role (if exists)
    const defaultRole = await prisma.role.findFirst({
      where: { name: 'user' }
    });

    // Assign default role if it exists
    if (defaultRole) {
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          roleId: defaultRole.id,
          assignedBy: newUser.id
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        role: defaultRole?.name || 'user'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: `${newUser.firstName} ${newUser.lastName}`.trim(),
        email: newUser.email,
        role: defaultRole?.name || 'user',
        organization: null
      },
      token,
      token_type: 'Bearer',
      expires_in: 86400
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}

function handleLogout() {
  return NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );
} 
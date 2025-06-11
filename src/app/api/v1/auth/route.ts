import { NextRequest, NextResponse } from 'next/server';
import { User, getUsers, getUserByEmail, addUser } from '@/lib/users';

export async function POST(request: NextRequest) {
  console.log('Auth POST called with action:', request.headers.get('content-type'));
  
  try {
    const body = await request.json();
    const { action } = body;
    console.log('Auth action:', action);

    if (action === 'login') {
      return handleLogin(body);
    } else if (action === 'register') {
      return handleRegister(body);
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

function handleLogin(body: { email: string; password: string }) {
  const { email, password } = body;
  console.log('Login attempt for:', email);

  // Find user by email
  const user = getUserByEmail(email);
  
  if (!user) {
    console.log('User not found:', email);
  }

  // Check if user exists and password matches
  if (!user || user.password !== password) {
    console.log('Invalid credentials for:', email);
    return NextResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 }
    );
  }

  console.log('User authenticated:', user.name, 'with ID:', user.id);
  
  // Create more secure token with expiration
  const timestamp = Date.now();
  const expiration = timestamp + (3600 * 1000); // 1 hour from now
  const token = `mock-jwt-token-for-user-${user.id}-exp-${expiration}-${timestamp}`;
  console.log('Generated token:', token);
  
  // Return user info and token (exclude password)
  const { password: _, ...userWithoutPassword } = user;
  
  console.log('Returning user data:', userWithoutPassword);
  console.log('With permissions:', user.permissions || []);
  
  return NextResponse.json({
    user: userWithoutPassword,
    access_token: token,
    token_type: 'Bearer',
    expires_in: 3600
  });
}

function handleRegister(body: { name: string; email: string; password: string; organization?: string }) {
  const { name, email, password, organization } = body;
  console.log('Registration attempt for:', email);

  // Check if required fields are provided
  if (!name || !email || !password) {
    console.log('Missing required fields for registration');
    return NextResponse.json(
      { message: 'Name, email and password are required' },
      { status: 400 }
    );
  }

  try {
    // Create and add new user
    const newUser = addUser({
      id: '',  // Will be auto-generated
      name,
      email,
      password,
      role: 'viewer', // Default role
      organization: organization || 'Unknown',
      permissions: ['documents.view'], // Default permissions
    });
    
    console.log('User registered successfully:', newUser.name, 'with ID:', newUser.id);
    console.log('User permissions:', newUser.permissions);
    
    // Create more secure token with expiration
    const timestamp = Date.now();
    const expiration = timestamp + (3600 * 1000); // 1 hour from now
    const token = `mock-jwt-token-for-user-${newUser.id}-exp-${expiration}-${timestamp}`;
    console.log('Generated token for new user:', token);

    // Return user info (exclude password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    console.log('Returning new user data:', userWithoutPassword);
    
    return NextResponse.json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check if it's the "user already exists" error
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { message: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}

function handleLogout() {
  // In a real app, this would invalidate the token
  console.log('User logged out');
  
  return NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );
} 
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  organization: string;
  permissions: string[];
}

// Convert Prisma user to our User interface
function formatUser(prismaUser: any): User {
  return {
    id: prismaUser.id,
    name: `${prismaUser.firstName || ''} ${prismaUser.lastName || ''}`.trim() || prismaUser.username || prismaUser.email,
    email: prismaUser.email,
    password: '', // Never return the actual password hash
    role: prismaUser.status === 'ACTIVE' ? 'user' : 'pending',
    organization: 'Default Organization', // You can expand this later with actual organization logic
    permissions: ['documents.view', 'documents.create'] // Basic permissions
  };
}

export async function getUsers(): Promise<User[]> {
  try {
    const prismaUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true
      }
    });

    return prismaUsers.map(formatUser);
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return default admin user as fallback
    return [{
      id: 'user-001',
      name: 'Admin User',
      email: 'admin@example.com',
      password: '',
      role: 'admin',
      organization: 'Default Organization',
      permissions: ['documents.view', 'documents.create', 'documents.edit', 'documents.delete', 'admin.all']
    }];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const prismaUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true
      }
    });

    if (!prismaUser) {
      return null;
    }

    return formatUser(prismaUser);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

// Synchronous versions for backward compatibility (these will need to be updated to async)
export function getUsersSync(): User[] {
  // This is a temporary fallback for immediate use
  return [{
    id: 'user-001',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '',
    role: 'admin',
    organization: 'Default Organization',
    permissions: ['documents.view', 'documents.create', 'documents.edit', 'documents.delete', 'admin.all']
  }];
}

export function getUserByIdSync(id: string): User | null {
  const users = getUsersSync();
  return users.find(user => user.id === id) || null;
} 
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: 'user-001' },
          { email: 'admin@legisflow.com' },
        ]
      }
    });

    if (existingUser) {
      console.log('Default user already exists:', existingUser.id);
      return existingUser;
    }

    // Create default user
    const user = await prisma.user.create({
      data: {
        id: 'user-001',
        email: 'admin@legisflow.com',
        name: 'Admin User',
        password: 'hashed_password_would_go_here', // In production, use proper password hashing
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('Created default user:', user);
    return user;
  } catch (error) {
    console.error('Error creating default user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 
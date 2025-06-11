const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    // Update the default user
    const updatedUser = await prisma.user.update({
      where: { id: 'user-001' },
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@legisflow.com',
      }
    });

    console.log('Updated default user:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error updating default user:', error);
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
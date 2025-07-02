const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking database...');
    
    // Check users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.id}: ${user.firstName} ${user.lastName} (${user.email})`);
    });
    
    // Check organizations
    const orgs = await prisma.organization.findMany();
    console.log(`\nFound ${orgs.length} organizations:`);
    orgs.forEach(org => {
      console.log(`- ${org.id}: ${org.name}`);
    });
    
    // Check workflows
    const workflows = await prisma.workflow.findMany();
    console.log(`\nFound ${workflows.length} workflows:`);
    workflows.forEach(wf => {
      console.log(`- ${wf.id}: ${wf.name}`);
    });
    
    // Check document types
    const docTypes = await prisma.documentType.findMany();
    console.log(`\nFound ${docTypes.length} document types:`);
    docTypes.forEach(dt => {
      console.log(`- ${dt.id}: ${dt.name} (workflow: ${dt.workflowId})`);
    });
    
    // Check documents
    const docs = await prisma.document.findMany();
    console.log(`\nFound ${docs.length} documents:`);
    docs.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.title} (${doc.status})`);
    });
    
    console.log('\nDatabase check complete!');
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 
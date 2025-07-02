const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function checkDocumentTypes() {
  try {
    console.log('📋 Checking Document Types...\n');
    
    const documentTypes = await prisma.documentType.findMany();
    
    console.log(`Found ${documentTypes.length} document types:`);
    documentTypes.forEach(type => {
      console.log(`  - ID: ${type.id}, Name: ${type.name}`);
    });
    
    // Check if there are any templates
    const templates = await prisma.documentTemplate.findMany({
      include: {
        documentType: true
      }
    });
    
    console.log(`\nFound ${templates.length} templates:`);
    templates.forEach(template => {
      console.log(`  - ${template.name} (Type: ${template.documentType?.name || 'Unknown'})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

checkDocumentTypes(); 
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    // First check if we have any document types
    const existingType = await prisma.documentType.findFirst();
    if (existingType) {
      console.log('Document type already exists:', existingType.id);
      return existingType;
    }

    // Create a default workflow if needed
    let workflow = await prisma.workflow.findFirst();
    if (!workflow) {
      workflow = await prisma.workflow.create({
        data: {
          name: "Standard Document Workflow",
          description: "Default workflow for all document types",
          createdById: "user-001",
          updatedById: "user-001",
          status: "ACTIVE",
          version: 1
        }
      });
      console.log('Created default workflow:', workflow.id);
    }

    // Create default document types
    const documentTypes = [
      {
        name: "Projet de loi",
        description: "Document législatif proposé par le gouvernement",
        workflowId: workflow.id
      },
      {
        name: "Décret",
        description: "Acte réglementaire signé par le Premier ministre",
        workflowId: workflow.id
      },
      {
        name: "Arrêté", 
        description: "Décision administrative signée par un ministre",
        workflowId: workflow.id
      },
      {
        name: "Circulaire",
        description: "Instruction administrative interne",
        workflowId: workflow.id
      },
      {
        name: "Note de service",
        description: "Communication interne",
        workflowId: workflow.id
      }
    ];

    for (const type of documentTypes) {
      const newType = await prisma.documentType.create({
        data: {
          name: type.name,
          description: type.description,
          workflow: {
            connect: { id: workflow.id }
          }
        }
      });
      console.log('Created document type:', newType.id, newType.name);
    }

    console.log('Default document types created successfully');
  } catch (error) {
    console.error('Error creating default document types:', error);
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
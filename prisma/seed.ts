import { PrismaClient, Confidentiality, DocumentStatus } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  try {
    // Create a workflow first (required for document types)
    const workflow = await prisma.workflow.create({
      data: {
        name: 'Standard Document Workflow',
        description: 'Default workflow for documents',
        createdById: 'user-001',
        updatedById: 'user-001',
        isActive: true,
        version: 1
      }
    });
    
    console.log(`Created workflow: ${workflow.name}`);

    // Create a sample user
    const user = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        id: 'user-001',
        username: 'admin',
        email: 'admin@example.com',
        passwordHash: '$2a$12$jLwOHFgMFlwjUvDWEwuZROiYeb9/KdSvvVKLgzICH7D66D5YAxsjS', // password: admin123
        firstName: 'Admin',
        lastName: 'User',
        status: 'ACTIVE'
      },
    });
    
    console.log(`Created/updated user: ${user.firstName} ${user.lastName} (${user.email})`);

    // Create a sample organization
    const organization = await prisma.organization.upsert({
      where: { id: 'org-001' },
      update: {},
      create: {
        id: 'org-001',
        name: 'Demo Organization',
        description: 'Organization for demonstration purposes',
        orgType: 'OTHER',
        status: 'ACTIVE'
      },
    });
    
    console.log(`Created/updated organization: ${organization.name}`);

    // Clear existing document types (useful for re-running seeds)
    await prisma.documentType.deleteMany({});
    
    // Create document types
    const documentTypes = await Promise.all([
      prisma.documentType.create({
        data: {
          name: 'Legislation Draft',
          description: 'Initial draft of legislative document',
          workflowId: workflow.id
        },
      }),
      prisma.documentType.create({
        data: {
          name: 'Policy Brief',
          description: 'Brief summary of policy implications',
          workflowId: workflow.id
        },
      }),
      prisma.documentType.create({
        data: {
          name: 'Amendment',
          description: 'Proposed changes to existing legislation',
          workflowId: workflow.id
        },
      }),
      prisma.documentType.create({
        data: {
          name: 'Legal Opinion',
          description: 'Expert legal analysis and opinion',
          workflowId: workflow.id
        },
      }),
      prisma.documentType.create({
        data: {
          name: 'Report',
          description: 'Detailed analysis or findings',
          workflowId: workflow.id
        },
      }),
    ]);
    
    console.log(`Created ${documentTypes.length} document types`);

    // Create some sample documents
    const documents = await Promise.all([
      prisma.document.create({
        data: {
          title: 'Sample Legislation Draft',
          referenceNumber: 'DOC-2023-001',
          documentTypeId: documentTypes[0].id,
          status: DocumentStatus.DRAFT,
          version: 1,
          language: 'en',
          createdById: user.id,
          lastModifiedById: user.id,
          ownerOrganizationId: organization.id,
          confidentiality: Confidentiality.PUBLIC,
          keywords: ['sample', 'legislation', 'draft'],
          metadata: {
            category: 'LEGISLATIVE',
            tags: ['example', 'seed-data']
          },
          primaryFormat: 'docx',
          fileCount: 0,
          totalSize: 0,
          textExtracted: false
        },
      }),
      prisma.document.create({
        data: {
          title: 'Sample Policy Brief',
          referenceNumber: 'DOC-2023-002',
          documentTypeId: documentTypes[1].id,
          status: DocumentStatus.DRAFT,
          version: 1,
          language: 'en',
          createdById: user.id,
          lastModifiedById: user.id,
          ownerOrganizationId: organization.id,
          confidentiality: Confidentiality.RESTRICTED,
          keywords: ['policy', 'brief', 'analysis'],
          metadata: {
            category: 'POLICY',
            tags: ['example', 'seed-data']
          },
          primaryFormat: 'pdf',
          fileCount: 0,
          totalSize: 0,
          textExtracted: false
        },
      }),
    ]);
    
    console.log(`Created ${documents.length} sample documents`);
  } catch (error) {
    console.error("Error in seed script:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
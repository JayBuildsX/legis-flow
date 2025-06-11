import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, DocumentStatus, Confidentiality } from '@/generated/prisma';

// Initialize Prisma client
let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function GET(req: NextRequest) {
  try {
    console.log('API: Seeding a test document');
    const db = getPrismaClient();

    // Find or create a document type
    let documentType = await db.documentType.findFirst();
    
    if (!documentType) {
      // No document type exists, create one first
      // We need to create a workflow first
      const workflow = await db.workflow.create({
        data: {
          name: "Default Workflow",
          description: "Auto-generated default workflow",
          createdById: "system",
          updatedById: "system",
          version: 1,
          steps: {
            create: [
              {
                name: "Draft",
                description: "Initial draft step",
                stepOrder: 1,
                stepType: "EDITION",
                isMandatory: true
              }
            ]
          }
        }
      });

      documentType = await db.documentType.create({
        data: {
          name: "Test Document Type",
          description: "Auto-generated test document type",
          workflowId: workflow.id
        }
      });
    }

    // Find or create a user
    let user = await db.user.findFirst();
    
    if (!user) {
      user = await db.user.create({
        data: {
          username: "testuser",
          email: "test@example.com",
          passwordHash: "fake_hash",
          firstName: "Test",
          lastName: "User",
          status: "ACTIVE"
        }
      });
    }

    // Find or create an organization
    let organization = await db.organization.findFirst();
    
    if (!organization) {
      organization = await db.organization.create({
        data: {
          name: "Test Organization",
          description: "Auto-generated test organization",
          orgType: "OTHER",
          status: "ACTIVE"
        }
      });
    }

    // Create a test document
    const document = await db.document.create({
      data: {
        title: "Test Document",
        referenceNumber: `TEST-${Date.now()}`,
        documentTypeId: documentType.id,
        language: "fr",
        createdById: user.id,
        lastModifiedById: user.id,
        ownerOrganizationId: organization.id,
        status: DocumentStatus.IN_PROGRESS,
        confidentiality: Confidentiality.PUBLIC,
        keywords: ["test", "demo", "example"],
        metadata: {},
      }
    });

    return NextResponse.json({
      success: true,
      message: "Test document created successfully",
      document
    });
  } catch (error) {
    console.error('Error seeding test document:', error);
    return NextResponse.json(
      { error: 'Failed to seed test document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
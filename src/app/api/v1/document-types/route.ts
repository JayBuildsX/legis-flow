import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

// Mock data for document types
const mockDocumentTypes = [
  {
    id: "dt-001",
    name: "Legislation Draft",
    description: "Initial draft of legislative document",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    documentCount: 12
  },
  {
    id: "dt-002",
    name: "Policy Brief",
    description: "Brief summary of policy implications",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    documentCount: 8
  },
  {
    id: "dt-003",
    name: "Amendment",
    description: "Proposed changes to existing legislation",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    documentCount: 15
  },
  {
    id: "dt-004",
    name: "Legal Opinion",
    description: "Expert legal analysis and opinion",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    documentCount: 6
  },
  {
    id: "dt-005",
    name: "Report",
    description: "Detailed analysis or findings",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    documentCount: 9
  }
];

// Initialize Prisma client
let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function GET(req: NextRequest) {
  console.log('API: Fetching document types');
  const db = getPrismaClient();
  
  try {
    // Get document types from database
    const documentTypes = await db.documentType.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`Successfully fetched ${documentTypes.length} document types from database`);
    
    return NextResponse.json({
      success: true,
      data: documentTypes,
      isMockData: false
    });
  } catch (error) {
    console.error('Error fetching document types:', error);
    
    // Return mock document types as fallback
    const mockDocumentTypes = [
      { id: 'dt1', name: 'Projet de loi', description: 'Document législatif proposé par le gouvernement' },
      { id: 'dt2', name: 'Décret', description: 'Acte réglementaire signé par le Premier ministre' },
      { id: 'dt3', name: 'Arrêté', description: 'Décision administrative signée par un ministre' },
      { id: 'dt4', name: 'Circulaire', description: 'Instruction administrative interne' },
      { id: 'dt5', name: 'Note de service', description: 'Communication interne' }
    ];
    
    return NextResponse.json({
      success: true,
      data: mockDocumentTypes,
      isMockData: true
    });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Document type name is required' },
        { status: 400 }
      );
    }
    
    // Try to use database
    const db = getPrismaClient();
    if (db) {
      try {
        console.log('Creating document type in database');
        
        // First, get the first workflow from the database
        // This is a workaround - in production, you'd get the workflow ID from the request
        const workflow = await db.workflow.findFirst();
        if (!workflow) {
          console.error('No workflow found in database');
          // Create a default workflow if none exists
          const newWorkflow = await db.workflow.create({
            data: {
              name: "Standard Document Workflow",
              description: "Default workflow for all document types",
              createdById: "user-001", // This should be the authenticated user's ID
              updatedById: "user-001"  // This should be the authenticated user's ID
            }
          });
          
          // Create the document type with the new workflow
          const newType = await db.documentType.create({
            data: {
              name: body.name,
              description: body.description || null,
              workflow: {
                connect: { id: newWorkflow.id }
              }
            }
          });
          
          return NextResponse.json({
            data: {
              id: newType.id,
              name: newType.name,
              description: newType.description,
              createdAt: newType.createdAt.toISOString(),
              updatedAt: newType.updatedAt.toISOString(),
              workflowId: newType.workflowId,
              documentCount: 0
            },
            status: 201,
            message: 'Document type created successfully',
            isMockData: false
          }, { status: 201 });
        }
        
        // Create the document type with the existing workflow
        const newType = await db.documentType.create({
          data: {
            name: body.name,
            description: body.description || null,
            workflow: {
              connect: { id: workflow.id }
            }
          }
        });
        
        return NextResponse.json({
          data: {
            id: newType.id,
            name: newType.name,
            description: newType.description,
            createdAt: newType.createdAt.toISOString(),
            updatedAt: newType.updatedAt.toISOString(),
            workflowId: newType.workflowId,
            documentCount: 0
          },
          status: 201,
          message: 'Document type created successfully',
          isMockData: false
        }, { status: 201 });
      } catch (error) {
        console.error('Error creating document type in database:', error);
      }
    }
    
    console.log('Using mock data for document type creation');
    
    // Return mock response
    const newType = {
      id: `dt-${Date.now().toString().slice(-6)}`,
      name: body.name,
      description: body.description || null,
      workflowId: 'wf-default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentCount: 0
    };
    
    return NextResponse.json({
      data: newType,
      status: 201,
      message: 'Document type created successfully (mock data)',
      isMockData: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error in document-types POST route:', error);
    return NextResponse.json(
      { error: 'Failed to create document type' },
      { status: 500 }
    );
  }
} 
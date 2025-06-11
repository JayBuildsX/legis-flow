import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, WorkflowStatus } from '@/generated/prisma';

// Initialize Prisma Client
let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

/**
 * GET handler to retrieve all workflows
 */
export async function GET(request: NextRequest) {
  console.log('API: Fetching workflows');
  const db = getPrismaClient();
  
  try {
    // Get workflows from database with counts
    const workflows = await db.workflow.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            steps: true,
            documentTypes: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Format workflows for API response
    const formattedWorkflows = workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      steps: workflow._count.steps,
      documentsCount: workflow._count.documentTypes,
      version: workflow.version,
      createdAt: workflow.createdAt.toISOString(),
      updatedAt: workflow.updatedAt.toISOString(),
      isActive: workflow.isActive
    }));
    
    console.log(`Successfully fetched ${workflows.length} workflows from database`);
    
    return NextResponse.json({
      success: true,
      data: formattedWorkflows,
      isMockData: false
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    
    // Return mock workflows as fallback
    const mockWorkflows = [
      {
        id: 'wf1',
        name: 'Projet de loi standard',
        description: 'Workflow législatif complet avec examen parlementaire',
        steps: 8,
        documentsCount: 12
      },
      {
        id: 'wf2',
        name: 'Décret simple',
        description: 'Procédure réglementaire simplifiée',
        steps: 5,
        documentsCount: 24
      },
      {
        id: 'wf3',
        name: 'Arrêté ministériel',
        description: 'Circuit de validation interne et signature',
        steps: 4,
        documentsCount: 18
      },
      {
        id: 'wf4',
        name: 'Circulaire administrative',
        description: 'Diffusion et publication interne',
        steps: 3,
        documentsCount: 31
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: mockWorkflows,
      isMockData: true
    });
  }
}

/**
 * POST handler to create a new workflow
 */
export async function POST(request: NextRequest) {
  console.log('API: Creating new workflow');
  
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // In a real implementation, you'd extract the user ID from a verified JWT token
    const userId = 'user-001';
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Workflow name is required' },
        { status: 400 }
      );
    }
    
    const db = getPrismaClient();
    
    // Create workflow in database
    const workflow = await db.workflow.create({
      data: {
        name: body.name,
        description: body.description || null,
        createdById: userId,
        updatedById: userId,
        isActive: body.isActive !== undefined ? body.isActive : true,
        version: 1,
        expectedDuration: body.expectedDuration || null
      }
    });
    
    // Create steps if provided
    if (body.steps && Array.isArray(body.steps) && body.steps.length > 0) {
      for (const step of body.steps) {
        await db.workflowStep.create({
          data: {
            workflowId: workflow.id,
            name: step.name,
            description: step.description || null,
            stepOrder: step.order,
            stepType: step.type,
            expectedDuration: step.expectedDuration,
            isMandatory: step.isMandatory !== undefined ? step.isMandatory : true,
            requiresSignature: step.requiresSignature || false,
            requiresComment: step.requiresComment || false
          }
        });
      }
    }
    
    // Create transitions if provided
    if (body.transitions && Array.isArray(body.transitions) && body.transitions.length > 0) {
      for (const transition of body.transitions) {
        await db.workflowTransition.create({
          data: {
            workflowId: workflow.id,
            fromStepId: transition.fromStepId,
            toStepId: transition.toStepId,
            transitionCondition: transition.condition || null,
            isAutomatic: transition.isAutomatic || false
          }
        });
      }
    }
    
    console.log(`Successfully created workflow: ${workflow.id}`);
    
    return NextResponse.json({
      success: true,
      data: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        createdAt: workflow.createdAt.toISOString(),
        updatedAt: workflow.updatedAt.toISOString(),
        isActive: workflow.isActive,
        version: workflow.version
      },
      isMockData: false
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    
    // Return error response
    return NextResponse.json({
      success: false,
      error: 'Failed to create workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
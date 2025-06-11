import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

// Initialize Prisma client
let prisma: PrismaClient | null = null;

/**
 * Function to get or create the Prisma client
 */
function getPrismaClient() {
  if (!prisma) {
    try {
      console.log('Initializing Prisma client for workflow details');
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize Prisma client:', error);
      return null;
    }
  }
  return prisma;
}

/**
 * GET handler to retrieve a workflow by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;
    console.log(`Fetching workflow details for ID: ${workflowId}`);
    
    // Try to get workflow from database
    const db = getPrismaClient();
    if (db) {
      try {
        // Get workflow with its steps, transitions, and document types
        const workflow = await db.workflow.findUnique({
          where: { id: workflowId },
          include: {
            steps: {
              orderBy: {
                stepOrder: 'asc'
              }
            },
            transitions: true,
            documentTypes: {
              select: {
                id: true,
                name: true,
                description: true,
                _count: {
                  select: {
                    documents: true
                  }
                }
              }
            },
            // Get documents using this workflow via document types
            documentTypes: {
              include: {
                documents: {
                  select: {
                    id: true,
                    title: true,
                    status: true,
                    currentWorkflowStepId: true
                  },
                  take: 10 // Limit to 10 most recent documents
                }
              }
            }
          }
        });
        
        if (!workflow) {
          return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
          );
        }
        
        // Get information about the current step for each document
        const documents = [];
        for (const docType of workflow.documentTypes) {
          for (const doc of docType.documents) {
            // If document has a current workflow step, get its name
            let currentStepName = "Unknown";
            if (doc.currentWorkflowStepId) {
              const step = workflow.steps.find(s => s.id === doc.currentWorkflowStepId);
              if (step) {
                currentStepName = step.name;
              }
            }
            
            documents.push({
              id: doc.id,
              title: doc.title,
              status: doc.status,
              currentStep: currentStepName
            });
          }
        }
        
        // Format the response
        const formattedWorkflow = {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          version: workflow.version,
          createdAt: workflow.createdAt.toISOString(),
          updatedAt: workflow.updatedAt.toISOString(),
          createdBy: "User", // In a real app, this would be fetched
          updatedBy: "User", // In a real app, this would be fetched
          isActive: workflow.isActive,
          expectedDuration: workflow.expectedDuration,
          steps: workflow.steps.map(step => ({
            id: step.id,
            name: step.name,
            description: step.description,
            stepOrder: step.stepOrder,
            stepType: step.stepType,
            isMandatory: step.isMandatory,
            expectedDuration: step.expectedDuration,
            requiresSignature: step.requiresSignature,
            requiresComment: step.requiresComment
          })),
          transitions: workflow.transitions.map(transition => ({
            id: transition.id,
            fromStepId: transition.fromStepId,
            toStepId: transition.toStepId,
            isAutomatic: transition.isAutomatic,
            transitionCondition: transition.transitionCondition
          })),
          documentTypes: workflow.documentTypes.map(type => type.name),
          documents: documents
        };
        
        return NextResponse.json({
          data: formattedWorkflow,
          status: 200,
          message: 'Workflow retrieved successfully',
          isMockData: false
        });
      } catch (error) {
        console.error('Error fetching workflow from database:', error);
      }
    }
    
    // If database fetch failed, return error
    return NextResponse.json(
      { error: 'Failed to retrieve workflow' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in workflow GET route:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve workflow', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update a workflow
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const workflowId = params.id;
    const body = await request.json();
    
    // Try to update workflow in database
    const db = getPrismaClient();
    if (db) {
      try {
        // Check if workflow exists
        const existingWorkflow = await db.workflow.findUnique({
          where: { id: workflowId }
        });
        
        if (!existingWorkflow) {
          return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
          );
        }
        
        // Update workflow
        const updatedWorkflow = await db.workflow.update({
          where: { id: workflowId },
          data: {
            name: body.name,
            description: body.description,
            isActive: body.isActive,
            version: existingWorkflow.version + 1, // Increment version
            updatedById: 'user-001', // This should be dynamic from the auth token
            expectedDuration: body.expectedDuration
          }
        });
        
        // If steps are provided, update them
        if (body.steps && Array.isArray(body.steps)) {
          // Delete existing steps and transitions (cascade will handle transitions)
          await db.workflowStep.deleteMany({
            where: { workflowId }
          });
          
          // Create new steps
          const newSteps = await Promise.all(body.steps.map(async (step: any, index: number) => {
            return db.workflowStep.create({
              data: {
                workflowId,
                name: step.name,
                description: step.description || '',
                stepOrder: index + 1,
                stepType: step.stepType,
                isMandatory: step.isMandatory ?? true,
                requiresSignature: step.requiresSignature ?? false,
                requiresComment: step.requiresComment ?? false,
                expectedDuration: step.expectedDuration
              }
            });
          }));
          
          // Create new transitions if provided
          if (body.transitions && Array.isArray(body.transitions)) {
            await Promise.all(body.transitions.map(async (transition: any) => {
              const fromStep = newSteps.find(s => s.id === transition.fromStepId);
              const toStep = newSteps.find(s => s.id === transition.toStepId);
              
              if (fromStep && toStep) {
                return db.workflowTransition.create({
                  data: {
                    workflowId,
                    fromStepId: fromStep.id,
                    toStepId: toStep.id,
                    isAutomatic: transition.isAutomatic ?? false,
                    transitionCondition: transition.transitionCondition
                  }
                });
              }
            }));
          }
        }
        
        return NextResponse.json({
          data: {
            id: updatedWorkflow.id,
            name: updatedWorkflow.name,
            description: updatedWorkflow.description,
            version: updatedWorkflow.version,
            isActive: updatedWorkflow.isActive
          },
          status: 200,
          message: 'Workflow updated successfully'
        });
      } catch (error) {
        console.error('Error updating workflow in database:', error);
        return NextResponse.json(
          { error: 'Failed to update workflow', details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }
    
    // If database is not available, return error
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error in workflow PUT route:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, AssignmentStatus } from '@/generated/prisma';

// Initialize Prisma Client
let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function GET(req: NextRequest) {
  console.log('API: Fetching tasks');
  const db = getPrismaClient();
  
  try {
    // Get current user ID from authentication (placeholder - implement with real auth)
    const userId = 'current-user-id';
    
    // Get tasks from database using StepAssignment model
    const tasks = await db.stepAssignment.findMany({
      where: {
        assignedToId: userId,
        status: AssignmentStatus.PENDING
      },
      include: {
        documentWorkflow: {
          include: {
            document: {
              select: {
                id: true,
                title: true,
                referenceNumber: true
              }
            }
          }
        },
        step: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    });
    
    console.log(`Successfully fetched ${tasks.length} tasks from database`);
    
    // Format tasks for API response
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.step.name || 'Task',
      description: task.comment || task.step.description || '',
      status: task.status,
      priority: 'medium', // Derive priority based on due date or other factors
      dueDate: task.dueDate?.toISOString(),
      documentId: task.documentWorkflow.document.id,
      documentTitle: task.documentWorkflow.document.title || 'Unknown Document',
      documentReference: task.documentWorkflow.document.referenceNumber
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedTasks,
      isMockData: false
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
    // Return mock tasks as fallback
    const mockTasks = [
      {
        id: 't1',
        title: 'Review Draft Bill',
        description: 'Initial review of draft legislation',
        status: 'PENDING',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        documentId: 'd1',
        documentTitle: 'Finance Bill 2024',
        documentReference: 'FB-2024-001'
      },
      {
        id: 't2',
        title: 'Approve Cabinet Memo',
        description: 'Final approval needed for cabinet memorandum',
        status: 'PENDING',
        priority: 'medium',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        documentId: 'd2',
        documentTitle: 'Environmental Policy Update',
        documentReference: 'EPU-2024-005'
      },
      {
        id: 't3',
        title: 'Sign Ministry Order',
        description: 'Signature required for ministry order',
        status: 'PENDING',
        priority: 'low',
        dueDate: new Date(Date.now() + 259200000).toISOString(),
        documentId: 'd3',
        documentTitle: 'Education Department Restructuring',
        documentReference: 'EDR-2024-012'
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: mockTasks,
      isMockData: true
    });
  }
} 
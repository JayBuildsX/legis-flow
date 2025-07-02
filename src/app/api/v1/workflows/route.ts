import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * GET handler to retrieve all workflows
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    try {
      const workflows = await prisma.workflow.findMany({
        include: {
          steps: true,
          documentTypes: true,
          _count: {
            select: { documentWorkflows: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      });

      const totalCount = await prisma.workflow.count();

      const formattedWorkflows = workflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        steps: workflow.steps.length,
        documentsCount: workflow._count.documentWorkflows,
        isActive: workflow.isActive,
        version: workflow.version,
        createdAt: workflow.createdAt.toISOString(),
        updatedAt: workflow.updatedAt.toISOString()
      }));

      return NextResponse.json({
        success: true,
        data: formattedWorkflows,
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        isMockData: false
      });

    } catch (error) {
      console.error('Error fetching workflows from database:', error);
      
      // Return empty response instead of mock data
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        isMockData: false,
        message: 'Database unavailable. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Error in workflows route:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve workflows' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create a new workflow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Workflow name is required' },
        { status: 400 }
      );
    }

    try {
      const newWorkflow = await prisma.workflow.create({
        data: {
          name: body.name,
          description: body.description || '',
          createdById: 'admin-user-id', // Should come from JWT token
          updatedById: 'admin-user-id',
          expectedDuration: body.expectedDuration || null
        },
        include: {
          steps: true,
          documentTypes: true
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          id: newWorkflow.id,
          name: newWorkflow.name,
          description: newWorkflow.description,
          steps: newWorkflow.steps.length,
          documentsCount: 0,
          isActive: newWorkflow.isActive,
          version: newWorkflow.version,
          createdAt: newWorkflow.createdAt.toISOString(),
          updatedAt: newWorkflow.updatedAt.toISOString()
        },
        isMockData: false,
        message: 'Workflow created successfully'
      }, { status: 201 });

    } catch (error) {
      console.error('Error creating workflow:', error);
      return NextResponse.json(
        { error: 'Failed to create workflow' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
} 
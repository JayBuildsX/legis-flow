import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const templateId = params.id;

    if (!templateId) {
      return NextResponse.json(
        { message: 'Template ID is required' },
        { status: 400 }
      );
    }

    try {
      const template = await prisma.document.findUnique({
        where: { 
          id: templateId,
          isTemplate: true
        },
        include: {
          documentType: {
            select: {
              id: true,
              name: true
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!template) {
        return NextResponse.json(
          { message: 'Template not found' },
          { status: 404 }
        );
      }

      const formattedTemplate = {
        id: template.id,
        name: template.title,
        description: template.metadata ? (template.metadata as any).description : '',
        documentTypeId: template.documentTypeId,
        content: template.metadata ? (template.metadata as any).content : '',
        format: template.primaryFormat || 'markdown',
        createdAt: template.creationDate.toISOString(),
        updatedAt: template.lastModifiedDate.toISOString(),
        createdBy: {
          id: template.createdBy.id,
          name: `${template.createdBy.firstName || ''} ${template.createdBy.lastName || ''}`.trim() || template.createdBy.email
        },
        metadata: template.metadata
      };

      return NextResponse.json({
        data: formattedTemplate,
        status: 200,
        message: 'Template retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching template from database:', error);
      return NextResponse.json(
        { message: 'Database error. Please try again later.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in template detail route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const templateId = params.id;
    const body = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { message: 'Template ID is required' },
        { status: 400 }
      );
    }

    try {
      const updatedTemplate = await prisma.document.update({
        where: { 
          id: templateId,
          isTemplate: true
        },
        data: {
          title: body.name,
          primaryFormat: body.format || 'markdown',
          metadata: {
            description: body.description,
            content: body.content,
            ...(body.metadata || {})
          },
          lastModifiedDate: new Date()
        },
        include: {
          documentType: {
            select: {
              id: true,
              name: true
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      const formattedTemplate = {
        id: updatedTemplate.id,
        name: updatedTemplate.title,
        description: updatedTemplate.metadata ? (updatedTemplate.metadata as any).description : '',
        documentTypeId: updatedTemplate.documentTypeId,
        content: updatedTemplate.metadata ? (updatedTemplate.metadata as any).content : '',
        format: updatedTemplate.primaryFormat || 'markdown',
        createdAt: updatedTemplate.creationDate.toISOString(),
        updatedAt: updatedTemplate.lastModifiedDate.toISOString(),
        createdBy: {
          id: updatedTemplate.createdBy.id,
          name: `${updatedTemplate.createdBy.firstName || ''} ${updatedTemplate.createdBy.lastName || ''}`.trim() || updatedTemplate.createdBy.email
        },
        metadata: updatedTemplate.metadata
      };

      return NextResponse.json({
        data: formattedTemplate,
        status: 200,
        message: 'Template updated successfully'
      });

    } catch (error) {
      console.error('Error updating template:', error);
      return NextResponse.json(
        { message: 'Failed to update template' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const templateId = params.id;

    if (!templateId) {
      return NextResponse.json(
        { message: 'Template ID is required' },
        { status: 400 }
      );
    }

    try {
      await prisma.document.delete({
        where: { 
          id: templateId,
          isTemplate: true
        }
      });

      return NextResponse.json({
        status: 200,
        message: 'Template deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json(
        { message: 'Failed to delete template' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
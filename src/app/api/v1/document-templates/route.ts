import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.document.findMany({
      where: {
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
      },
      orderBy: {
        creationDate: 'desc'
      }
    });

    const formattedTemplates = templates.map(template => ({
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
    }));

    return NextResponse.json({
      data: formattedTemplates,
      status: 200,
      message: 'Templates retrieved successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { 
        data: [],
        message: 'Database unavailable. Please try again later.',
        isMockData: false
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.documentTypeId || !body.content) {
      return NextResponse.json(
        { message: 'Missing required fields: name, documentTypeId, and content are required' },
        { status: 400 }
      );
    }
    
    // Create a new template in the database
    const newTemplate = await prisma.document.create({
      data: {
        title: body.name,
        referenceNumber: `TPL-${Date.now()}`,
        documentTypeId: body.documentTypeId,
        status: 'DRAFT',
        version: 1,
        language: 'en',
        createdById: 'user-001', // This should come from JWT token
        lastModifiedById: 'user-001',
        ownerOrganizationId: 'org-001', // This should come from user's organization
        confidentiality: 'PUBLIC',
        isTemplate: true,
        primaryFormat: body.format || 'markdown',
        metadata: {
          description: body.description || '',
          content: body.content,
          ...(body.metadata || {})
        }
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
      id: newTemplate.id,
      name: newTemplate.title,
      description: newTemplate.metadata ? (newTemplate.metadata as any).description : '',
      documentTypeId: newTemplate.documentTypeId,
      content: newTemplate.metadata ? (newTemplate.metadata as any).content : '',
      format: newTemplate.primaryFormat || 'markdown',
      createdAt: newTemplate.creationDate.toISOString(),
      updatedAt: newTemplate.lastModifiedDate.toISOString(),
      createdBy: {
        id: newTemplate.createdBy.id,
        name: `${newTemplate.createdBy.firstName || ''} ${newTemplate.createdBy.lastName || ''}`.trim() || newTemplate.createdBy.email
      },
      metadata: newTemplate.metadata
    };
    
    return NextResponse.json({
      data: formattedTemplate,
      status: 201,
      message: 'Template created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { message: 'Failed to create template' },
      { status: 500 }
    );
  }
} 
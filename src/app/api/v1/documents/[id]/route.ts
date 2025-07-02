import { NextRequest, NextResponse } from 'next/server';
import { ElasticsearchService } from '@/lib/elasticsearch';
import { FileStorageService } from '@/lib/fileStorage';
import { PrismaClient } from '@/generated/prisma';

// Initialize Prisma client only when needed
let prisma: PrismaClient | null = null;

function getPrismaClient() {
  if (!prisma) {
    try {
      console.log('Initializing Prisma client for document detail');
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize Prisma client:', error);
      return null;
    }
  }
  return prisma;
}

/**
 * GET handler to retrieve a document by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const documentId = params.id;

    if (!documentId) {
      return NextResponse.json(
        { message: 'Document ID is required' },
        { status: 400 }
      );
    }

    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { message: 'Database unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    try {
      const document = await db.document.findUnique({
        where: { id: documentId },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          lastModifiedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          documentType: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!document) {
        return NextResponse.json(
          { message: 'Document not found' },
          { status: 404 }
        );
      }

      const formattedDocument = {
        id: document.id,
        title: document.title,
        reference: document.referenceNumber,
        type: document.documentType.name,
        status: document.status,
        createdAt: document.creationDate.toISOString(),
        updatedAt: document.lastModifiedDate.toISOString(),
        author: {
          id: document.createdBy.id,
          name: `${document.createdBy.firstName || ''} ${document.createdBy.lastName || ''}`.trim() || document.createdBy.email,
          email: document.createdBy.email
        },
        lastModifiedBy: {
          id: document.lastModifiedBy?.id || document.createdBy.id,
          name: document.lastModifiedBy 
            ? `${document.lastModifiedBy.firstName || ''} ${document.lastModifiedBy.lastName || ''}`.trim() || document.lastModifiedBy.email
            : `${document.createdBy.firstName || ''} ${document.createdBy.lastName || ''}`.trim() || document.createdBy.email,
          email: document.lastModifiedBy?.email || document.createdBy.email
        },
        description: document.metadata ? (document.metadata as any).description || '' : '',
        tags: document.keywords || [],
        metadata: document.metadata || {},
        confidentiality: document.confidentiality || 'PUBLIC',
        currentVersion: document.version,
        primaryFormat: document.primaryFormat || 'markdown',
        fileCount: document.fileCount || 1,
        totalSize: document.totalSize || 0,
        availableFormats: ['markdown', 'pdf'],
        isMockData: false
      };

      return NextResponse.json({
        data: formattedDocument,
        isMockData: false
      });

    } catch (error) {
      console.error('Error fetching document from database:', error);
      return NextResponse.json(
        { message: 'Database error. Please try again later.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in document detail route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update a document
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const documentId = params.id;
    const body = await request.json();

    console.log('PUT /api/v1/documents/[id] - Request body:', body);

    if (!documentId) {
      return NextResponse.json(
        { message: 'Document ID is required' },
        { status: 400 }
      );
    }

    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { message: 'Database unavailable' },
        { status: 503 }
      );
    }

    // Check if document exists
    const existingDocument = await db.document.findUnique({
      where: { id: documentId }
    });

    if (!existingDocument) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      );
    }

    // Prepare update data - only include fields that are provided and valid
    const updateData: any = {
      lastModifiedDate: new Date(),
    };

    // Add fields if they're provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.referenceNumber !== undefined) updateData.referenceNumber = body.referenceNumber;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.confidentiality !== undefined) updateData.confidentiality = body.confidentiality;
    if (body.keywords !== undefined) updateData.keywords = body.keywords;
    
    // Handle description in metadata (since schema doesn't have description field)
    if (body.description !== undefined) {
      const currentMetadata = existingDocument.metadata as any || {};
      updateData.metadata = {
        ...currentMetadata,
        description: body.description
      };
    }

    // Get user ID from auth token if available
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        // For now, use the existing document's createdBy ID as fallback
        updateData.lastModifiedById = existingDocument.createdById;
      } catch (error) {
        console.log('Could not decode token, using original creator as modifier');
        updateData.lastModifiedById = existingDocument.createdById;
      }
    } else {
      updateData.lastModifiedById = existingDocument.createdById;
    }

    console.log('PUT /api/v1/documents/[id] - Update data:', updateData);

    const updatedDocument = await db.document.update({
      where: { id: documentId },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        lastModifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        documentType: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('PUT /api/v1/documents/[id] - Document updated successfully');

    // Format response to match expected structure
    const formattedDocument = {
      id: updatedDocument.id,
      title: updatedDocument.title,
      reference: updatedDocument.referenceNumber,
      type: updatedDocument.documentType.name,
      status: updatedDocument.status,
      createdAt: updatedDocument.creationDate.toISOString(),
      updatedAt: updatedDocument.lastModifiedDate.toISOString(),
      author: {
        id: updatedDocument.createdBy.id,
        name: `${updatedDocument.createdBy.firstName || ''} ${updatedDocument.createdBy.lastName || ''}`.trim() || updatedDocument.createdBy.email,
        email: updatedDocument.createdBy.email
      },
      description: updatedDocument.metadata ? (updatedDocument.metadata as any).description || '' : '',
      tags: updatedDocument.keywords || [],
      metadata: updatedDocument.metadata || {},
      confidentiality: updatedDocument.confidentiality || 'PUBLIC'
    };

    return NextResponse.json({
      data: formattedDocument,
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('PUT /api/v1/documents/[id] - Error updating document:', error);
    return NextResponse.json(
      { message: 'Failed to update document', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to delete a document
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const documentId = params.id;

    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { message: 'Database unavailable' },
        { status: 503 }
      );
    }

    await db.document.delete({
      where: { id: documentId }
    });

    return NextResponse.json({
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { message: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 
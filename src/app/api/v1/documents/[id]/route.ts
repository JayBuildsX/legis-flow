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
        description: document.description,
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

    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { message: 'Database unavailable' },
        { status: 503 }
      );
    }

    const updatedDocument = await db.document.update({
      where: { id: documentId },
      data: {
        title: body.title,
        description: body.description,
        content: body.content,
        status: body.status,
        keywords: body.tags || [],
        lastModifiedDate: new Date(),
        lastModifiedById: 'admin-user-id' // Should come from JWT token
      },
      include: {
        createdBy: true,
        lastModifiedBy: true,
        documentType: true
      }
    });

    return NextResponse.json({
      data: updatedDocument,
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { message: 'Failed to update document' },
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
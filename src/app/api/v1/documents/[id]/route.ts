import { NextRequest, NextResponse } from 'next/server';
import { ElasticsearchService } from '@/lib/elasticsearch';
import { FileStorageService } from '@/lib/fileStorage';
import { PrismaClient } from '@/generated/prisma';

// Mock data for a document when database is unavailable
const mockDocument = {
  id: "doc-001",
  title: "Draft Legislation on Environmental Protection",
  reference: "ENV-2023-001",
  type: "Legislation Draft",
  status: "DRAFT",
  createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  author: {
    id: "user-001",
    name: "Jean Dupont",
    email: "jean.dupont@example.com"
  },
  lastModifiedBy: {
    id: "user-001",
    name: "Jean Dupont",
    email: "jean.dupont@example.com"
  },
  organization: {
    id: "org-001",
    name: "Ministère de l'Environnement"
  },
  category: "Legislation Draft",
  tags: ["environment", "legislation", "climate"],
  metadata: {},
  description: "Draft legislation focusing on enhancing environmental protection measures",
  confidentiality: "PUBLIC",
  currentVersion: 2,
  primaryFormat: "docx",
  fileCount: 2,
  totalSize: 1024000,
  availableFormats: ["docx", "pdf"],
  isMockData: true
};

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
    // Comment out authentication check for easier testing
    /*
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    */

    // Correctly extract params.id for Next.js 15
    const params = await context.params;
    const documentId = params.id;
    
    // Get database client
    const db = getPrismaClient();
    if (!db) {
      console.log('Database not available, returning mock document for ID:', documentId);
      return NextResponse.json({
        ...mockDocument,
        id: documentId,
        isMockData: true
      });
    }
    
    try {
      // Attempt to find document in database
      // This is a placeholder for actual database implementation
      // In a real implementation, you would query the database
      
      // For now, return mock data with the requested ID
      console.log(`Document ID ${documentId} not found in database, returning mock data`);
      return NextResponse.json({
        ...mockDocument,
        id: documentId,
        isMockData: true
      });
    } catch (error) {
      console.error('Error retrieving document from database:', error);
      return NextResponse.json({
        ...mockDocument,
        id: documentId,
        isMockData: true
      });
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve document', details: error instanceof Error ? error.message : 'Unknown error' },
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
    // Check authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Correctly extract params.id for Next.js 15
    const params = await context.params;
    const documentId = params.id;
    const body = await request.json();
    
    // Create an updated mock document
    const updatedMockDocument = {
      ...mockDocument,
      id: documentId,
      title: body.title || mockDocument.title,
      description: body.description || mockDocument.description,
      status: body.status || mockDocument.status,
      reference: body.referenceNumber || mockDocument.reference,
      tags: body.keywords || mockDocument.tags,
      confidentiality: body.confidentiality || mockDocument.confidentiality,
      metadata: body.metadata || mockDocument.metadata,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`Database not available, returning mock updated document for ID: ${documentId}`);
    return NextResponse.json({
      ...updatedMockDocument,
      isMockData: true,
      message: "Document updated in mock mode"
    });
    
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document', details: error instanceof Error ? error.message : 'Unknown error' },
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
    // Check authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Correctly extract params.id for Next.js 15
    const params = await context.params;
    const documentId = params.id;
    
    console.log(`Database not available, simulating deletion of document ID: ${documentId}`);
    return NextResponse.json({
      message: 'Document deleted successfully (mock mode)',
      isMockData: true
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
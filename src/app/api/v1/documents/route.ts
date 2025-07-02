import { NextRequest, NextResponse } from 'next/server';
import { ElasticsearchService } from '@/lib/elasticsearch';
import { PrismaClient } from '@/generated/prisma';
import fs from 'fs';
import path from 'path';

// Initialize Prisma client
let prisma: PrismaClient | null = null;

/**
 * Function to get or create the Prisma client
 */
function getPrismaClient() {
  if (!prisma) {
    try {
      console.log('Initializing Prisma client for documents');
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize Prisma client:', error);
      return null;
    }
  }
  return prisma;
}

// Check if documents have been cleared via reset endpoint
function haveDocumentsBeenDeleted() {
  try {
    const persistenceFilePath = path.resolve(process.cwd(), '.document-deletion');
    if (fs.existsSync(persistenceFilePath)) {
      const data = JSON.parse(fs.readFileSync(persistenceFilePath, 'utf8'));
      return data.cleared === true;
    }
  } catch (error) {
    console.error('Error checking document deletion status:', error);
  }
  return false;
}

// No mock data by default - system will return empty state when database is unavailable
export const mockDocuments: any[] = [];

// Try to initialize Elasticsearch index on server start
async function initializeElasticsearch() {
  try {
    await ElasticsearchService.initializeIndices();
    console.log('Elasticsearch indices initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Elasticsearch:', error);
    console.log('Elasticsearch not available: ', error instanceof Error ? error.message : error);
  }
}

// Call this function in development, in production you'd do this differently
initializeElasticsearch().catch(console.error);

export async function GET(request: NextRequest) {
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
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    // Get filter parameters
    const searchTerm = url.searchParams.get('searchTerm') || '';
    const status = url.searchParams.getAll('status');
    const type = url.searchParams.getAll('type');
    const tags = url.searchParams.getAll('tags');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    // Try to get from database first
    const db = getPrismaClient();
    if (db) {
      try {
        // Build where clause for filters
        const where: any = {};
        
        if (status.length > 0) {
          where.status = { in: status };
        }
        
        if (type.length > 0) {
          where.documentType = {
            name: { in: type }
          };
        }
        
        if (tags.length > 0) {
          where.keywords = { hasSome: tags };
        }
        
        if (dateFrom) {
          where.updatedAt = {
            ...(where.updatedAt || {}),
            gte: new Date(dateFrom)
          };
        }
        
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setDate(toDate.getDate() + 1); // Include the end date
          where.updatedAt = {
            ...(where.updatedAt || {}),
            lte: toDate
          };
        }
        
        // Add search query if provided
        if (searchTerm) {
          where.OR = [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { referenceNumber: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ];
        }
        
        console.log('Executing database query with filters:', JSON.stringify(where));
        
        // Fix the orderBy parameter to match schema - use lastModifiedDate instead of updatedAt
        const documents = await db.document.findMany({
          where,
          include: {
            createdBy: {
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
          },
          orderBy: {
            lastModifiedDate: 'desc'
          },
          skip: (page - 1) * pageSize,
          take: pageSize
        });
        
        console.log(`Found ${documents.length} documents in database`);
        
        const totalCount = await db.document.count({ where });
        
        // Format documents for API response
        const formattedDocuments = documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          reference: doc.referenceNumber,
          status: doc.status,
          type: doc.documentType.name,
          createdAt: doc.creationDate.toISOString(),
          updatedAt: doc.lastModifiedDate.toISOString(),
          author: {
            id: doc.createdBy.id,
            name: `${doc.createdBy.firstName || ''} ${doc.createdBy.lastName || ''}`.trim() || doc.createdBy.email,
            email: doc.createdBy.email
          },
          tags: doc.keywords || [],
          primaryFormat: doc.primaryFormat || 'markdown',
          fileCount: doc.fileCount
        }));
        
        // Return success response with documents
        return NextResponse.json({
          items: formattedDocuments,
          total: totalCount,
          page,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          isMockData: false
        });
      } catch (error) {
        console.error('Error fetching documents from database:', error);
        // Return empty response instead of falling back to mock data
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          limit: pageSize,
          totalPages: 0,
          isMockData: false,
          message: 'Database is unavailable. Please try again later.'
        });
      }
    }
    
    console.log('Database unavailable, returning empty document list');
    
    // Return empty response instead of mock data
    return NextResponse.json({
      items: [],
      total: 0,
      page,
      limit: pageSize, 
      totalPages: 0,
      isMockData: false,
      message: 'No database connection available. Please try again later.'
    });
  } catch (error) {
    console.error('Error in documents route:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve documents', items: [], total: 0 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log('Document create request body:', body);
    
    // Handle both camelCase and snake_case parameter names
    const title = body.title;
    const documentTypeId = body.documentTypeId || body.document_type_id;
    
    // Validate required fields
    if (!title || !documentTypeId) {
      return NextResponse.json(
        { error: 'Title and document type are required fields' },
        { status: 400 }
      );
    }
    
    // Get database client
    const db = getPrismaClient();
    if (!db) {
      return NextResponse.json(
        { 
          error: 'Database unavailable',
          message: 'Cannot create document because the database is not available. Please try again later.'
        },
        { status: 503 }
      );
    }
    
    try {
      // Create the document in the database
      const newDocument = await db.document.create({
        data: {
          title,
          referenceNumber: body.referenceNumber || body.reference_number || `DOC-${Date.now().toString().slice(-6)}`,
          status: 'DRAFT',
          documentTypeId,
          description: body.description || '',
          keywords: body.tags || [],
          primaryFormat: body.content_format || 'markdown',
          language: 'en',
          createdById: 'user-001', // This should come from the JWT token
          lastModifiedById: 'user-001',
          ownerOrganizationId: 'org-001',
          creationDate: new Date(),
          lastModifiedDate: new Date(),
          fileCount: 1
        },
        include: {
          createdBy: {
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

      return NextResponse.json(
        { 
          id: newDocument.id,
          title: newDocument.title,
          reference: newDocument.referenceNumber,
          status: newDocument.status,
          type: newDocument.documentType.name,
          createdAt: newDocument.creationDate.toISOString(),
          updatedAt: newDocument.lastModifiedDate.toISOString(),
          author: {
            id: newDocument.createdBy.id,
            name: `${newDocument.createdBy.firstName || ''} ${newDocument.createdBy.lastName || ''}`.trim() || newDocument.createdBy.email,
            email: newDocument.createdBy.email
          },
          content: newDocument.content,
          format: newDocument.primaryFormat,
          message: "Document created successfully"
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating document in database:', error);
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Failed to create document in the database. Please try again later.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
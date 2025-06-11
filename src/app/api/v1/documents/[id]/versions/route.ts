import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

// Initialize Prisma client
let prisma: PrismaClient | null = null;

/**
 * Function to get or create the Prisma client
 */
function getPrismaClient() {
  if (!prisma) {
    try {
      console.log('Initializing Prisma client for document versions');
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize Prisma client:', error);
      return null;
    }
  }
  return prisma;
}

// Mock data for document versions
const mockVersions = [
  {
    id: "v2",
    documentId: "doc-001",
    version: "2", 
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: "user-001",
      name: "Jean Dupont",
      email: "jean.dupont@example.com"
    },
    changeDescription: "Updated article 4 to reflect new emissions targets",
    status: "current"
  },
  {
    id: "v1",
    documentId: "doc-001",
    version: "1",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    author: {
      id: "user-001",
      name: "Jean Dupont",
      email: "jean.dupont@example.com"
    },
    changeDescription: "Initial document creation",
    status: "archived"
  }
];

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Properly await the params object itself
    const params = await Promise.resolve(context.params);
    const id = params.id;

    // Process query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    
    console.log(`Retrieving versions for document: ${id}`);

    // Try to get from database first
    const db = getPrismaClient();
    if (db) {
      try {
        const documentVersions = await db.documentVersion.findMany({
          where: {
            documentId: id
          },
          orderBy: {
            versionNumber: 'desc'
          },
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          skip: offset,
          take: limit
        });

        const totalCount = await db.documentVersion.count({
          where: {
            documentId: id
          }
        });

        // Format the response
        const formattedVersions = documentVersions.map(version => ({
          id: version.id,
          documentId: version.documentId,
          version: String(version.versionNumber),
          createdAt: version.createdAt.toISOString(),
          author: {
            id: version.createdBy.id,
            name: `${version.createdBy.firstName || ''} ${version.createdBy.lastName || ''}`.trim() || version.createdBy.email,
            email: version.createdBy.email
          },
          changeDescription: version.changeSummary || "",
          status: version.status.toLowerCase()
        }));

        console.log(`Successfully retrieved ${formattedVersions.length} versions from database`);
        
        return NextResponse.json({
          data: formattedVersions,
          pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit)
          },
          isMockData: false
        });
      } catch (error) {
        console.error('Error fetching document versions from database:', error);
        // Fall back to mock data on error
      }
    }

    console.log('Using mock versions data as fallback');
    // For any document ID, return the mock versions with the correct document ID
    const versionsWithCorrectId = mockVersions.map(v => ({
      ...v,
      documentId: id
    }));

    // Return the document versions with pagination metadata
    return NextResponse.json({
      data: versionsWithCorrectId,
      pagination: {
        total: versionsWithCorrectId.length,
        page,
        limit,
        pages: Math.ceil(versionsWithCorrectId.length / limit)
      },
      isMockData: true
    });
  } catch (error) {
    console.error('Error fetching document versions:', error);
    return NextResponse.json(
      { message: 'Error fetching document versions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Properly await the params object itself
    const params = await Promise.resolve(context.params);
    const id = params.id;
    const body = await request.json();

    // Validate required fields
    if (!body.content && !body.changeDescription) {
      return NextResponse.json(
        { message: 'Content or change description is required to create a new version' },
        { status: 400 }
      );
    }
    
    // Try to use database
    const db = getPrismaClient();
    if (db) {
      try {
        // First, get the document to ensure it exists
        const document = await db.document.findUnique({
          where: { id },
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              take: 1
            }
          }
        });

        if (!document) {
          return NextResponse.json(
            { message: 'Document not found' },
            { status: 404 }
          );
        }

        // Calculate the next version number
        const latestVersion = document.versions[0];
        const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

        // Create the new version
        const newVersion = await db.documentVersion.create({
          data: {
            document: {
              connect: { id }
            },
            versionNumber: nextVersionNumber,
            content: body.content || '',
            contentFormat: body.contentFormat || 'markdown',
            changeSummary: body.changeDescription,
            createdBy: {
              connect: { id: body.author?.id || "user-001" } // Should be from auth token in production
            },
            status: body.status?.toUpperCase() || "DRAFT",
            isMajorVersion: body.isMajorVersion || false
          },
          include: {
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

        // Update the document's version number
        await db.document.update({
          where: { id },
          data: {
            version: nextVersionNumber,
            lastModifiedDate: new Date(),
            lastModifiedBy: {
              connect: { id: body.author?.id || "user-001" } // Should be from auth token in production
            }
          }
        });

        // Format the response
        const formattedVersion = {
          id: newVersion.id,
          documentId: newVersion.documentId,
          version: String(newVersion.versionNumber),
          createdAt: newVersion.createdAt.toISOString(),
          author: {
            id: newVersion.createdBy.id,
            name: `${newVersion.createdBy.firstName || ''} ${newVersion.createdBy.lastName || ''}`.trim() || newVersion.createdBy.email,
            email: newVersion.createdBy.email
          },
          changeDescription: newVersion.changeSummary || "",
          status: newVersion.status.toLowerCase(),
          isMockData: false
        };

        return NextResponse.json(formattedVersion, { status: 201 });
      } catch (error) {
        console.error('Error creating document version in database:', error);
        // Fall back to mock data on error
      }
    }

    console.log('Using mock data as fallback for version creation');
    // Mock creating a new version
    const newVersion = {
      id: `v${Math.floor(Math.random() * 1000)}`,
      documentId: id,
      version: "3",
      createdAt: new Date().toISOString(),
      author: {
        id: body.author?.id || "user-001",
        name: body.author?.name || "Jean Dupont",
        email: body.author?.email || "jean.dupont@example.com"
      },
      changeDescription: body.changeDescription || "Document updated",
      status: body.status?.toLowerCase() || "draft",
      isMockData: true
    };

    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    console.error('Error creating document version:', error);
    return NextResponse.json(
      { message: 'Error creating document version' },
      { status: 500 }
    );
  }
} 
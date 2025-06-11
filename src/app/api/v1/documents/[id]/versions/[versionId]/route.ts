import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

// Initialize Prisma client
const prisma = new PrismaClient();

// Remove mock data
// ... existing code ...

export async function GET(
  request: NextRequest,
  context: { params: { id: string, versionId: string } }
) {
  try {
    // Properly await the params object itself
    const params = await Promise.resolve(context.params);
    const id = params.id;
    const versionId = params.versionId;
    
    // Extract the version number from the versionId (removing 'v' prefix)
    const versionNumber = parseFloat(versionId.replace('v', ''));
    if (isNaN(versionNumber)) {
      return NextResponse.json(
        { message: `Invalid version format: ${versionId}` },
        { status: 400 }
      );
    }
    
    // Find the document version in the database
    const version = await prisma.documentVersion.findFirst({
      where: { 
        documentId: id,
        versionNumber: versionNumber
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!version) {
      return NextResponse.json(
        { message: `Version ${versionId} for document ${id} not found` },
        { status: 404 }
      );
    }
    
    // Format the response
    const response = {
      id: `v${version.versionNumber}`,
      documentId: version.documentId,
      version: version.versionNumber.toString(),
      createdAt: version.createdAt.toISOString(),
      author: {
        id: version.createdBy.id,
        name: version.createdBy.name,
        email: version.createdBy.email
      },
      changeDescription: version.changeDescription || "",
      status: version.status.toLowerCase()
    };
    
    // Return the specific version
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching document version:', error);
    return NextResponse.json(
      { message: 'Error fetching document version' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string, versionId: string } }
) {
  try {
    // Properly await the params object itself
    const params = await Promise.resolve(context.params);
    const id = params.id;
    const versionId = params.versionId;
    const body = await request.json();
    
    // Extract the version number from the versionId (removing 'v' prefix)
    const versionNumber = parseFloat(versionId.replace('v', ''));
    if (isNaN(versionNumber)) {
      return NextResponse.json(
        { message: `Invalid version format: ${versionId}` },
        { status: 400 }
      );
    }
    
    // Find the version to update
    const existingVersion = await prisma.documentVersion.findFirst({
      where: { 
        documentId: id,
        versionNumber: versionNumber
      }
    });
    
    if (!existingVersion) {
      return NextResponse.json(
        { message: `Version ${versionId} for document ${id} not found` },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    if (body.changeDescription !== undefined) {
      updateData.changeDescription = body.changeDescription;
    }
    if (body.status !== undefined) {
      // Convert status to uppercase for enum
      updateData.status = body.status.toUpperCase();
    }
    
    // Update the version in the database
    const updatedVersion = await prisma.documentVersion.update({
      where: { id: existingVersion.id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Format the response
    const response = {
      id: `v${updatedVersion.versionNumber}`,
      documentId: updatedVersion.documentId,
      version: updatedVersion.versionNumber.toString(),
      createdAt: updatedVersion.createdAt.toISOString(),
      updatedAt: updatedVersion.updatedAt.toISOString(),
      author: {
        id: updatedVersion.createdBy.id,
        name: updatedVersion.createdBy.name,
        email: updatedVersion.createdBy.email
      },
      changeDescription: updatedVersion.changeDescription || "",
      status: updatedVersion.status.toLowerCase()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating version:', error);
    return NextResponse.json(
      { message: 'Error updating version' },
      { status: 500 }
    );
  }
} 
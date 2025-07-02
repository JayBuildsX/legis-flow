import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

// Initialize Prisma client
const prisma = new PrismaClient();

// Remove mock data
// ... existing code ...

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const documentId = resolvedParams.id;
    const versionId = resolvedParams.versionId;
    
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
        documentId: documentId,
        versionNumber: versionNumber
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
    
    if (!version) {
      return NextResponse.json(
        { message: `Version ${versionId} for document ${documentId} not found` },
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
        name: `${version.createdBy.firstName || ''} ${version.createdBy.lastName || ''}`.trim(),
        email: version.createdBy.email
      },
      changeDescription: version.changeSummary || "",
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
  { params }: { params: Promise<{ id: string, versionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const versionId = resolvedParams.versionId;
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
      updateData.changeSummary = body.changeDescription;
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
            firstName: true,
            lastName: true,
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
      author: {
        id: updatedVersion.createdBy.id,
        name: `${updatedVersion.createdBy.firstName || ''} ${updatedVersion.createdBy.lastName || ''}`.trim(),
        email: updatedVersion.createdBy.email
      },
      changeDescription: updatedVersion.changeSummary || "",
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
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { FileStorageService } from '@/lib/fileStorage';
import fs from 'fs/promises';

// Initialize Prisma client only when needed
let prisma: PrismaClient | null = null;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string, versionId: string }> }
) {
  try {
    // Properly await the params object itself
    const params = await context.params;
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
    const version = await getPrisma().documentVersion.findFirst({
      where: { 
        documentId: id,
        versionNumber: versionNumber
      },
      include: {
        convertedFiles: true
      }
    });
    
    if (!version) {
      return NextResponse.json(
        { message: `Version ${versionId} of document ${id} not found` },
        { status: 404 }
      );
    }
    
    // If content is stored directly in the database, return it
    if (version.content) {
      return NextResponse.json({
        content: version.content,
        format: version.contentFormat || 'markdown'
      });
    }
    
    // If no content in database but files exist, try to read from primary file
    if (version.convertedFiles && version.convertedFiles.length > 0) {
      const primaryFile = version.convertedFiles.find((file: any) => file.isActive);
      const fileToRead = primaryFile || version.convertedFiles[0]; // Use primary or first file
      
      try {
        // Get file path using static method
        const filePath = FileStorageService.getFullPath(fileToRead.filePath);
        
        // Read file content
        const content = await fs.readFile(filePath, 'utf-8');
        
        return NextResponse.json({
          content,
          format: fileToRead.format,
          fileName: fileToRead.filePath,
          fileId: fileToRead.id
        });
      } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json(
          { message: 'Error reading file content' },
          { status: 500 }
        );
      }
    }
    
    // No content found
    return NextResponse.json(
      { message: 'No content available for this version' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching version content:', error);
    return NextResponse.json(
      { message: 'Error fetching version content' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string, versionId: string }> }
) {
  try {
    // Properly await the params object itself
    const params = await context.params;
    const id = params.id;
    const versionId = params.versionId;
    const body = await request.json();
    
    // Check if content is provided
    if (!body.content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Extract the version number from the versionId (removing 'v' prefix)
    const versionNumber = parseFloat(versionId.replace('v', ''));
    if (isNaN(versionNumber)) {
      return NextResponse.json(
        { message: `Invalid version format: ${versionId}` },
        { status: 400 }
      );
    }
    
    // Find the version to update
    const version = await getPrisma().documentVersion.findFirst({
      where: { 
        documentId: id,
        versionNumber: versionNumber
      }
    });
    
    if (!version) {
      return NextResponse.json(
        { message: `Version ${versionId} for document ${id} not found` },
        { status: 404 }
      );
    }
    
    // Update the version with new content
    await prisma.documentVersion.update({
      where: { id: version.id },
      data: {
        content: body.content,
        contentFormat: body.format || 'markdown'
      }
    });
    
    return NextResponse.json({
      content: body.content,
      format: body.format || 'markdown',
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Error updating version content:', error);
    return NextResponse.json(
      { message: 'Error updating version content' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { FileStorageService } from '@/lib/fileStorage';
import fs from 'fs/promises';

// Initialize Prisma client
const prisma = new PrismaClient();
const fileStorage = new FileStorageService();

// Initialize storage
fileStorage.initialize();

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
        files: true
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
    if (version.files.length > 0) {
      const primaryFile = version.files.find(file => file.isPrimary);
      const fileToRead = primaryFile || version.files[0]; // Use primary or first file
      
      try {
        // Get file path
        const filePath = fileStorage.getFullPath(fileToRead.path);
        
        // Read file content
        const content = await fs.readFile(filePath, 'utf-8');
        
        return NextResponse.json({
          content,
          format: fileToRead.format,
          fileName: fileToRead.filename,
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
  context: { params: { id: string, versionId: string } }
) {
  try {
    // Properly await the params object itself
    const params = await Promise.resolve(context.params);
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
    const version = await prisma.documentVersion.findFirst({
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
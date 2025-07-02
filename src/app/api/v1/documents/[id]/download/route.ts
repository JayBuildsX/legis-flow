import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, FileFormat } from '@/generated/prisma';
import { FileStorageService } from '@/lib/fileStorage';
import { DocumentConverterService } from '@/lib/documentConverter';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Get document file and return it as download
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const documentId = resolvedParams.id;
    const url = new URL(request.url);
    const requestedFormat = (url.searchParams.get('format')?.toUpperCase() as FileFormat) || null;
    const versionNumber = parseInt(url.searchParams.get('version') || '0');

    // Find document and check if it exists
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get the document version to download
    const versionToDownload = versionNumber > 0
      ? await prisma.documentVersion.findFirst({
          where: {
            documentId,
            versionNumber,
          },
          include: {
            files: true,
          },
        })
      : document.versions[0]; // Latest version

    if (!versionToDownload) {
      return NextResponse.json({ error: 'Document version not found' }, { status: 404 });
    }

    // If no format specified, use original format
    const format = requestedFormat || versionToDownload.fileType as FileFormat;
    
    // Find the file with the requested format
    const fileRecord = versionToDownload.files?.find(file => file.format === format);
    
    if (!fileRecord) {
      // If the format is original, return error as it should exist
      if (format === versionToDownload.fileType) {
        return NextResponse.json(
          { error: 'Original file not found' },
          { status: 404 }
        );
      }
      
      // Need to convert the file to the requested format
      try {
        // Get the original file
        const originalFile = versionToDownload.files?.find(file => file.isOriginal);
        
        if (!originalFile) {
          return NextResponse.json(
            { error: 'Original file not found for conversion' },
            { status: 404 }
          );
        }

        const originalFilePath = FileStorageService.getFullPath(originalFile.filePath);
        
        // Convert the document to the requested format
        const { outputPath, mimeType } = await DocumentConverterService.convertDocument(
          originalFilePath,
          versionToDownload.fileType as FileFormat,
          format
        );

        // Create document file record for the conversion
        const stats = await fs.stat(outputPath);
        const relativePath = path.relative(FileStorageService.STORAGE_BASE_DIR, outputPath);
        
        // Store the converted file in the database
        await prisma.documentFile.create({
          data: {
            documentVersionId: versionToDownload.id,
            format,
            filePath: relativePath,
            fileSize: stats.size,
            isOriginal: false,
            metadata: {
              convertedFrom: versionToDownload.fileType,
              convertedAt: new Date().toISOString()
            },
          },
        });

        // Update available formats
        if (!document.availableFormats.includes(format)) {
          await prisma.document.update({
            where: { id: documentId },
            data: {
              availableFormats: [...document.availableFormats, format],
              fileCount: document.fileCount + 1,
              totalSize: document.totalSize + stats.size,
            },
          });
        }

        // Read file and return it
        const fileContent = await fs.readFile(outputPath);
        
        // Create response with appropriate headers
        const response = new NextResponse(fileContent, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_v${versionToDownload.versionNumber}.${format.toLowerCase()}"`,
          },
        });

        return response;
      } catch (error) {
        console.error('Error converting document:', error);
        return NextResponse.json(
          { error: 'Failed to convert document', details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }
    
    // File exists, serve it
    const filePath = FileStorageService.getFullPath(fileRecord.filePath);
    
    try {
      // Read file and return it
      const fileContent = await fs.readFile(filePath);
      
      // Get MIME type for the format
      const mimeType = DocumentConverterService.getMimeTypeForFormat(format);
      
      // Create response with appropriate headers
      const response = new NextResponse(fileContent, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_v${versionToDownload.versionNumber}.${format.toLowerCase()}"`,
        },
      });
      
      return response;
    } catch (error) {
      console.error('Error reading file:', error);
      return NextResponse.json(
        { error: 'Failed to read document file', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Document download error:', error);
    return NextResponse.json(
      { error: 'Error processing document download', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
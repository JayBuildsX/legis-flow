import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, DocumentStatus, Confidentiality } from '@/generated/prisma';
import { FileStorageService, FileFormat } from '@/lib/fileStorage';
import { DocumentConverterService } from '@/lib/documentConverter';
import { ElasticsearchService } from '@/lib/elasticsearch';

const prisma = new PrismaClient();

/**
 * Handle POST request to upload a new document
 * @param req Request object containing the document file and metadata
 * @returns Response with the created document or error
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication - TEMPORARILY BYPASSED FOR TESTING
    /*
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    */
    
    // In a real implementation, you'd extract the user ID from a verified JWT token
    // For now, use a placeholder user ID
    const userId = "user-001";

    // Get form data with file and metadata
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get metadata from form
    const title = formData.get('title') as string;
    const referenceNumber = formData.get('referenceNumber') as string;
    const description = formData.get('description') as string || '';
    const documentTypeId = formData.get('documentTypeId') as string;
    const keywords = formData.get('keywords') as string || '';
    const confidentiality = (formData.get('confidentiality') as string || 'PUBLIC') as Confidentiality;
    
    // Validate required fields
    if (!title || !referenceNumber || !documentTypeId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, referenceNumber, and documentTypeId are required' },
        { status: 400 }
      );
    }

    // Determine file format from file extension
    const originalFilename = file.name;
    const fileExtension = originalFilename.split('.').pop()?.toLowerCase() || '';
    let fileFormat: FileFormat;
    
    switch (fileExtension) {
      case 'pdf':
        fileFormat = FileFormat.PDF;
        break;
      case 'docx':
        fileFormat = FileFormat.DOCX;
        break;
      case 'html':
        fileFormat = FileFormat.HTML;
        break;
      case 'md':
        fileFormat = FileFormat.MARKDOWN;
        break;
      case 'txt':
        fileFormat = FileFormat.TEXT;
        break;
      case 'xml':
        fileFormat = FileFormat.XML;
        break;
      case 'json':
        fileFormat = FileFormat.JSON;
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported file format: .${fileExtension}` },
          { status: 400 }
        );
    }

    // Find or create a default organization
    let organization;
    try {
      // Try to find an existing organization
      organization = await prisma.organization.findFirst();
      
      if (!organization) {
        // Create a default organization if none exists
        organization = await prisma.organization.create({
          data: {
            name: "Default Organization",
            description: "Auto-generated default organization",
            orgType: "OTHER",
            status: "ACTIVE"
          }
        });
        console.log('Created default organization:', organization.id);
      }
    } catch (orgError) {
      console.error('Error finding/creating organization:', orgError);
      return NextResponse.json(
        { error: 'Failed to find or create organization' },
        { status: 500 }
      );
    }

    // Create document in database
    const document = await prisma.document.create({
      data: {
        title,
        referenceNumber,
        status: DocumentStatus.DRAFT,
        confidentiality,
        primaryFormat: fileFormat,
        fileCount: 1,
        textExtracted: false,
        availableFormats: [fileFormat],
        documentType: {
          connect: { id: documentTypeId }
        },
        createdBy: {
          connect: { id: userId }
        },
        lastModifiedBy: {
          connect: { id: userId }
        },
        ownerOrganization: {
          connect: { id: organization.id }
        },
        language: 'fr', // Default language
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        creationDate: new Date(),
        lastModifiedDate: new Date()
      }
    });

    // Convert file to ArrayBuffer for storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Store file using FileStorageService
    const documentDir = await FileStorageService.createDocumentDirectory(document.id);
    const fileMetadata = await FileStorageService.storeFile(
      document.id,
      document.id, // Using document ID as version ID for the first version
      buffer, 
      originalFilename,
      file.type,
      fileFormat
    );

    // Create initial document version
    const documentVersion = await prisma.documentVersion.create({
      data: {
        document: {
          connect: { id: document.id }
        },
        versionNumber: 1,
        originalFilePath: fileMetadata.storagePath,
        originalFileType: fileFormat,
        originalFileSize: fileMetadata.size,
        createdBy: {
          connect: { id: userId }
        },
        status: 'CURRENT',
        contentFormat: fileFormat,
        hasTextExtracted: false,
        availableFormats: [fileFormat]
      }
    });

    // Extract text and create DocumentFile entry if successful
    try {
      // Extract text from document for search indexing
      const extractedText = await DocumentConverterService.extractText(
        fileMetadata.storagePath,
        fileFormat
      );

      // Create document file entry
      await prisma.documentFile.create({
        data: {
          documentVersion: {
            connect: { id: documentVersion.id }
          },
          format: fileFormat,
          filePath: fileMetadata.storagePath,
          fileSize: fileMetadata.size,
          mimeType: fileMetadata.mimeType,

          isActive: true,
          metadata: {
            originalFilename: originalFilename
          },
        }
      });

      // Update document to indicate text has been extracted
      await prisma.document.update({
        where: { id: document.id },
        data: {
          textExtracted: true,
          totalSize: fileMetadata.size,
        }
      });

      // Index document in Elasticsearch
      try {
        await ElasticsearchService.indexDocument({
          id: document.id,
          title: document.title,
          reference: document.referenceNumber,

          status: document.status,
          content: extractedText,
          keywords: document.keywords,
          createdAt: document.creationDate.toISOString(),
          updatedAt: document.lastModifiedDate.toISOString(),
        });

        // Update lastSearchIndexed timestamp
        await prisma.document.update({
          where: { id: document.id },
          data: {
            lastSearchIndexed: new Date()
          }
        });
      } catch (esError) {
        console.error('Error indexing document in Elasticsearch:', esError);
        // Continue processing even if ES indexing fails
      }
    } catch (extractionError) {
      console.error('Error extracting text from document:', extractionError);
      // Continue with upload even if text extraction fails
    }

    // Return success response with document data
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        referenceNumber: document.referenceNumber,
        status: document.status,
        versionNumber: documentVersion.versionNumber,
        createdAt: document.creationDate,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
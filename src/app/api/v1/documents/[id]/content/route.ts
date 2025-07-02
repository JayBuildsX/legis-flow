import { NextRequest, NextResponse } from 'next/server';
import { ElasticsearchService } from '@/lib/elasticsearch';
import { FileStorageService } from '@/lib/fileStorage';
import fs from 'fs/promises';

// Mock data for document content when database is unavailable
const mockDocumentContent = {
  content: `# Draft Legislation on Environmental Protection

## Article 1: Purpose
This legislation aims to enhance environmental protection measures across all sectors of the economy.

## Article 2: Scope of Application
This legislation applies to all entities operating within the jurisdiction, including public and private organizations.

## Article 3: Principles
The implementation of this legislation shall be guided by the following principles:
- Precautionary principle
- Polluter pays principle
- Principle of prevention
- Principle of sustainable development

## Article 4: Emissions Reduction
All entities shall reduce their carbon emissions by at least 30% by 2030, compared to 2020 levels.

## Article 5: Enforcement
The Ministry of Environment shall be responsible for the enforcement of this legislation.

## Article 6: Penalties
Non-compliance with the provisions of this legislation shall result in fines and other administrative measures.
`,
  format: "markdown",
  version: "2",
  mockData: true
};

// Initialize Prisma client only when needed
let prisma: any = null;

function getPrismaClient() {
  if (!prisma) {
    try {
      const { PrismaClient } = require('@/generated/prisma');
      console.log('Initializing Prisma client for document content');
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize Prisma client:', error);
      return null;
    }
  }
  return prisma;
}

/**
 * Handle GET request to fetch document content
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Correctly extract params.id for Next.js 15
    const params = await context.params;
    const documentId = params.id;
    console.log(`Fetching content for document: ${documentId}`);
    
    // Try to get from database first
    const db = getPrismaClient();
    if (db) {
      try {
        // Get the latest version for this document
        const latestVersion = await db.documentVersion.findFirst({
          where: { documentId },
          orderBy: { versionNumber: 'desc' },
          select: {
            content: true,
            contentFormat: true,
            versionNumber: true,
            createdAt: true
          }
        });
        
        if (latestVersion && latestVersion.content) {
          console.log(`Found real content for document ${documentId}, version ${latestVersion.versionNumber}`);
          return NextResponse.json({
            content: latestVersion.content,
            format: latestVersion.contentFormat || 'markdown',
            version: latestVersion.versionNumber.toString(),
            documentId,
            lastModified: latestVersion.createdAt.toISOString(),
            mockData: false
          });
        }
        
        // If no content found, check if document exists and create initial content
        const document = await db.document.findUnique({
          where: { id: documentId },
          select: { id: true, title: true }
        });
        
        if (document) {
          console.log(`Document ${documentId} exists but has no content, creating initial version`);
          
          // Create initial content based on document title
          const initialContent = `# ${document.title}

## Document Content

This document is ready for editing. Please add your content here.

### Key Points
- Add main points here
- Include relevant information
- Structure your content clearly

---
*Document created: ${new Date().toLocaleDateString()}*`;

          // Create initial version
          const newVersion = await db.documentVersion.create({
            data: {
              documentId,
              versionNumber: 1,
              content: initialContent,
              contentFormat: 'markdown',
              createdById: 'user-001', // Default to admin user
              changeSummary: 'Initial document content created',
              status: 'ACTIVE',
              isMajorVersion: true
            }
          });
          
          return NextResponse.json({
            content: initialContent,
            format: 'markdown',
            version: "1",
            documentId,
            lastModified: newVersion.createdAt.toISOString(),
            mockData: false,
            message: "Initial content created"
          });
        }
        
      } catch (dbError) {
        console.error('Database error fetching content:', dbError);
        // Fall back to mock data if database fails
      }
    }
    
    // Fallback to mock content if database unavailable
    console.log(`Falling back to mock content for document: ${documentId}`);
    return NextResponse.json({
      ...mockDocumentContent,
      documentId
    });
  } catch (error) {
    console.error('Error fetching document content:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve document content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Handle PUT request to update document content
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
    
    if (!body.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    
    console.log(`Saving content for document: ${documentId}`);
    
    // Try to save to database
    const db = getPrismaClient();
    if (db) {
      try {
        // Check if document exists
        const document = await db.document.findUnique({
          where: { id: documentId },
          select: { id: true, title: true }
        });
        
        if (!document) {
          return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
          );
        }
        
        // Get latest version number
        const latestVersion = await db.documentVersion.findFirst({
          where: { documentId },
          orderBy: { versionNumber: 'desc' },
          select: { versionNumber: true }
        });
        
        const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;
        
        // Create new version with the content
        const newVersion = await db.documentVersion.create({
          data: {
            documentId,
            versionNumber: nextVersionNumber,
            content: body.content,
            contentFormat: body.format || 'markdown',
            createdById: 'user-001', // Should come from auth token
            changeSummary: body.comment || 'Content updated via API',
            status: 'ACTIVE',
            isMajorVersion: false
          }
        });
        
        console.log(`Content saved successfully for document ${documentId}, version ${nextVersionNumber}`);
        
        return NextResponse.json({
          content: body.content,
          format: body.format || 'markdown',
          version: nextVersionNumber.toString(),
          documentId,
          lastModified: newVersion.createdAt.toISOString(),
          mockData: false,
          message: "Document content saved successfully to database"
        });
        
      } catch (dbError) {
        console.error('Database error saving content:', dbError);
        return NextResponse.json(
          { error: 'Failed to save content to database', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }
    
    // Fallback mock response if database unavailable
    console.log('Database unavailable, returning mock response');
    return NextResponse.json({
      content: body.content,
      format: body.format || 'markdown',
      version: "mock", 
      documentId,
      mockData: true,
      message: "Document content updated (mock response - database unavailable)"
    });
  } catch (error) {
    console.error('Error updating document content:', error);
    return NextResponse.json(
      { error: 'Failed to update document content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
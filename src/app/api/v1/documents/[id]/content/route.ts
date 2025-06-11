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
let prisma = null;

/**
 * Handle GET request to fetch document content
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Check authentication (commented out for testing)
    /*
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    */

    // Correctly extract params.id
    const documentId = context.params.id;
    console.log(`Fetching content for document: ${documentId}`);
    
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
  context: { params: { id: string } }
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
    
    // Correctly extract params.id
    const documentId = context.params.id;
    const body = await request.json();
    
    if (!body.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Return mock response since we're not using database
    return NextResponse.json({
      content: body.content,
      format: body.format || 'markdown',
      version: "3", // Simulate version increment
      documentId,
      mockData: true,
      message: "Document content updated successfully (mock response)"
    });
  } catch (error) {
    console.error('Error updating document content:', error);
    return NextResponse.json(
      { error: 'Failed to update document content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
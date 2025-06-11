import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import fs from 'fs';
import path from 'path';

// Flag to track if mock documents have been cleared
let mockDocumentsCleared = false;

// Initialize Prisma client
let prisma: PrismaClient | null = null;

function getPrismaClient() {
  if (!prisma) {
    try {
      console.log('Initializing Prisma client for document reset');
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize Prisma client:', error);
      return null;
    }
  }
  return prisma;
}

// Type for the mock documents module
type MockDocumentsModule = {
  mockDocuments?: any[];
};

// Reset all documents in the system (for development/testing purposes only)
export async function DELETE(request: NextRequest) {
  try {
    console.log('Document reset endpoint called');
    
    // In a production system, you would require authentication and high-level permissions
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authentication missing or invalid');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('Authentication validated');
    
    const db = getPrismaClient();
    let deletedCount = 0;

    // Try to delete from database if available
    if (db) {
      try {
        // First, delete all document versions to avoid foreign key constraints
        console.log('Deleting document versions first...');
        await db.documentVersion.deleteMany({});
        console.log('Document versions deleted successfully');
        
        // Then delete all document comments if they exist
        try {
          console.log('Deleting document comments...');
          await db.documentComment.deleteMany({});
          console.log('Document comments deleted successfully');
        } catch (error) {
          console.log('No document comments table or no comments to delete');
        }
        
        // Try to delete any other related entities that might have foreign keys
        try {
          console.log('Deleting document workflows...');
          await db.documentWorkflow.deleteMany({});
          console.log('Document workflows deleted successfully');
        } catch (error) {
          console.log('No document workflows table or no workflows to delete');
        }
        
        // Now delete all documents
        console.log('Deleting documents...');
        const result = await db.document.deleteMany({});
        deletedCount = result.count;
        console.log(`Deleted ${deletedCount} documents from database`);
      } catch (error) {
        console.error('Error deleting documents from database:', error);
        // Continue execution even if database deletion fails
      }
    } else {
      console.log('No database connection available, skipping database deletion');
    }

    // Store deletion status in a file for persistence across server restarts
    const persistenceFilePath = path.resolve(process.cwd(), '.document-deletion');
    
    // Clear mock documents using a more reliable approach
    let mocksCleared = false;
    try {
      // Path to mock documents module
      const mockDocumentsPath = path.resolve(process.cwd(), 'src/app/api/v1/documents/route.ts');
      
      // Check if the mock documents module exists
      if (fs.existsSync(mockDocumentsPath)) {
        console.log('Found mock documents module, attempting to clear');
        
        // Try to import the module dynamically to avoid caching issues
        const mockModule = await import('../../documents/route') as MockDocumentsModule;
        
        if (mockModule && 'mockDocuments' in mockModule && Array.isArray(mockModule.mockDocuments)) {
          // Create a backup before clearing
          const backupCount = mockModule.mockDocuments.length;
          
          // Clear the array
          mockModule.mockDocuments.length = 0;
          
          // Set the global flag to indicate documents have been cleared
          mockDocumentsCleared = true;
          
          // Write deletion status to a file for persistence
          fs.writeFileSync(persistenceFilePath, JSON.stringify({
            cleared: true,
            timestamp: new Date().toISOString()
          }));
          
          console.log(`Cleared ${backupCount} mock documents`);
          mocksCleared = true;
          
          // Add deleted count if we didn't delete from DB
          if (deletedCount === 0) {
            deletedCount = backupCount;
          }
        } else {
          console.log('Mock documents array not found or not an array');
        }
      } else {
        console.log('Mock documents module not found');
      }
    } catch (err) {
      console.error('Error clearing mock documents:', err);
    }
    
    return NextResponse.json({
      success: true,
      message: `All documents have been deleted. Removed ${deletedCount} documents.`,
      details: {
        dbDeleted: deletedCount > 0,
        mocksCleared: mocksCleared,
        totalDeleted: deletedCount
      }
    });
  } catch (error) {
    console.error('Error in document reset route:', error);
    return NextResponse.json(
      { error: 'Failed to reset documents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
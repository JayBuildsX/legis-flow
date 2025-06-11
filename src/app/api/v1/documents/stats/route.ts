import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, DocumentStatus } from '@/generated/prisma';

// Initialize Prisma Client
let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function GET(req: NextRequest) {
  console.log('API: Fetching document statistics');
  const db = getPrismaClient();
  
  try {
    // Get document counts by status
    const totalDocuments = await db.document.count();
    const inProgressDocuments = await db.document.count({
      where: { status: DocumentStatus.IN_PROGRESS }
    });
    const completedDocuments = await db.document.count({
      where: { status: DocumentStatus.APPROVED }
    });
    const pendingDocuments = await db.document.count({
      where: { status: DocumentStatus.DRAFT }
    });
    
    console.log('Successfully fetched document statistics from database');
    console.log(`Total: ${totalDocuments}, In Progress: ${inProgressDocuments}, Completed: ${completedDocuments}, Pending: ${pendingDocuments}`);
    
    return NextResponse.json({
      success: true,
      totalDocuments,
      inProgressDocuments,
      completedDocuments,
      pendingDocuments,
      isMockData: false
    });
  } catch (error) {
    console.error('Error fetching document statistics:', error);
    
    // Return mock statistics as fallback
    return NextResponse.json({
      success: true,
      totalDocuments: 42,
      inProgressDocuments: 15,
      completedDocuments: 20,
      pendingDocuments: 7,
      isMockData: true
    });
  }
} 
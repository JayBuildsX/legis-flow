import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const documentId = params.id;

    if (!documentId) {
      return NextResponse.json(
        { message: 'Document ID is required' },
        { status: 400 }
      );
    }

    try {
      const versions = await prisma.documentVersion.findMany({
        where: { documentId },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const formattedVersions = versions.map(version => ({
        id: version.id,
        documentId: version.documentId,
        version: version.versionNumber.toString(),
        createdAt: version.createdAt.toISOString(),
        author: {
          id: version.createdBy.id,
          name: `${version.createdBy.firstName || ''} ${version.createdBy.lastName || ''}`.trim() || version.createdBy.email,
          email: version.createdBy.email
        },
        changeDescription: version.changeDescription || 'No description provided',
        status: version.status || 'draft'
      }));

      return NextResponse.json(formattedVersions);

    } catch (error) {
      console.error('Error fetching document versions from database:', error);
      return NextResponse.json(
        [],
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching document versions:', error);
    return NextResponse.json(
      { message: 'Error fetching document versions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const documentId = params.id;
    const body = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { message: 'Document ID is required' },
        { status: 400 }
      );
    }

    try {
      // Get the latest version number
      const latestVersion = await prisma.documentVersion.findFirst({
        where: { documentId },
        orderBy: { versionNumber: 'desc' }
      });

      const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

      const newVersion = await prisma.documentVersion.create({
        data: {
          documentId,
          versionNumber: nextVersionNumber,
          changeDescription: body.changeDescription || 'Document updated',
          status: body.status?.toLowerCase() || 'draft',
          createdById: 'admin-user-id' // Should come from JWT token
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

      const formattedVersion = {
        id: newVersion.id,
        documentId: newVersion.documentId,
        version: newVersion.versionNumber.toString(),
        createdAt: newVersion.createdAt.toISOString(),
        author: {
          id: newVersion.createdBy.id,
          name: `${newVersion.createdBy.firstName || ''} ${newVersion.createdBy.lastName || ''}`.trim() || newVersion.createdBy.email,
          email: newVersion.createdBy.email
        },
        changeDescription: newVersion.changeDescription,
        status: newVersion.status,
        isMockData: false
      };

      return NextResponse.json(formattedVersion, { status: 201 });

    } catch (error) {
      console.error('Error creating document version in database:', error);
      return NextResponse.json(
        { message: 'Failed to create document version' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating document version:', error);
    return NextResponse.json(
      { message: 'Error creating document version' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { SignatureService } from '@/lib/signatureService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Extract user from JWT token
 */
function getUserFromToken(request: NextRequest): { userId: string; email: string } | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string; 
      email: string; 
      username: string; 
    };
    
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    console.error('[SIGNATURE] Token verification failed:', error);
    return null;
  }
}

/**
 * POST /api/v1/documents/[id]/sign - Sign a document
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: documentId } = await context.params;
    const body = await request.json();
    const { versionId, signatureType, reason, position } = body;

    // Validate required fields
    if (!versionId || !signatureType) {
      return NextResponse.json(
        { error: 'Version ID and signature type are required' },
        { status: 400 }
      );
    }

    // Validate signature type
    const validTypes = ['ELECTRONIC', 'DIGITAL', 'QUALIFIED'];
    if (!validTypes.includes(signatureType)) {
      return NextResponse.json(
        { error: 'Invalid signature type' },
        { status: 400 }
      );
    }

    // Check if user can sign this document
    const canSign = await SignatureService.canUserSignDocument(user.userId, documentId);
    if (!canSign) {
      return NextResponse.json(
        { error: 'You do not have permission to sign this document' },
        { status: 403 }
      );
    }

    // Create signature
    const signatureResult = await SignatureService.signDocument({
      documentId,
      versionId,
      signedById: user.userId,
      signatureType,
      reason,
      position
    });

    if (!signatureResult.success) {
      return NextResponse.json(
        { error: signatureResult.message },
        { status: 400 }
      );
    }

    console.log(`[SIGNATURE] Document ${documentId} signed by user ${user.userId}`);

    return NextResponse.json({
      message: signatureResult.message,
      signature: {
        id: signatureResult.signatureId,
        timestamp: signatureResult.timestamp
      }
    }, { status: 201 });

  } catch (error) {
    console.error('[SIGNATURE] Error signing document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sign document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/documents/[id]/sign - Get document signatures and signing status
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: documentId } = await context.params;

    // Get document signatures
    const signatures = await SignatureService.getDocumentSignatures(documentId);
    
    // Get signing workflow status
    const workflowStatus = await SignatureService.getSigningWorkflowStatus(documentId);
    
    // Check if current user can sign
    const canUserSign = await SignatureService.canUserSignDocument(user.userId, documentId);

    return NextResponse.json({
      documentId,
      signatures,
      workflowStatus,
      canUserSign,
      signatureCount: signatures.length
    });

  } catch (error) {
    console.error('[SIGNATURE] Error getting document signatures:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get document signatures',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
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
 * GET /api/v1/signatures/[id]/verify - Verify a signature
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

    const { id: signatureId } = await context.params;

    // Verify signature
    const verificationResult = await SignatureService.verifySignature(signatureId);

    console.log(`[SIGNATURE] Signature ${signatureId} verification: ${verificationResult.isValid ? 'VALID' : 'INVALID'}`);

    return NextResponse.json({
      signatureId,
      verification: verificationResult
    });

  } catch (error) {
    console.error('[SIGNATURE] Error verifying signature:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify signature',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/signatures/[id]/verify - Verify signature with additional checks
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

    const { id: signatureId } = await context.params;
    const body = await request.json();
    const { includeChain = false } = body;

    // Verify signature
    const verificationResult = await SignatureService.verifySignature(signatureId);

    // Additional verification details
    const response: any = {
      signatureId,
      verification: verificationResult,
      verifiedAt: new Date().toISOString(),
      verifiedBy: user.userId
    };

    // Include certificate chain if requested
    if (includeChain && verificationResult.certificate) {
      response.certificateChain = {
        certificate: verificationResult.certificate,
        trust: {
          level: 'DEMO', // In production, implement proper trust level checking
          issuerVerified: true,
          chainComplete: true
        }
      };
    }

    console.log(`[SIGNATURE] Advanced verification for signature ${signatureId} by user ${user.userId}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[SIGNATURE] Error in advanced signature verification:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform advanced signature verification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MFAService } from '@/lib/mfaService';

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
    console.error('[MFA] Token verification failed:', error);
    return null;
  }
}

/**
 * GET /api/v1/auth/mfa - Get MFA status and setup data
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'setup') {
      // Generate new MFA secret for setup
      const setupData = MFAService.generateMFASecret(user.email);
      
      return NextResponse.json({
        success: true,
        data: setupData,
        message: 'MFA setup data generated'
      });
    } else if (action === 'status') {
      // Get current MFA status
      const status = await MFAService.getMFAStatus(user.userId);
      
      return NextResponse.json({
        success: true,
        data: status,
        message: 'MFA status retrieved'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "setup" or "status"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[MFA] GET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process MFA request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/auth/mfa - Enable, disable, verify, or regenerate MFA
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, secret, code } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'enable': {
        if (!secret || !code) {
          return NextResponse.json(
            { error: 'Secret and verification code are required' },
            { status: 400 }
          );
        }

        const result = await MFAService.enableMFA(user.userId, secret, code);
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            message: result.message
          });
        } else {
          return NextResponse.json(
            { error: result.message },
            { status: 400 }
          );
        }
      }

      case 'disable': {
        if (!code) {
          return NextResponse.json(
            { error: 'Verification code is required' },
            { status: 400 }
          );
        }

        const result = await MFAService.disableMFA(user.userId, code);
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            message: result.message
          });
        } else {
          return NextResponse.json(
            { error: result.message },
            { status: 400 }
          );
        }
      }

      case 'verify': {
        if (!code) {
          return NextResponse.json(
            { error: 'Verification code is required' },
            { status: 400 }
          );
        }

        const result = await MFAService.verifyMFAForLogin(user.userId, code);
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            message: result.message
          });
        } else {
          return NextResponse.json(
            { error: result.message },
            { status: 400 }
          );
        }
      }

      case 'regenerate-backup-codes': {
        if (!code) {
          return NextResponse.json(
            { error: 'Verification code is required' },
            { status: 400 }
          );
        }

        const result = await MFAService.regenerateBackupCodes(user.userId, code);
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            message: result.message,
            data: {
              backupCodes: result.backupCodes
            }
          });
        } else {
          return NextResponse.json(
            { error: result.message },
            { status: 400 }
          );
        }
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: enable, disable, verify, regenerate-backup-codes' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[MFA] POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process MFA request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
import crypto from 'crypto';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export interface MFASetupData {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}

export interface MFAVerificationResult {
  success: boolean;
  message: string;
}

/**
 * Multi-Factor Authentication Service
 * Provides TOTP-based MFA functionality
 */
export class MFAService {
  
  /**
   * Generate a new MFA secret for a user
   */
  static generateMFASecret(userEmail: string, serviceName: string = 'LEGIS-FLOW'): MFASetupData {
    // Generate a random secret (base32)
    const secret = crypto.randomBytes(20).toString('base32');
    
    // Create QR code URL for Google Authenticator compatibility
    const qrCodeUrl = this.generateQRCodeUrl(userEmail, serviceName, secret);
    
    return {
      secret,
      qrCodeUrl,
      manualEntryKey: secret
    };
  }
  
  /**
   * Generate QR code URL for authenticator apps
   */
  private static generateQRCodeUrl(userEmail: string, serviceName: string, secret: string): string {
    const label = encodeURIComponent(`${serviceName}:${userEmail}`);
    const issuer = encodeURIComponent(serviceName);
    
    return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
  }
  
  /**
   * Simple TOTP generation function
   * This is a basic implementation - in production, use a library like speakeasy
   */
  static generateTOTP(secret: string, timeStep: number = Math.floor(Date.now() / 30000)): string {
    // Convert base32 secret to buffer
    const secretBuffer = this.base32ToBuffer(secret);
    
    // Create time-based counter
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(timeStep, 4);
    
    // Generate HMAC-SHA1
    const hmac = crypto.createHmac('sha1', secretBuffer);
    hmac.update(timeBuffer);
    const digest = hmac.digest();
    
    // Dynamic truncation
    const offset = digest[digest.length - 1] & 0x0f;
    const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1000000;
    
    // Pad with zeros to ensure 6 digits
    return code.toString().padStart(6, '0');
  }
  
  /**
   * Convert base32 string to buffer
   */
  private static base32ToBuffer(base32: string): Buffer {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    
    for (const char of base32.toUpperCase()) {
      const val = base32chars.indexOf(char);
      if (val === -1) continue;
      bits += val.toString(2).padStart(5, '0');
    }
    
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      if (i + 8 <= bits.length) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
      }
    }
    
    return Buffer.from(bytes);
  }
  
  /**
   * Verify a TOTP code
   */
  static verifyTOTP(secret: string, token: string, window: number = 1): boolean {
    const currentTimeStep = Math.floor(Date.now() / 30000);
    
    // Check current time step and adjacent ones for clock drift tolerance
    for (let i = -window; i <= window; i++) {
      const expectedToken = this.generateTOTP(secret, currentTimeStep + i);
      if (expectedToken === token) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Enable MFA for a user
   */
  static async enableMFA(userId: string, secret: string, verificationCode: string): Promise<MFAVerificationResult> {
    try {
      // Verify the code first
      if (!this.verifyTOTP(secret, verificationCode)) {
        return {
          success: false,
          message: 'Invalid verification code. Please try again.'
        };
      }
      
      // Store MFA secret in database
      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaSecret: secret,
          mfaEnabled: true,
          mfaBackupCodes: this.generateBackupCodes()
        }
      });
      
      console.log(`[MFA] Enabled MFA for user ${userId}`);
      
      return {
        success: true,
        message: 'Multi-factor authentication has been successfully enabled.'
      };
    } catch (error) {
      console.error('[MFA] Error enabling MFA:', error);
      return {
        success: false,
        message: 'Failed to enable MFA. Please try again.'
      };
    }
  }
  
  /**
   * Disable MFA for a user
   */
  static async disableMFA(userId: string, verificationCode: string): Promise<MFAVerificationResult> {
    try {
      // Get user's current MFA secret
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { mfaSecret: true, mfaEnabled: true }
      });
      
      if (!user || !user.mfaEnabled || !user.mfaSecret) {
        return {
          success: false,
          message: 'MFA is not enabled for this account.'
        };
      }
      
      // Verify the code
      if (!this.verifyTOTP(user.mfaSecret, verificationCode)) {
        return {
          success: false,
          message: 'Invalid verification code. Please try again.'
        };
      }
      
      // Disable MFA
      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaSecret: null,
          mfaEnabled: false,
          mfaBackupCodes: null
        }
      });
      
      console.log(`[MFA] Disabled MFA for user ${userId}`);
      
      return {
        success: true,
        message: 'Multi-factor authentication has been disabled.'
      };
    } catch (error) {
      console.error('[MFA] Error disabling MFA:', error);
      return {
        success: false,
        message: 'Failed to disable MFA. Please try again.'
      };
    }
  }
  
  /**
   * Verify MFA code during login
   */
  static async verifyMFAForLogin(userId: string, code: string): Promise<MFAVerificationResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          mfaSecret: true, 
          mfaEnabled: true, 
          mfaBackupCodes: true 
        }
      });
      
      if (!user || !user.mfaEnabled || !user.mfaSecret) {
        return {
          success: false,
          message: 'MFA is not enabled for this account.'
        };
      }
      
      // Check if it's a TOTP code
      if (this.verifyTOTP(user.mfaSecret, code)) {
        return {
          success: true,
          message: 'MFA verification successful.'
        };
      }
      
      // Check if it's a backup code
      if (user.mfaBackupCodes && Array.isArray(user.mfaBackupCodes)) {
        const backupCodes = user.mfaBackupCodes as string[];
        const codeIndex = backupCodes.indexOf(code);
        
        if (codeIndex !== -1) {
          // Remove used backup code
          const updatedCodes = backupCodes.filter((_, index) => index !== codeIndex);
          
          await prisma.user.update({
            where: { id: userId },
            data: { mfaBackupCodes: updatedCodes }
          });
          
          return {
            success: true,
            message: 'MFA verification successful using backup code.'
          };
        }
      }
      
      return {
        success: false,
        message: 'Invalid verification code or backup code.'
      };
    } catch (error) {
      console.error('[MFA] Error verifying MFA for login:', error);
      return {
        success: false,
        message: 'MFA verification failed. Please try again.'
      };
    }
  }
  
  /**
   * Generate backup codes
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character backup codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }
  
  /**
   * Get user's MFA status
   */
  static async getMFAStatus(userId: string): Promise<{
    enabled: boolean;
    backupCodesRemaining: number;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          mfaEnabled: true, 
          mfaBackupCodes: true 
        }
      });
      
      return {
        enabled: user?.mfaEnabled || false,
        backupCodesRemaining: user?.mfaBackupCodes ? 
          (Array.isArray(user.mfaBackupCodes) ? user.mfaBackupCodes.length : 0) : 0
      };
    } catch (error) {
      console.error('[MFA] Error getting MFA status:', error);
      return {
        enabled: false,
        backupCodesRemaining: 0
      };
    }
  }
  
  /**
   * Regenerate backup codes
   */
  static async regenerateBackupCodes(userId: string, verificationCode: string): Promise<{
    success: boolean;
    message: string;
    backupCodes?: string[];
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { mfaSecret: true, mfaEnabled: true }
      });
      
      if (!user || !user.mfaEnabled || !user.mfaSecret) {
        return {
          success: false,
          message: 'MFA is not enabled for this account.'
        };
      }
      
      // Verify current MFA code
      if (!this.verifyTOTP(user.mfaSecret, verificationCode)) {
        return {
          success: false,
          message: 'Invalid verification code. Please try again.'
        };
      }
      
      // Generate new backup codes
      const newBackupCodes = this.generateBackupCodes();
      
      await prisma.user.update({
        where: { id: userId },
        data: { mfaBackupCodes: newBackupCodes }
      });
      
      return {
        success: true,
        message: 'Backup codes have been regenerated.',
        backupCodes: newBackupCodes
      };
    } catch (error) {
      console.error('[MFA] Error regenerating backup codes:', error);
      return {
        success: false,
        message: 'Failed to regenerate backup codes. Please try again.'
      };
    }
  }
} 
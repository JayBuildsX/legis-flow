import crypto from 'crypto';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export interface SignatureData {
  documentId: string;
  versionId: string;
  signedById: string;
  signatureType: 'ELECTRONIC' | 'DIGITAL' | 'QUALIFIED';
  reason?: string;
  position?: {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SignatureResult {
  success: boolean;
  message: string;
  signatureId?: string;
  timestamp?: string;
}

export interface SignatureVerificationResult {
  isValid: boolean;
  certificate?: any;
  timestamp: string;
  reason?: string;
}

/**
 * Electronic Signature Service
 * Provides digital signature functionality for legal documents
 */
export class SignatureService {
  
  /**
   * Create a digital signature for a document
   */
  static async signDocument(signatureData: SignatureData): Promise<SignatureResult> {
    try {
      const { documentId, versionId, signedById, signatureType, reason, position } = signatureData;
      
      // Verify document and version exist
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });
      
      if (!document) {
        return {
          success: false,
          message: 'Document not found'
        };
      }
      
      const version = await prisma.documentVersion.findUnique({
        where: { id: versionId }
      });
      
      if (!version) {
        return {
          success: false,
          message: 'Document version not found'
        };
      }
      
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: signedById }
      });
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      // Generate signature value (simplified - in production use proper cryptographic signature)
      const signatureContent = `${documentId}:${versionId}:${signedById}:${Date.now()}`;
      const signatureValue = this.generateSignatureValue(signatureContent, signedById);
      
      // Get or create user certificate
      let certificate = await this.getUserCertificate(signedById);
      if (!certificate) {
        certificate = await this.createUserCertificate(signedById);
      }
      
      // Create signature record
      const signature = await prisma.signature.create({
        data: {
          documentId,
          versionId,
          signedById,
          signatureType,
          signatureValue,
          certificateId: certificate.id,
          signaturePosition: position ? JSON.stringify(position) : null,
          reason: reason || null,
          ipAddress: null, // Would be passed from request in real implementation
          metadata: {
            userAgent: 'LEGIS-FLOW Digital Signature',
            timestamp: new Date().toISOString(),
            algorithm: 'SHA256withRSA'
          }
        }
      });
      
      console.log(`[SIGNATURE] Document ${documentId} signed by user ${signedById}`);
      
      return {
        success: true,
        message: 'Document signed successfully',
        signatureId: signature.id,
        timestamp: signature.signedAt.toISOString()
      };
      
    } catch (error) {
      console.error('[SIGNATURE] Error signing document:', error);
      return {
        success: false,
        message: 'Failed to sign document'
      };
    }
  }
  
  /**
   * Verify a document signature
   */
  static async verifySignature(signatureId: string): Promise<SignatureVerificationResult> {
    try {
      const signature = await prisma.signature.findUnique({
        where: { id: signatureId },
        include: {
          certificate: true,
          document: true,
          version: true,
          signedBy: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      if (!signature) {
        return {
          isValid: false,
          timestamp: new Date().toISOString(),
          reason: 'Signature not found'
        };
      }
      
      // Check certificate validity
      if (signature.certificate) {
        const now = new Date();
        const certValid = signature.certificate.validFrom <= now && 
                          signature.certificate.validTo >= now &&
                          signature.certificate.status === 'ACTIVE';
        
        if (!certValid) {
          await prisma.signature.update({
            where: { id: signatureId },
            data: { isValid: false }
          });
          
          return {
            isValid: false,
            timestamp: signature.signedAt.toISOString(),
            reason: 'Certificate is no longer valid'
          };
        }
      }
      
      // Verify signature integrity (simplified)
      const expectedSignature = this.generateSignatureValue(
        `${signature.documentId}:${signature.versionId}:${signature.signedById}:${signature.signedAt.getTime()}`,
        signature.signedById
      );
      
      const isValid = signature.signatureValue === expectedSignature && signature.isValid;
      
      return {
        isValid,
        certificate: signature.certificate ? {
          issuer: signature.certificate.issuer,
          serialNumber: signature.certificate.serialNumber,
          validFrom: signature.certificate.validFrom.toISOString(),
          validTo: signature.certificate.validTo.toISOString(),
          status: signature.certificate.status
        } : null,
        timestamp: signature.signedAt.toISOString(),
        reason: isValid ? 'Signature is valid' : 'Signature verification failed'
      };
      
    } catch (error) {
      console.error('[SIGNATURE] Error verifying signature:', error);
      return {
        isValid: false,
        timestamp: new Date().toISOString(),
        reason: 'Verification error'
      };
    }
  }
  
  /**
   * Get all signatures for a document
   */
  static async getDocumentSignatures(documentId: string) {
    try {
      const signatures = await prisma.signature.findMany({
        where: { documentId },
        include: {
          signedBy: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          certificate: {
            select: {
              issuer: true,
              serialNumber: true,
              validFrom: true,
              validTo: true,
              status: true
            }
          },
          version: {
            select: {
              versionNumber: true
            }
          }
        },
        orderBy: { signedAt: 'desc' }
      });
      
      return signatures.map(sig => ({
        id: sig.id,
        signatureType: sig.signatureType,
        signedAt: sig.signedAt.toISOString(),
        isValid: sig.isValid,
        reason: sig.reason,
        position: sig.signaturePosition,
        versionNumber: sig.version.versionNumber,
        signedBy: {
          id: sig.signedBy.id,
          name: `${sig.signedBy.firstName || ''} ${sig.signedBy.lastName || ''}`.trim() || sig.signedBy.username,
          email: sig.signedBy.email
        },
        certificate: sig.certificate
      }));
      
    } catch (error) {
      console.error('[SIGNATURE] Error getting document signatures:', error);
      return [];
    }
  }
  
  /**
   * Check if user can sign document (permission check)
   */
  static async canUserSignDocument(userId: string, documentId: string): Promise<boolean> {
    try {
      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      if (!user || user.status !== 'ACTIVE') {
        return false;
      }
      
      // Check if user has document signing permissions
      const hasSignPermission = user.userRoles.some(userRole =>
        userRole.role.rolePermissions.some(rp =>
          rp.permission.code === 'documents.sign' || 
          rp.permission.code === 'admin.access'
        )
      );
      
      return hasSignPermission;
      
    } catch (error) {
      console.error('[SIGNATURE] Error checking user permissions:', error);
      return false;
    }
  }
  
  /**
   * Generate signature value (simplified implementation)
   */
  private static generateSignatureValue(content: string, userId: string): string {
    // In production, this would use the user's private key
    // For demo purposes, we'll use HMAC with a user-specific secret
    const secret = `signature-key-${userId}`;
    return crypto.createHmac('sha256', secret).update(content).digest('hex');
  }
  
  /**
   * Get user's certificate
   */
  private static async getUserCertificate(userId: string) {
    return await prisma.certificate.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        validTo: {
          gte: new Date()
        }
      }
    });
  }
  
  /**
   * Create a certificate for user (demo implementation)
   */
  private static async createUserCertificate(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate a demo certificate (in production, integrate with CA)
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
    
    const now = new Date();
    const validTo = new Date();
    validTo.setFullYear(validTo.getFullYear() + 1); // 1 year validity
    
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        issuer: 'LEGIS-FLOW Demo CA',
        serialNumber: crypto.randomBytes(8).toString('hex').toUpperCase(),
        validFrom: now,
        validTo,
        publicKey: keyPair.publicKey,
        status: 'ACTIVE'
      }
    });
    
    console.log(`[SIGNATURE] Created certificate for user ${userId}`);
    return certificate;
  }
  
  /**
   * Revoke a certificate
   */
  static async revokeCertificate(certificateId: string, reason: string): Promise<boolean> {
    try {
      await prisma.certificate.update({
        where: { id: certificateId },
        data: {
          status: 'REVOKED',
          revocationDate: new Date(),
          revocationReason: reason
        }
      });
      
      // Invalidate all signatures using this certificate
      await prisma.signature.updateMany({
        where: { certificateId },
        data: { isValid: false }
      });
      
      console.log(`[SIGNATURE] Revoked certificate ${certificateId}: ${reason}`);
      return true;
      
    } catch (error) {
      console.error('[SIGNATURE] Error revoking certificate:', error);
      return false;
    }
  }
  
  /**
   * Get signing workflow status for document
   */
  static async getSigningWorkflowStatus(documentId: string) {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          workflow: {
            include: {
              workflow: {
                include: {
                  steps: {
                    where: {
                      requiresSignature: true
                    },
                    orderBy: { stepOrder: 'asc' }
                  }
                }
              },
              stepAssignments: {
                include: {
                  assignedTo: {
                    select: {
                      id: true,
                      username: true,
                      email: true,
                      firstName: true,
                      lastName: true
                    }
                  },
                  step: true
                }
              }
            }
          },
          signatures: {
            include: {
              signedBy: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });
      
      if (!document || !document.workflow) {
        return null;
      }
      
      const signingSteps = document.workflow.workflow.steps.filter(step => step.requiresSignature);
      const signatures = document.signatures;
      
      const workflowStatus = signingSteps.map(step => {
        const assignment = document.workflow?.stepAssignments.find(sa => sa.stepId === step.id);
        const signature = signatures.find(sig => sig.signedById === assignment?.assignedToId);
        
        return {
          stepId: step.id,
          stepName: step.name,
          stepOrder: step.stepOrder,
          assignedTo: assignment?.assignedTo ? {
            id: assignment.assignedTo.id,
            name: `${assignment.assignedTo.firstName || ''} ${assignment.assignedTo.lastName || ''}`.trim() || assignment.assignedTo.username
          } : null,
          isSigned: !!signature,
          signedAt: signature?.signedAt.toISOString(),
          signatureId: signature?.id
        };
      });
      
      const totalSteps = workflowStatus.length;
      const completedSteps = workflowStatus.filter(step => step.isSigned).length;
      
      return {
        documentId,
        totalSigningSteps: totalSteps,
        completedSteps,
        isComplete: completedSteps === totalSteps,
        progress: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
        steps: workflowStatus
      };
      
    } catch (error) {
      console.error('[SIGNATURE] Error getting signing workflow status:', error);
      return null;
    }
  }
} 
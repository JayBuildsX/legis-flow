'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  PenTool, 
  Shield, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  FileText,
  Award,
  Eye
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DocumentSignatureProps {
  documentId: string;
  versionId: string;
  currentUserId: string;
}

interface Signature {
  id: string;
  signatureType: string;
  signedAt: string;
  isValid: boolean;
  reason?: string;
  position?: any;
  versionNumber: number;
  signedBy: {
    id: string;
    name: string;
    email: string;
  };
  certificate?: {
    issuer: string;
    serialNumber: string;
    validFrom: string;
    validTo: string;
    status: string;
  };
}

interface WorkflowStatus {
  documentId: string;
  totalSigningSteps: number;
  completedSteps: number;
  isComplete: boolean;
  progress: number;
  steps: {
    stepId: string;
    stepName: string;
    stepOrder: number;
    assignedTo?: {
      id: string;
      name: string;
    };
    isSigned: boolean;
    signedAt?: string;
    signatureId?: string;
  }[];
}

export default function DocumentSignature({ documentId, versionId, currentUserId }: DocumentSignatureProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [canUserSign, setCanUserSign] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);

  // Signature form state
  const [signatureForm, setSignatureForm] = useState({
    signatureType: 'ELECTRONIC' as const,
    reason: '',
    position: null as any
  });

  useEffect(() => {
    loadSignatureData();
  }, [documentId]);

  const loadSignatureData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/v1/documents/${documentId}/sign`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSignatures(data.signatures || []);
        setWorkflowStatus(data.workflowStatus);
        setCanUserSign(data.canUserSign);
      } else {
        setError('Failed to load signature data');
      }
    } catch (error) {
      setError('Error loading signature data');
      console.error('Error loading signature data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signDocument = async () => {
    try {
      setIsSigningInProgress(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`/api/v1/documents/${documentId}/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          versionId,
          signatureType: signatureForm.signatureType,
          reason: signatureForm.reason || null,
          position: signatureForm.position
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setShowSignDialog(false);
        setSignatureForm({
          signatureType: 'ELECTRONIC',
          reason: '',
          position: null
        });
        await loadSignatureData(); // Reload to show new signature
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to sign document');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSigningInProgress(false);
    }
  };

  const verifySignature = async (signatureId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/v1/signatures/${signatureId}/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Signature verification: ${data.verification.isValid ? 'VALID' : 'INVALID'}\nReason: ${data.verification.reason}`);
      } else {
        alert('Failed to verify signature');
      }
    } catch (error) {
      alert('Error verifying signature');
      console.error('Error verifying signature:', error);
    }
  };

  const getSignatureTypeBadge = (type: string) => {
    switch (type) {
      case 'ELECTRONIC':
        return <Badge variant="secondary">Electronic</Badge>;
      case 'DIGITAL':
        return <Badge variant="default">Digital</Badge>;
      case 'QUALIFIED':
        return <Badge variant="outline">Qualified</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getSignatureStatusBadge = (isValid: boolean) => {
    return (
      <Badge variant={isValid ? "secondary" : "destructive"}>
        {isValid ? 'Valid' : 'Invalid'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Digital Signatures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Signing Workflow Status */}
      {workflowStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Signing Workflow Progress
            </CardTitle>
            <CardDescription>
              {workflowStatus.completedSteps} of {workflowStatus.totalSigningSteps} signatures completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${workflowStatus.progress}%` }}
                ></div>
              </div>
              
              <div className="grid gap-3">
                {workflowStatus.steps.map((step, index) => (
                  <div key={step.stepId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.isSigned ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {step.isSigned ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{step.stepName}</p>
                        {step.assignedTo && (
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {step.assignedTo.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {step.isSigned ? (
                        <div>
                          <Badge variant="secondary">Signed</Badge>
                          {step.signedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(step.signedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {workflowStatus.isComplete && (
                <Alert>
                  <Award className="h-4 w-4" />
                  <AlertDescription>
                    All required signatures have been completed for this document.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign Document Section */}
      {canUserSign && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Sign Document
            </CardTitle>
            <CardDescription>
              Add your electronic signature to this document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <PenTool className="h-4 w-4 mr-2" />
                  Sign Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sign Document</DialogTitle>
                  <DialogDescription>
                    Add your electronic signature to this document version
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="signatureType">Signature Type</Label>
                    <Select 
                      value={signatureForm.signatureType} 
                      onValueChange={(value: any) => setSignatureForm({...signatureForm, signatureType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ELECTRONIC">Electronic Signature</SelectItem>
                        <SelectItem value="DIGITAL">Digital Signature</SelectItem>
                        <SelectItem value="QUALIFIED">Qualified Signature</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="reason">Reason for Signing (optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter reason for signing this document..."
                      value={signatureForm.reason}
                      onChange={(e) => setSignatureForm({...signatureForm, reason: e.target.value})}
                    />
                  </div>
                  
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      By signing this document, you certify that you have read and agree to its contents.
                      Your signature will be legally binding.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={signDocument} 
                      disabled={isSigningInProgress}
                      className="flex-1"
                    >
                      {isSigningInProgress ? 'Signing...' : 'Sign Document'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSignDialog(false)}
                      disabled={isSigningInProgress}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Existing Signatures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Document Signatures ({signatures.length})
            </div>
          </CardTitle>
          <CardDescription>
            All signatures applied to this document
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signatures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PenTool className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No signatures found for this document</p>
            </div>
          ) : (
            <div className="space-y-4">
              {signatures.map((signature) => (
                <div key={signature.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{signature.signedBy.name}</span>
                        <span className="text-sm text-muted-foreground">({signature.signedBy.email})</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {getSignatureTypeBadge(signature.signatureType)}
                        {getSignatureStatusBadge(signature.isValid)}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(signature.signedAt).toLocaleString()}
                        </div>
                      </div>
                      
                      {signature.reason && (
                        <p className="text-sm text-muted-foreground italic">
                          Reason: {signature.reason}
                        </p>
                      )}
                      
                      {signature.certificate && (
                        <div className="text-xs text-muted-foreground">
                          Certificate: {signature.certificate.issuer} (S/N: {signature.certificate.serialNumber})
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifySignature(signature.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Verify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
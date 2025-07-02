'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  Key, 
  Download, 
  Copy,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface MFAStatus {
  enabled: boolean;
  backupCodesRemaining: number;
}

interface MFASetupData {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}

export default function MFAManager() {
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Load MFA status on component mount
  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/v1/auth/mfa?action=status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMfaStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to load MFA status:', error);
    }
  };

  const generateSetupData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch('/api/v1/auth/mfa?action=setup', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSetupData(data.data);
        setShowSetup(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate setup data');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const enableMFA = async () => {
    if (!setupData || !verificationCode) {
      setError('Please enter the verification code from your authenticator app');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch('/api/v1/auth/mfa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'enable',
          secret: setupData.secret,
          code: verificationCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setShowSetup(false);
        setVerificationCode('');
        setSetupData(null);
        await loadMFAStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to enable MFA');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const disableMFA = async () => {
    if (!verificationCode) {
      setError('Please enter your current MFA code to disable MFA');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch('/api/v1/auth/mfa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'disable',
          code: verificationCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setVerificationCode('');
        await loadMFAStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to disable MFA');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateBackupCodes = async () => {
    if (!verificationCode) {
      setError('Please enter your current MFA code to regenerate backup codes');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch('/api/v1/auth/mfa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'regenerate-backup-codes',
          code: verificationCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setBackupCodes(data.data.backupCodes);
        setShowBackupCodes(true);
        setVerificationCode('');
        await loadMFAStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to regenerate backup codes');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legis-flow-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!mfaStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Multi-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading MFA status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* MFA Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mfaStatus.enabled ? (
                <ShieldCheck className="h-5 w-5 text-green-600" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-orange-600" />
              )}
              Multi-Factor Authentication
            </div>
            <Badge variant={mfaStatus.enabled ? "secondary" : "outline"}>
              {mfaStatus.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with multi-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {mfaStatus.enabled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">MFA is currently enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Backup codes remaining: {mfaStatus.backupCodesRemaining}
                  </p>
                </div>
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => regenerateBackupCodes()}
                  disabled={isLoading}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Regenerate Backup Codes
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowSetup(true)}
                  disabled={isLoading}
                >
                  Disable MFA
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">MFA is not enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Secure your account with an authenticator app
                  </p>
                </div>
                <ShieldAlert className="h-8 w-8 text-orange-600" />
              </div>

              <Button onClick={generateSetupData} disabled={isLoading}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Set Up MFA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup MFA Card */}
      {showSetup && setupData && !mfaStatus.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Set Up Multi-Factor Authentication</CardTitle>
            <CardDescription>
              Scan the QR code with your authenticator app or enter the secret manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="inline-block p-4 border rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.qrCodeUrl)}`}
                  alt="QR Code for MFA setup"
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Or enter this secret manually:</Label>
              <div className="flex gap-2">
                <Input 
                  value={setupData.manualEntryKey} 
                  readOnly 
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(setupData.manualEntryKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="setup-code">Enter verification code from your app:</Label>
              <Input
                id="setup-code"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={enableMFA} disabled={isLoading || !verificationCode}>
                Enable MFA
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSetup(false);
                  setSetupData(null);
                  setVerificationCode('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disable MFA Card */}
      {showSetup && mfaStatus.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Disable Multi-Factor Authentication</CardTitle>
            <CardDescription>
              Enter your current MFA code to disable multi-factor authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: Disabling MFA will make your account less secure.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="disable-code">Enter your current MFA code:</Label>
              <Input
                id="disable-code"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={disableMFA} 
                disabled={isLoading || !verificationCode}
              >
                Disable MFA
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSetup(false);
                  setVerificationCode('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes Card */}
      {showBackupCodes && backupCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your New Backup Codes</CardTitle>
            <CardDescription>
              Save these backup codes in a secure location. Each code can only be used once.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Store these codes securely. They can be used to access your account if you lose your authenticator device.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadBackupCodes}>
                <Download className="h-4 w-4 mr-2" />
                Download Codes
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBackupCodes(false)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regenerate Backup Codes */}
      {mfaStatus.enabled && !showBackupCodes && (
        <Card>
          <CardHeader>
            <CardTitle>Regenerate Backup Codes</CardTitle>
            <CardDescription>
              Generate new backup codes if you've lost your existing ones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="regenerate-code">Enter your current MFA code:</Label>
              <Input
                id="regenerate-code"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <Button 
              onClick={regenerateBackupCodes} 
              disabled={isLoading || !verificationCode}
            >
              <Key className="h-4 w-4 mr-2" />
              Generate New Backup Codes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocumentUpload from '@/components/DocumentUpload';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the document type interface
interface DocumentType {
  id: string;
  name: string;
  description?: string | null;
}

export default function UploadDocumentPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await fetch('/api/v1/document-types');
        if (!response.ok) {
          throw new Error('Failed to fetch document types');
        }
        const data = await response.json();
        setDocumentTypes(data.data || []);
      } catch (error) {
        console.error('Error fetching document types:', error);
        setError('Failed to load document types. Please try again later.');
      } finally {
        setIsLoadingTypes(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSuccess = () => {
    router.push('/documents');
  };

  const handleCancel = () => {
    router.push('/documents');
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Document</h1>
        <p className="text-muted-foreground">
          Upload a new document to the system
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoadingTypes ? (
        <div className="flex justify-center items-center h-[40vh]">
          <div className="animate-pulse text-lg">Loading document types...</div>
        </div>
      ) : (
        <DocumentUpload
          documentTypes={documentTypes}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
} 
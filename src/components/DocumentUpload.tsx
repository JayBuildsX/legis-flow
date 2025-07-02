import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileIcon, X as XIcon, Upload as UploadIcon } from 'lucide-react';
import { Document } from '@/generated/prisma';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define interfaces
interface DocumentType {
  id: string;
  name: string;
  description?: string | null;
}

// Define Confidentiality enum for the front-end
enum Confidentiality {
  PUBLIC = 'PUBLIC',
  RESTRICTED = 'RESTRICTED',
  CONFIDENTIAL = 'CONFIDENTIAL',
  SECRET = 'SECRET'
}

interface DocumentUploadProps {
  documentTypes?: DocumentType[];
  onSuccess?: (document: Document) => void;
  onCancel?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  documentTypes = [], 
  onSuccess, 
  onCancel 
}) => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [confidentiality, setConfidentiality] = useState<Confidentiality>(Confidentiality.PUBLIC);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  // Trigger file input click
  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Add a keyword
  const addKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  // Remove a keyword
  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  // Handle keyword input keydown
  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!title || !referenceNumber || !documentTypeId) {
      setError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('referenceNumber', referenceNumber);
      formData.append('description', description);
      formData.append('documentTypeId', documentTypeId);
      formData.append('keywords', keywords.join(','));
      formData.append('confidentiality', confidentiality);

      const response = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      setSuccess('Document uploaded successfully');
      
      if (onSuccess) {
        onSuccess(data.document);
      } else {
        router.push(`/documents/${data.document.id}`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  // Get file extension
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Get file icon color based on type
  const getFileIconColor = (filename: string) => {
    const ext = getFileExtension(filename);
    switch (ext) {
      case 'pdf':
        return 'text-red-500';
      case 'docx':
      case 'doc':
        return 'text-blue-500';
      case 'xlsx':
      case 'xls':
        return 'text-green-500';
      case 'txt':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-card rounded-lg shadow-sm p-6 border">
      <h2 className="text-2xl font-semibold mb-6">Upload Document</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="default" className="mb-6 bg-green-50 text-green-700 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center cursor-pointer
            ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/70'}
            ${file ? 'bg-muted/50' : ''}
            transition-colors duration-200 ease-in-out`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.html,.md,.txt,.xml,.json"
          />
          
          {!file ? (
            <div className="space-y-3">
              <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, HTML, Markdown, TXT, XML, JSON (Max 20MB)
              </p>
              <Button
                variant="outline"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onButtonClick();
                }}
              >
                Select File
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center space-x-3">
                <FileIcon className={`h-8 w-8 ${getFileIconColor(file.name)}`} />
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                type="button"
                aria-label="Remove file"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Document Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="Enter document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Reference Number <span className="text-red-500">*</span></Label>
            <Input
              id="referenceNumber"
              placeholder="e.g. DOC-2023-001"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter a brief description of the document"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type <span className="text-red-500">*</span></Label>
            <Select 
              value={documentTypeId} 
              onValueChange={setDocumentTypeId}
              required
            >
              <SelectTrigger id="documentType">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confidentiality">Confidentiality</Label>
            <Select 
              value={confidentiality} 
              onValueChange={(value) => setConfidentiality(value as Confidentiality)}
            >
              <SelectTrigger id="confidentiality">
                <SelectValue placeholder="Select confidentiality level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Confidentiality.PUBLIC}>
                  Public
                </SelectItem>
                <SelectItem value={Confidentiality.RESTRICTED}>
                  Restricted
                </SelectItem>
                <SelectItem value={Confidentiality.CONFIDENTIAL}>
                  Confidential
                </SelectItem>
                <SelectItem value={Confidentiality.SECRET}>
                  Secret
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Keywords */}
        <div className="mb-6 space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <div className="flex items-end gap-2 mb-2">
            <Input
              id="keywords"
              placeholder="Enter keywords and press Enter"
              value={currentKeyword}
              onChange={(e) => setCurrentKeyword(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addKeyword}
            >
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword) => (
              <Badge 
                key={keyword} 
                variant="secondary"
                className="flex gap-1 items-center"
              >
                {keyword}
                <XIcon 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeKeyword(keyword)}
                />
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload; 
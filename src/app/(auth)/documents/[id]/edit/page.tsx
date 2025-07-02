'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, ArrowLeft, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import Link from 'next/link';

// Form validation schema
const documentFormSchema = z.object({
  title: z.string().min(3, {
    message: 'Le titre doit comporter au moins 3 caractères',
  }),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']),
  confidentiality: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'SECRET']),
  keywords: z.array(z.string()).optional(),
  content: z.string().min(10, {
    message: 'Le contenu doit comporter au moins 10 caractères',
  }),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

interface Document {
  id: string;
  title: string;
  description?: string;
  reference: string;
  status: string;
  confidentiality: string;
  tags: string[];
  metadata: any;
  isMockData?: boolean;
}

interface DocumentContent {
  content: string;
  format: string;
  version: string;
  documentId: string;
  mockData?: boolean;
}

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [document, setDocument] = useState<Document | null>(null);
  const [documentContent, setDocumentContent] = useState<DocumentContent | null>(null);

  // Initialize form
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      referenceNumber: '',
      status: 'DRAFT',
      confidentiality: 'PUBLIC',
      keywords: [],
      content: '',
    },
    mode: 'onChange',
  });

  // Watch form changes for auto-save
  const watchedValues = form.watch();

  // Fetch document and content data
  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        setError(null);
        
        // Fetch document metadata
        setIsLoadingDocument(true);
        console.log('Fetching document:', resolvedParams.id);
        
        const docResponse = await fetch(`/api/v1/documents/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'mock-token'}`,
          }
        });
        
        console.log('Document fetch response status:', docResponse.status);
        
        if (!docResponse.ok) {
          const errorText = await docResponse.text();
          console.error('Document fetch failed:', errorText);
          throw new Error(`Failed to fetch document (${docResponse.status}): ${docResponse.statusText}`);
        }
        
        const docData = await docResponse.json();
        console.log('Fetched document data:', docData);
        
        // Handle API response format (might have data wrapper)
        const document = docData.data || docData;
        setDocument(document);
        
        // Fetch document content
        setIsLoadingContent(true);
        console.log('Fetching document content for:', resolvedParams.id);
        
        const contentResponse = await fetch(`/api/v1/documents/${resolvedParams.id}/content`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'mock-token'}`,
          }
        });
        
        console.log('Content fetch response status:', contentResponse.status);
        
        if (!contentResponse.ok) {
          const errorText = await contentResponse.text();
          console.error('Content fetch failed:', errorText);
          throw new Error(`Failed to fetch document content (${contentResponse.status}): ${contentResponse.statusText}`);
        }
        
        const contentData = await contentResponse.json();
        console.log('Fetched content data:', contentData);
        setDocumentContent(contentData);
        
        // Update form with fetched data
        console.log('Resetting form with data:', {
          title: document.title,
          description: document.description,
          referenceNumber: document.reference,
          status: document.status,
          confidentiality: document.confidentiality,
          keywords: document.tags,
          content: contentData.content
        });
        
        form.reset({
          title: document.title || '',
          description: document.description || '',
          referenceNumber: document.reference || '',
          status: document.status || 'DRAFT',
          confidentiality: document.confidentiality || 'PUBLIC',
          keywords: document.tags || [],
          content: contentData.content || '',
        });
        
      } catch (error) {
        console.error('Error fetching document data:', error);
        setError('Erreur lors du chargement du document');
      } finally {
        setIsLoadingDocument(false);
        setIsLoadingContent(false);
      }
    };

    fetchDocumentData();
  }, [resolvedParams.id, form]);

  // Track form changes
  useEffect(() => {
    if (!document || !documentContent) return;
    
    const subscription = form.watch((value, { name }) => {
      if (name) {
        setHasUnsavedChanges(true);
        setSuccess(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, document, documentContent]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [watchedValues, hasUnsavedChanges]);

  // Save document
  const handleSave = async (showSuccessMessage = true) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = form.getValues();
      
      const metadataPayload = {
        title: formData.title,
        description: formData.description,
        referenceNumber: formData.referenceNumber,
        status: formData.status,
        confidentiality: formData.confidentiality,
        keywords: formData.keywords,
      };
      
      console.log('Saving document metadata:', metadataPayload);
      console.log('Document ID:', resolvedParams.id);
      console.log('Auth token:', localStorage.getItem('auth_token') ? 'Present' : 'Missing');
      
      // Save document metadata
      const metadataResponse = await fetch(`/api/v1/documents/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'mock-token'}`,
        },
        body: JSON.stringify(metadataPayload),
      });
      
      console.log('Metadata response status:', metadataResponse.status);
      console.log('Metadata response headers:', Object.fromEntries(metadataResponse.headers.entries()));

      if (!metadataResponse.ok) {
        console.error('Metadata response not OK:', {
          status: metadataResponse.status,
          statusText: metadataResponse.statusText,
          headers: Object.fromEntries(metadataResponse.headers.entries())
        });
        
        let errorData;
        try {
          const responseText = await metadataResponse.text();
          console.log('Raw error response:', responseText);
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error('Failed to parse error response as JSON:', parseError);
          errorData = { message: `HTTP ${metadataResponse.status}: ${metadataResponse.statusText}` };
        }
        
        console.error('Metadata save error:', errorData);
        throw new Error(errorData.message || `Failed to save document metadata (${metadataResponse.status}): ${metadataResponse.statusText}`);
      }

      // Save document content
      const contentResponse = await fetch(`/api/v1/documents/${resolvedParams.id}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'mock-token'}`,
        },
        body: JSON.stringify({
          content: formData.content,
          format: 'markdown',
        }),
      });

      if (!contentResponse.ok) {
        console.error('Content response not OK:', {
          status: contentResponse.status,
          statusText: contentResponse.statusText
        });
        
        let errorData;
        try {
          const responseText = await contentResponse.text();
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error('Failed to parse content error response as JSON:', parseError);
          errorData = { message: `HTTP ${contentResponse.status}: ${contentResponse.statusText}` };
        }
        
        console.error('Content save error:', errorData);
        throw new Error(errorData.message || `Failed to save document content (${contentResponse.status}): ${contentResponse.statusText}`);
      }

      // Create new version
      const versionResponse = await fetch(`/api/v1/documents/${resolvedParams.id}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'mock-token'}`,
        },
        body: JSON.stringify({
          content: formData.content,
          comment: 'Document updated via edit page',
        }),
      });

      // Note: Version creation might fail if endpoint doesn't exist, but that's okay
      
      // After successful save, refresh the document data to show updated values
      console.log('Save successful, refreshing document data...');
      
      try {
        // Re-fetch document metadata to get the updated values
        const refreshResponse = await fetch(`/api/v1/documents/${resolvedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'mock-token'}`,
          }
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const updatedDocument = refreshData.data || refreshData;
          setDocument(updatedDocument);
          
          // Update form with refreshed data to show the saved values
          form.reset({
            title: updatedDocument.title || '',
            description: updatedDocument.description || '',
            referenceNumber: updatedDocument.reference || '',
            status: updatedDocument.status || 'DRAFT',
            confidentiality: updatedDocument.confidentiality || 'PUBLIC',
            keywords: updatedDocument.tags || [],
            content: formData.content, // Keep the current content
          });
          
          console.log('Document data refreshed successfully');
        }
      } catch (refreshError) {
        console.error('Failed to refresh document data after save:', refreshError);
        // Don't fail the save operation if refresh fails
      }
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      if (showSuccessMessage) {
        setSuccess('Document sauvegardé avec succès');
        setTimeout(() => setSuccess(null), 3000);
      }

    } catch (error) {
      console.error('Error saving document:', error);
      setError('Erreur lors de la sauvegarde du document');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: DocumentFormValues) => {
    await handleSave(true);
  };

  if (isLoadingDocument || isLoadingContent) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <span className="text-neutral-600">Chargement du document...</span>
      </div>
    );
  }

  if (!document || !documentContent) {
    return (
      <div className="py-20 text-center">
        <p className="text-neutral-600">Document non trouvé</p>
        <Button asChild className="mt-4">
          <Link href="/documents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux documents
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/documents/${resolvedParams.id}`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Édition : {document.title}
          </h1>
          <p className="text-neutral-600 mt-1">
            Référence: {document.reference}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status */}
          {hasUnsavedChanges ? (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Modifications non sauvegardées
            </Badge>
          ) : lastSaved ? (
            <Badge variant="secondary" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Sauvegardé à {lastSaved.toLocaleTimeString()}
            </Badge>
          ) : null}

          {/* Preview Button */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/documents/${resolvedParams.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Link>
          </Button>

          {/* Save Button */}
          <Button 
            onClick={() => handleSave(true)} 
            disabled={isLoading || !hasUnsavedChanges}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Édition du document</CardTitle>
          <CardDescription>
            Modifiez le contenu et les métadonnées du document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Contenu</TabsTrigger>
                  <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4 mt-6">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu du document</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Saisissez le contenu du document..."
                            className="min-h-[400px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Le contenu principal du document (format Markdown supporté)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre</FormLabel>
                          <FormControl>
                            <Input placeholder="Titre du document" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de référence</FormLabel>
                          <FormControl>
                            <Input placeholder="REF-2024-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Statut</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un statut" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DRAFT">Brouillon</SelectItem>
                              <SelectItem value="REVIEW">En révision</SelectItem>
                              <SelectItem value="APPROVED">Approuvé</SelectItem>
                              <SelectItem value="PUBLISHED">Publié</SelectItem>
                              <SelectItem value="ARCHIVED">Archivé</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confidentiality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confidentialité</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Niveau de confidentialité" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PUBLIC">Public</SelectItem>
                              <SelectItem value="RESTRICTED">Restreint</SelectItem>
                              <SelectItem value="CONFIDENTIAL">Confidentiel</SelectItem>
                              <SelectItem value="SECRET">Secret</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Description du document..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Une description détaillée du contenu et du but du document
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isLoading || !hasUnsavedChanges}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde en cours...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 
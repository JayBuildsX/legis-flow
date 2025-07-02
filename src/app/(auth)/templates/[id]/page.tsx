'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  Loader2,
  Tag,
  CalendarIcon,
  UserIcon,
  BookIcon
} from 'lucide-react';
import { apiClient, DocumentTemplate } from '@/lib/api';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [documentTypeName, setDocumentTypeName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  // Resolve async params
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;

    const fetchTemplate = async () => {
      try {
        setLoading(true);
        // Fetch template details
        const response = await apiClient.getDocumentTemplate(resolvedParams.id);
        
        if (response.status === 200 && response.data) {
          setTemplate(response.data);
          
          // Fetch document type name
          const typesResponse = await apiClient.getDocumentTypes();
          if (typesResponse.status === 200 && typesResponse.data) {
            // Handle different response formats
            let typesData: any[] = [];
            
            if (Array.isArray(typesResponse.data)) {
              typesData = typesResponse.data;
            } else if (typesResponse.data && typeof typesResponse.data === 'object' && 'data' in typesResponse.data) {
              const nestedData = (typesResponse.data as any).data;
              if (Array.isArray(nestedData)) {
                typesData = nestedData;
              }
            }
            
            // Find the document type that matches the template's documentTypeId
            const docType = typesData.find(type => type.id === response.data.documentTypeId);
            if (docType) {
              setDocumentTypeName(docType.name);
            } else {
              setDocumentTypeName('Type inconnu');
            }
          }
        } else {
          throw new Error(response.message || 'Failed to fetch template');
        }
      } catch (err: any) {
        console.error('Error fetching template:', err);
        setError('Une erreur est survenue lors du chargement du modèle');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplate();
  }, [resolvedParams]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      try {
        setDeleting(true);
        const response = await apiClient.deleteDocumentTemplate(resolvedParams!.id);
        
        if (response.status === 200) {
          // Redirect back to templates list
          router.push('/templates');
        } else {
          throw new Error(response.message || 'Failed to delete template');
        }
      } catch (err) {
        console.error('Error deleting template:', err);
        setError('Une erreur est survenue lors de la suppression du modèle');
        setDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Chargement du modèle...</span>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/templates')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
        
        <Card className="bg-destructive/10 border-destructive/30 text-destructive">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Modèle introuvable'}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => router.push('/templates')}
            >
              Retour à la liste des modèles
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/templates')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la liste
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{template.name}</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/templates/${resolvedParams?.id || ''}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Type de document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookIcon className="h-4 w-4 mr-2 text-primary" />
              <Badge variant="outline">{documentTypeName}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Date de création</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
              <span>{format(new Date(template.createdAt), 'dd/MM/yyyy')}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Créé par</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-2 text-primary" />
              <span>{template.createdBy.name}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {template.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{template.description}</p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Contenu du modèle
            <Badge variant="outline" className="ml-2">{template.format}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {template.format === 'markdown' ? (
            <div className="prose prose-slate dark:prose-invert max-w-none border rounded-md p-4 bg-muted/30">
              <ReactMarkdown>{template.content}</ReactMarkdown>
            </div>
          ) : template.format === 'html' ? (
            <div 
              className="border rounded-md p-4 bg-muted/30"
              dangerouslySetInnerHTML={{ __html: template.content }} 
            />
          ) : (
            <pre className="font-mono text-sm border rounded-md p-4 bg-muted/30 whitespace-pre-wrap">
              {template.content}
            </pre>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Dernière modification: {format(new Date(template.updatedAt), 'dd/MM/yyyy HH:mm')}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  FileText, 
  Pencil,
  Trash2, 
  BookTemplate, 
  Loader2 
} from 'lucide-react';
import { apiClient, DocumentTemplate } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentTypeNames, setDocumentTypeNames] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch document templates and document types
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch templates
        const templatesResponse = await apiClient.getDocumentTemplates();
        console.log('Templates response:', templatesResponse);
        
        if (templatesResponse.status === 200 && templatesResponse.data) {
          // Make sure templates is an array
          const templatesData = Array.isArray(templatesResponse.data) 
            ? templatesResponse.data 
            : [];
          
          setTemplates(templatesData);
        } else {
          throw new Error(templatesResponse.message || 'Failed to fetch templates');
        }
        
        // Fetch document types to get names
        const typesResponse = await apiClient.getDocumentTypes();
        console.log('Document types response:', typesResponse);
        
        if (typesResponse.status === 200 && typesResponse.data) {
          // Extract document types from the response and handle different response formats
          let typesData: any[] = [];
          
          if (Array.isArray(typesResponse.data)) {
            typesData = typesResponse.data;
          } else if (typesResponse.data && typeof typesResponse.data === 'object' && 'data' in typesResponse.data) {
            const nestedData = (typesResponse.data as any).data;
            if (Array.isArray(nestedData)) {
              typesData = nestedData;
            }
          }
          
          // Create a map of document type IDs to names
          const typeMap: Record<string, string> = {};
          typesData.forEach((type: any) => {
            if (type && type.id && type.name) {
              typeMap[type.id] = type.name;
            }
          });
          setDocumentTypeNames(typeMap);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Une erreur est survenue lors du chargement des modèles');
        // Initialize empty arrays to prevent rendering errors
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      try {
        const response = await apiClient.deleteDocumentTemplate(id);
        
        if (response.status === 200) {
          // Remove the deleted template from state
          setTemplates(templates.filter(template => template.id !== id));
        } else {
          throw new Error(response.message || 'Failed to delete template');
        }
      } catch (err) {
        console.error('Error deleting template:', err);
        setError('Une erreur est survenue lors de la suppression du modèle');
      }
    }
  };

  const getDocumentTypeName = (typeId: string): string => {
    return documentTypeNames[typeId] || 'Type inconnu';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Chargement des modèles...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Modèles de documents</h1>
        <Button onClick={() => router.push('/templates/nouveau')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau modèle
        </Button>
      </div>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}
      
      {templates.length === 0 ? (
        <Card className="py-16 flex flex-col items-center justify-center text-center">
          <BookTemplate className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun modèle</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Les modèles de documents vous permettent de standardiser la création de documents et d'accélérer votre flux de travail.
          </p>
          <Button onClick={() => router.push('/templates/nouveau')}>
            Créer un modèle
          </Button>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type de document</TableHead>
              <TableHead>Créé par</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <BookTemplate className="h-4 w-4 text-primary mr-2" />
                    {template.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getDocumentTypeName(template.documentTypeId)}
                  </Badge>
                </TableCell>
                <TableCell>{template.createdBy.name}</TableCell>
                <TableCell>{format(new Date(template.createdAt), 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push(`/templates/${template.id}`)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push(`/templates/${template.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 
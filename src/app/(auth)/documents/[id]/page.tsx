'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LucideLoader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { apiClient, Document, DocumentContent, DocumentVersion } from '@/lib/api';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DocumentVersionComparison from '@/components/DocumentVersionComparison';

type CommentType = {
  id: number;
  user: string;
  date: string;
  content: string;
  resolved: boolean;
};

export default function DocumentDetail() {
  const params = useParams();
  const router = useRouter();
  
  // Safe date formatting utility
  const formatDate = (dateString: string | null | undefined, formatString: string = 'dd/MM/yyyy à HH:mm'): string => {
    if (!dateString) return 'Non défini';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return format(date, formatString);
    } catch {
      return 'Date invalide';
    }
  };
  
  // Handle the Promise-based params for Next.js 15 compatibility
  const resolvedParams = React.useMemo(() => {
    if (params && typeof params.id === 'string') {
      return { id: params.id };
    }
    return { id: '' };
  }, [params]);
  
  const id = resolvedParams.id;
  
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DocumentContent | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [versionToCompare, setVersionToCompare] = useState<string | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingVersions, setLoadingVersions] = useState<boolean>(false);
  const [loadingVersionContent, setLoadingVersionContent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        setLoading(true);
        // Fetch document details
        const docResponse = await apiClient.getDocument(id as string);
        setDocument(docResponse.data);
        
        // Set mock data based on the document
        setComments([
          { id: 1, user: "Admin User", date: "2024-03-11", content: "L'article 3 pourrait préciser la fréquence des réunions du comité de veille.", resolved: true },
          { id: 2, user: "Admin User", date: "2024-03-09", content: "Suggère d'ajouter une référence au Code de la santé publique dans l'article 1.", resolved: true },
          { id: 3, user: "Admin User", date: "2024-03-07", content: "Vérifier si les mesures de l'article 2 sont alignées avec les dernières recommandations sanitaires.", resolved: false }
        ]);

        // Fetch document content
        setLoadingVersionContent(true);
        const contentResponse = await apiClient.getDocumentContent(id as string);
        setContent(contentResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Impossible de charger le document. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
        setLoadingVersionContent(false);
      }
    };

    if (id) {
      fetchDocumentData();
    }
  }, [id]);

  // Fetch version content when a version is selected
  const fetchVersionContent = async (versionId: string) => {
    try {
      setLoadingVersionContent(true);
      const versionContentResponse = await apiClient.getVersionContent(id as string, versionId);
      if (versionContentResponse.status === 200) {
        setSelectedVersion(versionContentResponse.data);
        setCompareMode(true);
      } else {
        console.error('Error fetching version content:', versionContentResponse.message);
      }
    } catch (err) {
      console.error('Error fetching version content:', err);
    } finally {
      setLoadingVersionContent(false);
    }
  };

  const getStatusBadge = (status: string) => {
    // Map status to badge variants (now with added primary and warning variants)
    const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline" | "primary" | "warning"> = {
      "validé": "secondary",
      "revision": "primary",
      "validation": "primary",
      "signature": "warning",
      "en_attente": "warning",
      "draft": "default",
      "rejeté": "destructive",
      "published": "secondary",
      "approved": "secondary",
      "archived": "outline",
      "inconnu": "default"
    };
    
    const statusLabels = {
      "validé": "Validé",
      "revision": "En révision",
      "validation": "En validation",
      "signature": "Signature en attente",
      "en_attente": "En attente",
      "draft": "Brouillon",
      "rejeté": "Rejeté",
      "published": "Publié",
      "approved": "Approuvé",
      "archived": "Archivé",
      "inconnu": "Inconnu"
    };
    
    const variant = statusVariants[status as keyof typeof statusVariants] || statusVariants.inconnu;
    const label = statusLabels[status as keyof typeof statusLabels] || statusLabels.inconnu;
    
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleVersionSelect = (versionId: string) => {
    fetchVersionContent(versionId);
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (!compareMode) {
      setSelectedVersion(null);
    } else {
      setVersionToCompare(null);
    }
  };

  const fetchVersions = async () => {
    try {
      setLoadingVersions(true);
      const response = await apiClient.getDocumentVersions(id as string);
      if (response.status === 200 && Array.isArray(response.data)) {
        setVersions(response.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching document versions:', err);
      setError('Erreur lors du chargement de l\'historique des versions');
    } finally {
      setLoadingVersions(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LucideLoader2 size={24} className="animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement du document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">{error}</p>
        <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Document non trouvé</p>
        <Link href="/documents" className="mt-2 inline-block">
          <Button size="sm" variant="outline">Retour aux documents</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{document.title}</h1>
          <div className="flex gap-2 mt-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {document.reference}
            </span>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {document.type?.replace(/'/g, "&apos;") || 'Type non défini'}
            </span>
            {getStatusBadge(document.status)}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/documents/${id}/edit`)}
          >
            Modifier
          </Button>
          <Button 
            variant="default"
            onClick={() => router.push('/documents')}
          >
            Retour à la liste
          </Button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <Tabs defaultValue="content">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="versions" onClick={fetchVersions}>Versions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content">
            {content ? (
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <strong>Version actuelle:</strong> {content.version}
                </div>
                
                {compareMode && selectedVersion ? (
                  <DocumentVersionComparison 
                    currentVersion={content}
                    selectedVersion={selectedVersion}
                    versions={versions}
                    onSelectVersion={handleVersionSelect}
                    onClose={toggleCompareMode}
                    isLoading={loadingVersionContent}
                  />
                ) : (
                  <div className="markdown-content whitespace-pre-wrap">
                    {content.content}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <LucideLoader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Chargement du contenu...</span>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Informations générales</h3>
                <dl className="space-y-2">
                  <div className="grid grid-cols-3">
                    <dt className="text-gray-500">Référence</dt>
                    <dd className="col-span-2">{document.reference}</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-gray-500">Type</dt>
                    <dd className="col-span-2">{document.type}</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-gray-500">Statut</dt>
                    <dd className="col-span-2">{document.status}</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-gray-500">Catégorie</dt>
                    <dd className="col-span-2">{document.category || 'Non définie'}</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-gray-500">Tags</dt>
                    <dd className="col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {document.tags?.map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        )) || "Aucun tag"}
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Métadonnées</h3>
                <dl className="space-y-2">
                  <div className="grid grid-cols-3">
                    <dt className="text-gray-500">Créé par</dt>
                    <dd className="col-span-2">{document.author?.name || 'Non défini'}</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-gray-500">Email</dt>
                    <dd className="col-span-2">{document.author?.email || 'Non défini'}</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-gray-500">Créé le</dt>
                    <dd className="col-span-2">{formatDate(document.createdAt)}</dd>
                  </div>
                  <div className="grid grid-cols-3">
                    <dt className="text-gray-500">Dernière modification</dt>
                    <dd className="col-span-2">{formatDate(document.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="versions">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Historique des versions</h3>
              {versions?.length > 0 && !compareMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleCompareMode}
                >
                  Comparer les versions
                </Button>
              )}
            </div>
            
            {loadingVersions ? (
              <div className="flex items-center justify-center h-64">
                <LucideLoader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Chargement de l'historique...</span>
              </div>
            ) : versions?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Date de modification</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map(version => (
                    <TableRow key={version.id}>
                      <TableCell>{version.version}</TableCell>
                      <TableCell>{formatDate(version.createdAt, 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell>{version.author?.name || 'Non défini'}</TableCell>
                      <TableCell>{version.changeDescription}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleVersionSelect(version.id)}
                          disabled={loadingVersionContent}
                        >
                          {loadingVersionContent ? (
                            <LucideLoader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : null}
                          {compareMode ? "Comparer" : "Consulter"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-500 py-10">
                <p>Aucun historique de version disponible</p>
              </div>
            )}
            
            {selectedVersion && !compareMode && (
              <div className="mt-6 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">
                    Version {selectedVersion.version}
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedVersion(null)}
                  >
                    Fermer
                  </Button>
                </div>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{selectedVersion.content}</div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
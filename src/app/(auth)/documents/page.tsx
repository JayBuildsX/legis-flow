'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideFile, LucidePlus, LucideLoader2, LucideUpload } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { apiClient, DocumentMeta } from '@/lib/api';
import { formatDate, validateDocuments } from '@/lib/utils';
import DocumentSearchFilters, { SearchFilters } from '@/components/molecules/DocumentSearchFilters';
import SearchResultHighlight from '@/components/molecules/SearchResultHighlight';
import { useSearchParams, useRouter } from 'next/navigation';
import DeleteAllDocumentsButton from '@/components/molecules/DeleteAllDocumentsButton';

interface ExtendedDocumentMeta extends Omit<DocumentMeta, 'status'> {
  status: string; // Allow any string for status
  metadata?: {
    urgency?: 'normal' | 'faible' | 'elevee';
    [key: string]: any;
  };
  highlights?: {
    title?: string[];
    content?: string[];
    [key: string]: string[] | undefined;
  };
}

interface DocumentItemProps {
  id: string;
  reference: string;
  title: string;
  status: string;
  date?: string;
  urgency?: 'normal' | 'faible' | 'elevee';
  highlights?: {
    title?: string[];
    content?: string[];
    [key: string]: string[] | undefined;
  };
}

const DocumentItem = ({ id, reference, title, status, date, urgency, highlights }: DocumentItemProps) => {
  const statusConfig = {
    revision: {
      label: 'Révision',
      variant: 'primary',
    },
    validation: {
      label: 'Validation juridique',
      variant: 'primary',
    },
    signature: {
      label: 'Signature',
      variant: 'warning',
    },
    validé: {
      label: 'Validé',
      variant: 'secondary',
    },
    draft: {
      label: 'Brouillon',
      variant: 'default',
    },
    review: {
      label: 'Révision',
      variant: 'primary',
    },
    approved: {
      label: 'Approuvé',
      variant: 'secondary',
    },
    published: {
      label: 'Publié',
      variant: 'secondary',
    },
    archived: {
      label: 'Archivé',
      variant: 'outline',
    },
    en_attente: {
      label: 'En attente',
      variant: 'warning',
    },
    rejeté: {
      label: 'Rejeté',
      variant: 'destructive',
    },
    inconnu: {
      label: 'Inconnu',
      variant: 'default',
    },
  };

  const urgencyConfig = {
    normal: undefined,
    faible: {
      label: 'Faible',
      variant: 'default',
    },
    elevee: {
      label: 'Élevée',
      variant: 'destructive',
    },
  };
  
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.inconnu;
  const urgencyInfo = urgency ? urgencyConfig[urgency] : undefined;

  return (
    <div className="flex items-center justify-between rounded-md border p-4 bg-card shadow-sm hover:border-primary/20">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-muted p-2 text-muted-foreground">
          <LucideFile size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{title}</h4>
            <span className="text-xs text-muted-foreground">{reference}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {statusInfo && (
              <Badge variant={statusInfo.variant as "secondary" | "default" | "outline" | "destructive"}>
                {statusInfo.label}
              </Badge>
            )}
            {urgencyInfo && (
              <Badge variant={urgencyInfo.variant as "secondary" | "default" | "outline" | "destructive"}>
                {urgencyInfo.label}
              </Badge>
            )}
          </div>
          
          {/* Display search result highlights if available */}
          {highlights && Object.keys(highlights).length > 0 && (
            <SearchResultHighlight highlights={highlights} maxContentFragments={2} />
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {date && <span className="text-sm text-muted-foreground">{date}</span>}
        <Link href={`/documents/${id}`}>
          <Button size="sm" variant="outline">
            Voir
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default function Documents() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [documents, setDocuments] = useState<ExtendedDocumentMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [response, setResponse] = useState<any>(null); // To store the full API response
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: searchParams.get('q') || '',
    status: [],
    type: [],
    tags: [],
    dateFrom: null,
    dateTo: null,
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Fetch and process all unique tags from documents
  const collectAvailableTags = useCallback((docs: ExtendedDocumentMeta[]) => {
    const tagSet = new Set<string>();
    if (docs && Array.isArray(docs)) {
      docs.forEach(doc => {
        // Check if doc.tags exists before trying to iterate
        if (doc.tags && Array.isArray(doc.tags)) {
          doc.tags.forEach(tag => tagSet.add(tag));
        }
      });
    }
    return Array.from(tagSet);
  }, []);

  // Fetch documents with filters
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching documents with filters:', filters);
      
      // Convert component filters to API filters
      const apiFilters = {
        searchTerm: filters.searchTerm || undefined,
        status: filters.status,
        type: filters.type,
        tags: filters.tags,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      };
      
      const response = await apiClient.getDocuments(currentPage, pageSize, apiFilters);
      setResponse(response.data); // Store the full response
      
      console.log('Documents API response:', {
        status: response.status,
        total: response.data.total,
        items: response.data.items || response.data.documents || [],
        message: response.data.message
      });
      
      if (response.status === 200) {
        // Get documents from either 'items' or 'documents' property
        const docs = response.data.items || response.data.documents || [];
        
        // Validate documents before setting state
        const validation = validateDocuments(docs);
        
        if (!validation.valid) {
          console.warn('Invalid document format detected:', validation);
          
          // Log detailed information about the invalid document
          if (validation.firstInvalid) {
            console.warn('First invalid document:', validation.firstInvalid.doc);
            console.warn('Missing fields:', validation.firstInvalid.missing);
          }
        }
        
        setDocuments(docs);
        setTotalDocuments(response.data.total);
        
        // Debug: Log when documents are updated
        console.log('Documents state updated:', {
          documentCount: docs.length,
          firstDocument: docs.length > 0 ? {
            id: docs[0].id,
            title: docs[0].title,
            status: docs[0].status
          } : null
        });
        
        // Only update available tags on initial load or if they're not already set
        if (availableTags.length === 0) {
          // Fetch all documents without pagination to get all tags
          const allDocsResponse = await apiClient.getDocuments(1, 100);
          if (allDocsResponse.status === 200) {
            const allDocs = allDocsResponse.data.items || allDocsResponse.data.documents || [];
            const tags = collectAvailableTags(allDocs);
            setAvailableTags(tags);
          }
        }
        
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to load documents');
      }
    } catch (err: unknown) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Impossible de charger les documents. Veuillez réessayer plus tard.');
      setDocuments([]);
      setTotalDocuments(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters, availableTags.length, collectAvailableTags]);

  // Fetch documents when filters or pagination changes
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  // Update URL when search term changes
  useEffect(() => {
    if (filters.searchTerm) {
      router.push(`/documents?q=${encodeURIComponent(filters.searchTerm)}`);
    } else if (searchParams.has('q')) {
      router.push('/documents');
    }
  }, [filters.searchTerm, router, searchParams]);

  // Update filters from URL on initial load
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam && queryParam !== filters.searchTerm) {
      setFilters(prev => ({ ...prev, searchTerm: queryParam }));
    }
  }, [searchParams, filters.searchTerm]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <h2 className="text-2xl font-bold">Documents</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <DeleteAllDocumentsButton />
          <Link href="/documents/upload">
            <Button size="sm" variant="outline" className="gap-1">
              <LucideUpload size={16} className="mr-1" />
              Importer
            </Button>
          </Link>
          <Link href="/documents/nouveau">
            <Button size="sm" className="gap-1">
              <LucidePlus size={16} className="mr-1" />
              Nouveau document
            </Button>
          </Link>
        </div>
      </div>

      {/* Document search filters */}
      <DocumentSearchFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableTags={availableTags}
      />

      {/* Document list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <LucideLoader2 size={24} className="animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Chargement des documents...</span>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-destructive">{error}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => fetchDocuments()}>
              Réessayer
            </Button>
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              {response?.message || "Aucun document trouvé"}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
              {Object.values(filters).some(v => 
                Array.isArray(v) ? v.length > 0 : !!v
              ) && (
                <Button size="sm" variant="outline" onClick={() => handleFiltersChange({
                  searchTerm: '',
                  status: [],
                  type: [],
                  tags: [],
                  dateFrom: null,
                  dateTo: null,
                })}>
                  Effacer les filtres
                </Button>
              )}
              <Link href="/documents/nouveau">
                <Button size="sm" variant="default">
                  Créer un nouveau document
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-2">
              {totalDocuments} document{totalDocuments > 1 ? 's' : ''} trouvé{totalDocuments > 1 ? 's' : ''}
            </div>
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                id={doc.id}
                reference={doc.reference}
                title={doc.title}
                status={doc.status}
                date={formatDate(doc.updatedAt)}
                urgency={doc.metadata?.urgency}
                highlights={doc.highlights}
              />
            ))}
            
            {/* Pagination */}
            {totalDocuments > pageSize && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  
                  {Array.from({ length: Math.min(5, Math.ceil(totalDocuments / pageSize)) }).map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className="w-9"
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
                  {Math.ceil(totalDocuments / pageSize) > 5 && (
                    <span className="flex items-center px-2">...</span>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalDocuments / pageSize)))}
                    disabled={currentPage === Math.ceil(totalDocuments / pageSize)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
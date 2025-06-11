'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  File, 
  Save, 
  Trash, 
  Upload, 
  X, 
  Loader2, 
  BookTemplate
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, DocumentTemplate, DocumentCreateParams } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface DocumentTypeOption {
  id: string;
  name: string;
  workflow: string;
  description: string;
}

const documentTypes: DocumentTypeOption[] = [
  { 
    id: 'type-001', 
    name: 'Projet de loi',
    workflow: 'Processus législatif standard',
    description: 'Pour la rédaction et le suivi des projets de loi soumis au Parlement.'
  },
  { 
    id: 'type-002', 
    name: 'Décret',
    workflow: 'Procédure réglementaire',
    description: 'Pour les textes réglementaires signés par le Premier ministre ou le Président.'
  },
  { 
    id: 'type-003', 
    name: 'Arrêté ministériel',
    workflow: 'Circuit de validation interne',
    description: 'Pour les décisions prises par un ou plusieurs ministres.'
  },
  { 
    id: 'type-004', 
    name: 'Circulaire',
    workflow: 'Procédure administrative simplifiée',
    description: 'Pour les instructions adressées par les ministres aux services.'
  },
];

export default function NewDocument() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Fetch templates when document type changes
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!selectedType) return;
      
      try {
        setLoadingTemplates(true);
        const response = await apiClient.getDocumentTemplates();
        
        if (response.status === 200 && response.data) {
          // Filter templates based on document type if needed
          // In a real app, you would filter by documentTypeId that matches the selected type
          setTemplates(response.data);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    
    fetchTemplates();
  }, [selectedType]);

  // Load template content when a template is selected
  useEffect(() => {
    const loadTemplateContent = async () => {
      if (!selectedTemplate) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getDocumentTemplate(selectedTemplate);
        
        if (response.status === 200 && response.data) {
          // Pre-fill the content and optionally other fields from the template
          setContent(response.data.content);
          
          // If the title is empty, suggest a title based on the template
          if (!title) {
            setTitle(`Nouveau ${response.data.name}`);
          }
        }
      } catch (err) {
        console.error('Error loading template content:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplateContent();
  }, [selectedTemplate, title]);

  const handleFileUpload = () => {
    // In a real application, this would handle file uploads
    // For demo purposes, we'll just add a fake file
    setFiles([...files, `Fichier-${files.length + 1}.pdf`]);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async () => {
    // Validate form
    if (!title) {
      setError("Le titre du document est obligatoire");
      return;
    }

    if (!selectedType) {
      setError("Veuillez sélectionner un type de document");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare document data
      const documentData: DocumentCreateParams = {
        title,
        document_type_id: selectedType,
        reference_number: reference || `REF-${Date.now().toString().slice(-6)}`,
        content: content || "# " + title,
        content_format: "markdown",
        metadata: {
          files: files.length > 0 ? files : undefined,
          templateId: selectedTemplate || undefined,
          category: getDocumentTypeById(selectedType)?.name || ''
        }
      };

      // Send API request
      const response = await apiClient.createDocument(documentData);
      
      if (response.status !== 201 && response.status !== 200) {
        throw new Error(response.message || 'Failed to create document');
      }
      
      // Navigate to the newly created document
      router.push(`/documents/${response.data.id}`);
    } catch (err: unknown) {
      console.error('Error creating document:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du document. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeById = (id: string): DocumentTypeOption | undefined => {
    return documentTypes.find(type => type.id === id);
  };

  return (
    <div className="space-y-6">
      {/* Top navigation and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/documents" className="rounded-full p-2 hover:bg-muted">
            <ArrowLeft size={18} />
          </Link>
          <h2 className="text-2xl font-bold">Nouveau document</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1"
            onClick={() => router.push('/documents')}
            disabled={loading}
          >
            <Trash size={16} className="mr-1" />
            Annuler
          </Button>
          <Button 
            size="sm" 
            className="gap-1"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-1 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={16} className="mr-1" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error message if present */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-destructive border border-destructive/20">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Main form */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-6">
          {/* Basic info */}
          <div>
            <h3 className="mb-4 text-lg font-medium">Informations de base</h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium">
                  Titre <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Titre du document"
                  required
                />
              </div>
              <div>
                <label htmlFor="reference" className="block text-sm font-medium">
                  Référence
                </label>
                <input
                  type="text"
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="ex: L2024-001"
                />
              </div>
            </div>
          </div>

          {/* Document type selection */}
          <div>
            <h3 className="mb-4 text-lg font-medium">
              Type de document <span className="text-destructive">*</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {documentTypes.map((type) => (
                <div
                  key={type.id}
                  className={`border rounded-md p-4 cursor-pointer transition-colors ${
                    selectedType === type.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className="font-medium">{type.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{type.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Template selection */}
          {selectedType && (
            <div>
              <h3 className="mb-4 text-lg font-medium">
                Modèle de document <span className="text-muted-foreground font-normal text-sm">(optionnel)</span>
              </h3>
              
              {loadingTemplates ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 size={20} className="animate-spin text-primary mr-2" />
                  <span className="text-muted-foreground">Chargement des modèles...</span>
                </div>
              ) : templates.length > 0 ? (
                <RadioGroup 
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  value={selectedTemplate || ""}
                  onValueChange={(value: string) => setSelectedTemplate(value || null)}
                >
                  {templates.map((template) => (
                    <div key={template.id} className="relative">
                      <RadioGroupItem
                        value={template.id}
                        id={`template-${template.id}`}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`template-${template.id}`}
                        className={`flex flex-col h-full cursor-pointer rounded-md border-2 p-4 ${
                          selectedTemplate === template.id
                            ? 'border-primary'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <BookTemplate size={18} className="mt-0.5 text-primary" />
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground mt-1">{template.description}</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}

                  {/* No template option */}
                  <div className="relative">
                    <RadioGroupItem
                      value=""
                      id="template-none"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="template-none"
                      className={`flex flex-col h-full cursor-pointer rounded-md border-2 p-4 ${
                        selectedTemplate === null
                          ? 'border-primary'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <File size={18} className="mt-0.5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Document vierge</div>
                          <div className="text-sm text-muted-foreground mt-1">Créer un document sans modèle prédéfini</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Aucun modèle disponible pour ce type de document</p>
                </div>
              )}
            </div>
          )}

          {/* Preview template content */}
          {selectedTemplate && content && (
            <div>
              <h3 className="mb-4 text-lg font-medium">
                Aperçu du modèle
              </h3>
              <Card className="border border-muted">
                <CardContent className="p-4 overflow-auto max-h-[300px]">
                  <pre className="whitespace-pre-wrap text-sm">{content}</pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
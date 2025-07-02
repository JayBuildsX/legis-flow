'use client';

import { useState, useEffect } from 'react';
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { VariableFieldsEditor } from '@/components/templates/VariableFieldsEditor';

// Schema for form validation
const templateFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Le nom du modèle doit comporter au moins 3 caractères',
  }),
  description: z.string().optional(),
  documentTypeId: z.string({
    required_error: 'Veuillez sélectionner un type de document',
  }),
  content: z.string().min(10, {
    message: 'Le contenu du modèle doit comporter au moins 10 caractères',
  }),
  format: z.enum(['markdown', 'html', 'plain']),
  variables: z.array(z.any()).optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

export default function NewTemplatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [templateVariables, setTemplateVariables] = useState<any[]>([]);

  // Default form values
  const defaultValues: Partial<TemplateFormValues> = {
    name: '',
    description: '',
    content: `# [TITRE]

## Section 1
[CONTENU_SECTION_1]

## Section 2
[CONTENU_SECTION_2]

## Section 3
[CONTENU_SECTION_3]`,
    format: 'markdown',
    variables: [],
  };

  // Initialize form
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Fetch document types on component mount
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setLoadingTypes(true);
        const response = await apiClient.getDocumentTypes();
        
        if (response.status === 200 && response.data) {
          // Handle different response formats
          let typesData: Array<{ id: string; name: string }> = [];
          
          if (Array.isArray(response.data)) {
            typesData = response.data;
          } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            const nestedData = (response.data as any).data;
            if (Array.isArray(nestedData)) {
              typesData = nestedData;
            }
          }
          
          setDocumentTypes(typesData);
        }
      } catch (error) {
        console.error('Failed to fetch document types:', error);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  // Handle form submission
  async function onSubmit(data: TemplateFormValues) {
    try {
      setIsLoading(true);
      
      // Add variables metadata to the request
      const templateData = {
        name: data.name,
        description: data.description || '',
        documentTypeId: data.documentTypeId,
        content: data.content,
        format: data.format,
        metadata: {
          variables: templateVariables,
        },
      };
      
      const response = await apiClient.createDocumentTemplate(templateData);

      if (response.status === 201 && response.data) {
        // Redirect to the templates list on success
        router.push('/templates');
      } else {
        throw new Error(response.message || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  }

  // Handle content and variables changes from the VariableFieldsEditor
  const handleContentAndVariablesChange = (newContent: string, variables: any[]) => {
    form.setValue('content', newContent);
    setTemplateVariables(variables);
    form.setValue('variables', variables);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/templates')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la liste
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Nouveau modèle de document</CardTitle>
          <CardDescription>
            Créez un modèle qui servira de base à la rédaction de nouveaux documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du modèle</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Projet de loi standard" {...field} />
                      </FormControl>
                      <FormDescription>
                        Un nom clair et descriptif pour identifier ce modèle.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de document</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={loadingTypes}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type de document" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingTypes ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Chargement...</span>
                            </div>
                          ) : (
                            documentTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Le type de document pour lequel ce modèle sera utilisé.
                      </FormDescription>
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
                        placeholder="Ex: Structure standard pour les projets de loi" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Une brève description de l'usage prévu pour ce modèle.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="markdown">Markdown</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="plain">Texte brut</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Le format de rédaction du modèle.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Contenu</TabsTrigger>
                  <TabsTrigger value="variables">Variables</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="pt-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu du modèle</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field}
                            className="font-mono min-h-[400px]" 
                          />
                        </FormControl>
                        <FormDescription>
                          Utilisez la syntaxe Markdown pour formater le contenu. 
                          Utilisez des placeholders comme [TITRE] qui seront remplacés lors de la création d'un document.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="variables" className="pt-4">
                  <VariableFieldsEditor
                    content={form.watch('content')}
                    onChange={handleContentAndVariablesChange}
                    initialVariables={templateVariables}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="pt-4">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Créer le modèle
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
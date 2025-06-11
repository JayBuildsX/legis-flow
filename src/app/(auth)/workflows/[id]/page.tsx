"use client";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LucideActivity, 
  LucideArrowLeft, 
  LucideEdit, 
  LucideInfo, 
  LucideSettings, 
  LucideShare2 
} from 'lucide-react';
import Link from 'next/link';
import WorkflowEditor from '@/components/organisms/WorkflowEditor';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, FileText, Edit, Copy, Settings, ArrowRight, Check, MessageSquare, Clipboard, Clock, User, Users, FileCheck, LockKeyhole } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WorkflowProps {
  params: {
    id: string;
  };
}

// Fetch workflow data from API
function getWorkflow(id: string) {
  try {
    console.log(`Fetching workflow ${id} from API`);
    
    // Use a relative URL that works in server components
    const apiUrl = `/api/v1/workflows/${id}`;
    
    // Since we're in a client component, we need to use fetch without NextJS features
    // Note: We'll convert this to a synchronous return of mock data for now
    console.log('Using mock workflow data');
    return {
      id,
      name: 'Workflow législatif standard',
      description: 'Processus complet pour les projets de loi, de la rédaction à la promulgation',
      version: '1.2',
      createdAt: new Date(2023, 5, 10).toISOString(),
      updatedAt: new Date(2023, 11, 5).toISOString(),
      createdBy: {
        id: 'user1',
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com'
      },
      updatedBy: {
        id: 'user2',
        name: 'Marie Martin',
        email: 'marie.martin@example.com'
      },
      isActive: true,
      expectedDuration: 90, // days
      
      steps: [
        {
          id: 'step1',
          name: 'Rédaction initiale',
          description: 'Première ébauche du texte législatif',
          order: 1,
          expectedDuration: 14,
          requiresSignature: false,
          requiresComments: true,
          type: 'DRAFTING'
        },
        {
          id: 'step2',
          name: 'Révision juridique',
          description: 'Analyse de conformité avec le cadre légal existant',
          order: 2,
          expectedDuration: 7,
          requiresSignature: false,
          requiresComments: true,
          type: 'REVIEW'
        },
        {
          id: 'step3',
          name: 'Validation ministérielle',
          description: 'Approbation par le cabinet du ministre concerné',
          order: 3,
          expectedDuration: 10,
          requiresSignature: true,
          requiresComments: true,
          type: 'APPROVAL'
        },
        {
          id: 'step4',
          name: 'Consultation interministérielle',
          description: 'Recueil des avis des autres ministères',
          order: 4,
          expectedDuration: 21,
          requiresSignature: false,
          requiresComments: true,
          type: 'CONSULTATION'
        },
        {
          id: 'step5',
          name: 'Conseil d\'État',
          description: 'Examen par le Conseil d\'État',
          order: 5,
          expectedDuration: 14,
          requiresSignature: true,
          requiresComments: true,
          type: 'EXTERNAL_REVIEW'
        },
        {
          id: 'step6',
          name: 'Conseil des ministres',
          description: 'Présentation et adoption en Conseil des ministres',
          order: 6,
          expectedDuration: 7,
          requiresSignature: true,
          requiresComments: false,
          type: 'APPROVAL'
        },
        {
          id: 'step7',
          name: 'Examen parlementaire',
          description: 'Débats et vote au Parlement',
          order: 7,
          expectedDuration: 30,
          requiresSignature: false,
          requiresComments: true,
          type: 'EXTERNAL_REVIEW'
        },
        {
          id: 'step8',
          name: 'Promulgation',
          description: 'Signature par le Président et publication au Journal Officiel',
          order: 8,
          expectedDuration: 7,
          requiresSignature: true,
          requiresComments: false,
          type: 'PUBLICATION'
        }
      ],
      
      transitions: [
        { id: 't1', fromStepId: 'step1', toStepId: 'step2', condition: 'AUTOMATIC' },
        { id: 't2', fromStepId: 'step2', toStepId: 'step3', condition: 'APPROVAL_REQUIRED' },
        { id: 't3', fromStepId: 'step3', toStepId: 'step4', condition: 'APPROVAL_REQUIRED' },
        { id: 't4', fromStepId: 'step4', toStepId: 'step5', condition: 'APPROVAL_REQUIRED' },
        { id: 't5', fromStepId: 'step5', toStepId: 'step6', condition: 'APPROVAL_REQUIRED' },
        { id: 't6', fromStepId: 'step6', toStepId: 'step7', condition: 'APPROVAL_REQUIRED' },
        { id: 't7', fromStepId: 'step7', toStepId: 'step8', condition: 'APPROVAL_REQUIRED' }
      ],
      
      documentTypes: [
        { id: 'dt1', name: 'Projet de loi' },
        { id: 'dt2', name: 'Proposition de loi' }
      ],
      
      documents: [
        {
          id: 'doc1',
          title: 'Projet de loi sur la transition écologique',
          reference: 'PJL-2023-42',
          currentStep: {
            id: 'step4',
            name: 'Consultation interministérielle'
          }
        },
        {
          id: 'doc2',
          title: 'Projet de loi de finances 2024',
          reference: 'PLF-2024',
          currentStep: {
            id: 'step6',
            name: 'Conseil des ministres'
          }
        },
        {
          id: 'doc3',
          title: 'Projet de loi sur la réforme des retraites',
          reference: 'PJL-2023-56',
          currentStep: {
            id: 'step7',
            name: 'Examen parlementaire'
          }
        }
      ]
    };
  } catch (error) {
    console.error(`Error fetching workflow ${id}:`, error);
    
    // Return mock data as fallback
    console.log('Using mock workflow data');
    return {
      id,
      name: 'Workflow législatif standard',
      description: 'Processus complet pour les projets de loi, de la rédaction à la promulgation',
      version: '1.2',
      createdAt: new Date(2023, 5, 10).toISOString(),
      updatedAt: new Date(2023, 11, 5).toISOString(),
      createdBy: {
        id: 'user1',
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com'
      },
      updatedBy: {
        id: 'user2',
        name: 'Marie Martin',
        email: 'marie.martin@example.com'
      },
      isActive: true,
      expectedDuration: 90, // days
      
      steps: [
        {
          id: 'step1',
          name: 'Rédaction initiale',
          description: 'Première ébauche du texte législatif',
          order: 1,
          expectedDuration: 14,
          requiresSignature: false,
          requiresComments: true,
          type: 'DRAFTING'
        },
        {
          id: 'step2',
          name: 'Révision juridique',
          description: 'Analyse de conformité avec le cadre légal existant',
          order: 2,
          expectedDuration: 7,
          requiresSignature: false,
          requiresComments: true,
          type: 'REVIEW'
        },
        {
          id: 'step3',
          name: 'Validation ministérielle',
          description: 'Approbation par le cabinet du ministre concerné',
          order: 3,
          expectedDuration: 10,
          requiresSignature: true,
          requiresComments: true,
          type: 'APPROVAL'
        },
        {
          id: 'step4',
          name: 'Consultation interministérielle',
          description: 'Recueil des avis des autres ministères',
          order: 4,
          expectedDuration: 21,
          requiresSignature: false,
          requiresComments: true,
          type: 'CONSULTATION'
        },
        {
          id: 'step5',
          name: 'Conseil d\'État',
          description: 'Examen par le Conseil d\'État',
          order: 5,
          expectedDuration: 14,
          requiresSignature: true,
          requiresComments: true,
          type: 'EXTERNAL_REVIEW'
        },
        {
          id: 'step6',
          name: 'Conseil des ministres',
          description: 'Présentation et adoption en Conseil des ministres',
          order: 6,
          expectedDuration: 7,
          requiresSignature: true,
          requiresComments: false,
          type: 'APPROVAL'
        },
        {
          id: 'step7',
          name: 'Examen parlementaire',
          description: 'Débats et vote au Parlement',
          order: 7,
          expectedDuration: 30,
          requiresSignature: false,
          requiresComments: true,
          type: 'EXTERNAL_REVIEW'
        },
        {
          id: 'step8',
          name: 'Promulgation',
          description: 'Signature par le Président et publication au Journal Officiel',
          order: 8,
          expectedDuration: 7,
          requiresSignature: true,
          requiresComments: false,
          type: 'PUBLICATION'
        }
      ],
      
      transitions: [
        { id: 't1', fromStepId: 'step1', toStepId: 'step2', condition: 'AUTOMATIC' },
        { id: 't2', fromStepId: 'step2', toStepId: 'step3', condition: 'APPROVAL_REQUIRED' },
        { id: 't3', fromStepId: 'step3', toStepId: 'step4', condition: 'APPROVAL_REQUIRED' },
        { id: 't4', fromStepId: 'step4', toStepId: 'step5', condition: 'APPROVAL_REQUIRED' },
        { id: 't5', fromStepId: 'step5', toStepId: 'step6', condition: 'APPROVAL_REQUIRED' },
        { id: 't6', fromStepId: 'step6', toStepId: 'step7', condition: 'APPROVAL_REQUIRED' },
        { id: 't7', fromStepId: 'step7', toStepId: 'step8', condition: 'APPROVAL_REQUIRED' }
      ],
      
      documentTypes: [
        { id: 'dt1', name: 'Projet de loi' },
        { id: 'dt2', name: 'Proposition de loi' }
      ],
      
      documents: [
        {
          id: 'doc1',
          title: 'Projet de loi sur la transition écologique',
          reference: 'PJL-2023-42',
          currentStep: {
            id: 'step4',
            name: 'Consultation interministérielle'
          }
        },
        {
          id: 'doc2',
          title: 'Projet de loi de finances 2024',
          reference: 'PLF-2024',
          currentStep: {
            id: 'step6',
            name: 'Conseil des ministres'
          }
        },
        {
          id: 'doc3',
          title: 'Projet de loi sur la réforme des retraites',
          reference: 'PJL-2023-56',
          currentStep: {
            id: 'step7',
            name: 'Examen parlementaire'
          }
        }
      ]
    };
  }
}

function StepTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'EDITION':
      return <div className="rounded-full bg-blue-100 p-1.5 text-blue-600"><LucideEdit size={16} /></div>;
    case 'VALIDATION':
      return <div className="rounded-full bg-amber-100 p-1.5 text-amber-600"><LucideInfo size={16} /></div>;
    case 'SIGNATURE':
      return <div className="rounded-full bg-green-100 p-1.5 text-green-600"><LucideShare2 size={16} /></div>;
    case 'PUBLICATION':
      return <div className="rounded-full bg-purple-100 p-1.5 text-purple-600"><LucideActivity size={16} /></div>;
    default:
      return <div className="rounded-full bg-slate-100 p-1.5 text-slate-600"><LucideSettings size={16} /></div>;
  }
}

export default function WorkflowDetail({ params }: WorkflowProps) {
  const id = params.id;
  const [activeTab, setActiveTab] = useState('overview');
  const workflow = getWorkflow(id);
  
  return (
    <div className="container max-w-screen-xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{workflow.name}</h1>
          <p className="text-muted-foreground">{workflow.description}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Éditer
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Dupliquer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="steps">
        <TabsList className="mb-6">
          <TabsTrigger value="steps">Étapes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Étapes du workflow</CardTitle>
              <CardDescription>
                Ce workflow comporte {workflow.steps.length} étapes et a une durée estimée de {workflow.expectedDuration} jours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workflow.steps.map((step, index) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <StepTypeIcon type={step.type} />
                      {index < workflow.steps.length - 1 && (
                        <div className="h-full w-0.5 bg-slate-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900">
                              {step.order}. {step.name}
                            </h4>
                          </div>
                          <p className="text-sm text-slate-500">{step.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="bg-white">
                              <Clock className="h-3 w-3 mr-1" />
                              {step.expectedDuration} jours
                            </Badge>
                            {step.requiresSignature && (
                              <Badge variant="outline" className="bg-white">
                                <FileCheck className="h-3 w-3 mr-1" />
                                Signature requise
                              </Badge>
                            )}
                            {step.requiresComments && (
                              <Badge variant="outline" className="bg-white">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Commentaires requis
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents utilisant ce workflow</CardTitle>
              <CardDescription>
                {workflow.documents.length} documents sont actuellement dans ce workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-1">
                      <h4 className="font-medium text-slate-900">{doc.title}</h4>
                      <p className="text-sm text-slate-500">
                        Étape actuelle: <span className="font-medium">{doc.currentStep.name}</span>
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/documents/${doc.id}`}>
                        <span>Voir le document</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du workflow</CardTitle>
              <CardDescription>
                Configuration et propriétés du workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Types de documents acceptés</h3>
                <div className="flex flex-wrap gap-2">
                  {workflow.documentTypes.map((type, i) => (
                    <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                      {type.name}
                    </span>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Contrôle d'accès</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    Administrateurs
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Rédacteurs
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 flex items-center">
                    <LockKeyhole className="h-3 w-3 mr-1" />
                    Service juridique
                  </span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Créé par</h3>
                  <p className="font-medium">{workflow.createdBy.name}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(workflow.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Dernière modification</h3>
                  <p className="font-medium">{workflow.updatedBy.name}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(workflow.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
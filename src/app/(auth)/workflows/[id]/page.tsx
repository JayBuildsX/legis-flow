"use client";
import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, FileText, Edit, Copy, Settings, ArrowRight, Check, MessageSquare, Clipboard, Clock, User, Users, FileCheck, LockKeyhole, CheckCircle, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useParams } from 'next/navigation';

// Types
interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  stepType: string;
  stepOrder: number;
  isCompleted: boolean;
  isCurrent: boolean;
  expectedDuration: number;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  completedAt?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  updatedBy: {
    id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  expectedDuration: number;
  steps: WorkflowStep[];
  documentsCount: number;
  averageCompletionTime: number;
}

export default function WorkflowDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchWorkflowData();
    }
  }, [id]);

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      // For now, we'll use placeholder data that would come from the database
      const workflowData: Workflow = {
        id,
        name: 'Workflow législatif standard',
        description: 'Processus complet pour les projets de loi, de la rédaction à la promulgation',
        version: '1.2',
        createdAt: new Date(2023, 5, 10).toISOString(),
        updatedAt: new Date(2023, 11, 5).toISOString(),
        createdBy: {
          id: 'user1',
          name: 'Admin User',
          email: 'admin@example.com'
        },
        updatedBy: {
          id: 'user2',
          name: 'Admin User',
          email: 'admin@example.com'
        },
        isActive: true,
        expectedDuration: 90,
        documentsCount: 25,
        averageCompletionTime: 78,
        steps: [
          {
            id: 'step1',
            name: 'Rédaction initiale',
            description: 'Rédaction du projet de loi par les services compétents',
            stepType: 'CREATION',
            stepOrder: 1,
            isCompleted: true,
            isCurrent: false,
            expectedDuration: 15,
            assignedUser: {
              id: 'user1',
              name: 'Admin User',
              email: 'admin@example.com'
            },
            completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'step2',
            name: 'Révision juridique',
            description: 'Examen juridique et vérification de la conformité',
            stepType: 'REVIEW',
            stepOrder: 2,
            isCompleted: true,
            isCurrent: false,
            expectedDuration: 10,
            assignedUser: {
              id: 'user2',
              name: 'Admin User',
              email: 'admin@example.com'
            },
            completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'step3',
            name: 'Consultation inter-ministérielle',
            description: 'Consultation des ministères concernés',
            stepType: 'CONSULTATION',
            stepOrder: 3,
            isCompleted: false,
            isCurrent: true,
            expectedDuration: 20,
            assignedUser: {
              id: 'user3',
              name: 'Admin User',
              email: 'admin@example.com'
            }
          },
          {
            id: 'step4',
            name: 'Examen en Conseil des ministres',
            description: 'Présentation et validation en Conseil des ministres',
            stepType: 'APPROVAL',
            stepOrder: 4,
            isCompleted: false,
            isCurrent: false,
            expectedDuration: 5
          },
          {
            id: 'step5',
            name: 'Dépôt au Parlement',
            description: 'Transmission au Parlement pour examen',
            stepType: 'SUBMISSION',
            stepOrder: 5,
            isCompleted: false,
            isCurrent: false,
            expectedDuration: 2
          },
          {
            id: 'step6',
            name: 'Examen parlementaire',
            description: 'Débats et votes au Parlement',
            stepType: 'PARLIAMENTARY_REVIEW',
            stepOrder: 6,
            isCompleted: false,
            isCurrent: false,
            expectedDuration: 30
          },
          {
            id: 'step7',
            name: 'Promulgation',
            description: 'Signature et publication du texte final',
            stepType: 'PROMULGATION',
            stepOrder: 7,
            isCompleted: false,
            isCurrent: false,
            expectedDuration: 3
          }
        ]
      };
      
      setWorkflow(workflowData);
      setError(null);
    } catch (err) {
      console.error('Error fetching workflow:', err);
      setError('Impossible de charger le workflow. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={fetchWorkflowData} className="mt-4">
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workflow) return null;

  const completedSteps = workflow.steps.filter(step => step.isCompleted).length;
  const totalSteps = workflow.steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{workflow.name}</h1>
        <p className="text-gray-600">{workflow.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Version {workflow.version}</span>
          <span>•</span>
          <span>Créé le {new Date(workflow.createdAt).toLocaleDateString('fr-FR')}</span>
          <span>•</span>
          <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
            {workflow.isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Progression</p>
                <p className="text-2xl font-bold text-gray-900">{completedSteps}/{totalSteps}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Durée attendue</p>
                <p className="text-2xl font-bold text-gray-900">{workflow.expectedDuration}j</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">{workflow.documentsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Temps moyen</p>
                <p className="text-2xl font-bold text-gray-900">{workflow.averageCompletionTime}j</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Progression globale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {Math.round(progressPercentage)}% complété
          </p>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Tabs defaultValue="steps" className="w-full">
        <TabsList>
          <TabsTrigger value="steps">Étapes</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Étapes du workflow</CardTitle>
              <CardDescription>
                Progression et statut de chaque étape
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg border ${
                      step.isCurrent
                        ? 'border-blue-500 bg-blue-50'
                        : step.isCompleted
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {step.isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : step.isCurrent ? (
                        <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-xs font-bold">{index + 1}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{step.name}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Durée: {step.expectedDuration} jours</span>
                        {step.assignedUser && (
                          <span>Assigné à: {step.assignedUser.name}</span>
                        )}
                        {step.completedAt && (
                          <span>Complété le: {new Date(step.completedAt).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Badge
                        variant={
                          step.isCompleted
                            ? 'default'
                            : step.isCurrent
                            ? 'outline'
                            : 'secondary'
                        }
                      >
                        {step.isCompleted
                          ? 'Complété'
                          : step.isCurrent
                          ? 'En cours'
                          : 'En attente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-gray-500 py-8">
                  <p>Aucun historique disponible pour ce workflow.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du workflow
                  </label>
                  <input
                    type="text"
                    value={workflow.name}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={workflow.description}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée attendue (jours)
                    </label>
                    <input
                      type="number"
                      value={workflow.expectedDuration}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={workflow.version}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
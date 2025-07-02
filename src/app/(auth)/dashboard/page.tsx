'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { 
  LucideCheckCircle, 
  LucideFile, 
  LucideFileCheck, 
  LucideFileWarning, 
  LucideArrowUp, 
  LucideArrowRight, 
  LucideCalendar, 
  LucideDownload, 
  LucideFileClock, 
  LucideFileText, 
  LucideCalendarClock, 
  LucideChevronRight, 
  LucideEye,
  LucideCheck,
  LucideWorkflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StatSkeletonCard } from '@/components/ui/stat-skeleton-card';
import { SkeletonCard } from '@/components/ui/skeleton-card';

interface DocumentStats {
  total: number;
  inProgress: number;
  completed: number;
  pending: number;
}

interface Task {
  id: string;
  title: string;
  documentTitle: string;
  documentId: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface Document {
  id: string;
  title: string;
  reference: string;
  status: string;
  updatedAt: string;
  type?: string;
  author?: {
    name: string;
    email: string;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  href?: string;
}

const StatCard = ({ title, value, icon, description, trend, href }: StatCardProps) => {
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (href) {
      return (
        <Link href={href} className="block">
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-neutral-200 hover:border-blue-300 bg-white">
            {children}
          </Card>
        </Link>
      );
    }
    return (
      <Card className="border-neutral-200 bg-white">
        {children}
      </Card>
    );
  };

  return (
    <CardWrapper>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-neutral-600 font-medium">{title}</CardDescription>
          <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-neutral-900">{value}</p>
            {description && <p className="text-sm text-neutral-500 mt-1">{description}</p>}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.positive ? <LucideArrowUp size={14} /> : <LucideArrowUp size={14} className="rotate-180" />}
              {trend.value}
            </div>
          )}
        </div>
      </CardContent>
    </CardWrapper>
  );
};

interface TaskItemProps {
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  type: string;
  documentId?: string;
}

const TaskItem = ({ title, dueDate, priority, type, documentId }: TaskItemProps) => {
  const priorityVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    low: "outline",
    medium: "default", 
    high: "destructive",
  };

  const priorityLabels = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Haute',
  };

  const priorityColors = {
    low: 'text-neutral-600 bg-neutral-50 border-neutral-300',
    medium: 'text-amber-700 bg-amber-50 border-amber-300',
    high: 'text-red-700 bg-red-50 border-red-300',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600">
          <LucideFile size={16} />
        </div>
        <div>
          <h4 className="font-semibold text-neutral-900">{title}</h4>
          <p className="text-sm text-neutral-600">{type}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${priorityColors[priority]}`}>
          {priorityLabels[priority]}
        </span>
        <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-md">
          <LucideCalendar size={14} />
          <span>{dueDate}</span>
        </div>
        <Link href={documentId ? `/documents/${documentId}` : '/documents'}>
          <Button size="sm" className="btn-primary">
            <LucideEye size={14} className="mr-1" />
            Voir
          </Button>
        </Link>
      </div>
    </div>
  );
};

// Status to badge variant mapping
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
  switch (status) {
    case 'APPROVED':
      return 'secondary'; // For success
    case 'IN_PROGRESS':
      return 'default'; // For warning
    default:
      return 'outline'; // For default/pending
  }
};

// Status to display text mapping
const getStatusDisplayText = (status: string): string => {
  switch (status) {
    case 'APPROVED':
      return 'Terminé';
    case 'IN_PROGRESS':
      return 'En cours';
    default:
      return 'En attente';
  }
};

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    inProgress: 0,
    completed: 0,
    pending: 0
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);

  // Fetch document stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/v1/documents/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            total: data.totalDocuments || 0,
            inProgress: data.inProgressDocuments || 0,
            completed: data.completedDocuments || 0,
            pending: data.pendingDocuments || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/v1/tasks');
        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            setTasks(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // Fetch recent documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/v1/documents?page=1&pageSize=5');
        if (response.ok) {
          const data = await response.json();
          console.log('Documents API response:', data);
          
          if (data.documents && Array.isArray(data.documents)) {
            // Transform API data to match our Document interface
            const formattedDocs = data.documents.map((doc: any) => ({
              id: doc.id,
              title: doc.title,
              reference: doc.reference || 'N/A',
              status: doc.status || 'DRAFT',
              updatedAt: doc.updatedAt || new Date().toISOString(),
              type: doc.type
            }));
            
            console.log('Formatted documents:', formattedDocs);
            setRecentDocuments(formattedDocs);
          } else {
            console.log('No documents array found in response');
            setRecentDocuments([]);
          }
        } else {
          console.error('API response not OK:', response.status);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setRecentDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome message */}
      {showWelcome && !isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center justify-between animate-fade shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <LucideCheckCircle className="text-blue-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 text-lg">Bienvenue sur LEGIS-FLOW</h4>
              <p className="text-blue-700 mt-1">Votre tableau de bord actualisé avec les dernières statistiques et activités.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowWelcome(false)} 
            className="text-blue-500 hover:text-blue-700 text-xl font-light hover:bg-blue-100 rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Tableau de bord</h2>
          <p className="text-neutral-600 mt-2 text-lg">Bienvenue, voici votre aperçu quotidien</p>
          <div className="flex items-center gap-2 mt-1 text-sm text-neutral-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="btn-secondary">
            <LucideDownload size={14} className="mr-2" />
            Exporter
          </Button>
          <Link href="/documents/upload">
            <Button size="sm" className="btn-primary">
              <LucideFileText size={14} className="mr-2" />
              Nouveau document
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatSkeletonCard />
            <StatSkeletonCard />
            <StatSkeletonCard />
            <StatSkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              title="Total Documents"
              value={stats.total.toString()}
              icon={<LucideFileText className="h-6 w-6" />}
              description="Documents dans le système"
              trend={{ value: "+12%", positive: true }}
              href="/documents"
            />
            <StatCard
              title="En cours"
              value={stats.inProgress.toString()}
              icon={<LucideFileClock className="h-6 w-6" />}
              description="Documents en traitement"
              trend={{ value: "+5%", positive: true }}
              href="/documents?status=in_progress"
            />
            <StatCard
              title="Terminés"
              value={stats.completed.toString()}
              icon={<LucideCheck className="h-6 w-6" />}
              description="Documents finalisés"
              trend={{ value: "+8%", positive: true }}
              href="/documents?status=completed"
            />
            <StatCard
              title="En attente"
              value={stats.pending.toString()}
              icon={<LucideCalendarClock className="h-6 w-6" />}
              description="En attente de validation"
              trend={{ value: "-3%", positive: false }}
              href="/documents?status=pending"
            />
          </>
        )}
      </div>

      {/* Tasks */}
      {isLoading ? (
        <SkeletonCard header headerHeight={8} lines={5} />
      ) : (
        <Card className="border-neutral-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2.5 rounded-lg">
                  <LucideCalendarClock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-neutral-900">Tâches prioritaires</CardTitle>
                  <p className="text-neutral-600 text-sm mt-1">Actions requises aujourd'hui</p>
                </div>
              </div>
              <Link href="/workflows">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  Voir toutes les tâches
                  <LucideChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.length > 0 ? (
              tasks.slice(0, 3).map(task => (
                <TaskItem
                  key={task.id}
                  title={task.title}
                  dueDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : 'Non défini'}
                  priority={task.priority}
                  type={task.documentTitle}
                  documentId={task.documentId}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-orange-100 p-4 rounded-full">
                    <LucideCalendarClock className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucune tâche prioritaire</h3>
                    <p className="text-neutral-600 max-w-md">
                      Parfait ! Vous n'avez actuellement aucune tâche urgente à traiter. 
                      Les nouvelles tâches apparaîtront ici au fur et à mesure.
                    </p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <Link href="/documents/nouveau">
                      <Button size="sm" className="btn-primary">
                        <LucideFileText size={14} className="mr-2" />
                        Créer un document
                      </Button>
                    </Link>
                    <Link href="/workflows">
                      <Button size="sm" variant="outline" className="btn-secondary">
                        <LucideWorkflow size={14} className="mr-2" />
                        Voir workflows
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent documents */}
      {isLoading ? (
        <SkeletonCard header headerHeight={8} lines={7} />
      ) : (
        <Card className="border-neutral-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2.5 rounded-lg">
                  <LucideFileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-neutral-900">Documents récents</CardTitle>
                  <p className="text-neutral-600 text-sm mt-1">Dernières modifications</p>
                </div>
              </div>
              <Link href="/documents">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  Voir tous les documents
                  <LucideChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-neutral-200">
                    <TableHead className="text-neutral-700 font-semibold">Référence</TableHead>
                    <TableHead className="hidden md:table-cell text-neutral-700 font-semibold">Titre</TableHead>
                    <TableHead className="text-neutral-700 font-semibold">Statut</TableHead>
                    <TableHead className="hidden sm:table-cell text-neutral-700 font-semibold">Date de modification</TableHead>
                    <TableHead className="text-neutral-700 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDocuments.length > 0 ? (
                    recentDocuments.map((doc) => (
                      <TableRow key={doc.id} className="border-b border-neutral-100 hover:bg-blue-50/50 transition-colors">
                        <TableCell className="py-3 px-4 text-sm font-medium text-neutral-700">{doc.reference || 'N/A'}</TableCell>
                        <TableCell className="py-3 px-4">
                          <Link href={`/documents/${doc.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                            {doc.title}
                          </Link>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                            doc.status === 'APPROVED' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : doc.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                          }`}>
                            {getStatusDisplayText(doc.status)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-neutral-600">
                          {new Date(doc.updatedAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Link href={`/documents/${doc.id}`}>
                              <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-blue-600 hover:bg-blue-50">
                                <LucideEye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/documents/${doc.id}/download`}>
                              <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-green-600 hover:bg-green-50">
                                <LucideDownload className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-neutral-100 p-3 rounded-full">
                            <LucideFileText className="h-6 w-6 text-neutral-400" />
                          </div>
                          <div>
                            <p className="text-neutral-600 font-medium">Aucun document récent</p>
                            <p className="text-neutral-500 text-sm">Commencez par créer votre premier document</p>
                          </div>
                          <Link href="/documents/nouveau">
                            <Button size="sm" className="btn-primary mt-2">
                              Créer un document
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
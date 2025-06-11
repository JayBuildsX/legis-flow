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
  LucideCheck
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
  return (
    <Card hoverable className="transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription>{title}</CardDescription>
          <div className="rounded-lg bg-primary-100 p-2 text-primary-600">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend.positive ? 'text-secondary-600' : 'text-accent-red-600'
            }`}>
              {trend.positive ? <LucideArrowUp size={14} /> : <LucideArrowUp size={14} className="rotate-180" />}
              {trend.value}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface TaskItemProps {
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  type: string;
}

const TaskItem = ({ title, dueDate, priority, type }: TaskItemProps) => {
  const priorityVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    low: "default",
    medium: "secondary",
    high: "destructive",
  };

  const priorityLabels = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Haute',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm hover:border-primary-200 hover:bg-slate-50 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary-100 p-2 text-primary-600">
          <LucideFile size={16} />
        </div>
        <div>
          <h4 className="font-medium text-slate-900">{title}</h4>
          <p className="text-xs text-slate-600">{type}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto mt-2 sm:mt-0">
        <Badge variant={priorityVariants[priority]}>
          {priorityLabels[priority]}
        </Badge>
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <LucideCalendar size={14} className="hidden sm:block" />
          {dueDate}
        </div>
        <Button size="sm" variant="outline" rightIcon={<LucideArrowRight size={14} />}>
          Voir
        </Button>
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome message */}
      {showWelcome && !isLoading && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center justify-between animate-fade">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <LucideCheckCircle className="text-primary-600" size={18} />
            </div>
            <div>
              <h4 className="font-medium text-primary-900">Bienvenue sur LEGIS-FLOW</h4>
              <p className="text-sm text-primary-700">Voici votre tableau de bord actualisé avec les dernières statistiques.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowWelcome(false)} 
            className="text-primary-500 hover:text-primary-700"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tableau de bord</h2>
          <p className="text-slate-500 mt-1">Bienvenue, voici votre aperçu quotidien</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<LucideDownload size={14} />}>
            Exporter
          </Button>
          <Link href="/documents/upload">
            <Button size="sm">Nouveau document</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              title="Documents"
              value={stats.total.toString()}
              icon={<LucideFileText className="h-5 w-5 text-indigo-600" />}
              href="/documents"
            />
            <StatCard
              title="En cours"
              value={stats.inProgress.toString()}
              icon={<LucideFileClock className="h-5 w-5 text-amber-600" />}
              href="/documents?status=in_progress"
            />
            <StatCard
              title="Terminés"
              value={stats.completed.toString()}
              icon={<LucideCheck className="h-5 w-5 text-emerald-600" />}
              href="/documents?status=completed"
            />
            <StatCard
              title="En attente"
              value={stats.pending.toString()}
              icon={<LucideCalendarClock className="h-5 w-5 text-rose-600" />}
              href="/documents?status=pending"
            />
          </>
        )}
      </div>

      {/* Tasks */}
      {isLoading ? (
        <SkeletonCard header headerHeight={8} lines={5} />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tâches en attente</CardTitle>
              <Button variant="link" size="sm" rightIcon={<LucideArrowRight size={14} />}>
                Voir toutes les tâches
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length > 0 ? (
              tasks.slice(0, 3).map(task => (
                <TaskItem
                  key={task.id}
                  title={task.title}
                  dueDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : 'Non défini'}
                  priority={task.priority}
                  type={task.documentTitle}
                />
              ))
            ) : (
              <>
                <TaskItem
                  title="Loi de finances 2024"
                  dueDate="Aujourd'hui"
                  priority="high"
                  type="Validation juridique"
                />
                <TaskItem
                  title="Décret sur la santé publique"
                  dueDate="Demain"
                  priority="medium"
                  type="Révision"
                />
                <TaskItem
                  title="Arrêté ministériel"
                  dueDate="Dans 3 jours"
                  priority="low"
                  type="Signature"
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent documents */}
      {isLoading ? (
        <SkeletonCard header headerHeight={8} lines={7} />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Documents récents</CardTitle>
              <Link href="/documents">
                <Button variant="link" size="sm" rightIcon={<LucideArrowRight size={14} />}>
                  Voir tous les documents
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead className="hidden md:table-cell">Titre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden sm:table-cell">Date de modification</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDocuments.length > 0 ? (
                    recentDocuments.map((doc) => (
                      <TableRow key={doc.id} className="border-b hover:bg-slate-50">
                        <TableCell className="py-3 px-2 text-sm text-slate-600">{doc.reference || 'N/A'}</TableCell>
                        <TableCell className="py-3 px-2">
                          <Link href={`/documents/${doc.id}`} className="text-primary hover:underline">
                            {doc.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(doc.status)}
                          >
                            {getStatusDisplayText(doc.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-2 text-sm text-slate-600">
                          {new Date(doc.updatedAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/documents/${doc.id}`}>
                                <LucideEye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon">
                              <LucideDownload className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        Aucun document récent
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
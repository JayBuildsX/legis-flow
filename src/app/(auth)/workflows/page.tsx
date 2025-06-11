import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LucideChevronRight, LucidePlus, LucideSearch, LucideWorkflow } from 'lucide-react';

interface WorkflowItemProps {
  id: string;
  name: string;
  description: string;
  steps: number;
  documentsCount: number;
}

// Define the workflow type that comes from the API
interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: number;
  documentsCount: number;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

// Fetch workflows from the API
async function getWorkflows(): Promise<Workflow[]> {
  try {
    console.log('Fetching workflows from API');
    
    // Properly construct absolute URL to avoid parsing errors
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const apiUrl = new URL('/api/v1/workflows', baseUrl).toString();
    
    console.log('Using workflows API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      next: { tags: ['workflows'] }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.data.length} workflows from API`);
    
    // If we have real data from the API, return it
    if (data.data && Array.isArray(data.data) && !data.isMockData) {
      return data.data;
    }
    
    // If no real data or mock data is returned, use default empty state
    console.log('No workflows found or mock data received, returning empty array');
    return [];
  } catch (error) {
    console.error('Error fetching workflows:', error);
    // Return empty array in case of error
    return [];
  }
}

const WorkflowItem = ({ id, name, description, steps, documentsCount }: WorkflowItemProps) => {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4 shadow-sm hover:border-primary-200">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary-100 p-2 text-primary-600">
          <LucideWorkflow size={18} />
        </div>
        <div>
          <h4 className="font-medium text-slate-900">{name}</h4>
          <p className="text-xs text-slate-600">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-slate-900">{steps}</span>
          <span className="text-xs text-slate-500">Étapes</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-slate-900">{documentsCount}</span>
          <span className="text-xs text-slate-500">Documents</span>
        </div>
        <Link href={`/workflows/${id}`}>
          <Button size="sm" variant="outline" className="gap-1">
            Voir
            <LucideChevronRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default async function Workflows() {
  // Fetch workflows data
  const workflows = await getWorkflows();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Workflows</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LucideSearch size={16} className="text-slate-500" />
            </div>
            <input
              type="text"
              className="py-2 pl-10 pr-4 w-64 text-sm rounded-md border border-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              placeholder="Rechercher un workflow..."
            />
          </div>
          <Link href="/workflows/nouveau">
            <Button size="sm">
              <LucidePlus size={16} className="mr-2" />
              Nouveau workflow
            </Button>
          </Link>
        </div>
      </div>

      {/* Workflow categories */}
      <div className="flex space-x-1">
        <Button size="sm" variant="default">Tous</Button>
        <Button size="sm" variant="ghost">Législatifs</Button>
        <Button size="sm" variant="ghost">Réglementaires</Button>
        <Button size="sm" variant="ghost">Administratifs</Button>
      </div>

      {/* Workflow list */}
      <div className="space-y-3">
        {workflows.map((workflow: Workflow) => (
          <WorkflowItem
            key={workflow.id}
            id={workflow.id}
            name={workflow.name}
            description={workflow.description}
            steps={workflow.steps}
            documentsCount={workflow.documentsCount}
          />
        ))}
      </div>
    </div>
  );
} 
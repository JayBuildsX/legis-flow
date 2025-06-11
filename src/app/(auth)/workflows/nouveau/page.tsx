"use client";

import { Button } from '@/components/ui/button';
import { LucideArrowLeft } from 'lucide-react';
import WorkflowEditor from '@/components/organisms/WorkflowEditor';
import Link from 'next/link';

export default function NewWorkflow() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/workflows">
            <Button variant="ghost" size="sm" className="gap-1">
              <LucideArrowLeft size={16} />
              Retour
            </Button>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Créer un nouveau workflow</h2>
        </div>
      </div>
      
      <p className="text-slate-600">
        Définissez les étapes et transitions de votre workflow. Vous pourrez le modifier ultérieurement.
      </p>
      
      {/* Editor component */}
      <WorkflowEditor 
        onSave={(workflow) => {
          console.log('Workflow saved:', workflow);
          // In a real implementation, this would save to the API
          // and redirect to the workflow detail page
        }}
      />
    </div>
  );
} 
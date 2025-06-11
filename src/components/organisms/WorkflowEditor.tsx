"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  LucideActivity, 
  LucideArrowDown, 
  LucideArrowRight, 
  LucideChevronDown, 
  LucideChevronUp, 
  LucideEdit, 
  LucideInfo, 
  LucidePlus, 
  LucideSettings,
  LucideShare2, 
  LucideTrash, 
} from 'lucide-react';

// Define workflow step types
const STEP_TYPES = [
  { id: 'EDITION', name: 'Édition', icon: <LucideEdit size={16} />, color: 'blue' },
  { id: 'VALIDATION', name: 'Validation', icon: <LucideInfo size={16} />, color: 'amber' },
  { id: 'REVIEW', name: 'Revue', icon: <LucideSettings size={16} />, color: 'slate' },
  { id: 'SIGNATURE', name: 'Signature', icon: <LucideShare2 size={16} />, color: 'green' },
  { id: 'NOTIFICATION', name: 'Notification', icon: <LucideInfo size={16} />, color: 'indigo' },
  { id: 'PUBLICATION', name: 'Publication', icon: <LucideActivity size={16} />, color: 'purple' },
];

// Interface for workflow steps
interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  stepOrder: number;
  stepType: string;
  expectedDuration?: number;
  isMandatory: boolean;
  requiresSignature: boolean;
  requiresComment: boolean;
  requiredRoleId?: string;
}

// Interface for workflow transitions
interface WorkflowTransition {
  id: string;
  fromStepId: string;
  toStepId: string;
  isAutomatic: boolean;
  transitionCondition?: string;
}

// Interface for workflow data
interface WorkflowData {
  id?: string;
  name: string;
  description?: string;
  version?: number;
  isActive?: boolean;
  expectedDuration?: number;
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
}

// Props for the WorkflowEditor component
interface WorkflowEditorProps {
  initialWorkflow?: WorkflowData;
  onSave?: (workflow: WorkflowData) => void;
}

// Generate a unique ID
const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

export default function WorkflowEditor({ 
  initialWorkflow,
  onSave 
}: WorkflowEditorProps) {
  // Initialize with default workflow or the provided one
  const [workflow, setWorkflow] = useState<WorkflowData>(
    initialWorkflow || {
      name: 'Nouveau workflow',
      description: '',
      isActive: true,
      version: 1,
      steps: [],
      transitions: []
    }
  );
  
  // State for the selected step
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  // State for the step edit dialog
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  // State for the transition being created
  const [transitionStart, setTransitionStart] = useState<string | null>(null);
  
  // Handle adding a new step
  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: generateId(),
      name: 'Nouvelle étape',
      description: '',
      stepOrder: workflow.steps.length + 1,
      stepType: 'EDITION',
      isMandatory: true,
      requiresSignature: false,
      requiresComment: false
    };
    
    setSelectedStep(newStep);
    setIsStepDialogOpen(true);
  };
  
  // Handle editing a step
  const handleEditStep = (step: WorkflowStep) => {
    setSelectedStep(step);
    setIsStepDialogOpen(true);
  };
  
  // Handle saving a step
  const handleSaveStep = (updatedStep: WorkflowStep) => {
    let updatedSteps;
    
    if (workflow.steps.find(s => s.id === updatedStep.id)) {
      // Update existing step
      updatedSteps = workflow.steps.map(s => 
        s.id === updatedStep.id ? updatedStep : s
      );
    } else {
      // Add new step
      updatedSteps = [...workflow.steps, updatedStep];
    }
    
    setWorkflow({
      ...workflow,
      steps: updatedSteps
    });
    
    setIsStepDialogOpen(false);
    setSelectedStep(null);
  };
  
  // Handle deleting a step
  const handleDeleteStep = (stepId: string) => {
    const updatedSteps = workflow.steps.filter(s => s.id !== stepId);
    const updatedTransitions = workflow.transitions.filter(
      t => t.fromStepId !== stepId && t.toStepId !== stepId
    );
    
    setWorkflow({
      ...workflow,
      steps: updatedSteps,
      transitions: updatedTransitions
    });
    
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
    }
    
    setIsStepDialogOpen(false);
  };
  
  // Handle moving a step up in the order
  const handleMoveStepUp = (stepId: string) => {
    const index = workflow.steps.findIndex(s => s.id === stepId);
    if (index <= 0) return;
    
    const updatedSteps = [...workflow.steps];
    
    // Swap with previous step
    [updatedSteps[index - 1], updatedSteps[index]] = [updatedSteps[index], updatedSteps[index - 1]];
    
    // Update step orders
    updatedSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    
    setWorkflow({
      ...workflow,
      steps: updatedSteps
    });
  };
  
  // Handle moving a step down in the order
  const handleMoveStepDown = (stepId: string) => {
    const index = workflow.steps.findIndex(s => s.id === stepId);
    if (index >= workflow.steps.length - 1) return;
    
    const updatedSteps = [...workflow.steps];
    
    // Swap with next step
    [updatedSteps[index], updatedSteps[index + 1]] = [updatedSteps[index + 1], updatedSteps[index]];
    
    // Update step orders
    updatedSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    
    setWorkflow({
      ...workflow,
      steps: updatedSteps
    });
  };
  
  // Handle creating a transition between steps
  const handleCreateTransition = (fromStepId: string) => {
    if (transitionStart === fromStepId) {
      // Cancel transition creation if clicking the same step
      setTransitionStart(null);
      return;
    }
    
    if (transitionStart === null) {
      // Start creating a transition
      setTransitionStart(fromStepId);
      return;
    }
    
    // Complete the transition
    const existingTransition = workflow.transitions.find(
      t => t.fromStepId === transitionStart && t.toStepId === fromStepId
    );
    
    if (existingTransition) {
      // Don't create duplicate transitions
      setTransitionStart(null);
      return;
    }
    
    const newTransition: WorkflowTransition = {
      id: generateId(),
      fromStepId: transitionStart,
      toStepId: fromStepId,
      isAutomatic: false
    };
    
    setWorkflow({
      ...workflow,
      transitions: [...workflow.transitions, newTransition]
    });
    
    setTransitionStart(null);
  };
  
  // Handle deleting a transition
  const handleDeleteTransition = (transitionId: string) => {
    setWorkflow({
      ...workflow,
      transitions: workflow.transitions.filter(t => t.id !== transitionId)
    });
  };
  
  // Handle toggling automatic transition
  const handleToggleAutomaticTransition = (transitionId: string) => {
    setWorkflow({
      ...workflow,
      transitions: workflow.transitions.map(t => 
        t.id === transitionId ? { ...t, isAutomatic: !t.isAutomatic } : t
      )
    });
  };
  
  // Handle saving the workflow
  const handleSaveWorkflow = () => {
    if (onSave) {
      onSave(workflow);
    }
  };
  
  // Utility function to get step color based on type
  const getStepTypeColor = (type: string) => {
    const stepType = STEP_TYPES.find(t => t.id === type);
    return stepType?.color || 'slate';
  };
  
  // Utility function to get step icon based on type
  const getStepTypeIcon = (type: string) => {
    const stepType = STEP_TYPES.find(t => t.id === type);
    return stepType?.icon || <LucideSettings size={16} />;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="workflow-name">Nom du workflow</Label>
            <Input
              id="workflow-name"
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="expected-duration">Durée estimée (jours)</Label>
            <Input
              id="expected-duration"
              type="number"
              value={workflow.expectedDuration || ''}
              onChange={(e) => setWorkflow({ 
                ...workflow, 
                expectedDuration: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="mt-1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="workflow-description">Description</Label>
          <Textarea
            id="workflow-description"
            value={workflow.description || ''}
            onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
            rows={3}
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center">
          <Switch
            id="workflow-active"
            checked={workflow.isActive || false}
            onCheckedChange={(checked) => setWorkflow({ ...workflow, isActive: checked })}
          />
          <Label htmlFor="workflow-active" className="ml-2">
            Workflow actif
          </Label>
        </div>
      </div>
      
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="font-medium text-slate-900">Étapes du workflow</h3>
          <Button size="sm" onClick={handleAddStep}>
            <LucidePlus size={16} className="mr-1" />
            Ajouter une étape
          </Button>
        </div>
        
        <div className="p-4">
          {workflow.steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-200 p-6">
              <p className="mb-2 text-slate-500">Aucune étape définie</p>
              <Button size="sm" onClick={handleAddStep}>
                <LucidePlus size={16} className="mr-1" />
                Ajouter une étape
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Steps visualization */}
              <div className="flex flex-col items-center gap-2">
                {workflow.steps.map((step, index) => (
                  <div key={step.id} className="w-full">
                    <div 
                      className={`
                        relative flex w-full cursor-pointer items-center justify-between rounded-md 
                        border ${transitionStart === step.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-slate-200'} 
                        bg-white p-3 hover:border-primary-200
                      `}
                      onClick={() => handleCreateTransition(step.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full bg-${getStepTypeColor(step.stepType)}-100 p-1.5 text-${getStepTypeColor(step.stepType)}-600`}>
                          {getStepTypeIcon(step.stepType)}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">
                            {step.stepOrder}. {step.name}
                          </h4>
                          {step.description && (
                            <p className="text-xs text-slate-600">{step.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveStepUp(step.id);
                          }}
                          disabled={index === 0}
                        >
                          <LucideChevronUp size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveStepDown(step.id);
                          }}
                          disabled={index === workflow.steps.length - 1}
                        >
                          <LucideChevronDown size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStep(step);
                          }}
                        >
                          <LucideEdit size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Display transitions between steps */}
                    {index < workflow.steps.length - 1 && (
                      <div className="my-2 flex flex-col items-center">
                        {workflow.transitions
                          .filter(t => t.fromStepId === step.id && t.toStepId === workflow.steps[index + 1].id)
                          .map(transition => (
                            <div 
                              key={transition.id}
                              className="flex items-center gap-2 text-slate-600"
                            >
                              <LucideArrowDown size={16} />
                              <span className="text-xs">
                                {transition.isAutomatic ? 'Automatique' : 'Manuel'}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleToggleAutomaticTransition(transition.id)}
                              >
                                <LucideSettings size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteTransition(transition.id)}
                              >
                                <LucideTrash size={16} />
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                    
                    {/* Show custom transitions that skip steps */}
                    {index < workflow.steps.length - 1 && workflow.transitions
                      .filter(t => 
                        t.fromStepId === step.id && 
                        t.toStepId !== workflow.steps[index + 1].id
                      )
                      .map(transition => {
                        const toStep = workflow.steps.find(s => s.id === transition.toStepId);
                        if (!toStep) return null;
                        
                        return (
                          <div 
                            key={transition.id}
                            className="ml-10 mt-2 flex items-center gap-2 text-slate-600"
                          >
                            <div className="flex items-center gap-1">
                              <LucideArrowRight size={16} />
                              <span className="text-xs">
                                Vers étape {toStep.stepOrder} ({transition.isAutomatic ? 'Auto' : 'Manuel'})
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleToggleAutomaticTransition(transition.id)}
                            >
                              <LucideSettings size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTransition(transition.id)}
                            >
                              <LucideTrash size={16} />
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveWorkflow}>
                  Enregistrer le workflow
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Step edit dialog */}
      {selectedStep && (
        <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {workflow.steps.find(s => s.id === selectedStep.id) 
                  ? 'Modifier l\'étape' 
                  : 'Ajouter une étape'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="step-name">Nom de l'étape</Label>
                <Input
                  id="step-name"
                  value={selectedStep.name}
                  onChange={(e) => setSelectedStep({
                    ...selectedStep,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="step-description">Description</Label>
                <Textarea
                  id="step-description"
                  value={selectedStep.description || ''}
                  onChange={(e) => setSelectedStep({
                    ...selectedStep,
                    description: e.target.value
                  })}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="step-type">Type d&apos;étape</Label>
                  <Select
                    value={selectedStep.stepType}
                    onValueChange={(value) => setSelectedStep({
                      ...selectedStep,
                      stepType: value
                    })}
                  >
                    <SelectTrigger id="step-type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {STEP_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <div className={`text-${type.color}-600`}>
                              {type.icon}
                            </div>
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="expected-duration">Durée estimée (heures)</Label>
                  <Input
                    id="expected-duration"
                    type="number"
                    value={selectedStep.expectedDuration || ''}
                    onChange={(e) => setSelectedStep({
                      ...selectedStep,
                      expectedDuration: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is-mandatory"
                    checked={selectedStep.isMandatory}
                    onCheckedChange={(checked) => setSelectedStep({
                      ...selectedStep,
                      isMandatory: checked
                    })}
                  />
                  <Label htmlFor="is-mandatory">
                    Étape obligatoire
                  </Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    id="requires-signature"
                    checked={selectedStep.requiresSignature}
                    onCheckedChange={(checked) => setSelectedStep({
                      ...selectedStep,
                      requiresSignature: checked
                    })}
                  />
                  <Label htmlFor="requires-signature">
                    Nécessite une signature
                  </Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    id="requires-comment"
                    checked={selectedStep.requiresComment}
                    onCheckedChange={(checked) => setSelectedStep({
                      ...selectedStep,
                      requiresComment: checked
                    })}
                  />
                  <Label htmlFor="requires-comment">
                    Nécessite un commentaire
                  </Label>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex items-center justify-between">
              {workflow.steps.find(s => s.id === selectedStep.id) && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteStep(selectedStep.id)}
                  type="button"
                >
                  Supprimer
                </Button>
              )}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsStepDialogOpen(false)}
                  type="button"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={() => handleSaveStep(selectedStep)}
                  type="button"
                >
                  Enregistrer
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  AdvancedWorkflowService,
  WorkflowTemplate,
  AdvancedWorkflowStep,
  ConditionalTransition,
  ParallelBranch,
  WorkflowCondition,
  WorkflowVariable
} from '@/lib/advancedWorkflows';
import { 
  Plus, 
  Trash2, 
  GitBranch, 
  Zap, 
  Clock, 
  Users, 
  Settings, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Split,
  Merge,
  Play,
  Save,
  Eye,
  Edit,
  Code,
  Bell,
  UserCheck,
  Filter,
  Layers
} from 'lucide-react';

interface AdvancedWorkflowBuilderProps {
  workflowId?: string;
  onSave?: (workflowId: string) => void;
  onCancel?: () => void;
}

const STEP_TYPES = [
  { value: 'approval', label: 'Approval', icon: UserCheck, color: 'bg-blue-500' },
  { value: 'review', label: 'Review', icon: Eye, color: 'bg-green-500' },
  { value: 'notification', label: 'Notification', icon: Bell, color: 'bg-yellow-500' },
  { value: 'conditional', label: 'Conditional', icon: Filter, color: 'bg-purple-500' },
  { value: 'parallel_start', label: 'Parallel Start', icon: Split, color: 'bg-orange-500' },
  { value: 'parallel_end', label: 'Parallel End', icon: Merge, color: 'bg-red-500' },
  { value: 'script', label: 'Script', icon: Code, color: 'bg-gray-500' }
];

const CONDITION_TYPES = [
  { value: 'document_value', label: 'Document Value' },
  { value: 'user_role', label: 'User Role' },
  { value: 'organization', label: 'Organization' },
  { value: 'custom_field', label: 'Custom Field' },
  { value: 'time_based', label: 'Time Based' },
  { value: 'approval_count', label: 'Approval Count' }
];

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'in', label: 'In' },
  { value: 'not_in', label: 'Not In' }
];

export default function AdvancedWorkflowBuilder({ 
  workflowId, 
  onSave, 
  onCancel 
}: AdvancedWorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<Omit<WorkflowTemplate, 'id'>>({
    name: '',
    description: '',
    steps: [],
    transitions: [],
    parallelBranches: [],
    variables: [],
    metadata: {}
  });

  const [selectedStep, setSelectedStep] = useState<AdvancedWorkflowStep | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isAddingTransition, setIsAddingTransition] = useState(false);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [isAddingVariable, setIsAddingVariable] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing workflow if editing
  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId]);

  const loadWorkflow = async (id: string) => {
    try {
      // Load workflow from API
      console.log(`Loading workflow ${id}`);
      // TODO: Implement API call
    } catch (error) {
      console.error('Error loading workflow:', error);
    }
  };

  const validateWorkflow = (): string[] => {
    const errors: string[] = [];

    if (!workflow.name.trim()) {
      errors.push('Workflow name is required');
    }

    if (workflow.steps.length === 0) {
      errors.push('At least one step is required');
    }

    // Validate step references in transitions
    const stepIds = workflow.steps.map(s => s.id);
    for (const transition of workflow.transitions) {
      if (!stepIds.includes(transition.fromStepId)) {
        errors.push(`Transition references invalid step: ${transition.fromStepId}`);
      }
      if (!stepIds.includes(transition.toStepId)) {
        errors.push(`Transition references invalid step: ${transition.toStepId}`);
      }
    }

    // Validate parallel branches
    for (const branch of workflow.parallelBranches) {
      if (branch.steps.length === 0) {
        errors.push(`Parallel branch "${branch.name}" has no steps`);
      }
      
      for (const stepId of branch.steps) {
        if (!stepIds.includes(stepId)) {
          errors.push(`Parallel branch "${branch.name}" references invalid step: ${stepId}`);
        }
      }
    }

    return errors;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const errors = validateWorkflow();
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      const workflowId = await AdvancedWorkflowService.createWorkflowTemplate(workflow);
      onSave?.(workflowId);
      
    } catch (error) {
      console.error('Error saving workflow:', error);
      setValidationErrors(['Failed to save workflow']);
    } finally {
      setIsSaving(false);
    }
  };

  const addStep = (stepType: string) => {
    const newStep: AdvancedWorkflowStep = {
      id: crypto.randomUUID(),
      name: `New ${stepType} Step`,
      stepType: stepType as any,
      assignmentType: 'single_user',
      assignmentConfig: {},
      priority: 'medium'
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));

    setSelectedStep(newStep);
    setIsAddingStep(false);
  };

  const updateStep = (stepId: string, updates: Partial<AdvancedWorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));

    if (selectedStep && selectedStep.id === stepId) {
      setSelectedStep(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteStep = (stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
      transitions: prev.transitions.filter(t => 
        t.fromStepId !== stepId && t.toStepId !== stepId
      )
    }));

    if (selectedStep && selectedStep.id === stepId) {
      setSelectedStep(null);
    }
  };

  const addTransition = (fromStepId: string, toStepId: string) => {
    const newTransition: ConditionalTransition = {
      id: crypto.randomUUID(),
      fromStepId,
      toStepId,
      conditions: [],
      priority: 1
    };

    setWorkflow(prev => ({
      ...prev,
      transitions: [...prev.transitions, newTransition]
    }));
  };

  const addConditionToTransition = (transitionId: string, condition: WorkflowCondition) => {
    setWorkflow(prev => ({
      ...prev,
      transitions: prev.transitions.map(t => 
        t.id === transitionId 
          ? { ...t, conditions: [...t.conditions, condition] }
          : t
      )
    }));
  };

  const addParallelBranch = () => {
    const newBranch: ParallelBranch = {
      id: crypto.randomUUID(),
      name: 'New Parallel Branch',
      steps: [],
      convergenceStepId: '',
      executionType: 'all_required'
    };

    setWorkflow(prev => ({
      ...prev,
      parallelBranches: [...prev.parallelBranches, newBranch]
    }));

    setIsAddingBranch(false);
  };

  const addVariable = () => {
    const newVariable: WorkflowVariable = {
      id: crypto.randomUUID(),
      name: 'newVariable',
      type: 'string',
      isRequired: false
    };

    setWorkflow(prev => ({
      ...prev,
      variables: [...prev.variables, newVariable]
    }));

    setIsAddingVariable(false);
  };

  const getStepIcon = (stepType: string) => {
    const stepTypeConfig = STEP_TYPES.find(t => t.value === stepType);
    return stepTypeConfig ? stepTypeConfig.icon : Settings;
  };

  const getStepColor = (stepType: string) => {
    const stepTypeConfig = STEP_TYPES.find(t => t.value === stepType);
    return stepTypeConfig ? stepTypeConfig.color : 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Advanced Workflow Builder
          </CardTitle>
          <CardDescription>
            Create complex workflows with conditional branching and parallel execution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Input
                id="workflow-description"
                value={workflow.description}
                onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter workflow description"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Workflow Canvas */}
        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Workflow Canvas
                </div>
                <Button size="sm" onClick={() => setIsAddingStep(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.steps.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No steps added yet. Click "Add Step" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workflow.steps.map((step, index) => {
                      const StepIcon = getStepIcon(step.stepType);
                      return (
                        <div key={step.id} className="flex items-center space-x-4">
                          {/* Step Card */}
                          <Card 
                            className={`flex-1 cursor-pointer transition-all ${
                              selectedStep?.id === step.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedStep(step)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${getStepColor(step.stepType)}`}>
                                    <StepIcon className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{step.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {step.stepType.replace('_', ' ')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{step.priority}</Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteStep(step.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Transition Arrow */}
                          {index < workflow.steps.length - 1 && (
                            <div className="flex flex-col items-center">
                              <ArrowDown className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Panel */}
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStep ? (
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="assignment">Assignment</TabsTrigger>
                    <TabsTrigger value="conditions">Conditions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Step Name</Label>
                      <Input
                        value={selectedStep.name}
                        onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Step Type</Label>
                      <Select
                        value={selectedStep.stepType}
                        onValueChange={(value) => updateStep(selectedStep.id, { stepType: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STEP_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={selectedStep.priority}
                        onValueChange={(value) => updateStep(selectedStep.id, { priority: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={selectedStep.description || ''}
                        onChange={(e) => updateStep(selectedStep.id, { description: e.target.value })}
                        placeholder="Enter step description"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="assignment" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Assignment Type</Label>
                      <Select
                        value={selectedStep.assignmentType}
                        onValueChange={(value) => updateStep(selectedStep.id, { assignmentType: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_user">Single User</SelectItem>
                          <SelectItem value="multiple_users">Multiple Users</SelectItem>
                          <SelectItem value="role_based">Role Based</SelectItem>
                          <SelectItem value="dynamic">Dynamic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedStep.stepType === 'approval' && (
                      <div className="space-y-4">
                        <Separator />
                        <h4 className="font-medium">Approval Configuration</h4>
                        
                        <div className="space-y-2">
                          <Label>Required Approvals</Label>
                          <Input
                            type="number"
                            value={selectedStep.approvalConfig?.requiredApprovals || 1}
                            onChange={(e) => updateStep(selectedStep.id, {
                              approvalConfig: {
                                ...selectedStep.approvalConfig,
                                requiredApprovals: parseInt(e.target.value) || 1,
                                allowDelegation: selectedStep.approvalConfig?.allowDelegation || false
                              }
                            })}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="allow-delegation"
                            checked={selectedStep.approvalConfig?.allowDelegation || false}
                            onCheckedChange={(checked) => updateStep(selectedStep.id, {
                              approvalConfig: {
                                ...selectedStep.approvalConfig,
                                requiredApprovals: selectedStep.approvalConfig?.requiredApprovals || 1,
                                allowDelegation: checked
                              }
                            })}
                          />
                          <Label htmlFor="allow-delegation">Allow Delegation</Label>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="conditions" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Step Conditions</Label>
                      <p className="text-sm text-muted-foreground">
                        Define when this step should be executed
                      </p>
                    </div>

                    {selectedStep.conditions && selectedStep.conditions.length > 0 ? (
                      <div className="space-y-2">
                        {selectedStep.conditions.map((condition, index) => (
                          <Card key={index}>
                            <CardContent className="p-3">
                              <div className="text-sm">
                                <Badge variant="outline">{condition.type}</Badge>
                                <span className="mx-2">{condition.operator}</span>
                                <span className="font-mono">{JSON.stringify(condition.value)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No conditions defined</p>
                    )}

                    <Button
                      size="sm"
                      onClick={() => {
                        const newCondition: WorkflowCondition = {
                          type: 'custom_field',
                          operator: 'equals',
                          value: ''
                        };
                        updateStep(selectedStep.id, {
                          conditions: [...(selectedStep.conditions || []), newCondition]
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-8 w-8 mx-auto mb-4 opacity-50" />
                  <p>Select a step to edit its properties</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Step Dialog */}
      <Dialog open={isAddingStep} onOpenChange={setIsAddingStep}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Step</DialogTitle>
            <DialogDescription>
              Choose the type of step you want to add to your workflow
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {STEP_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => addStep(type.value)}
                >
                  <div className={`p-2 rounded-full ${type.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm">{type.label}</span>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
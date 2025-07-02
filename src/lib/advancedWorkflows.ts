import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export interface WorkflowCondition {
  type: 'document_value' | 'user_role' | 'organization' | 'custom_field' | 'time_based' | 'approval_count';
  field?: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface ConditionalTransition {
  id: string;
  fromStepId: string;
  toStepId: string;
  conditions: WorkflowCondition[];
  priority: number;
  isDefault?: boolean;
}

export interface ParallelBranch {
  id: string;
  name: string;
  steps: string[]; // Step IDs in this branch
  convergenceStepId: string; // Where branches merge
  executionType: 'all_required' | 'any_required' | 'majority_required';
  minimumApprovals?: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: AdvancedWorkflowStep[];
  transitions: ConditionalTransition[];
  parallelBranches: ParallelBranch[];
  variables: WorkflowVariable[];
  metadata: Record<string, any>;
}

export interface AdvancedWorkflowStep {
  id: string;
  name: string;
  description?: string;
  stepType: 'approval' | 'review' | 'notification' | 'conditional' | 'parallel_start' | 'parallel_end' | 'script';
  assignmentType: 'single_user' | 'multiple_users' | 'role_based' | 'dynamic';
  assignmentConfig: {
    userIds?: string[];
    roleIds?: string[];
    organizationIds?: string[];
    dynamicAssignmentRule?: string;
  };
  approvalConfig?: {
    requiredApprovals: number;
    allowDelegation: boolean;
    escalationTimeout?: number; // minutes
    escalationTarget?: string; // user ID or role
  };
  conditions?: WorkflowCondition[];
  script?: string; // For script steps
  formFields?: WorkflowFormField[];
  estimatedDuration?: number; // minutes
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'user' | 'document';
  defaultValue?: any;
  isRequired: boolean;
  description?: string;
}

export interface WorkflowFormField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'file';
  label: string;
  required: boolean;
  options?: string[]; // For select fields
  validation?: string; // Regex pattern
}

export interface WorkflowExecution {
  id: string;
  documentId: string;
  workflowTemplateId: string;
  currentSteps: string[]; // Can be multiple for parallel execution
  variables: Record<string, any>;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  executionPath: WorkflowExecutionStep[];
}

export interface WorkflowExecutionStep {
  stepId: string;
  assignedToId?: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  formData?: Record<string, any>;
  comments?: string;
  escalated?: boolean;
  escalatedAt?: Date;
}

/**
 * Advanced Workflow Service
 * Handles complex workflows with conditional branching and parallel execution
 */
export class AdvancedWorkflowService {

  /**
   * Create a new workflow template with advanced features
   */
  static async createWorkflowTemplate(template: Omit<WorkflowTemplate, 'id'>): Promise<string> {
    try {
      // Validate workflow structure
      this.validateWorkflowTemplate(template);

      // Generate ID and store template
      const templateId = crypto.randomUUID();
      const fullTemplate: WorkflowTemplate = {
        id: templateId,
        ...template
      };

      // In a real implementation, this would be stored in database
      console.log(`[WORKFLOW] Created advanced workflow template: ${templateId}`);
      return templateId;

    } catch (error) {
      console.error('[WORKFLOW] Error creating workflow template:', error);
      throw error;
    }
  }

  /**
   * Start workflow execution for a document
   */
  static async startWorkflowExecution(
    documentId: string, 
    workflowTemplateId: string, 
    variables: Record<string, any> = {}
  ): Promise<string> {
    try {
      // Initialize execution
      const executionId = crypto.randomUUID();
      const execution: WorkflowExecution = {
        id: executionId,
        documentId,
        workflowTemplateId,
        currentSteps: [], // Will be set based on first step
        variables: { ...variables },
        status: 'active',
        startedAt: new Date(),
        executionPath: []
      };

      console.log(`[WORKFLOW] Started execution ${executionId} for document ${documentId}`);
      return executionId;

    } catch (error) {
      console.error('[WORKFLOW] Error starting workflow execution:', error);
      throw error;
    }
  }

  /**
   * Process a workflow step
   */
  static async processWorkflowStep(executionId: string, stepId: string): Promise<void> {
    try {
      const execution = await this.getWorkflowExecution(executionId);
      if (!execution) {
        throw new Error('Workflow execution not found');
      }

      const template = await this.getWorkflowTemplate(execution.workflowTemplateId);
      if (!template) {
        throw new Error('Workflow template not found');
      }

      const step = template.steps.find(s => s.id === stepId);
      if (!step) {
        throw new Error('Workflow step not found');
      }

      // Check if step should be executed based on conditions
      if (step.conditions && !this.evaluateConditions(step.conditions, execution)) {
        // Skip this step
        await this.completeStep(executionId, stepId, 'skipped');
        return;
      }

      // Execute step based on type
      switch (step.stepType) {
        case 'approval':
        case 'review':
          await this.executeApprovalStep(execution, step);
          break;

        case 'conditional':
          await this.executeConditionalStep(execution, step, template);
          break;

        case 'parallel_start':
          await this.executeParallelStart(execution, step, template);
          break;

        case 'parallel_end':
          await this.executeParallelEnd(execution, step, template);
          break;

        case 'notification':
          await this.executeNotificationStep(execution, step);
          break;

        case 'script':
          await this.executeScriptStep(execution, step);
          break;

        default:
          console.warn(`[WORKFLOW] Unknown step type: ${step.stepType}`);
      }

    } catch (error) {
      console.error('[WORKFLOW] Error processing workflow step:', error);
      throw error;
    }
  }

  /**
   * Complete a workflow step and determine next steps
   */
  static async completeStep(
    executionId: string, 
    stepId: string, 
    status: 'completed' | 'skipped' | 'failed',
    formData?: Record<string, any>,
    comments?: string
  ): Promise<void> {
    try {
      console.log(`[WORKFLOW] Completing step ${stepId} with status ${status}`);

      // In a real implementation, this would:
      // 1. Update execution state in database
      // 2. Evaluate conditions for next steps
      // 3. Handle parallel branch convergence
      // 4. Trigger notifications
      // 5. Schedule escalations

    } catch (error) {
      console.error('[WORKFLOW] Error completing step:', error);
      throw error;
    }
  }

  /**
   * Execute approval step with assignment logic
   */
  private static async executeApprovalStep(execution: WorkflowExecution, step: AdvancedWorkflowStep): Promise<void> {
    const assignedUsers = await this.resolveStepAssignment(step, execution);
    
    // Create step assignments
    for (const userId of assignedUsers) {
      await prisma.stepAssignment.create({
        data: {
          documentWorkflowId: execution.id,
          stepId: step.id,
          assignedToId: userId,
          assignedById: 'system',
          status: 'PENDING',
          dueDate: step.approvalConfig?.escalationTimeout ? 
            new Date(Date.now() + step.approvalConfig.escalationTimeout * 60000) : 
            undefined
        }
      });
    }

    // Set up escalation if configured
    if (step.approvalConfig?.escalationTimeout) {
      this.scheduleEscalation(execution.id, step.id, step.approvalConfig.escalationTimeout);
    }
  }

  /**
   * Execute conditional step to determine branching
   */
  private static async executeConditionalStep(
    execution: WorkflowExecution, 
    step: AdvancedWorkflowStep, 
    template: WorkflowTemplate
  ): Promise<void> {
    // Find applicable transitions
    const applicableTransitions = template.transitions
      .filter(t => t.fromStepId === step.id)
      .filter(t => this.evaluateConditions(t.conditions, execution))
      .sort((a, b) => a.priority - b.priority);

    if (applicableTransitions.length > 0) {
      // Take the highest priority transition
      const transition = applicableTransitions[0];
      execution.currentSteps.push(transition.toStepId);
    } else {
      // Look for default transition
      const defaultTransition = template.transitions.find(t => 
        t.fromStepId === step.id && t.isDefault
      );
      
      if (defaultTransition) {
        execution.currentSteps.push(defaultTransition.toStepId);
      } else {
        console.warn(`[WORKFLOW] No applicable transition found for conditional step ${step.id}`);
      }
    }

    // Mark step as completed immediately
    await this.completeStep(execution.id, step.id, 'completed');
  }

  /**
   * Execute parallel start - split into multiple branches
   */
  private static async executeParallelStart(
    execution: WorkflowExecution, 
    step: AdvancedWorkflowStep, 
    template: WorkflowTemplate
  ): Promise<void> {
    const parallelBranch = template.parallelBranches.find(b => 
      b.steps.includes(step.id)
    );

    if (parallelBranch) {
      // Add all branch steps to current steps
      execution.currentSteps.push(...parallelBranch.steps.filter(s => s !== step.id));
    }

    await this.completeStep(execution.id, step.id, 'completed');
  }

  /**
   * Execute parallel end - wait for all branches to complete
   */
  private static async executeParallelEnd(
    execution: WorkflowExecution, 
    step: AdvancedWorkflowStep, 
    template: WorkflowTemplate
  ): Promise<void> {
    const parallelBranch = template.parallelBranches.find(b => 
      b.convergenceStepId === step.id
    );

    if (parallelBranch) {
      // Check if all required branches are complete
      const completedBranchSteps = execution.executionPath
        .filter(ep => parallelBranch.steps.includes(ep.stepId) && ep.status === 'completed')
        .map(ep => ep.stepId);

      const requiredCompletions = this.calculateRequiredCompletions(parallelBranch, completedBranchSteps.length);
      
      if (completedBranchSteps.length >= requiredCompletions) {
        await this.completeStep(execution.id, step.id, 'completed');
      } else {
        // Wait for more branches to complete
        console.log(`[WORKFLOW] Waiting for ${requiredCompletions - completedBranchSteps.length} more branches to complete`);
      }
    }
  }

  /**
   * Execute notification step
   */
  private static async executeNotificationStep(execution: WorkflowExecution, step: AdvancedWorkflowStep): Promise<void> {
    const assignedUsers = await this.resolveStepAssignment(step, execution);
    
    // Send notifications (would integrate with notification service)
    for (const userId of assignedUsers) {
      console.log(`[WORKFLOW] Sending notification to user ${userId} for step ${step.id}`);
      // TODO: Integrate with notification service
    }

    await this.completeStep(execution.id, step.id, 'completed');
  }

  /**
   * Execute script step
   */
  private static async executeScriptStep(execution: WorkflowExecution, step: AdvancedWorkflowStep): Promise<void> {
    if (step.script) {
      try {
        // Execute custom script (simplified - in production, use proper sandbox)
        console.log(`[WORKFLOW] Executing script for step ${step.id}: ${step.script}`);
        
        // Update variables if script modifies them
        // execution.variables = { ...execution.variables, ...scriptResults };

        await this.completeStep(execution.id, step.id, 'completed');
      } catch (error) {
        console.error(`[WORKFLOW] Script execution failed for step ${step.id}:`, error);
        await this.completeStep(execution.id, step.id, 'failed');
      }
    }
  }

  /**
   * Evaluate workflow conditions
   */
  static evaluateConditions(conditions: WorkflowCondition[], execution: WorkflowExecution): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let currentLogicalOp: 'AND' | 'OR' = 'AND';

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, execution);
      
      if (currentLogicalOp === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      currentLogicalOp = condition.logicalOperator || 'AND';
    }

    return result;
  }

  /**
   * Evaluate single condition
   */
  private static evaluateCondition(condition: WorkflowCondition, execution: WorkflowExecution): boolean {
    let actualValue: any;

    switch (condition.type) {
      case 'custom_field':
        actualValue = execution.variables[condition.field || ''];
        break;
      case 'time_based':
        actualValue = new Date();
        break;
      case 'approval_count':
        actualValue = execution.executionPath.filter(ep => ep.status === 'completed').length;
        break;
      default:
        actualValue = null;
    }

    return this.compareValues(actualValue, condition.operator, condition.value);
  }

  /**
   * Compare values based on operator
   */
  private static compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'contains':
        return String(actual).includes(String(expected));
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(actual);
      default:
        return false;
    }
  }

  /**
   * Resolve step assignment based on configuration
   */
  private static async resolveStepAssignment(step: AdvancedWorkflowStep, execution: WorkflowExecution): Promise<string[]> {
    const assignedUsers: string[] = [];

    // Direct user assignment
    if (step.assignmentConfig.userIds) {
      assignedUsers.push(...step.assignmentConfig.userIds);
    }

    // Role-based assignment
    if (step.assignmentConfig.roleIds) {
      for (const roleId of step.assignmentConfig.roleIds) {
        const usersInRole = await prisma.userRole.findMany({
          where: { roleId },
          include: { user: true }
        });
        assignedUsers.push(...usersInRole.map(ur => ur.userId));
      }
    }

    // Organization-based assignment
    if (step.assignmentConfig.organizationIds) {
      for (const orgId of step.assignmentConfig.organizationIds) {
        const usersInOrg = await prisma.organizationUser.findMany({
          where: { organizationId: orgId },
          include: { user: true }
        });
        assignedUsers.push(...usersInOrg.map(ou => ou.userId));
      }
    }

    // Dynamic assignment (would implement rule engine)
    if (step.assignmentConfig.dynamicAssignmentRule) {
      // TODO: Implement dynamic assignment rule evaluation
      console.log(`[WORKFLOW] Dynamic assignment rule: ${step.assignmentConfig.dynamicAssignmentRule}`);
    }

    return [...new Set(assignedUsers)]; // Remove duplicates
  }

  /**
   * Determine next steps based on transitions
   */
  private static async determineNextSteps(
    execution: WorkflowExecution, 
    completedStepId: string, 
    template: WorkflowTemplate
  ): Promise<string[]> {
    const nextSteps: string[] = [];

    // Find transitions from completed step
    const transitions = template.transitions.filter(t => t.fromStepId === completedStepId);

    for (const transition of transitions) {
      if (this.evaluateConditions(transition.conditions, execution)) {
        nextSteps.push(transition.toStepId);
      }
    }

    // If no conditional transitions matched, look for default
    if (nextSteps.length === 0) {
      const defaultTransition = transitions.find(t => t.isDefault);
      if (defaultTransition) {
        nextSteps.push(defaultTransition.toStepId);
      }
    }

    return nextSteps;
  }

  /**
   * Calculate required completions for parallel branch
   */
  private static calculateRequiredCompletions(branch: ParallelBranch, totalSteps: number): number {
    switch (branch.executionType) {
      case 'all_required':
        return branch.steps.length;
      case 'any_required':
        return 1;
      case 'majority_required':
        return Math.ceil(branch.steps.length / 2);
      default:
        return branch.minimumApprovals || 1;
    }
  }

  /**
   * Validate workflow template structure
   */
  private static validateWorkflowTemplate(template: Omit<WorkflowTemplate, 'id'>): void {
    if (!template.name || template.steps.length === 0) {
      throw new Error('Invalid workflow template: name and steps are required');
    }

    // Validate step references in transitions
    const stepIds = template.steps.map(s => s.id);
    for (const transition of template.transitions) {
      if (!stepIds.includes(transition.fromStepId) || !stepIds.includes(transition.toStepId)) {
        throw new Error(`Invalid transition: references non-existent step`);
      }
    }

    // Validate parallel branches
    for (const branch of template.parallelBranches) {
      for (const stepId of branch.steps) {
        if (!stepIds.includes(stepId)) {
          throw new Error(`Invalid parallel branch: references non-existent step ${stepId}`);
        }
      }
      
      if (!stepIds.includes(branch.convergenceStepId)) {
        throw new Error(`Invalid parallel branch: convergence step ${branch.convergenceStepId} does not exist`);
      }
    }
  }

  /**
   * Map advanced step types to Prisma enum
   */
  private static mapStepType(stepType: string): any {
    const mapping: Record<string, string> = {
      'approval': 'VALIDATION',
      'review': 'VALIDATION',
      'notification': 'NOTIFICATION',
      'conditional': 'VALIDATION',
      'parallel_start': 'VALIDATION',
      'parallel_end': 'VALIDATION',
      'script': 'VALIDATION'
    };
    return mapping[stepType] || 'VALIDATION';
  }

  /**
   * Schedule escalation for a step (simplified implementation)
   */
  private static scheduleEscalation(executionId: string, stepId: string, timeoutMinutes: number): void {
    setTimeout(async () => {
      // Check if step is still pending
      const execution = await this.getWorkflowExecution(executionId);
      if (execution && execution.currentSteps.includes(stepId)) {
        console.log(`[WORKFLOW] Escalating step ${stepId} after ${timeoutMinutes} minutes`);
        // TODO: Implement escalation logic
      }
    }, timeoutMinutes * 60000);
  }

  /**
   * Store advanced workflow configuration
   */
  private static async storeAdvancedConfig(workflowId: string, template: Omit<WorkflowTemplate, 'id'>): Promise<void> {
    // Store in workflow metadata (simplified)
    const metadata = {
      transitions: template.transitions,
      parallelBranches: template.parallelBranches,
      variables: template.variables,
      advancedConfig: template.metadata
    };

    // In a real implementation, this would be stored in a dedicated table
    console.log(`[WORKFLOW] Storing advanced config for workflow ${workflowId}:`, metadata);
  }

  /**
   * Get workflow template (simplified - would come from database)
   */
  private static async getWorkflowTemplate(templateId: string): Promise<WorkflowTemplate | null> {
    // TODO: Implement database retrieval
    return null;
  }

  /**
   * Get workflow execution (simplified - would come from database)
   */
  private static async getWorkflowExecution(executionId: string): Promise<WorkflowExecution | null> {
    // TODO: Implement database retrieval
    return null;
  }

  /**
   * Store workflow execution (simplified - would save to database)
   */
  private static async storeWorkflowExecution(execution: WorkflowExecution): Promise<void> {
    // TODO: Implement database storage
    console.log(`[WORKFLOW] Storing execution state:`, execution);
  }
} 
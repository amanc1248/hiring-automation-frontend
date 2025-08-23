export interface WorkflowStep {
  id: string
  jobId: string
  name: string
  description: string
  type: 'resume_analysis' | 'human_approval' | 'task_assignment' | 'task_review' | 'interview_scheduling' | 'ai_interview' | 'offer_letter' | 'custom'
  order: number
  isActive: boolean
  
  // Step Configuration
  config: {
    delayBeforeExecution?: number // in hours
    requiresApproval: boolean
    approvers: string[] // user IDs who can approve
    autoProceed: boolean // if true, proceed without approval
    customAction?: string // for custom step types
  }
  
  // AI Email Settings
  aiEmail: {
    enabled: boolean
    subjectTemplate: string
    bodyTemplate: string
    variables: string[] // e.g., ['candidate_name', 'job_title', 'company_name']
  }
  
  // Step Status
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'waiting_approval'
  createdAt: string
  updatedAt: string
}

export interface Workflow {
  id: string
  companyId: string
  jobId: string
  name: string
  description: string
  steps: WorkflowStep[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  candidateId: string
  jobId: string
  currentStepId: string
  status: 'running' | 'paused' | 'completed' | 'failed' | 'waiting_approval'
  
  // Step Execution History
  stepHistory: WorkflowStepExecution[]
  
  // Current State
  currentStep: WorkflowStepExecution
  nextStep?: WorkflowStep
  
  // Metadata
  startedAt: string
  lastUpdatedAt: string
  completedAt?: string
}

export interface WorkflowStepExecution {
  id: string
  workflowExecutionId: string
  stepId: string
  stepName: string
  stepType: string
  
  // Execution Details
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'waiting_approval'
  startedAt?: string
  completedAt?: string
  
  // AI Actions
  aiActions: {
    emailSent?: {
      sentAt: string
      subject: string
      recipient: string
    }
    resumeAnalyzed?: {
      analyzedAt: string
      score: number
      insights: string[]
    }
    taskAssigned?: {
      assignedAt: string
      taskType: string
      dueDate?: string
    }
    taskReviewed?: {
      reviewedAt: string
      reviewer: string
      score: number
      feedback: string
      approved: boolean
    }
  }
  
  // Human Approval
  approval?: {
    required: boolean
    approvers: string[]
    approvedBy?: string
    approvedAt?: string
    rejectedBy?: string
    rejectedAt?: string
    comments?: string
  }
  
  // Error Handling
  error?: {
    message: string
    occurredAt: string
    retryCount: number
  }
}

export interface WorkflowApproval {
  id: string
  workflowExecutionId: string
  stepExecutionId: string
  stepName: string
  candidateName: string
  jobTitle: string
  
  // Approval Details
  approverId: string
  approverName: string
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
  createdAt: string
  updatedAt: string
}

export interface WorkflowCreateData {
  name: string
  description: string
  jobId: string
  steps: Omit<WorkflowStep, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>[]
}

export interface WorkflowStepCreateData {
  name: string
  description: string
  type: WorkflowStep['type']
  order: number
  config: WorkflowStep['config']
  aiEmail: WorkflowStep['aiEmail']
}

export interface WorkflowUpdateData extends Partial<WorkflowCreateData> {
  isActive?: boolean
}

// Workflow Templates for common hiring processes
export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: 'engineering' | 'design' | 'marketing' | 'sales' | 'general'
  steps: Omit<WorkflowStep, 'id' | 'jobId' | 'createdAt' | 'updatedAt'>[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// Workflow Statistics
export interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  totalExecutions: number
  runningExecutions: number
  completedExecutions: number
  averageCompletionTime: number // in hours
  approvalRate: number // percentage of approvals
  rejectionRate: number // percentage of rejections
}

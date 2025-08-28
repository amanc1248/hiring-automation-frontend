import type { 
  Workflow, 
  WorkflowStep, 
  WorkflowCreateData, 
  WorkflowUpdateData,
  WorkflowStepCreateData,
  WorkflowExecution,
  WorkflowStepExecution,
  WorkflowApproval,
  WorkflowTemplate,
  WorkflowStats
} from '../types/workflow'
import { workflowApiService, type WorkflowTemplatePopulated } from './workflowApiService'

// Mock workflow templates removed - now using real API from workflowApiService

// Mock workflows for existing jobs
//     description: 'Complete engineering hiring workflow with technical assessment and AI interview',
//     category: 'engineering',
//     isDefault: true,
//     steps: [
//       {
//         name: 'Email Reception',
//         description: 'Monitor job application emails',
//         type: 'email_reception',
//         order: 1,
//         isActive: true,
//         status: 'pending',
//         config: {
//           delayBeforeExecution: 3,
//           requiresApproval: false,
//           approvers: [],
//           autoProceed: true
//         },
//         aiEmail: {
//           enabled: false,
//           subjectTemplate: '',
//           bodyTemplate: '',
//           variables: []
//         }
//       },
//       {
//         name: 'Resume Analysis',
//         description: 'AI analyzes resume against job requirements',
//         type: 'resume_analysis',
//         order: 2,
//         isActive: true,
//         status: 'pending',
//         config: {
//           delayBeforeExecution: 0,
//           requiresApproval: true,
//           approvers: ['hr-manager', 'senior-engineer'],
//           autoProceed: false
//         },
//         aiEmail: {
//           enabled: false,
//           subjectTemplate: '',
//           bodyTemplate: '',
//           variables: []
//         }
//       },
//       {
//         name: 'Technical Task Assignment',
//         description: 'Send technical assessment to approved candidates',
//         type: 'task_assignment',
//         order: 3,
//         isActive: true,
//         status: 'pending',
//         config: {
//           delayBeforeExecution: 2,
//           requiresApproval: false,
//           approvers: [],
//           autoProceed: true
//         },
//         aiEmail: {
//           enabled: true,
//           subjectTemplate: 'Technical Assessment - {job_title}',
//           bodyTemplate: 'Hi {candidate_name}, please complete this technical assessment.',
//           variables: ['candidate_name', 'job_title']
//         }
//       },
//       {
//         name: 'Review Task Assignment',
//         description: 'Senior engineers review completed technical assessment',
//         type: 'task_review',
//         order: 4,
//         isActive: true,
//         status: 'pending',
//         config: {
//           delayBeforeExecution: 0,
//           requiresApproval: true,
//           approvers: ['senior-engineer', 'tech-lead'],
//           autoProceed: false
//         },
//         aiEmail: {
//           enabled: false,
//           subjectTemplate: '',
//           bodyTemplate: '',
//           variables: []
//         }
//       },
//       {
//         name: 'AI Interview Scheduling',
//         description: 'Schedule AI-powered technical interview',
//         type: 'interview_scheduling',
//         order: 5,
//         isActive: true,
//         status: 'pending',
//         config: {
//           delayBeforeExecution: 1,
//           requiresApproval: false,
//           approvers: [],
//           autoProceed: true
//         },
//         aiEmail: {
//           enabled: true,
//           subjectTemplate: 'Interview Scheduled - {job_title}',
//           bodyTemplate: 'Hi {candidate_name}, your AI interview has been scheduled.',
//           variables: ['candidate_name', 'job_title']
//         }
//       },
//       {
//         name: 'AI Interview',
//         description: 'Conduct AI-powered technical interview',
//         type: 'ai_interview',
//         order: 6,
//         isActive: true,
//         config: {
//           delayBeforeExecution: 0,
//           requiresApproval: false,
//           approvers: [],
//           autoProceed: true
//         },
//         aiEmail: {
//           enabled: false,
//           subjectTemplate: '',
//           bodyTemplate: '',
//           variables: []
//         }
//       },
//       {
//         name: 'Final Approval',
//         description: 'HR and engineering lead approve final candidate',
//         type: 'human_approval',
//         order: 7,
//         isActive: true,
//         config: {
//           delayBeforeExecution: 0,
//           requiresApproval: true,
//           approvers: ['hr-manager', 'engineering-manager', 'ceo'],
//           autoProceed: false
//         },
//         aiEmail: {
//           enabled: false,
//           subjectTemplate: '',
//           bodyTemplate: '',
//           variables: []
//         }
//       },
//       {
//         name: 'Offer Letter',
//         description: 'Send offer letter to approved candidate',
//         type: 'offer_letter',
//         order: 8,
//         isActive: true,
//         config: {
//           delayBeforeExecution: 4,
//           requiresApproval: false,
//           approvers: [],
//           autoProceed: true
//         },
//         aiEmail: {
//           enabled: true,
//           subjectTemplate: 'Congratulations! Offer for {job_title}',
//           bodyTemplate: 'Hi {candidate_name}, we are pleased to offer you the position.',
//           variables: ['candidate_name', 'job_title']
//         }
//       }
//     ],
//     createdAt: '2024-01-10T10:00:00Z',
//     updatedAt: '2024-01-10T10:00:00Z'
//   },
//   {
//     id: 'template-2',
//     name: 'Quick Design Hiring',
//     description: 'Streamlined design hiring with portfolio review and team interview',
//     category: 'design',
//     isDefault: false,
//     steps: [
//       {
//         name: 'Email Reception',
//         description: 'Monitor job application emails',
//         type: 'email_reception',
//         order: 1,
//         isActive: true,
//         config: {
//           delayBeforeExecution: 2,
//           requiresApproval: false,
//           approvers: [],
//           autoProceed: true
//         },
//         aiEmail: {
//           enabled: false,
//           subjectTemplate: '',
//           bodyTemplate: '',
//           variables: []
//         }
//       },
//       {
//         name: 'Portfolio Review',
//         description: 'Design team reviews candidate portfolio',
//         type: 'human_approval',
//         order: 2,
//         isActive: true,
//         config: {
//           delayBeforeExecution: 0,
//           requiresApproval: true,
//           approvers: ['design-lead', 'senior-designer'],
//           autoProceed: false
//         },
//         aiEmail: {
//           enabled: false,
//           subjectTemplate: '',
//           bodyTemplate: '',
//           variables: []
//         }
//       },
//       {
//         name: 'Team Interview',
//         description: 'Schedule team interview with design team',
//         type: 'interview_scheduling',
//         order: 3,
//         isActive: true,
//         config: {
//           delayBeforeExecution: 1,
//           requiresApproval: false,
//           approvers: [],
//           autoProceed: true
//         },
//         aiEmail: {
//           enabled: true,
//           subjectTemplate: 'Team Interview - {job_title}',
//           bodyTemplate: 'Hi {candidate_name}, we would like to schedule a team interview.',
//           variables: ['candidate_name', 'job_title']
//         }
//       },
//       {
//         name: 'Final Decision',
//         description: 'Design lead makes final hiring decision',
//         type: 'human_approval',
//         order: 4,
//         isActive: true,
//         config: {
//           delayBeforeExecution: 0,
//           requiresApproval: true,
//           approvers: ['design-lead', 'hr-manager'],
//           autoProceed: false
//         },
//         aiEmail: {
//           enabled: false,
//           subjectTemplate: '',
//           bodyTemplate: '',
//           variables: []
//         }
//       }
//     ],
//     createdAt: '2024-01-12T10:00:00Z',
//     updatedAt: '2024-01-12T10:00:00Z'
//   }
// ]

// Mock workflows for existing jobs
// const mockWorkflows: Workflow[] = [
//   {
//     id: 'workflow-1',
//     companyId: 'comp-1',
//     jobId: 'job-1', // Senior Full Stack Developer
//     name: 'Senior Full Stack Developer Workflow',
//     description: 'Complete engineering hiring process with technical assessment and AI interview',
//     steps: mockWorkflowTemplates[0].steps.map((step, index) => ({
//       ...step,
//       id: `step-${index + 1}`,
//       jobId: 'job-1',
//       createdAt: '2024-01-15T10:00:00Z',
//       updatedAt: '2024-01-15T10:00:00Z'
//     })),
//     isActive: true,
//     createdAt: '2024-01-15T10:00:00Z',
//     updatedAt: '2024-01-15T10:00:00Z'
//   }
// ]

// Mock workflow executions
const mockWorkflowExecutions: WorkflowExecution[] = [
  {
    id: 'exec-1',
    workflowId: 'workflow-1',
    candidateId: 'candidate-1',
    jobId: 'job-1',
    currentStepId: 'step-3',
    status: 'waiting_approval',
    stepHistory: [
      {
        id: 'exec-step-1',
        workflowExecutionId: 'exec-1',
        stepId: 'step-1',
        stepName: 'Email Reception',
        stepType: 'email_reception',
        status: 'completed',
        startedAt: '2024-01-15T10:00:00Z',
        completedAt: '2024-01-15T13:00:00Z',
        aiActions: {},
        approval: {
          required: false,
          approvers: []
        }
      },
      {
        id: 'exec-step-2',
        workflowExecutionId: 'exec-1',
        stepId: 'step-2',
        stepName: 'Resume Analysis',
        stepType: 'resume_analysis',
        status: 'completed',
        startedAt: '2024-01-15T13:00:00Z',
        completedAt: '2024-01-15T13:30:00Z',
        aiActions: {
          resumeAnalyzed: {
            analyzedAt: '2024-01-15T13:30:00Z',
            score: 85,
            insights: ['Strong React experience', 'Good Node.js skills', 'Excellent problem solving']
          }
        },
        approval: {
          required: true,
          approvers: ['hr-manager', 'senior-engineer'],
          approvedBy: 'hr-manager',
          approvedAt: '2024-01-15T14:00:00Z'
        }
      }
    ],
    currentStep: {
      id: 'exec-step-3',
      workflowExecutionId: 'exec-1',
      stepId: 'step-3',
      stepName: 'Technical Task Assignment',
      stepType: 'task_assignment',
      status: 'waiting_approval',
      startedAt: '2024-01-15T14:00:00Z',
      aiActions: {},
      approval: {
        required: false,
        approvers: []
      }
    },
    nextStep: null, // No mock data available
    startedAt: '2024-01-15T10:00:00Z',
    lastUpdatedAt: '2024-01-15T14:00:00Z'
  }
]

// Mock workflow stats
const mockWorkflowStats: WorkflowStats = {
  totalWorkflows: 3,
  activeWorkflows: 2,
  totalExecutions: 8,
  runningExecutions: 3,
  completedExecutions: 5,
  averageCompletionTime: 72, // hours
  approvalRate: 78, // percentage
  rejectionRate: 22 // percentage
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const workflowService = {
  // Workflow Templates
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    try {
      const apiTemplates: WorkflowTemplatePopulated[] = await workflowApiService.getWorkflowTemplates()
      // Convert API templates to frontend format
      return apiTemplates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        category: template.category as 'engineering' | 'design' | 'marketing' | 'sales' | 'general',
        isDefault: false,
        steps: template.step_details.map(stepDetail => ({
          name: stepDetail.workflow_step.name,
          display_name: stepDetail.workflow_step.display_name,  // ✅ Add display_name field
          description: stepDetail.workflow_step.description,
          type: stepDetail.workflow_step.id,
          order: stepDetail.order_number,
          isActive: true,
          status: 'pending' as const,
          config: {
            delayBeforeExecution: Math.floor((stepDetail.delay_in_seconds || 0) / 3600), // Convert seconds to hours
            requiresApproval: stepDetail.required_human_approval,
            approvers: [], // We don't have approver names in the API response
            autoProceed: stepDetail.auto_start
          },
          aiEmail: {
            enabled: false,
            subjectTemplate: '',
            bodyTemplate: '',
            variables: []
          }
        })),
        createdAt: template.created_at,
        updatedAt: template.updated_at
      }))
    } catch (error) {
      console.error('Failed to fetch workflow templates:', error)
      return []
    }
  },

  async getWorkflowTemplate(templateId: string): Promise<WorkflowTemplate | null> {
    try {
      const templates = await this.getWorkflowTemplates()
      return templates.find(template => template.id === templateId) || null
    } catch (error) {
      console.error('Failed to fetch workflow template:', error)
      return null
    }
  },

  // Workflows
  async getWorkflows(companyId: string): Promise<Workflow[]> {
    await delay(500)
    return [] // Mock workflows removed - implement with real API
  },

  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    await delay(300)
    return null // Mock workflows removed - implement with real API
  },

  async getWorkflowByJob(jobId: string): Promise<Workflow | null> {
    await delay(300)
    return null // Mock workflows removed - implement with real API
  },

  async createWorkflow(data: WorkflowCreateData, companyId: string): Promise<Workflow> {
    await delay(800)
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      companyId,
      ...data,
      steps: data.steps.map((step, index) => ({
        ...step,
        id: `step-${Date.now()}-${index}`,
        jobId: data.jobId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // Mock workflows removed - implement with real API
    return newWorkflow
  },

  async updateWorkflow(workflowId: string, updates: WorkflowUpdateData): Promise<Workflow | null> {
    await delay(600)
    // Mock workflows removed - implement with real API
    return null
  },

  async deleteWorkflow(workflowId: string): Promise<boolean> {
    await delay(400)
    // Mock workflows removed - implement with real API
    return true
  },

  // Workflow Steps
  async addWorkflowStep(workflowId: string, stepData: WorkflowStepCreateData): Promise<WorkflowStep | null> {
    await delay(600)
    // Mock workflows removed - implement with real API
    const workflow = null
    if (!workflow) return null

    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      jobId: workflow.jobId,
      ...stepData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    workflow.steps.push(newStep)
    workflow.updatedAt = new Date().toISOString()
    
    return newStep
  },

  async updateWorkflowStep(workflowId: string, stepId: string, updates: Partial<WorkflowStep>): Promise<WorkflowStep | null> {
    await delay(500)
    // Mock workflows removed - implement with real API
    const workflow = null
    if (!workflow) return null

    const stepIndex = workflow.steps.findIndex(s => s.id === stepId)
    if (stepIndex === -1) return null

    const updatedStep = {
      ...workflow.steps[stepIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    workflow.steps[stepIndex] = updatedStep
    workflow.updatedAt = new Date().toISOString()
    
    return updatedStep
  },

  async deleteWorkflowStep(workflowId: string, stepId: string): Promise<boolean> {
    await delay(400)
    // Mock workflows removed - implement with real API
    const workflow = null
    if (!workflow) return false

    const stepIndex = workflow.steps.findIndex(s => s.id === stepId)
    if (stepIndex === -1) return false

    workflow.steps.splice(stepIndex, 1)
    workflow.updatedAt = new Date().toISOString()
    
    return true
  },

  async reorderWorkflowSteps(workflowId: string, stepIds: string[]): Promise<boolean> {
    await delay(500)
    // Mock workflows removed - implement with real API
    const workflow = null
    if (!workflow) return false

    // Reorder steps based on the new order
    const reorderedSteps: WorkflowStep[] = []
    stepIds.forEach((stepId, index) => {
      const step = workflow.steps.find(s => s.id === stepId)
      if (step) {
        step.order = index + 1
        reorderedSteps.push(step)
      }
    })

    workflow.steps = reorderedSteps
    workflow.updatedAt = new Date().toISOString()
    
    return true
  },

  // Workflow Executions
  async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    await delay(400)
    return mockWorkflowExecutions.filter(exec => exec.workflowId === workflowId)
  },

  async getWorkflowExecution(executionId: string): Promise<WorkflowExecution | null> {
    await delay(300)
    return mockWorkflowExecutions.find(exec => exec.id === executionId) || null
  },

  // Workflow Stats
  async getWorkflowStats(companyId: string): Promise<WorkflowStats> {
    await delay(300)
    return mockWorkflowStats
  }
}

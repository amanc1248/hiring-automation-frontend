import { apiClient } from './apiClient';

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  step_type: 'automated' | 'manual' | 'approval';
  actions: Array<Record<string, any>>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  steps_execution_id: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowStepDetail {
  id: string;
  workflow_step_id: string;
  delay_in_seconds?: number;
  auto_start: boolean;
  required_human_approval: boolean;
  number_of_approvals_needed?: number;
  status: 'awaiting' | 'finished' | 'rejected';
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface CandidateWorkflow {
  id: string;
  name: string;
  description?: string;
  category: string;
  job_id: string;
  workflow_template_id: string;
  candidate_id: string;
  current_step_detail_id?: string;
  started_at: string;
  completed_at?: string;
  execution_log: Array<Record<string, any>>;
  created_at: string;
  updated_at: string;
}

class WorkflowApiService {
  /**
   * Get all available workflow steps
   */
  async getWorkflowSteps(): Promise<WorkflowStep[]> {
    const response = await apiClient.get('/api/workflows/steps');
    return response.data;
  }

  /**
   * Get a specific workflow step by ID
   */
  async getWorkflowStep(stepId: string): Promise<WorkflowStep> {
    const response = await apiClient.get(`/api/workflows/steps/${stepId}`);
    return response.data;
  }

  /**
   * Get all workflow templates with populated step details
   */
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    const response = await apiClient.get('/api/workflows/templates');
    return response.data;
  }

  /**
   * Create a new workflow template
   */
  async createWorkflowTemplate(template: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowTemplate> {
    const response = await apiClient.post('/api/workflows/templates', template);
    return response.data;
  }

  /**
   * Create a new workflow template with step details
   */
  async createWorkflowTemplateWithSteps(templateData: {
    name: string;
    description?: string;
    category: string;
    steps: Array<{
      workflow_step_id: string;
      delay_in_seconds?: number;
      auto_start: boolean;
      required_human_approval: boolean;
      number_of_approvals_needed?: number;
      order_number: number;
    }>;
  }): Promise<WorkflowTemplate> {
    const response = await apiClient.post('/api/workflows/templates/with-steps', templateData);
    return response.data;
  }

  /**
   * Update an existing workflow template with step details
   */
  async updateWorkflowTemplate(id: string, templateData: {
    name: string;
    description?: string;
    category: string;
    steps: Array<{
      workflow_step_id: string;
      delay_in_seconds?: number;
      auto_start: boolean;
      required_human_approval: boolean;
      number_of_approvals_needed?: number;
      order_number: number;
    }>;
  }): Promise<WorkflowTemplate> {
    const response = await apiClient.put(`/api/workflows/templates/${id}`, templateData);
    return response.data;
  }

  /**
   * Delete a workflow template
   */
  async deleteWorkflowTemplate(id: string): Promise<void> {
    await apiClient.delete(`/api/workflows/templates/${id}`);
  }

  /**
   * Get workflow step details for a specific workflow
   */
  async getWorkflowStepDetails(workflowId: string): Promise<WorkflowStepDetail[]> {
    const response = await apiClient.get(`/api/workflows/${workflowId}/step-details`);
    return response.data;
  }

  /**
   * Create workflow step detail
   */
  async createWorkflowStepDetail(stepDetail: Omit<WorkflowStepDetail, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowStepDetail> {
    const response = await apiClient.post('/api/workflows/step-details', stepDetail);
    return response.data;
  }

  /**
   * Update workflow step detail
   */
  async updateWorkflowStepDetail(id: string, stepDetail: Partial<Omit<WorkflowStepDetail, 'id' | 'created_at' | 'updated_at'>>): Promise<WorkflowStepDetail> {
    const response = await apiClient.put(`/api/workflows/step-details/${id}`, stepDetail);
    return response.data;
  }

  /**
   * Delete workflow step detail
   */
  async deleteWorkflowStepDetail(id: string): Promise<void> {
    await apiClient.delete(`/api/workflows/step-details/${id}`);
  }

  /**
   * Get candidate workflows
   */
  async getCandidateWorkflows(candidateId?: string, jobId?: string): Promise<CandidateWorkflow[]> {
    const params = new URLSearchParams();
    if (candidateId) params.append('candidate_id', candidateId);
    if (jobId) params.append('job_id', jobId);
    
    const response = await apiClient.get(`/api/workflows/candidate-workflows?${params.toString()}`);
    return response.data;
  }

  /**
   * Create candidate workflow
   */
  async createCandidateWorkflow(workflow: Omit<CandidateWorkflow, 'id' | 'started_at' | 'created_at' | 'updated_at' | 'execution_log'>): Promise<CandidateWorkflow> {
    const response = await apiClient.post('/api/workflows/candidate-workflows', workflow);
    return response.data;
  }

  /**
   * Update candidate workflow
   */
  async updateCandidateWorkflow(id: string, workflow: Partial<Omit<CandidateWorkflow, 'id' | 'created_at' | 'updated_at'>>): Promise<CandidateWorkflow> {
    const response = await apiClient.put(`/api/workflows/candidate-workflows/${id}`, workflow);
    return response.data;
  }

  /**
   * Delete candidate workflow
   */
  async deleteCandidateWorkflow(id: string): Promise<void> {
    await apiClient.delete(`/api/workflows/candidate-workflows/${id}`);
  }
}

export const workflowApiService = new WorkflowApiService();

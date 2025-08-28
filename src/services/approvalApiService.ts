/**
 * Approval API Service
 * Handles API calls for workflow approval management
 */

import { apiClient } from './apiClient'

export interface ApprovalRequest {
  id: string
  candidate_workflow_id: string
  workflow_step_detail_id: string
  required_approvals: number
  status: string
  requested_at: string
  responded_at?: string
  comments?: string
  
  // User permissions
  can_approve: boolean
  
  // Workflow step information
  step_name: string
  step_description: string
  step_type: string
  
  // Candidate information
  candidate_name: string
  candidate_email: string
  
  // Job information
  job_title: string
  job_department: string
}

export interface ApprovalSubmission {
  approval_request_id: string
  decision: 'approved' | 'rejected'
  comments?: string
}

export interface ApprovalSubmissionResponse {
  success: boolean
  message: string
  approval_id: string
}

export interface ApprovalRequestsList {
  requests: ApprovalRequest[]
  total_count: number
}

export interface ApprovalStats {
  pending_count: number
  approved_count: number
  rejected_count: number
  total_count: number
}

class ApprovalApiService {
  /**
   * Get pending approval requests for the current user
   */
  async getPendingApprovals(): Promise<ApprovalRequestsList> {
    const response = await apiClient.get('/api/approvals/pending')
    return response.data
  }

  /**
   * Submit approval or rejection for a workflow step
   */
  async submitApprovalResponse(submission: ApprovalSubmission): Promise<ApprovalSubmissionResponse> {
    const response = await apiClient.post('/api/approvals/respond', submission)
    return response.data
  }

  /**
   * Get approval history for the current user
   */
  async getApprovalHistory(limit: number = 50, offset: number = 0): Promise<ApprovalRequest[]> {
    const response = await apiClient.get('/api/approvals/history', {
      params: { limit, offset }
    })
    return response.data
  }

  /**
   * Get approval statistics (counts of pending, approved, rejected)
   */
  async getApprovalStats(): Promise<ApprovalStats> {
    // This endpoint doesn't exist yet, but we can derive stats from pending approvals
    const pending = await this.getPendingApprovals()
    const history = await this.getApprovalHistory(1000) // Get more for stats
    
    const pending_count = pending.total_count
    const approved_count = history.filter(req => req.status === 'approved').length
    const rejected_count = history.filter(req => req.status === 'rejected').length
    const total_count = pending_count + approved_count + rejected_count
    
    return {
      pending_count,
      approved_count,
      rejected_count,
      total_count
    }
  }
}

export const approvalApiService = new ApprovalApiService()
export default approvalApiService

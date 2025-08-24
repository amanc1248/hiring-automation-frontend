import { apiClient } from './apiClient'
import type { 
  JobResponse, 
  JobListResponse, 
  JobCreateRequest, 
  JobUpdateRequest,
  // Legacy types for backward compatibility
  JobPosting, 
  JobCreateData, 
  JobUpdateData 
} from '../types/job'

export const jobService = {
  // Get all jobs for the company
  async getJobs(params?: {
    skip?: number
    limit?: number
    search?: string
    status?: string
    department?: string
  }): Promise<JobListResponse> {
    const queryParams = new URLSearchParams()
    
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.department) queryParams.append('department', params.department)
    
    const queryString = queryParams.toString()
    const url = queryString ? `/api/jobs/?${queryString}` : '/api/jobs/'
    
    const response = await apiClient.get<JobListResponse>(url)
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch jobs')
    }
    return response.data!
  },

  // Get a single job by ID
  async getJob(jobId: string): Promise<JobResponse> {
    const response = await apiClient.get<JobResponse>(`/api/jobs/${jobId}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch job')
    }
    return response.data!
  },

  // Create a new job
  async createJob(jobData: JobCreateRequest): Promise<JobResponse> {
    const response = await apiClient.post<JobResponse>('/api/jobs/', jobData)
    if (!response.success) {
      throw new Error(response.error || 'Failed to create job')
    }
    return response.data!
  },

  // Update an existing job
  async updateJob(jobId: string, updates: JobUpdateRequest): Promise<JobResponse> {
    const response = await apiClient.put<JobResponse>(`/api/jobs/${jobId}`, updates)
    if (!response.success) {
      throw new Error(response.error || 'Failed to update job')
    }
    return response.data!
  },

  // Delete a job (soft delete)
  async deleteJob(jobId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/jobs/${jobId}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete job')
    }
    return response.data!
  },

  // Update job status
  async updateJobStatus(jobId: string, status: 'draft' | 'active' | 'paused' | 'closed'): Promise<JobResponse> {
    return await jobService.updateJob(jobId, { status })
  },

  // Legacy methods for backward compatibility (can be removed later)
  
  // Get all jobs for a company (legacy - uses companyId but ignores it since backend filters by JWT)
  async getJobsLegacy(companyId: string): Promise<JobPosting[]> {
    const response = await jobService.getJobs()
    
    // Convert new format to legacy format
    return response.jobs.map(job => ({
      id: job.id,
      title: job.title,
      companyId: companyId, // Use the passed companyId
      department: job.department || 'Unknown',
      description: job.description,
      requirements: job.requirements ? 
        job.requirements.split(',').map((req, index) => ({
          id: `req-${index}`,
          name: req.trim(),
          category: 'skill' as const,
          level: 'intermediate' as const,
          required: true
        })) : [],
      location: {
        type: (job.remote_policy as 'remote' | 'onsite' | 'hybrid') || 'onsite',
        city: job.location || undefined
      },
      salary: {
        min: job.salary_min || 0,
        max: job.salary_max || 0,
        currency: (job.salary_currency as 'USD' | 'EUR' | 'GBP' | 'INR') || 'USD',
        period: 'yearly' as const,
        equity: false,
        benefits: []
      },
      employmentType: job.job_type,
      experienceLevel: job.experience_level || 'mid',
      applicationEmail: 'applications@company.com', // Default email
      workflowId: job.workflow_template_id,
      status: job.status === 'active' ? 'published' : 
              job.status === 'closed' ? 'closed' : 
              job.status === 'paused' ? 'closed' : 'draft',
      publishedAt: job.status === 'active' ? job.posted_at : undefined,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      totalApplications: 0, // TODO: Get from backend when applications API is ready
      activeApplications: 0 // TODO: Get from backend when applications API is ready
    }))
  },

  // Get a single job by ID (legacy)
  async getJobLegacy(jobId: string): Promise<JobPosting | null> {
    try {
      const job = await jobService.getJob(jobId)
      
      // Convert to legacy format
      return {
        id: job.id,
        title: job.title,
        companyId: 'legacy', // Default value
        department: job.department || 'Unknown',
        description: job.description,
        requirements: job.requirements ? 
          job.requirements.split(',').map((req, index) => ({
            id: `req-${index}`,
            name: req.trim(),
            category: 'skill' as const,
            level: 'intermediate' as const,
            required: true
          })) : [],
        location: {
          type: (job.remote_policy as 'remote' | 'onsite' | 'hybrid') || 'onsite',
          city: job.location || undefined
        },
        salary: {
          min: job.salary_min || 0,
          max: job.salary_max || 0,
          currency: (job.salary_currency as 'USD' | 'EUR' | 'GBP' | 'INR') || 'USD',
          period: 'yearly' as const,
          equity: false,
          benefits: []
        },
        employmentType: job.job_type,
        experienceLevel: job.experience_level || 'mid',
        applicationEmail: 'applications@company.com',
        workflowId: job.workflow_template_id,
        status: job.status === 'active' ? 'published' : 
                job.status === 'closed' ? 'closed' : 
                job.status === 'paused' ? 'closed' : 'draft',
        publishedAt: job.status === 'active' ? job.posted_at : undefined,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
        totalApplications: 0,
        activeApplications: 0
      }
    } catch (error) {
      return null
    }
  },

  // Create a new job (legacy)
  async createJobLegacy(jobData: JobCreateData, companyId: string): Promise<JobPosting> {
    const createRequest: JobCreateRequest = {
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements.map(req => req.name).join(', '),
      department: jobData.department,
      location: jobData.location.city || (jobData.location.type === 'remote' ? 'Remote' : 'Office'),
      job_type: jobData.employmentType,
      experience_level: jobData.experienceLevel === 'lead' ? 'senior' : jobData.experienceLevel,
      remote_policy: jobData.location.type,
      salary_min: jobData.salary.min,
      salary_max: jobData.salary.max,
      salary_currency: jobData.salary.currency,
      status: 'draft',
      workflow_template_id: jobData.workflowId
    }
    
    const job = await jobService.createJob(createRequest)
    
    // Convert back to legacy format
    return {
      id: job.id,
      title: job.title,
      companyId: companyId,
      department: job.department || 'Unknown',
      description: job.description,
      requirements: jobData.requirements.map(req => ({
        id: `req-${Math.random()}`,
        ...req
      })),
      location: jobData.location,
      salary: jobData.salary,
      employmentType: jobData.employmentType,
      experienceLevel: jobData.experienceLevel,
      applicationEmail: jobData.applicationEmail,
      workflowId: job.workflow_template_id,
      status: 'draft',
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      totalApplications: 0,
      activeApplications: 0
    }
  },

  // Update an existing job (legacy)
  async updateJobLegacy(jobId: string, updates: JobUpdateData): Promise<JobPosting | null> {
    try {
      const updateRequest: JobUpdateRequest = {}
      
      if (updates.title) updateRequest.title = updates.title
      if (updates.description) updateRequest.description = updates.description
      if (updates.requirements) {
        updateRequest.requirements = updates.requirements.map(req => req.name).join(', ')
      }
      if (updates.department) updateRequest.department = updates.department
      if (updates.location) {
        updateRequest.location = updates.location.city || (updates.location.type === 'remote' ? 'Remote' : 'Office')
        updateRequest.remote_policy = updates.location.type
      }
      if (updates.employmentType) updateRequest.job_type = updates.employmentType
      if (updates.experienceLevel) {
        updateRequest.experience_level = updates.experienceLevel === 'lead' ? 'senior' : updates.experienceLevel
      }
      if (updates.salary) {
        updateRequest.salary_min = updates.salary.min
        updateRequest.salary_max = updates.salary.max
        updateRequest.salary_currency = updates.salary.currency
      }
      if (updates.status) {
        updateRequest.status = updates.status === 'published' ? 'active' : 
                             updates.status === 'closed' ? 'closed' : 'draft'
      }
      if (updates.workflowId) updateRequest.workflow_template_id = updates.workflowId
      
      const job = await jobService.updateJob(jobId, updateRequest)
      return await jobService.getJobLegacy(jobId)
    } catch (error) {
      return null
    }
  },

  // Delete a job (legacy)
  async deleteJobLegacy(jobId: string): Promise<boolean> {
    try {
      await jobService.deleteJob(jobId)
      return true
    } catch (error) {
      return false
    }
  },

  // Publish a job (legacy)
  async publishJob(jobId: string): Promise<JobPosting | null> {
    return await jobService.updateJobLegacy(jobId, { status: 'published' })
  },

  // Close a job (legacy)
  async closeJob(jobId: string): Promise<JobPosting | null> {
    return await jobService.updateJobLegacy(jobId, { status: 'closed' })
  }
}
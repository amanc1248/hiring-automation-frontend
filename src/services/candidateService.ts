import type { 
  Candidate, 
  CandidateCreateData, 
  CandidateUpdateData, 
  CandidateFilters, 
  CandidatesResponse 
} from '../types/candidate'
import { API_CONFIG, tokenStorage } from '../config/api'

// Helper function to make API calls
const makeApiCall = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenStorage.getAccessToken()}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Mock candidates data (fallback for when no real data exists)
const mockCandidates: Candidate[] = [
  {
    id: 'candidate-1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    jobId: 'job-1',
    jobTitle: 'Backend Engineer',
    applicationDate: '2024-01-15T10:00:00Z',
    currentStep: 'task_review',
    workflowProgress: [
      {
        id: 'step-1',
        name: 'Email Reception',
        type: 'email_reception',
        status: 'completed',
        startedAt: '2024-01-15T10:00:00Z',
        completedAt: '2024-01-15T10:05:00Z'
      },
      {
        id: 'step-2',
        name: 'Resume Analysis',
        type: 'resume_analysis',
        status: 'completed',
        startedAt: '2024-01-15T10:05:00Z',
        completedAt: '2024-01-15T10:10:00Z'
      },
      {
        id: 'step-3',
        name: 'Task Assignment',
        type: 'task_assignment',
        status: 'completed',
        startedAt: '2024-01-15T10:10:00Z',
        completedAt: '2024-01-15T10:15:00Z'
      },
      {
        id: 'step-4',
        name: 'Review Task Assignment',
        type: 'task_review',
        status: 'waiting_approval',
        startedAt: '2024-01-15T10:15:00Z'
      }
    ],
    resume: {
      id: 'resume-1',
      filename: 'john_smith_resume.pdf',
      originalName: 'John_Smith_Resume.pdf',
      fileSize: 245760,
      fileType: 'application/pdf',
      downloadUrl: '/api/resumes/john_smith_resume.pdf',
      uploadedAt: '2024-01-15T10:00:00Z'
    },
    communicationHistory: [
      {
        id: 'comm-1',
        type: 'email',
        subject: 'Application Received - Backend Engineer',
        content: 'Thank you for your application. We will review your resume and get back to you soon.',
        sender: 'hr@company.com',
        recipient: 'john.smith@email.com',
        timestamp: '2024-01-15T10:05:00Z',
        status: 'delivered'
      },
      {
        id: 'comm-2',
        type: 'email',
        subject: 'Technical Assessment - Backend Engineer',
        content: 'Please complete the technical assessment within 48 hours.',
        sender: 'hr@company.com',
        recipient: 'john.smith@email.com',
        timestamp: '2024-01-15T10:15:00Z',
        status: 'read'
      }
    ],
    status: 'pending',
    notes: ['Strong backend experience', 'Good communication skills'],
    companyId: 'company-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:15:00Z'
  },
  {
    id: 'candidate-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 987-6543',
    location: 'New York, NY',
    jobId: 'job-2',
    jobTitle: 'Frontend Engineer',
    applicationDate: '2024-01-14T14:30:00Z',
    currentStep: 'interview_scheduling',
    workflowProgress: [
      {
        id: 'step-1',
        name: 'Email Reception',
        type: 'email_reception',
        status: 'completed',
        startedAt: '2024-01-14T14:30:00Z',
        completedAt: '2024-01-14T14:35:00Z'
      },
      {
        id: 'step-2',
        name: 'Resume Analysis',
        type: 'resume_analysis',
        status: 'completed',
        startedAt: '2024-01-14T14:35:00Z',
        completedAt: '2024-01-14T14:40:00Z'
      },
      {
        id: 'step-3',
        name: 'Task Assignment',
        type: 'task_assignment',
        status: 'completed',
        startedAt: '2024-01-14T14:40:00Z',
        completedAt: '2024-01-14T14:45:00Z'
      },
      {
        id: 'step-4',
        name: 'Review Task Assignment',
        type: 'task_review',
        status: 'completed',
        startedAt: '2024-01-14T14:45:00Z',
        completedAt: '2024-01-14T16:00:00Z'
      },
      {
        id: 'step-5',
        name: 'Interview Scheduling',
        type: 'interview_scheduling',
        status: 'in_progress',
        startedAt: '2024-01-14T16:00:00Z'
      }
    ],
    resume: {
      id: 'resume-2',
      filename: 'sarah_johnson_resume.pdf',
      originalName: 'Sarah_Johnson_Resume.pdf',
      fileSize: 198432,
      fileType: 'application/pdf',
      downloadUrl: '/api/resumes/sarah_johnson_resume.pdf',
      uploadedAt: '2024-01-14T14:30:00Z'
    },
    communicationHistory: [
      {
        id: 'comm-3',
        type: 'email',
        subject: 'Application Received - Frontend Engineer',
        content: 'Thank you for your application. We will review your resume and get back to you soon.',
        sender: 'hr@company.com',
        recipient: 'sarah.johnson@email.com',
        timestamp: '2024-01-14T14:35:00Z',
        status: 'delivered'
      },
      {
        id: 'comm-4',
        type: 'email',
        subject: 'Technical Assessment - Frontend Engineer',
        content: 'Please complete the technical assessment within 48 hours.',
        sender: 'hr@company.com',
        recipient: 'sarah.johnson@email.com',
        timestamp: '2024-01-14T14:45:00Z',
        status: 'read'
      },
      {
        id: 'comm-5',
        type: 'email',
        subject: 'Task Approved - Interview Next',
        content: 'Congratulations! Your technical assessment has been approved. We will schedule an interview soon.',
        sender: 'hr@company.com',
        recipient: 'sarah.johnson@email.com',
        timestamp: '2024-01-14T16:00:00Z',
        status: 'sent'
      }
    ],
    status: 'active',
    notes: ['Excellent frontend skills', 'Great problem-solving approach'],
    companyId: 'company-1',
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T16:00:00Z'
  },
  {
    id: 'candidate-3',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 456-7890',
    location: 'Seattle, WA',
    jobId: 'job-1',
    jobTitle: 'Backend Engineer',
    applicationDate: '2024-01-13T09:15:00Z',
    currentStep: 'offer_letter',
    workflowProgress: [
      {
        id: 'step-1',
        name: 'Email Reception',
        type: 'email_reception',
        status: 'completed',
        startedAt: '2024-01-13T09:15:00Z',
        completedAt: '2024-01-13T09:20:00Z'
      },
      {
        id: 'step-2',
        name: 'Resume Analysis',
        type: 'resume_analysis',
        status: 'completed',
        startedAt: '2024-01-13T09:20:00Z',
        completedAt: '2024-01-13T09:25:00Z'
      },
      {
        id: 'step-3',
        name: 'Task Assignment',
        type: 'task_assignment',
        status: 'completed',
        startedAt: '2024-01-13T09:25:00Z',
        completedAt: '2024-01-13T09:30:00Z'
      },
      {
        id: 'step-4',
        name: 'Review Task Assignment',
        type: 'task_review',
        status: 'completed',
        startedAt: '2024-01-13T09:30:00Z',
        completedAt: '2024-01-13T11:00:00Z'
      },
      {
        id: 'step-5',
        name: 'Interview Scheduling',
        type: 'interview_scheduling',
        status: 'completed',
        startedAt: '2024-01-13T11:00:00Z',
        completedAt: '2024-01-13T11:05:00Z'
      },
      {
        id: 'step-6',
        name: 'AI Interview',
        type: 'ai_interview',
        status: 'completed',
        startedAt: '2024-01-13T11:05:00Z',
        completedAt: '2024-01-13T12:00:00Z'
      },
      {
        id: 'step-7',
        name: 'Final Approval',
        type: 'human_approval',
        status: 'completed',
        startedAt: '2024-01-13T12:00:00Z',
        completedAt: '2024-01-13T14:00:00Z'
      },
      {
        id: 'step-8',
        name: 'Offer Letter',
        type: 'offer_letter',
        status: 'in_progress',
        startedAt: '2024-01-13T14:00:00Z'
      }
    ],
    resume: {
      id: 'resume-3',
      filename: 'michael_chen_resume.pdf',
      originalName: 'Michael_Chen_Resume.pdf',
      fileSize: 312456,
      fileType: 'application/pdf',
      downloadUrl: '/api/resumes/michael_chen_resume.pdf',
      uploadedAt: '2024-01-13T09:15:00Z'
    },
    communicationHistory: [
      {
        id: 'comm-6',
        type: 'email',
        subject: 'Application Received - Backend Engineer',
        content: 'Thank you for your application. We will review your resume and get back to you soon.',
        sender: 'hr@company.com',
        recipient: 'michael.chen@email.com',
        timestamp: '2024-01-13T09:20:00Z',
        status: 'delivered'
      },
      {
        id: 'comm-7',
        type: 'email',
        subject: 'Technical Assessment - Backend Engineer',
        content: 'Please complete the technical assessment within 48 hours.',
        sender: 'hr@company.com',
        recipient: 'michael.chen@email.com',
        timestamp: '2024-01-13T09:30:00Z',
        status: 'read'
      },
      {
        id: 'comm-8',
        type: 'email',
        subject: 'Interview Scheduled - Backend Engineer',
        content: 'Your AI interview has been scheduled for tomorrow at 2 PM.',
        sender: 'hr@company.com',
        recipient: 'michael.chen@email.com',
        timestamp: '2024-01-13T11:05:00Z',
        status: 'delivered'
      },
      {
        id: 'comm-9',
        type: 'email',
        subject: 'Congratulations - Offer Letter',
        content: 'We are pleased to offer you the Backend Engineer position!',
        sender: 'hr@company.com',
        recipient: 'michael.chen@email.com',
        timestamp: '2024-01-13T14:00:00Z',
        status: 'sent'
      }
    ],
    status: 'completed',
    notes: ['Outstanding technical skills', 'Great cultural fit', 'Ready to offer'],
    companyId: 'company-1',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T14:00:00Z'
  }
]

class CandidateService {
  async getCandidates(companyId: string, filters: CandidateFilters & { page: number; limit: number }): Promise<CandidatesResponse> {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      })

      if (filters.search) params.append('search', filters.search)
      if (filters.jobId) params.append('job_id', filters.jobId)
      if (filters.status) params.append('status', filters.status)
      if (filters.workflowStep) params.append('workflow_step', filters.workflowStep)
      if (filters.dateRange) params.append('date_range', filters.dateRange)

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CANDIDATES}?${params}`
      
      const response = await makeApiCall(url)
      
      return {
        candidates: response.candidates,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      }
    } catch (error) {
      console.warn('Failed to fetch real candidates, using mock data:', error)
      
      // Fallback to mock data with filtering
      let filteredCandidates = [...mockCandidates]
      
      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredCandidates = filteredCandidates.filter(candidate =>
          candidate.name.toLowerCase().includes(searchLower) ||
          candidate.email.toLowerCase().includes(searchLower) ||
          candidate.jobTitle.toLowerCase().includes(searchLower)
        )
      }
      
      if (filters.jobId) {
        filteredCandidates = filteredCandidates.filter(candidate => candidate.jobId === filters.jobId)
      }
      
      if (filters.status) {
        filteredCandidates = filteredCandidates.filter(candidate => candidate.status === filters.status)
      }
      
      if (filters.workflowStep) {
        filteredCandidates = filteredCandidates.filter(candidate => candidate.currentStep === filters.workflowStep)
      }
      
      if (filters.dateRange !== 'all') {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        filteredCandidates = filteredCandidates.filter(candidate => {
          const applicationDate = new Date(candidate.applicationDate)
          
          switch (filters.dateRange) {
            case 'today':
              return applicationDate >= today
            case 'week':
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
              return applicationDate >= weekAgo
            case 'month':
              const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
              return applicationDate >= monthAgo
            case 'quarter':
              const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
              return applicationDate >= quarterAgo
            default:
              return true
          }
        })
      }
      
      const total = filteredCandidates.length
      const startIndex = (filters.page - 1) * filters.limit
      const endIndex = startIndex + filters.limit
      const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex)
      
      return {
        candidates: paginatedCandidates,
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      }
    }
  }

  async getCandidate(candidateId: string): Promise<Candidate | null> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CANDIDATES}/${candidateId}`
      const response = await makeApiCall(url)
      return response
    } catch (error) {
      console.warn('Failed to fetch real candidate, using mock data:', error)
      return mockCandidates.find(c => c.id === candidateId) || null
    }
  }

  async getCandidateWorkflow(candidateId: string): Promise<any> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CANDIDATES}/${candidateId}/workflow`
      const response = await makeApiCall(url)
      return response
    } catch (error) {
      console.error('Failed to fetch candidate workflow:', error)
      throw error
    }
  }

  async createCandidate(candidateData: CandidateCreateData): Promise<Candidate> {
    try {
      // Split name into first and last name for API
      const nameParts = candidateData.name.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const apiData = {
        first_name: firstName,
        last_name: lastName,
        email: candidateData.email,
        phone: candidateData.phone,
        location: candidateData.location
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CANDIDATES}`
      const response = await makeApiCall(url, {
        method: 'POST',
        body: JSON.stringify(apiData)
      })
      
      return response
    } catch (error) {
      console.warn('Failed to create real candidate, using mock:', error)
      
      // Fallback to mock creation
      const newCandidate: Candidate = {
        id: `candidate-${Date.now()}`,
        name: candidateData.name,
        email: candidateData.email,
        phone: candidateData.phone,
        location: candidateData.location,
        jobId: candidateData.jobId,
        jobTitle: 'Backend Engineer', // This would come from the job
        applicationDate: new Date().toISOString(),
        currentStep: 'email_reception',
        workflowProgress: [
          {
            id: `step-${Date.now()}`,
            name: 'Email Reception',
            type: 'email_reception',
            status: 'completed',
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          }
        ],
        resume: {
          id: `resume-${Date.now()}`,
          filename: 'new_resume.pdf',
          originalName: 'Resume.pdf',
          fileSize: 0,
          fileType: 'application/pdf',
          downloadUrl: '/api/resumes/new_resume.pdf',
          uploadedAt: new Date().toISOString()
        },
        communicationHistory: [],
        status: 'active',
        notes: [],
        companyId: 'company-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      mockCandidates.push(newCandidate)
      return newCandidate
    }
  }

  async updateCandidate(candidateId: string, updates: CandidateUpdateData): Promise<Candidate | null> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CANDIDATES}/${candidateId}`
      const response = await makeApiCall(url, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      return response
    } catch (error) {
      console.warn('Failed to update real candidate, using mock:', error)
      
      // Fallback to mock update
      const candidateIndex = mockCandidates.findIndex(c => c.id === candidateId)
      if (candidateIndex === -1) return null
      
      const updatedCandidate = { ...mockCandidates[candidateIndex], ...updates, updatedAt: new Date().toISOString() }
      mockCandidates[candidateIndex] = updatedCandidate
      
      return updatedCandidate
    }
  }

  async deleteCandidate(candidateId: string): Promise<boolean> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CANDIDATES}/${candidateId}`
      await makeApiCall(url, {
        method: 'DELETE'
      })
      return true
    } catch (error) {
      console.warn('Failed to delete real candidate, using mock:', error)
      
      // Fallback to mock delete
      const candidateIndex = mockCandidates.findIndex(c => c.id === candidateId)
      if (candidateIndex === -1) return false
      
      mockCandidates.splice(candidateIndex, 1)
      return true
    }
  }

}

export const candidateService = new CandidateService()

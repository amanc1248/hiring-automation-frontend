export interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  jobId: string
  jobTitle: string
  applicationDate: string
  currentStep: string
  workflowProgress: WorkflowStep[]
  resume: ResumeFile
  communicationHistory: Communication[]
  status: 'active' | 'pending' | 'completed' | 'rejected'
  notes: string[]
  companyId: string
  createdAt: string
  updatedAt: string
}

export interface ResumeFile {
  id: string
  filename: string
  originalName: string
  fileSize: number
  fileType: string
  downloadUrl: string
  uploadedAt: string
}

export interface Communication {
  id: string
  type: 'email' | 'note' | 'system'
  subject?: string
  content: string
  sender: string
  recipient: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

export interface WorkflowStep {
  id: string
  name: string
  type: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'waiting_approval'
  startedAt?: string
  completedAt?: string
  notes?: string
}

export interface CandidateFilters {
  search: string
  jobId: string
  status: string
  workflowStep: string
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter'
}

export interface CandidatesResponse {
  candidates: Candidate[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CandidateCreateData {
  name: string
  email: string
  phone?: string
  location?: string
  jobId: string
  resume?: File
}

export interface CandidateUpdateData extends Partial<CandidateCreateData> {
  status?: 'active' | 'pending' | 'completed' | 'rejected'
  currentStep?: string
  notes?: string[]
}

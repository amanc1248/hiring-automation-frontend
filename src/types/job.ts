// API Response Types that match our backend
export interface JobResponse {
  id: string
  title: string
  description: string
  requirements?: string
  department?: string
  location?: string
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
  experience_level?: 'entry' | 'mid' | 'senior' | 'executive'
  remote_policy?: 'remote' | 'hybrid' | 'onsite'
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  status: 'draft' | 'active' | 'paused' | 'closed'
  workflow_template_id?: string
  posted_at?: string
  expires_at?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface JobListResponse {
  jobs: JobResponse[]
  total: number
  skip: number
  limit: number
}

export interface JobCreateRequest {
  title: string
  description: string
  requirements?: string
  department?: string
  location?: string
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
  experience_level?: 'entry' | 'mid' | 'senior' | 'executive'
  remote_policy?: 'remote' | 'hybrid' | 'onsite'
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  status?: 'draft' | 'active' | 'paused' | 'closed'
  workflow_template_id?: string
  assigned_to?: string
  posted_at?: string
  expires_at?: string
  is_featured?: boolean
}

export interface JobUpdateRequest {
  title?: string
  description?: string
  requirements?: string
  department?: string
  location?: string
  job_type?: 'full-time' | 'part-time' | 'contract' | 'internship'
  experience_level?: 'entry' | 'mid' | 'senior' | 'executive'
  remote_policy?: 'remote' | 'hybrid' | 'onsite'
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  status?: 'draft' | 'active' | 'paused' | 'closed'
  workflow_template_id?: string
  assigned_to?: string
  posted_at?: string
  expires_at?: string
  is_featured?: boolean
}

// Legacy types for backward compatibility (can be removed later)
export interface JobRequirement {
  id: string
  name: string
  category: 'skill' | 'experience' | 'education' | 'certification'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  required: boolean
}

export interface JobLocation {
  type: 'remote' | 'onsite' | 'hybrid'
  city?: string
  state?: string
  country?: string
  timezone?: string
}

export interface JobSalary {
  min: number
  max: number
  currency: 'USD' | 'EUR' | 'GBP' | 'INR'
  period: 'hourly' | 'monthly' | 'yearly'
  equity?: boolean
  benefits?: string[]
}

export interface JobPosting {
  id: string
  title: string
  companyId: string
  department: string
  description: string
  requirements: JobRequirement[]
  location: JobLocation
  salary: JobSalary
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  applicationEmail: string
  workflowId?: string
  status: 'draft' | 'published' | 'closed' | 'archived'
  publishedAt?: string
  createdAt: string
  updatedAt: string
  totalApplications: number
  activeApplications: number
}

export interface JobCreateData {
  title: string
  department: string
  description: string
  requirements: Omit<JobRequirement, 'id'>[]
  location: JobLocation
  salary: JobSalary
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  applicationEmail: string
  workflowId?: string
}

export interface JobUpdateData extends Partial<JobCreateData> {
  status?: 'draft' | 'published' | 'closed' | 'archived'
}
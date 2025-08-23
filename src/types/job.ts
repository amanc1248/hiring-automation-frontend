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

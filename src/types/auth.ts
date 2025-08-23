export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'hr_manager' | 'recruiter' | 'tech_lead' | 'senior_engineer' | 'project_manager'
  companyId: string
}

export interface Company {
  id: string
  name: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  industry: string
  website?: string
  description?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  company: Company | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  // Company Info
  companyName: string
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  industry: string
  website?: string
  
  // Admin User Info
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}
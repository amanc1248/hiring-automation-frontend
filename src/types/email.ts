export interface EmailAccount {
  id: string
  companyId: string
  email: string
  provider: 'gmail' | 'outlook' | 'custom'
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EmailFilterRule {
  id: string
  emailAccountId: string
  name: string
  type: 'subject' | 'sender' | 'keywords' | 'job_id'
  value: string
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with'
  isActive: boolean
  priority: number
}

export interface EmailMonitoringConfig {
  id: string
  emailAccountId: string
  jobId?: string
  autoReply: boolean
  autoReplyTemplate: string
  processResumes: boolean
  aiScreening: boolean
  notificationEmails: string[]
  delayBeforeResponse: number // in hours
  isActive: boolean
}

export interface EmailTemplate {
  id: string
  companyId: string
  name: string
  type: 'application_received' | 'resume_reviewed' | 'interview_scheduled' | 'rejection' | 'offer'
  subject: string
  body: string
  variables: string[] // e.g., ['candidate_name', 'job_title', 'company_name']
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface EmailIntegration {
  id: string
  companyId: string
  type: 'gmail' | 'outlook' | 'custom_smtp'
  credentials: {
    clientId?: string
    clientSecret?: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: string
  }
  settings: {
    syncInterval: number // in minutes
    maxEmailsPerSync: number
    archiveProcessed: boolean
    markAsRead: boolean
  }
  status: 'active' | 'inactive' | 'error'
  lastSync?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface EmailStats {
  totalEmails: number
  processedEmails: number
  pendingEmails: number
  errorEmails: number
  lastProcessed?: string
  averageProcessingTime: number // in seconds
}

export interface EmailCreateData {
  email: string
  provider: 'gmail' | 'outlook' | 'custom'
}

export interface EmailUpdateData extends Partial<EmailCreateData> {
  status?: 'connected' | 'disconnected' | 'error'
  isActive?: boolean
}

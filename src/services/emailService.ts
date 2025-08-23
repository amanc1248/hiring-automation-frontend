import type { 
  EmailAccount, 
  EmailCreateData, 
  EmailUpdateData, 
  EmailStats 
} from '../types/email'
import { gmailApiService, type GmailConfig } from './gmailApiService'

// Mock email data
const mockEmailAccounts: EmailAccount[] = [
  {
    id: 'email-1',
    companyId: 'comp-1',
    email: 'jobs@techcorp.com',
    provider: 'gmail',
    status: 'connected',
    lastSync: '2024-01-15T10:00:00Z',
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'email-2',
    companyId: 'comp-1',
    email: 'careers@techcorp.com',
    provider: 'gmail',
    status: 'connected',
    lastSync: '2024-01-15T09:30:00Z',
    isActive: true,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-15T09:30:00Z'
  }
]



const mockEmailStats: EmailStats = {
  totalEmails: 156,
  processedEmails: 142,
  pendingEmails: 14,
  errorEmails: 0,
  lastProcessed: '2024-01-15T10:00:00Z',
  averageProcessingTime: 2.5
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Transform Gmail config to EmailAccount format
const transformGmailConfigToEmailAccount = (config: GmailConfig): EmailAccount => ({
  id: config.id,
  companyId: '', // Will be filled by the calling function
  email: config.gmail_address,
  provider: 'gmail',
  status: config.is_active ? 'connected' : 'disconnected',
  lastSync: config.last_sync || undefined,
  isActive: config.is_active,
  createdAt: config.created_at,
  updatedAt: config.updated_at
})

export const emailService = {
  // Email Accounts
  async getEmailAccounts(companyId: string): Promise<EmailAccount[]> {
    try {
      // Get real Gmail configurations from backend
      const gmailConfigs = await gmailApiService.getGmailConfigs()
      
      // Transform to EmailAccount format
      const emailAccounts = gmailConfigs.map(config => ({
        ...transformGmailConfigToEmailAccount(config),
        companyId
      }))
      
      return emailAccounts
    } catch (error) {
      console.error('Failed to fetch Gmail configurations:', error)
      // Fallback to mock data for development
      await delay(500)
      return mockEmailAccounts.filter(account => account.companyId === companyId)
    }
  },

  async getEmailAccount(accountId: string): Promise<EmailAccount | null> {
    await delay(300)
    return mockEmailAccounts.find(account => account.id === accountId) || null
  },

  async createEmailAccount(data: EmailCreateData, companyId: string): Promise<EmailAccount> {
    await delay(800)
    const newAccount: EmailAccount = {
      id: `email-${Date.now()}`,
      companyId,
      email: data.email,
      provider: data.provider,
      status: 'disconnected',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockEmailAccounts.push(newAccount)
    return newAccount
  },

  async updateEmailAccount(accountId: string, updates: EmailUpdateData): Promise<EmailAccount | null> {
    await delay(600)
    const accountIndex = mockEmailAccounts.findIndex(account => account.id === accountId)
    if (accountIndex === -1) return null

    const updatedAccount = {
      ...mockEmailAccounts[accountIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    mockEmailAccounts[accountIndex] = updatedAccount
    return updatedAccount
  },

  async deleteEmailAccount(accountId: string): Promise<boolean> {
    await delay(400)
    const accountIndex = mockEmailAccounts.findIndex(account => account.id === accountId)
    if (accountIndex === -1) return false

    mockEmailAccounts.splice(accountIndex, 1)
    return true
  },



  // Email Stats
  async getEmailStats(companyId: string): Promise<EmailStats> {
    await delay(300)
    return mockEmailStats
  },

  // Gmail OAuth (Real)
  async connectGmailAccount(): Promise<{ success: boolean; message: string; email?: string }> {
    try {
      const result = await gmailApiService.connectGmailAccount()
      
      if (result.success && result.email) {
        return {
          success: true,
          message: `Gmail account ${result.email} connected successfully! You can now monitor job application emails.`,
          email: result.email
        }
      } else {
        return {
          success: false,
          message: result.error || 'Failed to connect Gmail account'
        }
      }
    } catch (error) {
      console.error('Gmail OAuth error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect Gmail account'
      }
    }
  },

  async disconnectEmailAccount(accountId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await gmailApiService.deleteGmailConfig(accountId)
      return {
        success: result.success,
        message: result.message
      }
    } catch (error) {
      console.error('Failed to disconnect Gmail account:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to disconnect email account'
      }
    }
  },

  // Test Email Connection
  async testEmailConnection(accountId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await gmailApiService.testGmailConfig(accountId)
      return {
        success: result.success && result.connected,
        message: result.message
      }
    } catch (error) {
      console.error('Failed to test Gmail connection:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to test email connection'
      }
    }
  }
}

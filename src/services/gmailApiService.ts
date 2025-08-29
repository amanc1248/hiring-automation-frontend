import { apiClient } from './apiClient'
import { API_CONFIG } from '../config/api'

export interface GmailConfig {
  id: string
  gmail_address: string
  display_name: string
  is_active: boolean
  last_sync?: string
  sync_frequency_minutes: number
  granted_scopes: string[]
  created_at: string
  updated_at: string
}

export interface GmailOAuthResponse {
  success: boolean
  oauth_url: string
  message: string
}

export interface GmailTestResponse {
  success: boolean
  connected: boolean
  gmail_address: string
  message: string
}

export interface GmailActionResponse {
  success: boolean
  message: string
  is_active?: boolean
}

class GmailApiService {
  /**
   * Generate Gmail OAuth URL for admin to connect Gmail account
   */
  async getOAuthUrl(): Promise<GmailOAuthResponse> {
    const response = await apiClient.get<GmailOAuthResponse>('/api/gmail/oauth/url')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate OAuth URL')
    }
    
    return response.data
  }

  /**
   * Get all Gmail configurations for the current company
   */
  async getGmailConfigs(): Promise<GmailConfig[]> {
    const response = await apiClient.get<GmailConfig[]>('/api/gmail/configs')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch Gmail configurations')
    }
    
    return response.data
  }

  /**
   * Test Gmail configuration connection
   */
  async testGmailConfig(configId: string): Promise<GmailTestResponse> {
    const response = await apiClient.post<GmailTestResponse>(`/api/gmail/configs/${configId}/test`)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to test Gmail configuration')
    }
    
    return response.data
  }

  /**
   * Delete Gmail configuration
   */
  async deleteGmailConfig(configId: string): Promise<GmailActionResponse> {
    const response = await apiClient.delete<GmailActionResponse>(`/api/gmail/configs/${configId}`)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to delete Gmail configuration')
    }
    
    return response.data
  }

  /**
   * Toggle Gmail configuration active status
   */
  async toggleGmailConfig(configId: string): Promise<GmailActionResponse> {
    const response = await apiClient.post<GmailActionResponse>(`/api/gmail/configs/${configId}/toggle`)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to toggle Gmail configuration')
    }
    
    return response.data
  }

  /**
   * Open Gmail OAuth popup and handle the flow
   */
  async connectGmailAccount(): Promise<{ success: boolean; email?: string; error?: string }> {
    try {
      // Get OAuth URL from backend
      const oauthResponse = await this.getOAuthUrl()
      
      return new Promise((resolve) => {
        // Open OAuth popup
        const popup = window.open(
          oauthResponse.oauth_url,
          'gmail-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        )

        if (!popup) {
          resolve({ success: false, error: 'Popup blocked. Please allow popups for this site.' })
          return
        }

        // Initialize timeout and interval IDs
        let timeoutId: ReturnType<typeof setTimeout>
        let checkClosedInterval: ReturnType<typeof setInterval>

        // Listen for messages from the popup
        const messageHandler = (event: MessageEvent) => {
          console.log('🔍 [Gmail OAuth] Received message:', event.origin, event.data)
          
          // Only accept messages from our own origin or the backend
          if (event.origin !== window.location.origin && 
              !event.origin.includes('localhost:8000') &&
              !event.origin.includes('hr-automation-backend-production')) {
            console.log('🔍 [Gmail OAuth] Origin not allowed:', event.origin)
            return
          }

          const { type, success, email, error } = event.data
          console.log('🔍 [Gmail OAuth] Message type:', type, 'Success:', success, 'Email:', email, 'Error:', error)

          if (type === 'gmail-oauth-result') {
            // Clean up
            window.removeEventListener('message', messageHandler)
            if (popup && !popup.closed) {
              popup.close()
            }
            clearTimeout(timeoutId)
            clearInterval(checkClosedInterval)

            if (success && email) {
              resolve({ success: true, email })
            } else if (error) {
              resolve({ success: false, error: this.getErrorMessage(error) })
            } else {
              resolve({ success: false, error: 'OAuth flow was cancelled or incomplete' })
            }
          }
        }

        window.addEventListener('message', messageHandler)

        // Fallback: Check if popup was closed manually (user cancelled)
        checkClosedInterval = setInterval(() => {
          try {
            if (popup.closed) {
              console.log('🔍 [Gmail OAuth] Popup closed by user')
              clearInterval(checkClosedInterval)
              window.removeEventListener('message', messageHandler)
              clearTimeout(timeoutId)
              resolve({ success: false, error: 'OAuth flow was cancelled by user' })
            }
          } catch (e) {
            // Cross-origin error, popup might be on different domain
            // This is expected during OAuth flow
            console.log('🔍 [Gmail OAuth] Cross-origin check (expected):', e)
          }
        }, 1000)

        // Timeout after 5 minutes
        timeoutId = setTimeout(() => {
          if (popup && !popup.closed) {
            popup.close()
          }
          clearInterval(checkClosedInterval)
          window.removeEventListener('message', messageHandler)
          resolve({ success: false, error: 'OAuth flow timed out' })
        }, 5 * 60 * 1000)
      })
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to initiate OAuth flow' 
      }
    }
  }

  /**
   * Handle OAuth callback redirect (for non-popup flow)
   */
  handleOAuthCallback(): { success: boolean; email?: string; error?: string } {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const email = urlParams.get('email')
    const error = urlParams.get('error')

    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname)

    if (success === 'true' && email) {
      return { success: true, email }
    } else if (error) {
      return { success: false, error: this.getErrorMessage(error) }
    }

    return { success: false }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'access_denied': 'You denied access to Gmail. Please try again and grant the necessary permissions.',
      'callback_failed': 'Failed to complete Gmail connection. Please try again.',
      'invalid_request': 'Invalid OAuth request. Please contact support if this persists.',
      'server_error': 'Server error occurred. Please try again later.'
    }

    return errorMessages[error] || `OAuth error: ${error}`
  }
}

export const gmailApiService = new GmailApiService()
export default gmailApiService

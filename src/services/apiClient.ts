import { API_CONFIG, tokenStorage, type ApiResponse, type ApiError } from '../config/api'
import { authService } from './authService'

class ApiClient {
  private baseURL: string
  private isRefreshing = false
  private failedQueue: Array<{ resolve: Function; reject: Function }> = []

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Proactively refresh token if it's expiring soon (but not for refresh endpoint)
    if (!endpoint.includes('/auth/refresh')) {
      await authService.refreshTokenIfNeeded()
    }
    
    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    }

    // Add auth token if available
    const token = tokenStorage.getAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      // Handle different response types
      let data: any = null
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        // Handle 401 Unauthorized - token might be expired
        if (response.status === 401) {
          // Try to refresh the token
          const refreshResult = await this.handleTokenRefresh()
          
          if (refreshResult) {
            // Retry the original request with new token
            return this.request<T>(endpoint, options)
          } else {
            // Refresh failed, redirect to login
            tokenStorage.clearTokens()
            window.location.href = '/auth'
            return {
              success: false,
              error: 'Authentication failed'
            }
          }
        }

        const error: ApiError = {
          detail: data.detail || data.message || 'An error occurred',
          status_code: response.status
        }

        return {
          success: false,
          error: error.detail
        }
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      }
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Handle token refresh
  private async handleTokenRefresh(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      // Wait for the current refresh to complete
      return new Promise((resolve) => {
        this.failedQueue.push({ resolve, reject: () => resolve(false) })
      })
    }

    this.isRefreshing = true

    try {
      const refreshResult = await authService.refreshToken()
      
      if (refreshResult.success) {
        // Resolve all queued requests
        this.failedQueue.forEach(({ resolve }) => resolve(true))
        this.failedQueue = []
        return true
      } else {
        // Resolve all queued requests with failure
        this.failedQueue.forEach(({ resolve }) => resolve(false))
        this.failedQueue = []
        return false
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Resolve all queued requests with failure
      this.failedQueue.forEach(({ resolve }) => resolve(false))
      this.failedQueue = []
      return false
    } finally {
      this.isRefreshing = false
    }
  }

  // File upload method
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const token = tokenStorage.getAccessToken()
    const headers: Record<string, string> = {}
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient

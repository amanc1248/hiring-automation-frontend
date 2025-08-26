import { apiClient } from './apiClient'
import { API_CONFIG, tokenStorage } from '../config/api'
import type { LoginCredentials, RegisterData, User, Company } from '../types/auth'

// Backend response types
interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: BackendUser
  company: BackendCompany
}

interface RegisterResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: BackendUser
  company: BackendCompany
  message: string
}

interface BackendUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role_name: string
  role_display_name: string
  company_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface BackendCompany {
  id: string
  name: string
  size: string
  industry: string
  website?: string
  description?: string
  created_at: string
  updated_at: string
}

// Transform backend user to frontend user
const transformUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  email: backendUser.email,
  firstName: backendUser.first_name,
  lastName: backendUser.last_name,
  role: backendUser.role_name as User['role'],
  companyId: backendUser.company_id
})

// Transform backend company to frontend company
const transformCompany = (backendCompany: BackendCompany): Company => ({
  id: backendCompany.id,
  name: backendCompany.name,
  size: backendCompany.size as Company['size'],
  industry: backendCompany.industry,
  website: backendCompany.website,
  description: backendCompany.description,
  createdAt: backendCompany.created_at
})

// Flag to prevent recursive refresh calls
let isRefreshing = false

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; company?: Company; error?: string }> {
    const response = await apiClient.post<LoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, credentials)
    
    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Login failed'
      }
    }

    // Store tokens
    tokenStorage.setTokens(response.data.access_token, response.data.refresh_token)
    
    // Transform and return user data
    const user = transformUser(response.data.user)
    const company = transformCompany(response.data.company)

    return {
      success: true,
      user,
      company
    }
  },

  async register(data: RegisterData): Promise<{ success: boolean; user?: User; company?: Company; error?: string }> {
    // Transform frontend data to backend format
    const backendData = {
      company: {
        name: data.companyName,
        size: data.companySize,
        industry: data.industry,
        website: data.website || null
      },
      admin_user: {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password
      }
    }

    const response = await apiClient.post<RegisterResponse>(API_CONFIG.ENDPOINTS.REGISTER, backendData)
    
    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Registration failed'
      }
    }

    // Store tokens
    tokenStorage.setTokens(response.data.access_token, response.data.refresh_token)
    
    // Transform and return user data
    const user = transformUser(response.data.user)
    const company = transformCompany(response.data.company)

    return {
      success: true,
      user,
      company
    }
  },

  async getCurrentUser(): Promise<{ success: boolean; user?: User; company?: Company; error?: string }> {
    const response = await apiClient.get<BackendUser>(API_CONFIG.ENDPOINTS.ME)
    
    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Failed to get user info'
      }
    }

    const user = transformUser(response.data)
    
    // For now, try to get company info from localStorage (stored during login)
    // TODO: Implement proper company endpoint later
    const storedAuth = localStorage.getItem('hireflow_auth')
    let company: Company | undefined
    
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth)
        company = authData.company
      } catch (error) {
        console.warn('Failed to parse stored auth data:', error)
      }
    }
    
    // If no stored company data, create a minimal company object
    if (!company) {
      company = {
        id: response.data.company_id,
        name: 'Unknown Company', // We'll get this properly when company endpoint is implemented
        size: 'medium' as const,
        industry: 'Technology',
        createdAt: new Date().toISOString()
      }
    }

    return {
      success: true,
      user,
      company
    }
  },

  async refreshToken(): Promise<{ success: boolean; error?: string }> {
    // Prevent recursive refresh calls
    if (isRefreshing) {
      return {
        success: false,
        error: 'Token refresh already in progress'
      }
    }

    const refreshToken = tokenStorage.getRefreshToken()
    
    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token available'
      }
    }

    isRefreshing = true

    try {
      // Make direct fetch call to avoid circular dependency with apiClient
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.access_token && data.refresh_token) {
        // Update tokens
        tokenStorage.setTokens(data.access_token, data.refresh_token)
        return { success: true }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      tokenStorage.clearTokens()
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      }
    } finally {
      isRefreshing = false
    }
  },

  logout(): void {
    tokenStorage.clearTokens()
  },

  isAuthenticated(): boolean {
    return !!tokenStorage.getAccessToken()
  },

  // Check if access token is about to expire (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const accessToken = tokenStorage.getAccessToken()
    if (!accessToken) return false

    try {
      // Decode JWT to check expiration
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const expTime = payload.exp * 1000 // Convert to milliseconds
      const currentTime = Date.now()
      const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds
      
      return (expTime - currentTime) < fiveMinutes
    } catch (error) {
      console.error('Error checking token expiration:', error)
      return false
    }
  },

  // Proactively refresh token if it's expiring soon
  async refreshTokenIfNeeded(): Promise<boolean> {
    if (this.isTokenExpiringSoon()) {
      console.log('🔄 Token expiring soon, refreshing...')
      const result = await this.refreshToken()
      return result.success
    }
    return true
  }
}

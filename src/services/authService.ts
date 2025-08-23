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
    const refreshToken = tokenStorage.getRefreshToken()
    
    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token available'
      }
    }

    const response = await apiClient.post<{ access_token: string; refresh_token: string }>(
      API_CONFIG.ENDPOINTS.REFRESH,
      { refresh_token: refreshToken }
    )
    
    if (!response.success || !response.data) {
      tokenStorage.clearTokens()
      return {
        success: false,
        error: response.error || 'Token refresh failed'
      }
    }

    // Update tokens
    tokenStorage.setTokens(response.data.access_token, response.data.refresh_token)
    
    return {
      success: true
    }
  },

  logout(): void {
    tokenStorage.clearTokens()
  },

  isAuthenticated(): boolean {
    return !!tokenStorage.getAccessToken()
  }
}

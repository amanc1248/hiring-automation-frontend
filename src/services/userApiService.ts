import { apiClient } from './apiClient'
import { API_CONFIG } from '../config/api'
import type { User, UserRole, UserCreateData, UserUpdateData } from '../types/user'

interface UserFilters {
  search?: string
  role_filter?: string
  status_filter?: 'active' | 'inactive' | 'pending_first_login'
  skip?: number
  limit?: number
}

interface UserListResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Backend API response types
interface BackendUser {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  phone?: string
  is_active: boolean
  last_login?: string
  first_login_at?: string
  must_change_password: boolean
  preferences: Record<string, any>
  company_id: string
  role_id: string
  role_name: string
  role_display_name: string
  created_by?: string
  created_at: string
  updated_at: string
  temporary_password?: string
}

interface BackendUserRole {
  id: string
  name: string
  display_name: string
  description: string
  permissions: string[]
  approval_types: string[]
  is_system_role: boolean
}

interface UserCreateRequest {
  email: string
  first_name: string
  last_name: string
  phone?: string
  role_id: string
  password?: string
}

interface UserUpdateRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  role_id?: string
  is_active?: boolean
}

// Transform backend user to frontend user
const transformUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  email: backendUser.email,
  firstName: backendUser.first_name,
  lastName: backendUser.last_name,
  role: {
    id: backendUser.role_id,
    name: backendUser.role_name,
    displayName: backendUser.role_display_name,
    description: '', // Will be filled from roles API if needed
    permissions: {
      canViewJobs: true,
      canEditJobs: backendUser.role_name === 'admin',
      canPostJobs: ['admin', 'hr_manager'].includes(backendUser.role_name),
      canReviewCandidates: true,
      canManageUsers: backendUser.role_name === 'admin',
      canViewAnalytics: ['admin', 'hr_manager'].includes(backendUser.role_name),
      canManageWorkflows: backendUser.role_name === 'admin'
    },
    approvalTypes: [],
    isDefault: false,
    createdAt: backendUser.created_at
  },
  companyId: backendUser.company_id,
  isActive: backendUser.is_active,
  invitedBy: backendUser.created_by || 'system',
  invitedAt: backendUser.created_at,
  registeredAt: backendUser.first_login_at || backendUser.created_at,
  lastLoginAt: backendUser.last_login || null,
  createdAt: backendUser.created_at,
  updatedAt: backendUser.updated_at,
  // Additional fields for user management
  firstLoginAt: backendUser.first_login_at,
  mustChangePassword: backendUser.must_change_password,
  temporaryPassword: backendUser.temporary_password
})

// Transform backend role to frontend role
const transformRole = (backendRole: BackendUserRole): UserRole => ({
  id: backendRole.id,
  name: backendRole.name,
  displayName: backendRole.display_name,
  description: backendRole.description,
  permissions: {
    canViewJobs: true,
    canEditJobs: backendRole.name === 'admin',
    canPostJobs: ['admin', 'hr_manager'].includes(backendRole.name),
    canReviewCandidates: true,
    canManageUsers: backendRole.name === 'admin',
    canViewAnalytics: ['admin', 'hr_manager'].includes(backendRole.name),
    canManageWorkflows: backendRole.name === 'admin'
  },
  approvalTypes: backendRole.approval_types,
  isDefault: backendRole.is_system_role,
  createdAt: new Date().toISOString()
})

export const userApiService = {
  // Get all users in the company
  async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.role_filter) params.append('role_filter', filters.role_filter)
    if (filters.status_filter) params.append('status_filter', filters.status_filter)
    if (filters.skip) params.append('skip', filters.skip.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    
    const queryString = params.toString()
    const endpoint = `${API_CONFIG.ENDPOINTS.USERS}${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get<BackendUser[]>(endpoint)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch users')
    }
    
    const users = response.data.map(transformUser)
    
    // Calculate pagination (since backend returns array, we'll handle pagination on frontend for now)
    const page = Math.floor((filters.skip || 0) / (filters.limit || 10)) + 1
    const limit = filters.limit || 10
    const total = users.length
    const totalPages = Math.ceil(total / limit)
    
    return {
      users,
      total,
      page,
      limit,
      totalPages
    }
  },

  // Get a single user
  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get<BackendUser>(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch user')
    }
    
    return transformUser(response.data)
  },

  // Create a new user
  async createUser(userData: UserCreateData): Promise<User> {
    const createRequest: UserCreateRequest = {
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      role_id: userData.roleId,
      password: userData.password // Optional - will be auto-generated if not provided
    }
    
    const response = await apiClient.post<BackendUser>(API_CONFIG.ENDPOINTS.USERS, createRequest)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create user')
    }
    
    return transformUser(response.data)
  },

  // Update a user
  async updateUser(userId: string, userData: UserUpdateData): Promise<User> {
    const updateRequest: UserUpdateRequest = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      role_id: userData.roleId,
      is_active: userData.isActive
    }
    
    const response = await apiClient.put<BackendUser>(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`, updateRequest)
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update user')
    }
    
    return transformUser(response.data)
  },

  // Reset user password
  async resetUserPassword(userId: string): Promise<{ message: string; temporaryPassword: string }> {
    const response = await apiClient.post<{ message: string; temporary_password: string }>(
      `${API_CONFIG.ENDPOINTS.USERS}/${userId}/reset-password`
    )
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to reset password')
    }
    
    return {
      message: response.data.message,
      temporaryPassword: response.data.temporary_password
    }
  },

  // Activate user
  async activateUser(userId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${API_CONFIG.ENDPOINTS.USERS}/${userId}/activate`
    )
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to activate user')
    }
    
    return response.data
  },

  // Deactivate user
  async deactivateUser(userId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${API_CONFIG.ENDPOINTS.USERS}/${userId}/deactivate`
    )
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to deactivate user')
    }
    
    return response.data
  },

  // Get available roles
  async getRoles(): Promise<UserRole[]> {
    const response = await apiClient.get<BackendUserRole[]>('/api/auth/roles')
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch roles')
    }
    
    return response.data.map(transformRole)
  }
}

export default userApiService

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://hr-automation-backend-production-1d70.up.railway.app',
  ENDPOINTS: {
    // Auth endpoints
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    
    // Company endpoints
    COMPANIES: '/api/companies',
    
    // User endpoints
    USERS: '/api/users',
    
    // Job endpoints
    JOBS: '/api/jobs',
    
    // Candidate endpoints
    CANDIDATES: '/api/candidates',
    
    // Application endpoints
    APPLICATIONS: '/api/applications',
    
    // Interview endpoints
    INTERVIEWS: '/api/interviews',
    
    // Workflow endpoints
    WORKFLOWS: '/api/workflows',
    WORKFLOW_TEMPLATES: '/api/workflow-templates',
    WORKFLOW_RUNS: '/api/workflow-runs'
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  detail: string
  status_code: number
}

// Token storage helpers
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token')
  },
  
  setAccessToken: (token: string): void => {
    localStorage.setItem('access_token', token)
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token')
  },
  
  setRefreshToken: (token: string): void => {
    localStorage.setItem('refresh_token', token)
  },
  
  clearTokens: (): void => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
  
  setTokens: (accessToken: string, refreshToken: string): void => {
    tokenStorage.setAccessToken(accessToken)
    tokenStorage.setRefreshToken(refreshToken)
  }
}

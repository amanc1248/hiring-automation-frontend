// API Configuration
// Debug: Log environment variables
console.log('🔍 Environment Variables Debug:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('MODE:', import.meta.env.MODE);

// Determine the base URL based on environment
const getBaseUrl = () => {
  // Check localStorage override first (for manual switching)
  if (typeof window !== 'undefined') {
    const forceLocal = localStorage.getItem('FORCE_LOCAL_API');
    if (forceLocal === 'true') {
      return 'http://localhost:8000';
    }
  }
  
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we're running locally (development server)
  const isLocalDev = import.meta.env.DEV || 
                     (typeof window !== 'undefined' && (
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1'
                     ));
  
  if (isLocalDev) {
    return 'http://localhost:8000';
  }
  
  // In production, use HTTPS backend
  return 'https://hr-automation-backend-production-1d70.up.railway.app';
};

// Force HTTPS for production backend URLs
const forceHttps = (url: string): string => {
  if (url.includes('hr-automation-backend-production-1d70.up.railway.app')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

const baseUrl = getBaseUrl();
const secureBaseUrl = forceHttps(baseUrl);
console.log('🚀 Final BASE_URL:', secureBaseUrl);

// Add environment switcher to global scope for debugging
if (typeof window !== 'undefined') {
  (window as any).switchToLocal = () => {
    console.log('🔄 Switching to local backend...');
    localStorage.setItem('FORCE_LOCAL_API', 'true');
    window.location.reload();
  };
  
  (window as any).switchToProduction = () => {
    console.log('🔄 Switching to production backend...');
    localStorage.removeItem('FORCE_LOCAL_API');
    window.location.reload();
  };
  
  (window as any).getCurrentApiUrl = () => {
    return secureBaseUrl;
  };
}

export const API_CONFIG = {
  BASE_URL: secureBaseUrl,
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

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import type { AuthState, LoginCredentials, RegisterData } from '../types/auth'
import { authService } from '../services/authService'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    company: null,
    isAuthenticated: false,
    isLoading: true
  })

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const result = await authService.getCurrentUser()
        if (result.success && result.user && result.company) {
          setAuthState({
            user: result.user,
            company: result.company,
            isAuthenticated: true,
            isLoading: false
          })
        } else {
          // Token might be invalid, clear it
          authService.logout()
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    const result = await authService.login(credentials)
    
    if (result.success && result.user && result.company) {
      // Store auth data in localStorage for session persistence
      localStorage.setItem('hireflow_auth', JSON.stringify({
        user: result.user,
        company: result.company
      }))
      
      setAuthState({
        user: result.user,
        company: result.company,
        isAuthenticated: true,
        isLoading: false
      })
      
      return { success: true }
    } else {
      return { success: false, error: result.error || 'Login failed' }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    // Client-side validation
    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match' }
    }

    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' }
    }

    const result = await authService.register(data)
    
    if (result.success && result.user && result.company) {
      // Store auth data in localStorage for session persistence
      localStorage.setItem('hireflow_auth', JSON.stringify({
        user: result.user,
        company: result.company
      }))
      
      setAuthState({
        user: result.user,
        company: result.company,
        isAuthenticated: true,
        isLoading: false
      })
      
      return { success: true }
    } else {
      return { success: false, error: result.error || 'Registration failed' }
    }
  }

  const logout = () => {
    authService.logout()
    localStorage.removeItem('hireflow_auth')
    setAuthState({
      user: null,
      company: null,
      isAuthenticated: false,
      isLoading: false
    })
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

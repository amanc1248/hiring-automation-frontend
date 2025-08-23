import type { User, UserRole, UserInvitation, UsersResponse, UserCreateData, UserUpdateData, RoleCreateData } from '../types/user'

// Local type definitions to avoid circular dependencies
interface ApprovalRequest {
  id: string
  candidateId: string
  jobId: string
  workflowStepId: string
  stepName: string
  stepType: string
  requestedBy: string
  requestedFor: string
  status: 'pending' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  context: {
    candidateName: string
    candidateEmail: string
    jobTitle: string
    companyName: string
    currentStep: string
    previousStepResults: any
    notes: string
    attachments?: string[]
  }
  createdAt: string
  respondedAt?: string
  response?: {
    approved: boolean
    feedback: string
    score?: number
    nextSteps?: string
    rejectionReason?: string
  }
}

// Mock data for predefined roles
export const DEFAULT_ROLES: UserRole[] = [
  {
    id: 'admin',
    name: 'admin',
    displayName: 'Admin',
    description: 'Full system access and user management',
    permissions: {
      canViewJobs: true,
      canEditJobs: true,
      canPostJobs: true,
      canReviewCandidates: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canManageWorkflows: true
    },
    approvalTypes: ['task_review', 'interview_scheduling', 'offer_approval', 'workflow_creation'],
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tech_lead',
    name: 'tech_lead',
    displayName: 'Tech Lead',
    description: 'Technical leadership and candidate review',
    permissions: {
      canViewJobs: true,
      canEditJobs: false,
      canPostJobs: false,
      canReviewCandidates: true,
      canManageUsers: false,
      canViewAnalytics: false,
      canManageWorkflows: false
    },
    approvalTypes: ['task_review', 'interview_scheduling'],
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'senior_engineer',
    name: 'senior_engineer',
    displayName: 'Senior Engineer',
    description: 'Senior developer with review responsibilities',
    permissions: {
      canViewJobs: true,
      canEditJobs: false,
      canPostJobs: false,
      canReviewCandidates: true,
      canManageUsers: false,
      canViewAnalytics: false,
      canManageWorkflows: false
    },
    approvalTypes: ['task_review'],
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'project_manager',
    name: 'project_manager',
    displayName: 'Project Manager',
    description: 'Project oversight and candidate evaluation',
    permissions: {
      canViewJobs: true,
      canEditJobs: false,
      canPostJobs: false,
      canReviewCandidates: true,
      canManageUsers: false,
      canViewAnalytics: false,
      canManageWorkflows: false
    },
    approvalTypes: ['task_review', 'interview_scheduling'],
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'hr_manager',
    name: 'hr_manager',
    displayName: 'HR Manager',
    description: 'Human resources and hiring decisions',
    permissions: {
      canViewJobs: true,
      canEditJobs: true,
      canPostJobs: true,
      canReviewCandidates: true,
      canManageUsers: false,
      canViewAnalytics: false,
      canManageWorkflows: false
    },
    approvalTypes: ['interview_scheduling', 'offer_approval'],
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z'
  }
]

// Mock users data - will be replaced with real API calls
const mockUsers: User[] = []

// Mock invitations data - will be replaced with real API calls
const mockInvitations: UserInvitation[] = []

// Mock approval requests data
const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: 'apr-1',
    candidateId: 'candidate-1',
    jobId: 'job-1',
    workflowStepId: 'step-1',
    stepName: 'Task Review',
    stepType: 'task_review',
    requestedBy: 'system',
    requestedFor: 'user-2', // Alex Chen (Tech Lead)
    status: 'pending',
    priority: 'medium',
    context: {
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@email.com',
      jobTitle: 'Senior Backend Engineer',
      companyName: 'TechCorp',
      currentStep: 'Task Review',
      previousStepResults: {
        taskSubmitted: true,
        taskType: 'API Design Challenge',
        submittedAt: '2024-01-15T14:00:00Z'
      },
      notes: 'Please review the API design challenge submission and provide feedback.',
      attachments: ['task_submission.pdf', 'code_repository.zip']
    },
    createdAt: '2024-01-15T16:00:00Z'
  },
  {
    id: 'apr-2',
    candidateId: 'candidate-2',
    jobId: 'job-1',
    workflowStepId: 'step-2',
    stepName: 'Interview Scheduling',
    stepType: 'interview_scheduling',
    requestedBy: 'system',
    requestedFor: 'user-4', // Emma Wilson (Project Manager)
    status: 'pending',
    priority: 'high',
    context: {
      candidateName: 'Jane Smith',
      candidateEmail: 'jane.smith@email.com',
      jobTitle: 'Senior Backend Engineer',
      companyName: 'TechCorp',
      currentStep: 'Interview Scheduling',
      previousStepResults: {
        taskApproved: true,
        taskScore: 85,
        approvedBy: 'user-2',
        approvedAt: '2024-01-16T10:00:00Z'
      },
      notes: 'Task approved with high score. Schedule technical interview.',
      attachments: ['task_review_feedback.pdf']
    },
    createdAt: '2024-01-16T11:00:00Z'
  }
]

class UserService {
  // Get all users for a company
  async getUsers(companyId: string, filters: any): Promise<UsersResponse> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filteredUsers = [...mockUsers]
    
    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      )
    }
    
    if (filters.role) {
      filteredUsers = filteredUsers.filter(user => user.role.id === filters.role)
    }
    
    if (filters.status) {
      filteredUsers = filteredUsers.filter(user => 
        filters.status === 'active' ? user.isActive : !user.isActive
      )
    }
    
    const total = filteredUsers.length
    const startIndex = (filters.page - 1) * filters.limit
    const endIndex = startIndex + filters.limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
    
    return {
      users: paginatedUsers,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit)
    }
  }

  // Get a single user
  async getUser(userId: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockUsers.find(user => user.id === userId) || null
  }

  // Create a new user
  async createUser(userData: UserCreateData, companyId: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const role = DEFAULT_ROLES.find(r => r.id === userData.roleId)
    if (!role) throw new Error('Invalid role')
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role,
      companyId,
      isActive: true,
      invitedBy: 'system',
      invitedAt: new Date().toISOString(),
      registeredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockUsers.push(newUser)
    return newUser
  }

  // Update a user
  async updateUser(userId: string, userData: UserUpdateData): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const userIndex = mockUsers.findIndex(user => user.id === userId)
    if (userIndex === -1) return null
    
    const updatedUser = { ...mockUsers[userIndex], ...userData, updatedAt: new Date().toISOString() }
    mockUsers[userIndex] = updatedUser
    
    return updatedUser
  }

  // Delete a user
  async deleteUser(userId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const userIndex = mockUsers.findIndex(user => user.id === userId)
    if (userIndex === -1) return false
    
    mockUsers.splice(userIndex, 1)
    return true
  }

  // Get all roles
  async getRoles(): Promise<UserRole[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return DEFAULT_ROLES
  }

  // Get invitations
  async getInvitations(companyId: string): Promise<UserInvitation[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockInvitations.filter(inv => inv.companyId === companyId)
  }

  // Send invitation
  async sendInvitation(invitationData: { email: string; roleId: string }, companyId: string, invitedBy: string): Promise<UserInvitation> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newInvitation: UserInvitation = {
      id: `inv-${Date.now()}`,
      email: invitationData.email,
      roleId: invitationData.roleId,
      invitedBy,
      companyId,
      status: 'pending',
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }
    
    mockInvitations.push(newInvitation)
    return newInvitation
  }

  // Get approval requests for a user
  async getApprovalRequests(userId: string): Promise<ApprovalRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockApprovalRequests.filter(req => req.requestedFor === userId)
  }

  // Respond to approval request
  async respondToApproval(approvalId: string, response: { approved: boolean; feedback: string; score?: number; nextSteps?: string; rejectionReason?: string }): Promise<ApprovalRequest | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const requestIndex = mockApprovalRequests.findIndex(req => req.id === approvalId)
    if (requestIndex === -1) return null
    
    const updatedRequest: ApprovalRequest = {
      ...mockApprovalRequests[requestIndex],
      status: response.approved ? 'approved' : 'rejected',
      respondedAt: new Date().toISOString(),
      response
    }
    
    mockApprovalRequests[requestIndex] = updatedRequest
    return updatedRequest
  }
}

export const userService = new UserService()

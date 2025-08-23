export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  companyId: string
  isActive: boolean
  invitedBy?: string
  invitedAt: string
  registeredAt: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  
  // User management fields
  firstLoginAt?: string
  mustChangePassword?: boolean
  temporaryPassword?: string
}

export interface UserRole {
  id: string
  name: string
  displayName: string
  description: string
  permissions: UserPermissions
  approvalTypes: string[]
  isDefault: boolean
  createdAt: string
}

export interface UserPermissions {
  canViewJobs: boolean
  canEditJobs: boolean
  canPostJobs: boolean
  canReviewCandidates: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
  canManageWorkflows: boolean
}

export interface UserInvitation {
  id: string
  email: string
  roleId: string
  invitedBy: string
  companyId: string
  status: 'pending' | 'accepted' | 'expired'
  invitedAt: string
  expiresAt: string
  acceptedAt?: string
}

export interface ApprovalRequest {
  id: string
  candidateId: string
  jobId: string
  workflowStepId: string
  stepName: string
  stepType: string
  requestedBy: string // system
  requestedFor: string // user ID who needs to approve
  status: 'pending' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  context: ApprovalContext
  createdAt: string
  respondedAt?: string
  response?: ApprovalResponse
}

export interface ApprovalContext {
  candidateName: string
  candidateEmail: string
  jobTitle: string
  companyName: string
  currentStep: string
  previousStepResults: any
  notes: string
  attachments?: string[]
}

export interface ApprovalResponse {
  approved: boolean
  feedback: string
  score?: number
  nextSteps?: string
  rejectionReason?: string
}

export interface UserFilters {
  search?: string
  role?: string
  status?: 'active' | 'inactive'
  page: number
  limit: number
}

export interface UsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UserCreateData {
  email: string
  firstName: string
  lastName: string
  phone?: string
  roleId: string
  password?: string
}

export interface UserUpdateData {
  firstName?: string
  lastName?: string
  roleId?: string
  isActive?: boolean
}

export interface RoleCreateData {
  name: string
  displayName: string
  description: string
  permissions: UserPermissions
  approvalTypes: string[]
}

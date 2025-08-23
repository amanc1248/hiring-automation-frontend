import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { userApiService } from '../services/userApiService'
import type { User, UserRole, UserInvitation, ApprovalRequest } from '../types/user'

const UserManagementPage: React.FC = () => {
  const { company } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [invitations, setInvitations] = useState<UserInvitation[]>([])
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  })
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleId: '',
    password: ''
  })
  const [createdUser, setCreatedUser] = useState<User | null>(null)

  useEffect(() => {
    if (company) {
      loadData()
    }
  }, [company, currentPage, filters])

  const loadData = async () => {
    if (!company) return
    setIsLoading(true)
    setError(null)
    
    try {
      // Load users and roles in parallel
      const [usersData, rolesData] = await Promise.all([
        userApiService.getUsers({
          search: filters.search || undefined,
          role_filter: filters.role || undefined,
          status_filter: filters.status as any || undefined,
          skip: (currentPage - 1) * itemsPerPage,
          limit: itemsPerPage
        }),
        userApiService.getRoles()
      ])
      
      setUsers(usersData.users)
      setTotalPages(usersData.totalPages)
      setRoles(rolesData)
      
      // For now, we'll keep invitations and approval requests empty
      // These will be implemented when we add the invitation system
      setInvitations([])
      setApprovalRequests([])
      
    } catch (error) {
      console.error('Failed to load user data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load user data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createUserForm.email || !createUserForm.firstName || !createUserForm.lastName || !createUserForm.roleId) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      const newUser = await userApiService.createUser({
        email: createUserForm.email,
        firstName: createUserForm.firstName,
        lastName: createUserForm.lastName,
        phone: createUserForm.phone || undefined,
        roleId: createUserForm.roleId,
        password: createUserForm.password || undefined // Will be auto-generated if not provided
      })
      
      setCreatedUser(newUser) // Show the temporary password
      setCreateUserForm({ email: '', firstName: '', lastName: '', phone: '', roleId: '', password: '' })
      loadData() // Refresh the user list
    } catch (error) {
      console.error('Failed to create user:', error)
      setError(error instanceof Error ? error.message : 'Failed to create user')
    }
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'tech_lead': return 'bg-blue-100 text-blue-800'
      case 'senior_engineer': return 'bg-green-100 text-green-800'
      case 'project_manager': return 'bg-purple-100 text-purple-800'
      case 'hr_manager': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <p className="text-muted-foreground">Loading user management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display">User Management</h1>
          <p className="text-muted-foreground">Manage team members and their roles</p>
        </div>
        <Button 
          size="lg" 
          className="bg-gradient-hero hover:bg-gradient-hero/90 w-full sm:w-auto"
          onClick={() => setShowCreateUserModal(true)}
        >
          <span className="mr-2">👤</span>
          Add User
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary text-lg">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-10 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">📧</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{invitations.filter(inv => inv.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-10 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-lg">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{approvalRequests.filter(req => req.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <span className="text-success text-lg">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.displayName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">User</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Last Login</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleUserClick(user)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role.name)}`}>
                        {user.role.displayName}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive ? 'active' : 'inactive')}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="outline" size="sm">
                        <span className="mr-2">👁️</span>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, users.length)} of {users.length} users
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.filter(inv => inv.status === 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Users who haven't accepted their invitations yet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.filter(inv => inv.status === 'pending').map((invitation) => {
                const role = roles.find(r => r.id === invitation.roleId)
                return (
                  <div key={invitation.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-lg">📧</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited as {role?.displayName} • {new Date(invitation.invitedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <span className="mr-2">🔄</span>
                        Resend
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <span className="mr-2">❌</span>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Add Team Member</h2>
              <p className="text-muted-foreground mt-1">Create a new user account with login credentials</p>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">First Name *</label>
                  <input
                    type="text"
                    required
                    value={createUserForm.firstName}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={createUserForm.lastName}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email Address *</label>
                <input
                  type="email"
                  required
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  placeholder="john.doe@company.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Phone</label>
                <input
                  type="tel"
                  value={createUserForm.phone}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  placeholder="+1-555-0123"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Role *</label>
                <select
                  required
                  value={createUserForm.roleId}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, roleId: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.displayName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
                <input
                  type="password"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  placeholder="Leave blank to auto-generate"
                />
                <p className="text-xs text-muted-foreground mt-1">Leave blank to auto-generate a secure password</p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                  <span className="mr-2">👤</span>
                  Create User
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateUserModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Created Success Modal */}
      {createdUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">User Created Successfully!</h2>
              <p className="text-muted-foreground mt-1">Share these credentials with the new user</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Login Credentials</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-mono">{createdUser.email}</span>
                  </div>
                  {createdUser.temporaryPassword && (
                    <div>
                      <span className="text-muted-foreground">Password: </span>
                      <span className="font-mono bg-background px-2 py-1 rounded border">
                        {createdUser.temporaryPassword}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-amber-800 text-sm">
                  <strong>Important:</strong> The user will be required to change their password on first login.
                  Please share these credentials securely.
                </p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => navigator.clipboard.writeText(`Email: ${createdUser.email}\nPassword: ${createdUser.temporaryPassword}`)}
                  className="flex-1"
                >
                  📋 Copy Credentials
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCreatedUser(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">User Details</h2>
              <p className="text-muted-foreground mt-1">View and manage user information</p>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleColor(selectedUser.role.name)}`}>
                    {selectedUser.role.displayName}
                  </span>
                </div>
              </div>

              {/* Role Details */}
              <div className="border-t border-border pt-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">Role & Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-foreground mb-2">Permissions</h5>
                    <div className="space-y-2">
                      {Object.entries(selectedUser.role.permissions).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span className="text-sm text-foreground">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-2">Approval Types</h5>
                    <div className="space-y-2">
                      {selectedUser.role.approvalTypes.map((type) => (
                        <span key={type} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-2 mb-2">
                          {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div className="border-t border-border pt-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="text-muted-foreground">Last Login:</span>
                    <span className="text-foreground">
                      {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="text-muted-foreground">Registered:</span>
                    <span className="text-foreground">
                      {new Date(selectedUser.registeredAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.isActive ? 'active' : 'inactive')}`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-border pt-6">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <span className="mr-2">✏️</span>
                    Edit User
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <span className="mr-2">🔄</span>
                    Change Role
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-destructive hover:text-destructive"
                  >
                    <span className="mr-2">❌</span>
                    Deactivate
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => setShowUserModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagementPage

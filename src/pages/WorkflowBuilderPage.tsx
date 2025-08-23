import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../hooks/useAuth'
import { workflowService } from '../services/workflowService'
import { workflowApiService, type WorkflowStep as ApiWorkflowStep } from '../services/workflowApiService'
import { userApiService } from '../services/userApiService'
import type { WorkflowStep, WorkflowTemplate, WorkflowStats } from '../types/workflow'
import type { User } from '../types/user'

const WorkflowBuilderPage = () => {
  const { company } = useAuth()
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [stats, setStats] = useState<WorkflowStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [availableSteps, setAvailableSteps] = useState<ApiWorkflowStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showCustomBuilder, setShowCustomBuilder] = useState(false)
  const [showEditWorkflow, setShowEditWorkflow] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowTemplate | null>(null)
  const [showEditStep, setShowEditStep] = useState(false)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  // Form states
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    jobId: '',
    templateId: ''
  })

  // Step type descriptions (hardcoded)
  const stepTypeDescriptions = {
    resume_analysis: 'AI analyzes resume against job requirements',
    human_approval: 'Human reviewer approves or rejects candidate',
    task_assignment: 'Send technical assessment to candidate',
    task_review: 'Review completed technical assessment',
    interview_scheduling: 'Schedule interview automatically',
    ai_interview: 'Conduct AI-powered technical interview',
    offer_letter: 'Send offer letter to approved candidate',
    custom: 'Custom workflow step'
  }

  // Custom workflow builder state
  const [customWorkflow, setCustomWorkflow] = useState({
    name: '',
    description: '',
    steps: [] as Array<{
      name: string
      description: string
      type: 'resume_analysis' | 'human_approval' | 'task_assignment' | 'task_review' | 'interview_scheduling' | 'ai_interview' | 'offer_letter' | 'custom'
      delayHours: number
      requiresApproval: boolean
      approvers: string[]
      numberOfApprovalsNeeded: number
      autoStart: boolean
    }>
  })

  const [newStep, setNewStep] = useState({
    name: '',
    description: '',
    type: 'resume_analysis' as 'resume_analysis' | 'human_approval' | 'task_assignment' | 'task_review' | 'interview_scheduling' | 'ai_interview' | 'offer_letter' | 'custom',
    delayHours: 0,
    requiresApproval: false,
    approvers: [] as string[],
    numberOfApprovalsNeeded: 1,
    autoStart: false
  })

  useEffect(() => {
    if (company) {
      loadData()
    }
  }, [company])

  const loadData = async () => {
    if (!company) return
    setIsLoading(true)
    try {
      const [templatesData, statsData, usersData, availableStepsData] = await Promise.all([
        workflowService.getWorkflowTemplates(),
        workflowService.getWorkflowStats(company.id),
        userApiService.getUsers({ limit: 100, status_filter: 'active' }),
        workflowApiService.getWorkflowSteps()
      ])
      setTemplates(templatesData)
      setStats(statsData)
      console.log('Users data received:', usersData)
      setUsers(usersData.users)
      setAvailableSteps(availableStepsData)
    } catch (error) {
      console.error('Failed to load workflow data:', error)
    } finally {
      setIsLoading(false)
    }
  }



  const handleSaveAsTemplate = async () => {
    if (!customWorkflow.name || customWorkflow.steps.length === 0) {
      alert('Please provide a workflow name and at least one step before saving as template.')
      return
    }

    try {
      // Map frontend workflow steps to backend format
      const steps = customWorkflow.steps.map((step, index) => {
        // Find the actual workflow step ID from availableSteps
        let workflowStepId = step.type
        
        // If it's a custom step or not found in availableSteps, we need to handle it
        if (step.type === 'custom' || !availableSteps.find(s => s.id === step.type)) {
          // For custom steps, we could create a new workflow_step or use a default one
          // For now, let's skip custom steps or throw an error
          throw new Error(`Cannot save template with custom steps. Please use only predefined workflow steps.`)
        }
        
        return {
          workflow_step_id: workflowStepId,
          delay_in_seconds: step.delayHours * 3600, // Convert hours to seconds
          auto_start: step.autoStart,
          required_human_approval: step.requiresApproval,
          number_of_approvals_needed: step.requiresApproval ? step.numberOfApprovalsNeeded : undefined,
          order_number: index + 1
        }
      })

      const templateData = {
        name: customWorkflow.name,
        description: customWorkflow.description || `Custom workflow template: ${customWorkflow.name}`,
        category: 'custom',
        steps: steps
      }

      await workflowApiService.createWorkflowTemplateWithSteps(templateData)
      alert('Workflow template saved successfully!')
      
      // Refresh templates list
      const updatedTemplates = await workflowService.getWorkflowTemplates()
      setTemplates(updatedTemplates)
      
    } catch (error) {
      console.error('Failed to save workflow template:', error)
      alert('Failed to save workflow template. Please try again.')
    }
  }



  const handleAddStep = () => {
    if (!newStep.description.trim()) {
      alert('Please enter a step description.')
      return
    }

    setCustomWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, { ...newStep }]
    }))

    setNewStep({
      name: '',
      description: '',
      type: 'resume_analysis',
      delayHours: 0,
      requiresApproval: false,
      approvers: [],
      numberOfApprovalsNeeded: 1,
      autoStart: false
    })
  }

  const handleRemoveStep = (index: number) => {
    setCustomWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }))
  }

  const handleEditStep = (index: number) => {
    const step = customWorkflow.steps[index]
    setNewStep({
      name: step.name,
      description: step.description,
      type: step.type,
      delayHours: step.delayHours,
      requiresApproval: step.requiresApproval,
      approvers: step.approvers,
      numberOfApprovalsNeeded: step.numberOfApprovalsNeeded || 1,
      autoStart: step.autoStart || false
    })
    setEditingStepIndex(index)
    setShowEditStep(true)
  }

  const handleUpdateStep = () => {
    if (editingStepIndex === null) return
    
    if (!newStep.description.trim()) {
      alert('Please enter a step description.')
      return
    }

    setCustomWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === editingStepIndex ? { ...newStep } : step
      )
    }))

    // Reset form
    setNewStep({
      name: '',
      description: '',
      type: 'resume_analysis',
      delayHours: 0,
      requiresApproval: false,
      approvers: [],
      numberOfApprovalsNeeded: 1,
      autoStart: false
    })
    setEditingStepIndex(null)
    setShowEditStep(false)
  }

  const handleCancelEdit = () => {
    setNewStep({
      name: '',
      description: '',
      type: 'resume_analysis',
      delayHours: 0,
      requiresApproval: false,
      approvers: [],
      numberOfApprovalsNeeded: 1,
      autoStart: false
    })
    setEditingStepIndex(null)
    setShowEditStep(false)
  }





  const handleCancelEditWorkflow = () => {
    setShowEditWorkflow(false)
    setEditingWorkflow(null)
    setCustomWorkflow({ name: '', description: '', steps: [] })
  }

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'resume_analysis':
      case 'automated': return '📄'
      case 'human_approval':
      case 'approval': return '👤'
      case 'task_assignment':
      case 'manual': return '📝'
      case 'task_review': return '🔍'
      case 'interview_scheduling': return '📅'
      case 'ai_interview': return '🤖'
      case 'offer_letter': return '📜'
      case 'custom': return '⚙️'
      default: return '📋'
    }
  }

  const getStepColor = (stepType: string) => {
    switch (stepType) {
      case 'resume_analysis': return 'bg-green-100 text-green-800'
      case 'human_approval': return 'bg-yellow-100 text-yellow-800'
      case 'task_assignment': return 'bg-purple-100 text-purple-800'
      case 'task_review': return 'bg-orange-100 text-orange-800'
      case 'interview_scheduling': return 'bg-indigo-100 text-indigo-800'
      case 'ai_interview': return 'bg-pink-100 text-pink-800'
      case 'offer_letter': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getApproverNames = (approverIds: string[]) => {
    if (!approverIds || approverIds.length === 0) return 'None'
    return approverIds.map(id => {
      const user = users.find(u => u.id === id)
      return user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
    }).join(', ')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <p className="text-muted-foreground">Loading workflow builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display">Workflow Builder</h1>
          <p className="text-muted-foreground">Create and manage hiring automation workflows for each job</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">

          <Button 
            size="lg" 
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setShowCustomBuilder(true)}
          >
            <span className="mr-2">⚡</span>
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Workflow Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary text-lg">⚡</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalWorkflows}</p>
                  <p className="text-sm text-muted-foreground">Total Workflows</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.activeWorkflows}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <span className="text-warning text-lg">🔄</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.runningExecutions}</p>
                  <p className="text-sm text-muted-foreground">Running</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary text-lg">📊</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.approvalRate}%</p>
                  <p className="text-sm text-muted-foreground">Approval Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workflow Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Workflow Templates</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{template.category}</p>
                  </div>
                  {template.isDefault && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      Default
                    </span>
                  )}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Workflow Steps:</h4>
                  <div className="space-y-2">
                    {template.steps.slice(0, 3).map((step, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStepColor(step.type)}`}>
                          <span>{getStepIcon(step.type)}</span>
                          <span>{step.name}</span>
                        </span>
                        {step.type !== 'custom' && (
                          <div className="group relative">
                            <span className="text-blue-500 cursor-help text-xs">ℹ️</span>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 max-w-xs">
                              {stepTypeDescriptions[step.type]}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {template.steps.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{template.steps.length - 3} more steps
                      </p>
                    )}
                  </div>
                </div>
                

              </CardContent>
            </Card>
          ))}
        </div>
      </div>





      {/* Custom Workflow Builder Modal */}
      {showCustomBuilder && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle>Create Workflow</CardTitle>
                <CardDescription>
                  Build custom workflow after you receive your email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Workflow Name *</label>
                    <input
                      type="text"
                      required
                      value={customWorkflow.name}
                      onChange={(e) => setCustomWorkflow(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                      placeholder="e.g., Engineering Hiring Workflow"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea
                      value={customWorkflow.description}
                      onChange={(e) => setCustomWorkflow(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                      placeholder="Describe what this workflow does..."
                    />
                  </div>

                  {/* Add/Edit Workflow Step */}
                  <div className="border border-border rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {editingStepIndex !== null ? 'Edit Workflow Step' : 'Add Workflow Step'}
                    </h3>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Step Type</label>
                      <select
                        value={newStep.type}
                        onChange={(e) => {
                          const selectedStep = availableSteps.find(step => step.id === e.target.value)
                          setNewStep(prev => ({ 
                            ...prev, 
                            type: e.target.value as any,
                            description: selectedStep?.description || prev.description
                          }))
                        }}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                      >

                        <option value="">Select a workflow step...</option>
                        {availableSteps.map((step) => (
                          <option key={step.id} value={step.id}>
                            {getStepIcon(step.step_type)} {step.name}
                          </option>
                        ))}
                        <option value="custom">⚙️ Custom Action</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Description</label>
                      <input
                        type="text"
                        value={newStep.description}
                        onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                        placeholder="What does this step do?"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Delay (hours)</label>
                        <input
                          type="number"
                          min="0"
                          max="168"
                          value={newStep.delayHours}
                          onChange={(e) => setNewStep(prev => ({ ...prev, delayHours: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Approvers</label>
                        <select
                          multiple
                          value={newStep.approvers}
                          onChange={(e) => {
                            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
                            setNewStep(prev => ({ ...prev, approvers: selectedOptions }))
                          }}
                          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth min-h-[100px]"
                        >
                          {users.filter(user => user.role.name !== 'admin').length === 0 ? (
                            <option disabled>No non-admin users available</option>
                          ) : (
                            users
                              .filter(user => user.role.name !== 'admin')
                              .map(user => (
                                <option key={user.id} value={user.id}>
                                  {user.firstName} {user.lastName} ({user.role.displayName})
                                </option>
                              ))
                          )}
                        </select>
                        <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple users</p>
                      </div>

                      <div className="space-y-3 pt-6">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newStep.requiresApproval}
                            onChange={(e) => setNewStep(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                            className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                          />
                          <span className="text-sm text-foreground">Requires Approval</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newStep.autoStart}
                            onChange={(e) => setNewStep(prev => ({ ...prev, autoStart: e.target.checked }))}
                            className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                          />
                          <span className="text-sm text-foreground">Auto Start</span>
                        </div>
                        

                      </div>
                    </div>

                    {/* Number of Approvals Needed - Show only when requires approval is checked */}
                    {newStep.requiresApproval && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Number of Approvals Needed</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={newStep.numberOfApprovalsNeeded}
                          onChange={(e) => setNewStep(prev => ({ ...prev, numberOfApprovalsNeeded: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                          placeholder="1"
                        />
                        <p className="text-xs text-muted-foreground">How many approvals are required to proceed</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={editingStepIndex !== null ? handleUpdateStep : handleAddStep}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <span className="mr-2">
                          {editingStepIndex !== null ? '✏️' : '➕'}
                        </span>
                        {editingStepIndex !== null ? 'Update Step' : 'Add Step to Workflow'}
                      </Button>
                      
                      {editingStepIndex !== null && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="px-6"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Current Steps */}
                  {customWorkflow.steps.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Workflow Steps ({customWorkflow.steps.length})</h3>
                      <div className="space-y-3">
                        {customWorkflow.steps.map((step, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStepColor(step.type)}`}>
                                <span>{getStepIcon(step.type)}</span>
                                <span>{step.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              </span>
                              <div className="text-sm text-muted-foreground">
                                {step.description}
                              </div>
                              <div className="flex items-center space-x-2 text-xs">
                                {step.delayHours > 0 && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    ⏰ {step.delayHours}h
                                  </span>
                                )}
                                {step.requiresApproval && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    👤 Approval
                                  </span>
                                )}

                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditStep(index)}
                                className="border-primary text-primary hover:bg-primary/10"
                              >
                                <span className="mr-1">✏️</span>
                                Edit
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveStep(index)}
                                className="border-destructive text-destructive hover:bg-destructive/10"
                              >
                                <span className="mr-1">🗑️</span>
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-6 border-t border-border">
                    <Button
                      type="submit"
                      disabled={customWorkflow.steps.length === 0}
                      className="flex-1 bg-gradient-hero hover:bg-gradient-hero/90"
                    >
                      Create Workflow
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveAsTemplate}
                      disabled={!customWorkflow.name || customWorkflow.steps.length === 0}
                      className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                    >
                      💾 Save as Template
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCustomBuilder(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowBuilderPage

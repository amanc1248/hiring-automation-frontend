import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../hooks/useAuth'
import { jobService } from '../../services/jobService'
import type { JobCreateData, JobRequirement, JobLocation, JobSalary } from '../../types/job'

interface JobFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const JobForm = ({ onSuccess, onCancel }: JobFormProps) => {
  const { company } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<JobCreateData>({
    title: '',
    department: '',
    description: '',
    requirements: [],
    location: {
      type: 'remote',
      city: '',
      state: '',
      country: '',
      timezone: ''
    },
    salary: {
      min: 0,
      max: 0,
      currency: 'USD',
      period: 'yearly',
      equity: false,
      benefits: []
    },
    employmentType: 'full-time',
    experienceLevel: 'mid',
    applicationEmail: '',
    workflowId: ''
  })

  const [newRequirement, setNewRequirement] = useState({
    name: '',
    category: 'skill' as const,
    level: 'intermediate' as const,
    required: true
  })

  const [newBenefit, setNewBenefit] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return

    setIsLoading(true)
    try {
      await jobService.createJob(formData, company.id)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create job:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addRequirement = () => {
    if (newRequirement.name.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, { ...newRequirement, id: `req-${Date.now()}` }]
      }))
      setNewRequirement({ name: '', category: 'skill', level: 'intermediate', required: true })
    }
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        salary: {
          ...prev.salary,
          benefits: [...(prev.salary.benefits || []), newBenefit.trim()]
        }
      }))
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        benefits: prev.salary.benefits?.filter((_, i) => i !== index) || []
      }
    }))
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof JobCreateData] as any),
        [field]: value
      }
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Job Posting</CardTitle>
          <CardDescription>
            Fill in the details below to create a new job posting for your company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    placeholder="e.g., Senior Full Stack Developer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    placeholder="e.g., Engineering"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Job Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Requirements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Requirement Name</label>
                  <input
                    type="text"
                    value={newRequirement.name}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    placeholder="e.g., React"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={newRequirement.category}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  >
                    <option value="skill">Skill</option>
                    <option value="experience">Experience</option>
                    <option value="education">Education</option>
                    <option value="certification">Certification</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Level</label>
                  <select
                    value={newRequirement.level}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Required</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newRequirement.required}
                      onChange={(e) => setNewRequirement(prev => ({ ...prev, required: e.target.checked }))}
                      className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                    />
                    <span className="text-sm text-muted-foreground">Required</span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addRequirement}
                className="w-full sm:w-auto"
              >
                <span className="mr-2">➕</span>
                Add Requirement
              </Button>

              {/* Display Requirements */}
              {formData.requirements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Current Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg text-sm"
                      >
                        <span className="font-medium">{req.name}</span>
                        <span className="text-muted-foreground">({req.category}, {req.level})</span>
                        <span className={req.required ? 'text-success' : 'text-muted-foreground'}>
                          {req.required ? 'Required' : 'Optional'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location & Employment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Location & Employment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Location Type</label>
                  <select
                    value={formData.location.type}
                    onChange={(e) => handleNestedChange('location', 'type', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  >
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => handleChange('employmentType', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => handleChange('experienceLevel', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>

              {formData.location.type !== 'remote' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">City</label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                      placeholder="e.g., San Francisco"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">State</label>
                    <input
                      type="text"
                      value={formData.location.state}
                      onChange={(e) => handleNestedChange('location', 'state', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                      placeholder="e.g., CA"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Country</label>
                    <input
                      type="text"
                      value={formData.location.country}
                      onChange={(e) => handleNestedChange('location', 'country', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                      placeholder="e.g., USA"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Salary & Benefits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Salary & Benefits</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Min Salary *</label>
                  <input
                    type="number"
                    required
                    value={formData.salary.min}
                    onChange={(e) => handleNestedChange('salary', 'min', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Max Salary *</label>
                  <input
                    type="number"
                    required
                    value={formData.salary.max}
                    onChange={(e) => handleNestedChange('salary', 'max', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    placeholder="80000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Currency</label>
                  <select
                    value={formData.salary.currency}
                    onChange={(e) => handleNestedChange('salary', 'currency', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Period</label>
                  <select
                    value={formData.salary.period}
                    onChange={(e) => handleNestedChange('salary', 'period', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.salary.equity}
                    onChange={(e) => handleNestedChange('salary', 'equity', e.target.checked)}
                    className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">Equity included</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Benefits</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    placeholder="e.g., Health Insurance"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addBenefit}
                  >
                    Add
                  </Button>
                </div>

                {formData.salary.benefits && formData.salary.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.salary.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg text-sm"
                      >
                        <span>{benefit}</span>
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Application Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Application Email *</label>
              <input
                type="email"
                required
                value={formData.applicationEmail}
                onChange={(e) => handleChange('applicationEmail', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                placeholder="jobs@company.com"
              />
              <p className="text-xs text-muted-foreground">
                This email will receive all job applications for this position
              </p>
            </div>

            {/* Workflow Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Hiring Workflow</label>
              <select
                value={formData.workflowId}
                onChange={(e) => handleChange('workflowId', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              >
                <option value="">Select a workflow (optional)</option>
                <option value="engineering-template">Engineering Template</option>
                <option value="design-template">Design Template</option>
                <option value="custom-workflow">Custom Workflow</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Choose a workflow to automate the hiring process for this job. You can create custom workflows in the Workflows section.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-hero hover:bg-gradient-hero/90"
              >
                {isLoading ? 'Creating...' : 'Create Job Posting'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default JobForm

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../hooks/useAuth'
import { jobService } from '../../services/jobService'
import type { JobResponse, JobCreateRequest, JobUpdateRequest } from '../../types/job'

interface JobFormProps {
  job?: JobResponse | null
  onSuccess?: () => void
  onCancel?: () => void
}

const JobForm = ({ job, onSuccess, onCancel }: JobFormProps) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<JobCreateRequest>({
    title: '',
    description: '',
    requirements: '',
    department: '',
    location: '',
    job_type: 'full-time',
    experience_level: 'mid',
    remote_policy: 'onsite',
    salary_min: 0,
    salary_max: 0,
    salary_currency: 'USD',
    status: 'draft'
  })

  // Load job data if editing
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        requirements: job.requirements || '',
        department: job.department || '',
        location: job.location || '',
        job_type: job.job_type,
        experience_level: job.experience_level || 'mid',
        remote_policy: job.remote_policy || 'onsite',
        salary_min: job.salary_min || 0,
        salary_max: job.salary_max || 0,
        salary_currency: job.salary_currency || 'USD',
        status: job.status
      })
    }
  }, [job])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      if (job) {
        // Update existing job
        const updateData: JobUpdateRequest = { ...formData }
        await jobService.updateJob(job.id, updateData)
      } else {
        // Create new job
        await jobService.createJob(formData)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Failed to save job:', error)
      alert('Failed to save job. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof JobCreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {job ? 'Edit Job Posting' : 'Create New Job Posting'}
          </CardTitle>
          <CardDescription>
            {job 
              ? 'Update the details of this job posting'
              : 'Fill in the details below to create a new job posting for your company'
            }
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
                  <label className="text-sm font-medium text-foreground">Department</label>
                  <input
                    type="text"
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Requirements</label>
                <textarea
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  placeholder="e.g., 3+ years React, TypeScript, Node.js experience..."
                />
              </div>
            </div>

            {/* Location & Employment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Location & Employment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Remote Policy</label>
                  <select
                    value={formData.remote_policy}
                    onChange={(e) => handleChange('remote_policy', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  >
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Job Type</label>
                  <select
                    value={formData.job_type}
                    onChange={(e) => handleChange('job_type', e.target.value)}
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
                    value={formData.experience_level}
                    onChange={(e) => handleChange('experience_level', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>

              {formData.remote_policy !== 'remote' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Office Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              )}
            </div>

            {/* Salary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Salary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Min Salary</label>
                  <input
                    type="number"
                    value={formData.salary_min || ''}
                    onChange={(e) => handleChange('salary_min', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Max Salary</label>
                  <input
                    type="number"
                    value={formData.salary_max || ''}
                    onChange={(e) => handleChange('salary_max', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    placeholder="80000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Currency</label>
                  <select
                    value={formData.salary_currency}
                    onChange={(e) => handleChange('salary_currency', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Draft jobs are not visible to candidates. Active jobs can receive applications.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-hero hover:bg-gradient-hero/90"
              >
                {isLoading ? (job ? 'Updating...' : 'Creating...') : (job ? 'Update Job' : 'Create Job')}
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
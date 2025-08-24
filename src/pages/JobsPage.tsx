import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { useAuth } from '../hooks/useAuth'
import { jobService } from '../services/jobService'
import JobForm from '../components/jobs/JobForm'
import type { JobResponse } from '../types/job'

const JobsPage = () => {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<JobResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'active' | 'paused' | 'closed'>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingJob, setEditingJob] = useState<JobResponse | null>(null)

  useEffect(() => {
    if (user) {
      loadJobs()
    }
  }, [user])

  const loadJobs = async () => {
    setIsLoading(true)
    try {
      const response = await jobService.getJobs()
      setJobs(response.jobs)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (jobId: string, newStatus: 'active' | 'closed' | 'paused') => {
    try {
      await jobService.updateJobStatus(jobId, newStatus)
      await loadJobs() // Reload jobs
    } catch (error) {
      console.error('Failed to update job status:', error)
      alert('Failed to update job status. Please try again.')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await jobService.deleteJob(jobId)
        await loadJobs() // Reload jobs
      } catch (error) {
        console.error('Failed to delete job:', error)
        alert('Failed to delete job. Please try again.')
      }
    }
  }

  const handleEditJob = (job: JobResponse) => {
    setEditingJob(job)
    setShowCreateForm(true)
  }

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true
    return job.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground'
      case 'active': return 'bg-success text-success-foreground'
      case 'paused': return 'bg-warning text-warning-foreground'
      case 'closed': return 'bg-destructive text-destructive-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝'
      case 'active': return '✅'
      case 'paused': return '⏸️'
      case 'closed': return '❌'
      default: return '❓'
    }
  }

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Salary not specified'
    const curr = currency || 'USD'
    if (min && max) {
      return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`
    } else if (min) {
      return `${curr} ${min.toLocaleString()}+`
    } else if (max) {
      return `Up to ${curr} ${max.toLocaleString()}`
    }
    return 'Salary not specified'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display">Job Management</h1>
          <p className="text-muted-foreground">Create and manage your job postings</p>
        </div>
        <Button 
          size="lg" 
          className="bg-gradient-hero hover:bg-gradient-hero/90 w-full sm:w-auto"
          onClick={() => {
            setEditingJob(null)
            setShowCreateForm(true)
          }}
        >
          <span className="mr-2">➕</span>
          Create New Job
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'draft', 'active', 'paused', 'closed'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status === 'all' ? 'All Jobs' : status}
            {status !== 'all' && (
              <span className="ml-2 bg-background/20 px-2 py-0.5 rounded text-xs">
                {jobs.filter(job => job.status === status).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary text-lg">💼</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {jobs.filter(job => job.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <span className="text-warning text-lg">📝</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {jobs.filter(job => job.status === 'draft').length}
                </p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary text-lg">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "You haven't created any jobs yet. Get started by creating your first job posting!"
                  : `No jobs with status "${filter}" found.`
                }
              </p>
              {filter === 'all' && (
                <Button 
                  size="lg" 
                  className="bg-gradient-hero hover:bg-gradient-hero/90"
                  onClick={() => {
                    setEditingJob(null)
                    setShowCreateForm(true)
                  }}
                >
                  <span className="mr-2">➕</span>
                  Create Your First Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="card-hover">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        <span>{getStatusIcon(job.status)}</span>
                        <span className="capitalize">{job.status}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {job.department && (
                        <span className="flex items-center space-x-1">
                          <span>🏢</span>
                          <span>{job.department}</span>
                        </span>
                      )}
                      {(job.location || job.remote_policy) && (
                        <span className="flex items-center space-x-1">
                          <span>📍</span>
                          <span>
                            {job.remote_policy === 'remote' ? 'Remote' : 
                             job.remote_policy === 'hybrid' ? 'Hybrid' : 
                             job.remote_policy === 'onsite' ? 'On-site' : 'Office'}
                            {job.location && job.remote_policy !== 'remote' && ` - ${job.location}`}
                          </span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <span>💰</span>
                        <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                      </span>
                      {job.experience_level && (
                        <span className="flex items-center space-x-1">
                          <span>🎯</span>
                          <span className="capitalize">{job.experience_level}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {job.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(job.id, 'active')}
                        className="bg-success hover:bg-success/90"
                      >
                        <span className="mr-1">✅</span>
                        Publish
                      </Button>
                    )}
                    
                    {job.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(job.id, 'paused')}
                          className="border-warning text-warning hover:bg-warning/10"
                        >
                          <span className="mr-1">⏸️</span>
                          Pause
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(job.id, 'closed')}
                          className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                          <span className="mr-1">❌</span>
                          Close
                        </Button>
                      </>
                    )}

                    {job.status === 'paused' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(job.id, 'active')}
                        className="bg-success hover:bg-success/90"
                      >
                        <span className="mr-1">▶️</span>
                        Resume
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditJob(job)}
                    >
                      <span className="mr-1">✏️</span>
                      Edit
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteJob(job.id)}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <span className="mr-1">🗑️</span>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {job.description}
                </p>
                
                {job.requirements && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Requirements:</h4>
                      <p className="text-sm text-muted-foreground">{job.requirements}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t">
                  <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(job.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Job Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <JobForm
              job={editingJob}
              onSuccess={() => {
                setShowCreateForm(false)
                setEditingJob(null)
                loadJobs()
              }}
              onCancel={() => {
                setShowCreateForm(false)
                setEditingJob(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default JobsPage
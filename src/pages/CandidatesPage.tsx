import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { candidateService } from '../services/candidateService'
import type { Candidate, CandidateFilters } from '../types/candidate'

const CandidatesPage = () => {
  const { company } = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showJobModal, setShowJobModal] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table')
  
  // Filters state
  const [filters, setFilters] = useState<CandidateFilters>({
    search: '',
    jobId: '',
    status: '',
    workflowStep: '',
    dateRange: 'all'
  })

  useEffect(() => {
    if (company) {
      loadCandidates()
    }
  }, [company, currentPage, filters])

  const loadCandidates = async () => {
    if (!company) return
    setIsLoading(true)
    try {
      const response = await candidateService.getCandidates(company.id, {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      })
      setCandidates(response.candidates)
      setFilteredCandidates(response.candidates)
      setTotalPages(Math.ceil(response.total / itemsPerPage))
    } catch (error) {
      console.error('Failed to load candidates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: keyof CandidateFilters, value: string) => {
    setFilters((prev: CandidateFilters) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setShowDetailModal(true)
  }

  const handleJobClick = (jobId: string, jobTitle: string) => {
    // Mock job data - in real app, this would fetch from jobService
    const mockJob = {
      id: jobId,
      title: jobTitle,
      department: 'Engineering',
      description: 'We are looking for a talented engineer to join our team...',
      requirements: [
        '5+ years of experience in backend development',
        'Strong knowledge of Python, FastAPI, and PostgreSQL',
        'Experience with cloud platforms (AWS/GCP)',
        'Excellent problem-solving skills'
      ],
      workflow: 'Engineering Hiring Workflow',
      status: 'published',
      totalApplications: candidates.filter(c => c.jobId === jobId).length,
      activeApplications: candidates.filter(c => c.jobId === jobId && c.status === 'active').length,
      createdAt: '2024-01-01T00:00:00Z'
    }
    
    setSelectedJob(mockJob)
    setShowJobModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getWorkflowStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'email_reception': return '📧'
      case 'resume_analysis': return '📄'
      case 'task_assignment': return '📝'
      case 'task_review': return '🔍'
      case 'interview_scheduling': return '📅'
      case 'ai_interview': return '🤖'
      case 'offer_letter': return '📜'
      default: return '⚙️'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <p className="text-muted-foreground">Loading candidates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display">Candidates</h1>
          <p className="text-muted-foreground">Manage and track job applicants through your hiring workflows</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="w-full sm:w-auto">
            <span className="mr-2">📊</span>
            Export Data
          </Button>
          <Button className="bg-gradient-hero hover:bg-gradient-hero/90 w-full sm:w-auto">
            <span className="mr-2">➕</span>
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary text-lg">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{candidates.length}</p>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">📧</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {candidates.filter(c => c.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-lg">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {candidates.filter(c => c.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {candidates.filter(c => c.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Search</label>
              <input
                type="text"
                placeholder="Name, email, or job title..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              />
            </div>

            {/* Job Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Job Position</label>
              <select
                value={filters.jobId}
                onChange={(e) => handleFilterChange('jobId', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              >
                <option value="">All Jobs</option>
                <option value="backend-engineer">Backend Engineer</option>
                <option value="frontend-engineer">Frontend Engineer</option>
                <option value="fullstack-engineer">Full Stack Engineer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Workflow Step Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Workflow Step</label>
              <select
                value={filters.workflowStep}
                onChange={(e) => handleFilterChange('workflowStep', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              >
                <option value="">All Steps</option>
                <option value="email_reception">📧 Email Reception</option>
                <option value="resume_analysis">📄 Resume Analysis</option>
                <option value="task_assignment">📝 Task Assignment</option>
                <option value="task_review">🔍 Task Review</option>
                <option value="interview_scheduling">📅 Interview Scheduling</option>
                <option value="ai_interview">🤖 AI Interview</option>
                <option value="offer_letter">📜 Offer Letter</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date Applied</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Candidates ({filteredCandidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Candidate</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Job Position</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Current Step</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Applied</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <span className="text-2xl">👥</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">No Candidates Yet</h3>
                          <p className="text-muted-foreground mt-2">
                            Candidates will appear here when they apply for jobs through your email automation workflow.
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Make sure you have:
                          </p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                            <li>• Email polling enabled in Email Configuration</li>
                            <li>• Jobs posted with workflow templates</li>
                            <li>• Gmail account connected and authorized</li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                  <tr 
                    key={candidate.id} 
                    className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleCandidateClick(candidate)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {candidate.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleJobClick(candidate.jobId, candidate.jobTitle)
                        }}
                        className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                      >
                        {candidate.jobTitle}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getWorkflowStepIcon(candidate.currentStep)}</span>
                                                 <span className="text-sm text-foreground">
                           {candidate.currentStep.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                         </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(candidate.applicationDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          👁️ View
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          📧 Email
                        </Button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, candidates.length)} of {candidates.length} candidates
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
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

      {/* Candidate Detail Modal */}
      {showDetailModal && selectedCandidate && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedCandidate.name}</CardTitle>
                    <p className="text-muted-foreground">{selectedCandidate.email}</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Candidate Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="text-foreground">{selectedCandidate.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="text-foreground">{selectedCandidate.location || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Applied for:</span>
                        <span className="text-foreground">{selectedCandidate.jobTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Application Date:</span>
                        <span className="text-foreground">
                          {new Date(selectedCandidate.applicationDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Current Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCandidate.status)}`}>
                          {selectedCandidate.status.charAt(0).toUpperCase() + selectedCandidate.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Step:</span>
                        <span className="text-foreground">
                          {selectedCandidate.currentStep.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="text-foreground font-medium">
                          {selectedCandidate.workflowProgress.filter((s: any) => s.status === 'completed').length} of {selectedCandidate.workflowProgress.length} steps completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Progress */}
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Hiring Workflow Progress</h3>
                  <div className="space-y-4">
                    {/* Workflow Steps */}
                    {selectedCandidate.workflowProgress.map((step: any, index: number) => (
                      <div key={step.id} className="relative">
                        {/* Step Line */}
                        {index < selectedCandidate.workflowProgress.length - 1 && (
                          <div className={`absolute left-5 top-8 w-0.5 h-8 ${
                            step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                          }`}></div>
                        )}
                        
                        {/* Step Content */}
                        <div className="flex items-start space-x-4">
                          {/* Step Icon */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                            step.status === 'completed' ? 'bg-green-500' :
                            step.status === 'in_progress' ? 'bg-blue-500' :
                            step.status === 'waiting_approval' ? 'bg-yellow-500' :
                            step.status === 'failed' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`}>
                            {step.status === 'completed' ? '✓' :
                             step.status === 'in_progress' ? '⏳' :
                             step.status === 'waiting_approval' ? '👤' :
                             step.status === 'failed' ? '❌' :
                             '○'}
                          </div>
                          
                          {/* Step Details */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-foreground">{step.name}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                step.status === 'completed' ? 'bg-green-100 text-green-800' :
                                step.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                step.status === 'waiting_approval' ? 'bg-yellow-100 text-yellow-800' :
                                step.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {step.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </span>
                            </div>
                            
                            {/* Step Metadata */}
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              {step.startedAt && (
                                <span>Started: {new Date(step.startedAt).toLocaleString()}</span>
                              )}
                              {step.completedAt && (
                                <span>Completed: {new Date(step.completedAt).toLocaleString()}</span>
                              )}
                              {step.status === 'waiting_approval' && (
                                <span className="text-yellow-600 font-medium">⏳ Waiting for human approval</span>
                              )}
                            </div>
                            
                            {/* Step Notes */}
                            {step.notes && (
                              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                <span className="font-medium">Notes:</span> {step.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline">
                      <span className="mr-2">📧</span>
                      Send Email
                    </Button>
                    <Button variant="outline">
                      <span className="mr-2">📝</span>
                      Assign Task
                    </Button>
                    <Button variant="outline">
                      <span className="mr-2">📅</span>
                      Schedule Interview
                    </Button>
                    <Button variant="outline">
                      <span className="mr-2">📄</span>
                      View Resume
                    </Button>
                    <Button variant="outline">
                      <span className="mr-2">📊</span>
                      View Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedJob.title}</CardTitle>
                    <p className="text-muted-foreground">{selectedJob.department}</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowJobModal(false)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Job Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedJob.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Workflow:</span>
                        <span className="text-foreground">{selectedJob.workflow}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posted:</span>
                        <span className="text-foreground">
                          {new Date(selectedJob.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Applications</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="text-foreground font-semibold">{selectedJob.totalApplications}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active:</span>
                        <span className="text-foreground font-semibold text-green-600">{selectedJob.activeApplications}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="text-foreground font-semibold text-yellow-600">
                          {candidates.filter(c => c.jobId === selectedJob.id && c.status === 'pending').length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full">
                        <span className="mr-2">📝</span>
                        Edit Job
                      </Button>
                      <Button variant="outline" className="w-full">
                        <span className="mr-2">📊</span>
                        View Analytics
                      </Button>
                      <Button variant="outline" className="w-full">
                        <span className="mr-2">⚡</span>
                        Manage Workflow
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Job Description</h3>
                  <p className="text-foreground leading-relaxed">{selectedJob.description}</p>
                </div>

                {/* Requirements */}
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((requirement: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-foreground">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Candidates for this Job */}
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Candidates for this Position</h3>
                  <div className="space-y-3">
                    {candidates
                      .filter(c => c.jobId === selectedJob.id)
                      .map(candidate => (
                        <div key={candidate.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary text-sm font-semibold">
                                {candidate.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{candidate.name}</p>
                              <p className="text-sm text-muted-foreground">{candidate.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                              {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setShowJobModal(false)
                                handleCandidateClick(candidate)
                              }}
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>
                      ))}
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

export default CandidatesPage

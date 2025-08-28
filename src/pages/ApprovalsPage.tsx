import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { approvalApiService } from '../services/approvalApiService'
import type { ApprovalRequest, ApprovalStats } from '../services/approvalApiService'
import { useAuth } from '../hooks/useAuth'

const ApprovalsPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([])
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRequest[]>([])
  const [stats, setStats] = useState<ApprovalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  const [showCommentModal, setShowCommentModal] = useState<{ 
    approval: ApprovalRequest, 
    decision: 'approved' | 'rejected' 
  } | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    loadApprovalData()
  }, [])

  const loadApprovalData = async () => {
    try {
      setIsLoading(true)
      const [pendingData, historyData, statsData] = await Promise.all([
        approvalApiService.getPendingApprovals(),
        approvalApiService.getApprovalHistory(),
        approvalApiService.getApprovalStats()
      ])
      
      setPendingApprovals(pendingData.requests)
      setApprovalHistory(historyData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load approval data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprovalAction = (approval: ApprovalRequest, decision: 'approved' | 'rejected') => {
    if (decision === 'rejected') {
      // Always show comment modal for rejections
      setShowCommentModal({ approval, decision })
      setComment('')
    } else {
      // For approvals, show modal for optional comment
      setShowCommentModal({ approval, decision })
      setComment('')
    }
  }

  const submitApproval = async () => {
    if (!showCommentModal) return

    try {
      setIsSubmitting(showCommentModal.approval.id)
      
      await approvalApiService.submitApprovalResponse({
        approval_request_id: showCommentModal.approval.id,
        decision: showCommentModal.decision,
        comments: comment.trim() || undefined
      })

      // Refresh data
      await loadApprovalData()
      
      // Close modal
      setShowCommentModal(null)
      setComment('')
    } catch (error) {
      console.error('Failed to submit approval:', error)
      alert('Failed to submit approval. Please try again.')
    } finally {
      setIsSubmitting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStepTypeIcon = (stepType: string) => {
    const icons: Record<string, string> = {
      'resume_analysis': '📄',
      'interview_scheduling': '📅',
      'task_assignment': '📝',
      'task_review': '🔍',
      'offer_generation': '💼',
      'custom': '⚙️'
    }
    return icons[stepType] || '📋'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const renderApprovalCard = (approval: ApprovalRequest, showActions: boolean = true) => (
    <Card key={approval.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStepTypeIcon(approval.step_type)}</span>
            <div>
              <CardTitle className="text-lg">{approval.step_name}</CardTitle>
              <CardDescription>
                {approval.candidate_name} • {approval.job_title}
              </CardDescription>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(approval.status)}`}>
            {approval.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Candidate:</span>
              <p>{approval.candidate_name}</p>
              <p className="text-muted-foreground">{approval.candidate_email}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Position:</span>
              <p>{approval.job_title}</p>
              <p className="text-muted-foreground">{approval.job_department}</p>
            </div>
          </div>
          
          <div>
            <span className="font-medium text-muted-foreground">Step Details:</span>
            <p className="text-sm mt-1">{approval.step_display_name}</p>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Requested: {formatDate(approval.requested_at)}</span>
            {approval.responded_at && (
              <span>Responded: {formatDate(approval.responded_at)}</span>
            )}
          </div>

          {approval.comments && (
            <div className="border-t pt-3">
              <span className="font-medium text-muted-foreground">Comments:</span>
              <p className="text-sm mt-1 italic">{approval.comments}</p>
            </div>
          )}

          {showActions && approval.status === 'pending' && (
            <div className="pt-3 border-t">
              {approval.can_approve ? (
                // User can approve - show action buttons
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprovalAction(approval, 'approved')}
                    disabled={isSubmitting === approval.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✅ Approve
                  </Button>
                  <Button
                    onClick={() => handleApprovalAction(approval, 'rejected')}
                    disabled={isSubmitting === approval.id}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    ❌ Reject
                  </Button>
                </div>
              ) : (
                // User can only view - show view-only status
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-blue-600">👁️ View Only</span>
                  <span>• You can view this approval but cannot take action</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading approvals...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Approvals</h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' 
              ? 'View all workflow approvals across the company (Admin access)'
              : 'Manage workflow step approvals and review requests'
            }
          </p>
        </div>
        <Button onClick={loadApprovalData} variant="outline">
          🔄 Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="space-y-4">
          {/* Admin indicator */}
          {user?.role === 'admin' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-800">
                <span className="text-lg">👑</span>
                <div>
                  <p className="font-medium">Admin View</p>
                  <p className="text-sm">You can see all pending approvals across the company</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending_count}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.approved_count}</p>
                    <p className="text-sm text-muted-foreground">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">❌</span>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected_count}</p>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.total_count}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending ({pendingApprovals.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          History ({approvalHistory.length})
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'pending' ? (
          <div>
            {pendingApprovals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <span className="text-4xl mb-4 block">✅</span>
                  <h3 className="text-lg font-medium text-foreground mb-2">No Pending Approvals</h3>
                  <p className="text-muted-foreground">
                    All caught up! You have no pending approval requests.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingApprovals.map(approval => renderApprovalCard(approval, true))
            )}
          </div>
        ) : (
          <div>
            {approvalHistory.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <span className="text-4xl mb-4 block">📚</span>
                  <h3 className="text-lg font-medium text-foreground mb-2">No Approval History</h3>
                  <p className="text-muted-foreground">
                    Your approval history will appear here once you start responding to requests.
                  </p>
                </CardContent>
              </Card>
            ) : (
              approvalHistory.map(approval => renderApprovalCard(approval, false))
            )}
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {showCommentModal.decision === 'approved' ? '✅ Approve Request' : '❌ Reject Request'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                {showCommentModal.approval.candidate_name} • {showCommentModal.approval.step_name}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {showCommentModal.decision === 'rejected' ? 'Reason for rejection *' : 'Comments (optional)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md resize-none"
                rows={3}
                placeholder={showCommentModal.decision === 'rejected' 
                  ? 'Please provide a reason for rejection...'
                  : 'Add any comments or notes...'
                }
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={submitApproval}
                disabled={isSubmitting === showCommentModal.approval.id || 
                  (showCommentModal.decision === 'rejected' && !comment.trim())}
                className={showCommentModal.decision === 'approved' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
                }
              >
                {isSubmitting === showCommentModal.approval.id ? 'Submitting...' : 
                  showCommentModal.decision === 'approved' ? 'Approve' : 'Reject'}
              </Button>
              <Button
                onClick={() => {
                  setShowCommentModal(null)
                  setComment('')
                }}
                variant="outline"
                disabled={isSubmitting === showCommentModal.approval.id}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovalsPage

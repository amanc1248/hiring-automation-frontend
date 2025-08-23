import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../hooks/useAuth'
import { emailService } from '../services/emailService'
import { gmailApiService } from '../services/gmailApiService'
import type { EmailAccount, EmailStats } from '../types/email'

const EmailConfigPage = () => {
  const { company } = useAuth()
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([])
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showConnectForm, setShowConnectForm] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)



  useEffect(() => {
    if (company) {
      loadEmailData()
    }
  }, [company])

  // Handle OAuth callback on page load and popup messages
  useEffect(() => {
    const handleOAuthCallback = () => {
      const result = gmailApiService.handleOAuthCallback()
      
      if (result.success && result.email) {
        alert(`Gmail account ${result.email} connected successfully!`)
        loadEmailData() // Refresh the data
      } else if (result.error) {
        alert(`Gmail connection failed: ${result.error}`)
      }
    }

    // Handle popup messages from OAuth callback
    const handlePopupMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'GMAIL_OAUTH_COMPLETE') {
        if (event.data.success && event.data.email) {
          alert(`Gmail account ${event.data.email} connected successfully!`)
          loadEmailData() // Refresh the data
        } else if (event.data.error) {
          alert(`Gmail connection failed: ${event.data.error}`)
        }
      }
    }

    // Add message listener for popup communication
    window.addEventListener('message', handlePopupMessage)

    // Check if this is an OAuth callback (direct URL)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') || urlParams.get('error')) {
      handleOAuthCallback()
    }

    // Cleanup
    return () => {
      window.removeEventListener('message', handlePopupMessage)
    }
  }, [])

  const loadEmailData = async () => {
    if (!company) return
    setIsLoading(true)
    try {
      const [accounts, stats] = await Promise.all([
        emailService.getEmailAccounts(company.id),
        emailService.getEmailStats(company.id)
      ])
      setEmailAccounts(accounts)
      setEmailStats(stats)
    } catch (error) {
      console.error('Failed to load email data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return

    setIsConnecting(true)
    try {
      // Use real Gmail OAuth flow
      const result = await emailService.connectGmailAccount()
      
      if (result.success) {
        // Reload email accounts to show the new connection
        await loadEmailData()
        setShowConnectForm(false)
        alert(result.message)
      } else {
        alert(`Connection failed: ${result.message}`)
      }
    } catch (error) {
      console.error('Failed to connect email:', error)
      alert('Failed to connect email account. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }



  const handleTestConnection = async (accountId: string) => {
    try {
      const result = await emailService.testEmailConnection(accountId)
      if (result.success) {
        await loadEmailData() // Reload to show updated status
        alert(result.message)
      } else {
        alert(`Test failed: ${result.message}`)
      }
    } catch (error) {
      console.error('Failed to test connection:', error)
      alert('Failed to test email connection. Please try again.')
    }
  }

  const handleDisconnectAccount = async (accountId: string) => {
    if (confirm('Are you sure you want to disconnect this email account?')) {
      try {
        const result = await emailService.disconnectEmailAccount(accountId)
        if (result.success) {
          await loadEmailData() // Reload to show updated status
          alert(result.message)
        } else {
          alert(`Disconnect failed: ${result.message}`)
        }
      } catch (error) {
        console.error('Failed to disconnect account:', error)
        alert('Failed to disconnect email account. Please try again.')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-success text-success-foreground'
      case 'disconnected': return 'bg-muted text-muted-foreground'
      case 'error': return 'bg-destructive text-destructive-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅'
      case 'disconnected': return '❌'
      case 'error': return '⚠️'
      default: return '❓'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <p className="text-muted-foreground">Loading email configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-display">Email Configuration</h1>
          <p className="text-muted-foreground">Set up email monitoring for job applications and AI automation</p>
        </div>
        <Button 
          size="lg" 
          className="bg-gradient-hero hover:bg-gradient-hero/90 w-full sm:w-auto"
          onClick={() => setShowConnectForm(true)}
        >
          <span className="mr-2">📧</span>
          Connect Email Account
        </Button>
      </div>

      {/* Email Stats */}
      {emailStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary text-lg">📧</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{emailStats.totalEmails}</p>
                  <p className="text-sm text-muted-foreground">Total Emails</p>
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
                  <p className="text-2xl font-bold text-foreground">{emailStats.processedEmails}</p>
                  <p className="text-sm text-muted-foreground">Processed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <span className="text-warning text-lg">⏳</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{emailStats.pendingEmails}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary text-lg">⚡</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{emailStats.averageProcessingTime}s</p>
                  <p className="text-sm text-muted-foreground">Avg Processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Accounts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Connected Email Accounts</h2>
        </div>

        {emailAccounts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No email accounts connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your Gmail account to start monitoring job application emails automatically.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-hero hover:bg-gradient-hero/90"
                onClick={() => setShowConnectForm(true)}
              >
                <span className="mr-2">🔗</span>
                Connect First Email Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {emailAccounts.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📧</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{account.email}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{account.provider}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                      <span>{getStatusIcon(account.status)}</span>
                      <span className="capitalize">{account.status}</span>
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Last sync: {account.lastSync ? new Date(account.lastSync).toLocaleString() : 'Never'}</p>
                    <p>Created: {new Date(account.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {account.status === 'disconnected' && (
                      <Button
                        size="sm"
                        onClick={() => handleTestConnection(account.id)}
                        className="bg-success hover:bg-success/90"
                      >
                        <span className="mr-1">🔗</span>
                        Test Connection
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* TODO: Edit account */}}
                    >
                      <span className="mr-1">✏️</span>
                      Edit
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisconnectAccount(account.id)}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <span className="mr-1">🔌</span>
                      Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>



      {/* Connect Email Modal */}
      {showConnectForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Connect Email Account</CardTitle>
                <CardDescription>
                  Connect your Gmail account to monitor job application emails automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConnectEmail} className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-white text-2xl">📧</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Connect Gmail Account</h3>
                      <p className="text-muted-foreground">
                        Securely connect your Gmail account using Google OAuth to monitor job application emails automatically.
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-foreground">What you'll get:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Automatic email monitoring for job applications</li>
                      <li>• AI-powered resume parsing and candidate creation</li>
                      <li>• Secure OAuth connection (no password storage)</li>
                      <li>• Real-time email processing and notifications</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <p className="text-amber-800 text-sm">
                      <strong>Note:</strong> You'll be redirected to Google to authorize access. 
                      We only request permission to read emails and manage calendar events for interview scheduling.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-border">
                    <Button
                      type="submit"
                      disabled={isConnecting}
                      className="flex-1 bg-gradient-hero hover:bg-gradient-hero/90"
                    >
                      {isConnecting ? (
                        <>
                          <span className="mr-2 animate-spin">⏳</span>
                          Connecting to Gmail...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🔗</span>
                          Connect Gmail Account
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowConnectForm(false)}
                      className="flex-1"
                      disabled={isConnecting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}


    </div>
  )
}

export default EmailConfigPage

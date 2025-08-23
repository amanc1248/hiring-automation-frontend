import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../hooks/useAuth'

const Dashboard = () => {
  const { user } = useAuth()
  
  // Role-based dashboard content
  const getRoleBasedContent = () => {
    switch (user?.role) {
      case 'admin':
        return {
          welcomeMessage: `Welcome back, ${user.firstName}! 👋`,
          description: 'Your AI hiring assistant has been busy. Here\'s what\'s happening today.',
          showPostJob: true,
          showReports: true,
          showUserManagement: true,
          showWorkflowManagement: true
        }
      case 'tech_lead':
        return {
          welcomeMessage: `Welcome back, ${user.firstName}! 🔧`,
          description: 'Here are your technical review tasks and team updates.',
          showPostJob: false,
          showReports: false,
          showUserManagement: false,
          showWorkflowManagement: false
        }
      case 'senior_engineer':
        return {
          welcomeMessage: `Welcome back, ${user.firstName}! 💻`,
          description: 'Here are your pending code reviews and technical assessments.',
          showPostJob: false,
          showReports: false,
          showUserManagement: false,
          showWorkflowManagement: false
        }
      case 'project_manager':
        return {
          welcomeMessage: `Welcome back, ${user.firstName}! 📊`,
          description: 'Here are your project timelines and candidate evaluations.',
          showPostJob: false,
          showReports: true,
          showUserManagement: false,
          showWorkflowManagement: false
        }
      case 'hr_manager':
        return {
          welcomeMessage: `Welcome back, ${user.firstName}! 👔`,
          description: 'Here are your hiring pipeline updates and candidate reviews.',
          showPostJob: true,
          showReports: true,
          showUserManagement: false,
          showWorkflowManagement: false
        }
      default:
        return {
          welcomeMessage: `Welcome back, ${user?.firstName || 'User'}! 👋`,
          description: 'Your AI hiring assistant has been busy. Here\'s what\'s happening today.',
          showPostJob: true,
          showReports: true,
          showUserManagement: false,
          showWorkflowManagement: false
        }
    }
  }

  const roleContent = getRoleBasedContent()
  const stats = [
    {
      title: 'Active Jobs',
      value: '12',
      change: '+3 this week',
      changeType: 'positive',
      icon: '💼'
    },
    {
      title: 'Total Candidates',
      value: '248',
      change: '+18 this week',
      changeType: 'positive',
      icon: '👥'
    },
    {
      title: 'AI Interviews',
      value: '45',
      change: '+12 today',
      changeType: 'positive',
      icon: '🤖'
    },
    {
      title: 'Pending Reviews',
      value: '8',
      change: '-2 from yesterday',
      changeType: 'negative',
      icon: '📋'
    }
  ]

  const recentActivity = [
    {
      type: 'interview',
      message: 'AI Interview completed for John Smith - Frontend Developer',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      type: 'application',
      message: 'New application received for Senior Backend Engineer',
      time: '15 minutes ago',
      status: 'info'
    },
    {
      type: 'job',
      message: 'Job posting "Full Stack Developer" went live',
      time: '1 hour ago',
      status: 'success'
    },
    {
      type: 'review',
      message: 'Resume screening completed for 5 candidates',
      time: '2 hours ago',
      status: 'info'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              {roleContent.welcomeMessage}
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              {roleContent.description}
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3">
            {roleContent.showPostJob && (
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <span className="mr-2">➕</span>
                Post New Job
              </Button>
            )}
            {roleContent.showReports && (
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
                <span className="mr-2">📊</span>
                View Reports
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <span className="text-2xl">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-success' : 'text-warning'
              }`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📈</span>
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Latest updates from your hiring pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-success' : 'bg-primary'
                  }`}></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
                               <CardContent className="space-y-3">
                     {roleContent.showUserManagement && (
                       <Link to="/email-config">
                         <Button className="w-full justify-start" variant="outline">
                           <span className="mr-2">📧</span>
                           1. Email Configuration
                         </Button>
                       </Link>
                     )}
                     {roleContent.showWorkflowManagement && (
                       <Link to="/workflow-builder">
                         <Button className="w-full justify-start" variant="outline">
                           <span className="mr-2">⚡</span>
                           2. Build Workflows
                         </Button>
                       </Link>
                     )}
                     {roleContent.showPostJob && (
                       <Link to="/jobs">
                         <Button className="w-full justify-start" variant="outline">
                           <span className="mr-2">💼</span>
                           3. Create Job Posts
                         </Button>
                       </Link>
                     )}
                     <Link to="/candidates">
                       <Button className="w-full justify-start" variant="outline">
                         <span className="mr-2">👥</span>
                         Review Candidates
                       </Button>
                     </Link>
                     {roleContent.showUserManagement && (
                       <Link to="/users">
                         <Button className="w-full justify-start" variant="outline">
                           <span className="mr-2">👤</span>
                           Manage Users
                         </Button>
                       </Link>
                     )}
                   </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🎯</span>
                <span>Today's Goals</span>
              </CardTitle>
            </CardHeader>
                               <CardContent className="space-y-3">
                     <div className="flex items-center space-x-3">
                       <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
                         <span className="text-xs text-white">✓</span>
                       </div>
                       <span className="text-sm text-muted-foreground line-through">Setup email configuration</span>
                     </div>
                     <div className="flex items-center space-x-3">
                       <div className="w-4 h-4 border-2 border-primary rounded-full"></div>
                       <span className="text-sm text-foreground">Create hiring workflows</span>
                     </div>
                     <div className="flex items-center space-x-3">
                       <div className="w-4 h-4 border-2 border-muted rounded-full"></div>
                       <span className="text-sm text-foreground">Review candidate applications</span>
                     </div>
                   </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

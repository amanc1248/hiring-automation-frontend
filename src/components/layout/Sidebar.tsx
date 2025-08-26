import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { useAuth } from '../../hooks/useAuth'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()
  
  // Role-based navigation permissions
  const getNavigationItems = () => {
    const allItems = [

      {
        name: 'Email Config',
        icon: '📧',
        href: '/email-config',
        stepNumber: 1,
        isSetupStep: true,
        requiredPermissions: ['admin', 'hr_manager'] // Only admin and HR can configure email
      },
      {
        name: 'Workflows',
        icon: '⚡',
        href: '/workflow-builder',
        stepNumber: 2,
        isSetupStep: true,
        requiredPermissions: ['admin'] // Only admin can build workflows
      },
      {
        name: 'Jobs',
        icon: '💼',
        href: '/jobs',
        stepNumber: 3,
        isSetupStep: true,
        requiredPermissions: ['admin', 'hr_manager'] // Admin and HR can manage jobs
      },
      {
        name: 'Candidates',
        icon: '👥',
        href: '/candidates',
        isSetupStep: false,
        requiredPermissions: [] // Everyone can view candidates
      },
      {
        name: 'Approvals',
        icon: '✅',
        href: '/approvals',
        isSetupStep: false,
        requiredPermissions: ['admin', 'hr_manager', 'recruiter'] // Admins, HR managers, and recruiters can approve
      },
      {
        name: 'Users',
        icon: '👤',
        href: '/users',
        isSetupStep: false,
        requiredPermissions: ['admin'] // Only admin can manage users
      },

    ]
    
    // Filter items based on user role
    if (!user) return allItems
    
    return allItems.filter(item => 
      item.requiredPermissions.length === 0 || 
      item.requiredPermissions.includes(user.role)
    )
  }
  
  const navigationItems = getNavigationItems()

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col hidden lg:flex">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground font-display">
              HireFlow
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              AI Hiring Automation
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-4">
          <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            Setup Flow
          </p>
        </div>
        
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{item.icon}</span>
                {item.isSetupStep && item.stepNumber && (
                  <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {item.stepNumber}
                  </span>
                )}
              </div>
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-accent-foreground">
                Setup Complete
              </p>
              <p className="text-xs text-sidebar-accent-foreground/60">
                Ready to automate hiring
              </p>
            </div>
          </div>
          <button 
            className="w-full px-3 py-2 bg-success hover:bg-success/90 text-success-foreground text-sm font-medium rounded-lg transition-colors"
          >
            View Guide
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar


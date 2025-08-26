import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { useAuth } from '../../hooks/useAuth'

const Header = () => {
  const { user, company, logout } = useAuth()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  return (
    <>
      <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6">
        {/* Left Section - Search & Mobile Menu */}
        <div className="flex items-center space-x-3 flex-1">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span className="text-lg">☰</span>
          </Button>
          
          {/* Search Bar */}
          <div className="relative max-w-md w-full hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-muted-foreground text-sm">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search candidates, jobs, or workflows..."
              className="w-full pl-10 pr-4 py-2 bg-muted border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
            />
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-2 lg:space-x-3">




          {/* User Profile */}
          <div className="flex items-center space-x-2 lg:space-x-3 pl-2 lg:pl-3 border-l border-border">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {company?.name || 'Company'}
              </p>
            </div>
            <div className="relative group">
              <Button variant="ghost" size="sm" className="p-0 w-10 h-10 rounded-full">
                <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                  </span>
                </div>
              </Button>
              {/* Online Status */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-background rounded-full"></div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-12 w-48 bg-background border border-border rounded-lg shadow-strong opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">
                    {user ? `${user.firstName} ${user.lastName}` : 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={logout}
                  >
                    <span className="mr-2">🚪</span>
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="text-xl font-bold">HireFlow</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="text-lg">✕</span>
              </Button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {/* Dashboard - Everyone can see */}
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-3 p-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <span className="text-lg">📊</span>
                <span className="font-medium">Dashboard</span>
              </Link>
              
              {/* Email Config - Admin and HR only */}
              {(user?.role === 'admin' || user?.role === 'hr_manager') && (
                <Link
                  to="/email-config"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <span className="text-lg">📧</span>
                  <span className="font-medium">Email Config</span>
                </Link>
              )}
              
              {/* Workflows - Admin only */}
              {user?.role === 'admin' && (
                <Link
                  to="/workflow-builder"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <span className="text-lg">⚡</span>
                  <span className="font-medium">Workflows</span>
                </Link>
              )}
              
              {/* Jobs - Admin and HR only */}
              {(user?.role === 'admin' || user?.role === 'hr_manager') && (
                <Link
                  to="/jobs"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <span className="text-lg">💼</span>
                  <span className="font-medium">Jobs</span>
                </Link>
              )}
              
              {/* Candidates - Everyone can see */}
              <Link
                to="/candidates"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-3 p-3 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <span className="text-lg">👥</span>
                <span className="font-medium">Candidates</span>
              </Link>
              
              {/* Approvals - Admin, HR, and Recruiters only */}
              {(user?.role === 'admin' || user?.role === 'hr_manager' || user?.role === 'recruiter') && (
                <Link
                  to="/approvals"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <span className="text-lg">✅</span>
                  <span className="font-medium">Approvals</span>
                </Link>
              )}
              
              {/* Users - Admin only */}
              {user?.role === 'admin' && (
                <Link
                  to="/users"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <span className="text-lg">👤</span>
                  <span className="font-medium">Users</span>
                </Link>
              )}

            </nav>

            {/* Mobile User Info */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {user ? `${user.firstName} ${user.lastName}` : 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {company?.name || 'Company'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  logout()
                  setShowMobileMenu(false)
                }}
              >
                <span className="mr-2">🚪</span>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header

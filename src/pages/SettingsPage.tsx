import React from 'react'

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-display">Settings</h1>
        <p className="text-muted-foreground">Configure your hiring automation preferences</p>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Settings Coming Soon</h3>
        <p className="text-muted-foreground">
          This page will let you configure delays, approval gates, workflow steps, and team member permissions.
        </p>
      </div>
    </div>
  )
}

export default SettingsPage

import React from 'react'

const AICenterPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-display">AI Center</h1>
        <p className="text-muted-foreground">Manage AI interviews and automation workflows</p>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">AI Center Coming Soon</h3>
        <p className="text-muted-foreground">
          This page will let you configure AI interview agents, voice cloning, and automated workflows.
        </p>
      </div>
    </div>
  )
}

export default AICenterPage

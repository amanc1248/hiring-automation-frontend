import React from 'react'

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-display">Analytics</h1>
        <p className="text-muted-foreground">Track hiring metrics and performance insights</p>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Coming Soon</h3>
        <p className="text-muted-foreground">
          This page will show hiring metrics, time-to-hire, candidate quality scores, and AI performance data.
        </p>
      </div>
    </div>
  )
}

export default AnalyticsPage

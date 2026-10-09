'use client'

import { useState } from 'react'
import DailyPerformanceChart from './DailyPerformanceChart'
import PortfolioInsightsCards from './PortfolioInsightsCards'
import Link from 'next/link'

export default function AnalyticsDashboard({ initialData }) {
  const [activeTimeframe, setActiveTimeframe] = useState('1M')
  const [analyticsData, setAnalyticsData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function handleTimeframeChange(tf) {
    if (tf === activeTimeframe || isLoading) return
    setActiveTimeframe(tf)
    setIsLoading(true)

    try {
      const res = await fetch(`/api/analytics?timeframe=${tf}`)
      const json = await res.json()
      if (json.success && json.data) {
        setAnalyticsData(json.data)
      }
    } catch (err) {
      console.error('Failed to change timeframe:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRefresh() {
    if (isRefreshing) return
    setIsRefreshing(true)

    try {
      const res = await fetch(`/api/analytics?timeframe=${activeTimeframe}&refresh=true`)
      const json = await res.json()
      if (json.success && json.data) {
        setAnalyticsData(json.data)
      }
    } catch (err) {
      console.error('Failed to refresh analytics:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!analyticsData?.hasData) {
    return (
      <div className="card card-elevated" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          No Portfolio Holdings Found
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 2rem', fontSize: '0.875rem' }}>
          Add your stocks, mutual funds, gold ETFs, or cash holdings on the Dashboard to unlock daily performance charts, NIFTY 50 benchmarking, and smart health diagnostics.
        </p>
        <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', borderRadius: '10px' }}>
          Go to Dashboard & Add Assets →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Top Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--primary)',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Intelligence & Charts
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Benchmark: NIFTY 50
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Portfolio Analytics
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary"
            disabled={isRefreshing}
            style={{ height: '42px', borderRadius: '10px', padding: '0 1.25rem' }}
          >
            {isRefreshing ? 'Refreshing Quotes...' : '↻ Recalculate'}
          </button>

          <Link
            href="/dashboard"
            className="btn btn-primary"
            style={{ height: '42px', borderRadius: '10px', padding: '0 1.25rem' }}
          >
            ← Back to Holdings
          </Link>
        </div>
      </header>

      {/* Main Chart Component */}
      <DailyPerformanceChart
        initialData={analyticsData}
        activeTimeframe={activeTimeframe}
        onTimeframeChange={handleTimeframeChange}
        isLoading={isLoading || isRefreshing}
      />

      {/* Portfolio Insights & Diagnostics */}
      <PortfolioInsightsCards
        insights={analyticsData.insights}
      />
    </div>
  )
}

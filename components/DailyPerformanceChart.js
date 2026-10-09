'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts'

export default function DailyPerformanceChart({
  initialData,
  activeTimeframe,
  onTimeframeChange,
  isLoading
}) {
  const [chartMode, setChartMode] = useState('GROWTH') // 'GROWTH' | 'DAILY_SWINGS'
  const [showBenchmark, setShowBenchmark] = useState(true)

  const summary = initialData?.summary || {}
  const chartData = initialData?.chartData || []

  const isPeriodPositive = (summary.periodGainLoss || 0) >= 0
  const isTodayPositive = (summary.todayChange || 0) >= 0

  const timeframes = ['7D', '1M', '3M', '6M', '1Y']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const isUp = (data.dayChange || 0) >= 0
      return (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          padding: '1rem',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(10px)',
          minWidth: '220px'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            {data.date} ({data.displayDate})
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Portfolio Value:</span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary)' }}>
              ₹{data.value?.toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Daily Change:</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: isUp ? 'var(--success)' : 'var(--error)' }}>
              {isUp ? '+' : ''}₹{data.dayChange?.toLocaleString('en-IN')} ({isUp ? '+' : ''}{data.dayChangePercent}%)
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Period Return:</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: data.periodReturnPercent >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {data.periodReturnPercent >= 0 ? '+' : ''}{data.periodReturnPercent}%
            </span>
          </div>

          {showBenchmark && data.niftyReturnPercent !== undefined && (
            <div style={{
              marginTop: '0.4rem',
              paddingTop: '0.4rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500 }}>NIFTY 50:</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: data.niftyReturnPercent >= 0 ? 'var(--success)' : 'var(--error)' }}>
                {data.niftyReturnPercent >= 0 ? '+' : ''}{data.niftyReturnPercent}%
              </span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="card card-elevated" style={{ border: '1px solid var(--border)', padding: '1.75rem' }}>
      {/* Top Header with Title, Mode Switcher, and Timeframe Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Daily Performance & Trends
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Real-time tracking of portfolio valuation and day-by-day movements
          </p>
        </div>

        {/* Controls: Mode Switcher & Timeframe Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Chart Mode Switcher */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-surface)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border)'
          }}>
            <button
              onClick={() => setChartMode('GROWTH')}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: chartMode === 'GROWTH' ? 'var(--bg-card)' : 'transparent',
                color: chartMode === 'GROWTH' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: chartMode === 'GROWTH' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              📈 Valuation Curve
            </button>
            <button
              onClick={() => setChartMode('DAILY_SWINGS')}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: chartMode === 'DAILY_SWINGS' ? 'var(--bg-card)' : 'transparent',
                color: chartMode === 'DAILY_SWINGS' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: chartMode === 'DAILY_SWINGS' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              📊 Daily Up & Down
            </button>
          </div>

          {/* Timeframe Buttons */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-surface)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border)'
          }}>
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                disabled={isLoading}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: isLoading ? 'wait' : 'pointer',
                  backgroundColor: activeTimeframe === tf ? 'var(--primary)' : 'transparent',
                  color: activeTimeframe === tf ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: activeTimeframe === tf ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Performance Metrics Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        padding: '1.25rem',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius)',
        marginBottom: '1.75rem',
        border: '1px solid var(--border)'
      }}>
        <div>
          <div className="label">Current Net Worth</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--primary)' }}>
            ₹{(summary.currentNetWorth || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div>
          <div className="label">Today&apos;s Movement</div>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: isTodayPositive ? 'var(--success)' : 'var(--error)'
          }}>
            <span>{isTodayPositive ? '↗' : '↘'}</span>
            <span>₹{Math.abs(summary.todayChange || 0).toLocaleString('en-IN')}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, opacity: 0.9 }}>
              ({isTodayPositive ? '+' : ''}{summary.todayChangePercent || 0}%)
            </span>
          </div>
        </div>

        <div>
          <div className="label">{activeTimeframe} Period Return</div>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: isPeriodPositive ? 'var(--success)' : 'var(--error)'
          }}>
            <span>{isPeriodPositive ? '▲' : '▼'}</span>
            <span>₹{Math.abs(summary.periodGainLoss || 0).toLocaleString('en-IN')}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, opacity: 0.9 }}>
              ({isPeriodPositive ? '+' : ''}{summary.periodReturnPercent || 0}%)
            </span>
          </div>
        </div>

        <div>
          <div className="label">Daily Win Ratio</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--success)' }}>{summary.upDays || 0} Up</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: 'var(--error)' }}>{summary.downDays || 0} Down</span>
            <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              {summary.winRatePercent || 0}%
            </span>
          </div>
        </div>

        <div>
          <div className="label">Alpha vs NIFTY 50</div>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: (summary.alpha || 0) >= 0 ? 'var(--success)' : 'var(--error)'
          }}>
            {(summary.alpha || 0) >= 0 ? '+' : ''}{summary.alpha || 0}%
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>
              ({(summary.alpha || 0) >= 0 ? 'Beating' : 'Lagging'} Market)
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div style={{ height: '360px', width: '100%', position: 'relative' }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(var(--bg-card), 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: 'var(--radius)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
              <span className="spinner" style={{
                width: '20px',
                height: '20px',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></span>
              Updating Market Data...
            </div>
          </div>
        )}

        {chartData.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No historical data available for this timeframe.
          </div>
        ) : chartMode === 'GROWTH' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
              <XAxis
                dataKey="displayDate"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#growthGradient)"
                activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
              <XAxis
                dataKey="displayDate"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
              />
              <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1.5} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="dayChange" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.dayChange >= 0 ? 'var(--success)' : 'var(--error)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend & Benchmarking Sub-bar */}
      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
            Portfolio Net Worth
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--success)' }}></span>
            Positive Day
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--error)' }}></span>
            Pullback Day
          </span>
        </div>

        {summary.maxUpDay?.amount > 0 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>
              Best Day: <strong style={{ color: 'var(--success)' }}>+{summary.maxUpDay.percent}% ({summary.maxUpDay.date})</strong>
            </span>
            {summary.maxDownDay?.amount < 0 && (
              <span>
                Largest Dip: <strong style={{ color: 'var(--error)' }}>{summary.maxDownDay.percent}% ({summary.maxDownDay.date})</strong>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

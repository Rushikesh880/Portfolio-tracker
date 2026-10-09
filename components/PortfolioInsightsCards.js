'use client'

export default function PortfolioInsightsCards({ insights }) {
  if (!insights) return null

  const {
    healthScore,
    healthStatus,
    healthColor,
    riskProfile,
    riskBadgeColor,
    scoresBreakdown = {},
    assetBreakdown = {},
    largestHolding = {},
    topGainers = [],
    topLosers = [],
    alerts = []
  } = insights

  const { diversificationScore = 0, concentrationScore = 0, liquidityScore = 0 } = scoresBreakdown

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Row 1: Health Score Card & Asset Exposure Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Health Score & Diagnostics */}
        <div className="card card-elevated" style={{ border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Portfolio Health Score
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Diversification balance & risk diagnostics
              </p>
            </div>
            <span style={{
              backgroundColor: `${riskBadgeColor}15`,
              color: riskBadgeColor,
              border: `1px solid ${riskBadgeColor}30`,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.02em'
            }}>
              {riskProfile}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem' }}>
            <div style={{
              width: '92px',
              height: '92px',
              borderRadius: '50%',
              border: `6px solid ${healthColor}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${healthColor}10`,
              boxShadow: `0 0 16px ${healthColor}25`,
              flexShrink: 0
            }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: healthColor, lineHeight: 1 }}>
                {healthScore}
              </span>
              <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                / 100
              </span>
            </div>

            <div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {healthStatus}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {healthScore >= 75
                  ? 'Your portfolio has resilient asset allocation with healthy cash and asset diversification.'
                  : 'Consider reducing single-asset concentration to safeguard against market volatility.'}
              </div>
            </div>
          </div>

          {/* Diagnostics Progress Bars */}
          <div style={{ display: 'grid', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-main)' }}>Asset Class Spread</span>
                <span style={{ color: 'var(--text-muted)' }}>{diversificationScore} / 35</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(diversificationScore / 35) * 100}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-main)' }}>Concentration Safety</span>
                <span style={{ color: 'var(--text-muted)' }}>{concentrationScore} / 35</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(concentrationScore / 35) * 100}%`, height: '100%', backgroundColor: 'var(--secondary)', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-main)' }}>Liquidity Cushion</span>
                <span style={{ color: 'var(--text-muted)' }}>{liquidityScore} / 30</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(liquidityScore / 30) * 100}%`, height: '100%', backgroundColor: 'var(--accent)', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Class Allocation vs Target Balance */}
        <div className="card card-elevated" style={{ border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Asset Class Breakdown
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Actual exposure compared to balanced guidelines
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem', flex: 1 }}>
            {/* Equities */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>Equities & Mutual Funds</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Growth & Capital Appreciation</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>{assetBreakdown.equityShare}%</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 50 - 65%</div>
                </div>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, assetBreakdown.equityShare || 0)}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
              </div>
            </div>

            {/* Precious Metals */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>Gold & Silver ETFs</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inflation & Market Crisis Hedge</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent)' }}>{assetBreakdown.metalsShare}%</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 10 - 20%</div>
                </div>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, assetBreakdown.metalsShare || 0)}%`, height: '100%', backgroundColor: 'var(--accent)' }}></div>
              </div>
            </div>

            {/* Liquid Cash */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>Liquid Assets & Cash</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emergency Fund & Opportunity Buffer</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--success)' }}>{assetBreakdown.cashShare}%</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 10 - 25%</div>
                </div>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, assetBreakdown.cashShare || 0)}%`, height: '100%', backgroundColor: 'var(--success)' }}></div>
              </div>
            </div>
          </div>

          {largestHolding.name && (
            <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Largest Asset Exposure:</span>
              <strong style={{ color: 'var(--text-main)' }}>{largestHolding.name} ({largestHolding.weight}%)</strong>
            </div>
          )}
        </div>

      </div>

      {/* Row 2: Top Gainers & Draggers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Top Gainers */}
        <div className="card card-elevated" style={{ border: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>Top Performers</h3>
          </div>

          {topGainers.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No asset data available.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {topGainers.map((asset, i) => (
                <div key={asset.id || i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{asset.asset_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{asset.currentPrice?.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--success)' }}>
                      +{asset.returnPercent?.toFixed(2)}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 500 }}>
                      +₹{Math.round(asset.gainLoss || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Underperformers */}
        <div className="card card-elevated" style={{ border: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--error)' }}></span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>Portfolio Draggers</h3>
          </div>

          {topLosers.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No asset data available.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {topLosers.map((asset, i) => {
                const isLoss = (asset.gainLoss || 0) < 0
                return (
                  <div key={asset.id || i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '10px',
                    border: '1px solid var(--border)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{asset.asset_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{asset.currentPrice?.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: isLoss ? 'var(--error)' : 'var(--text-main)' }}>
                        {asset.returnPercent?.toFixed(2)}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isLoss ? 'var(--error)' : 'var(--text-muted)', fontWeight: 500 }}>
                        {isLoss ? '' : '+'}₹{Math.round(asset.gainLoss || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Row 3: Smart Actionable Insights & Alerts */}
      {alerts.length > 0 && (
        <div className="card card-elevated" style={{ border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Smart Financial Insights & Alerts
          </h3>
          <div style={{ display: 'grid', gap: '0.875rem' }}>
            {alerts.map((alert, idx) => {
              const isWarning = alert.type === 'warning'
              const isSuccess = alert.type === 'success'
              const accentColor = isWarning ? 'var(--warning)' : isSuccess ? 'var(--success)' : 'var(--primary)'
              const icon = isWarning ? '⚠️' : isSuccess ? '✨' : '💡'

              return (
                <div key={idx} style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface)',
                  borderLeft: `4px solid ${accentColor}`,
                  display: 'flex',
                  gap: '0.875rem',
                  alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      {alert.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { deleteHolding, sellHolding, addCash } from '@/app/dashboard/actions'

export default function DashboardCard({ type, title, holdings }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (holdings.length === 0) return null
  const isCash = type === 'CASH'

  // Calculate totals based on ALL holdings
  const totalValue = holdings.reduce((acc, h) => acc + (h.quantity * h.current_price), 0)
  const totalCost = holdings.reduce((acc, h) => acc + (h.quantity * h.purchase_price), 0)
  const totalGainLoss = totalValue - totalCost
  const gainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
  const isPositive = totalGainLoss >= 0

  const displayedHoldings = isExpanded ? holdings : holdings.slice(0, 5)
  const hasMore = holdings.length > 5

  return (
    <div className="card" style={{ border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)' }}>{title}</h3>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isCash ? 'Balance' : 'Value'}</div>
           <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalValue)}
           </div>
        </div>
      </div>
      
      {!isCash && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem', padding: '1.25rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius)' }}>
          <div>
            <div className="label">Investment</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalCost)}
            </div>
          </div>
          <div>
            <div className="label">Returns</div>
            <div className={isPositive ? 'text-success' : 'text-danger'} style={{ fontSize: '1.125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {isPositive ? '↗' : '↘'} {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(totalGainLoss))}
              <span style={{ fontSize: '0.8125rem', fontWeight: '400', opacity: 0.8 }}>
                ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="table-container" style={{ border: 'none', borderRadius: '0', flex: 1 }}>
        <table style={{ borderSpacing: '0 0.5rem', borderCollapse: 'separate', backgroundColor: 'transparent' }}>
          <thead>
            <tr>
              <th style={{ backgroundColor: 'transparent', padding: '0.75rem 1rem' }}>{isCash ? 'Bank' : 'Asset'}</th>
              {isCash && <th style={{ backgroundColor: 'transparent', padding: '0.75rem 1rem' }}>Category</th>}
              <th style={{ backgroundColor: 'transparent', padding: '0.75rem 1rem' }}>{isCash ? 'Current Amount' : 'Holdings'}</th>
              {!isCash && <th style={{ backgroundColor: 'transparent', padding: '0.75rem 1rem' }}>Avg. Cost</th>}
              {!isCash && <th style={{ backgroundColor: 'transparent', padding: '0.75rem 1rem' }}>Market Price</th>}
              {!isCash && <th style={{ backgroundColor: 'transparent', padding: '0.75rem 1rem' }}>Total Value</th>}
              <th style={{ backgroundColor: 'transparent', padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedHoldings.map((h) => {
              const hGainLoss = (h.current_price - h.purchase_price) * h.quantity
              const hPositive = hGainLoss >= 0
              return (
                <tr key={h.id} className="table-row-hover" style={{ backgroundColor: 'var(--bg-card)', transition: 'all 0.2s ease' }}>
                  <td style={{ padding: '1.25rem 1rem', borderRadius: '12px 0 0 12px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9375rem' }}>{isCash ? (h.bank_name || h.asset_name) : h.asset_name}</div>
                  </td>
                  {isCash && (
                    <td style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <span style={{ backgroundColor: 'var(--bg-surface)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: '500', color: 'var(--text-main)' }}>
                        {h.fund_type || 'Cash'}
                      </span>
                    </td>
                  )}
                  <td style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: '600', color: isCash ? 'var(--primary)' : 'inherit', fontSize: isCash ? '1.125rem' : 'inherit' }}>
                      {isCash ? '₹' : ''}{h.quantity.toLocaleString('en-IN')}
                    </span>
                  </td>
                  {!isCash && (
                    <>
                      <td style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        ₹{h.purchase_price.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>₹{h.current_price.toLocaleString('en-IN')}</span>
                      </td>
                      <td style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{(h.quantity * h.current_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                        <div className={hPositive ? 'text-success' : 'text-danger'} style={{ fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {hPositive ? '+' : ''}{hGainLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                      </td>
                    </>
                  )}
                  <td style={{ padding: '1.25rem 1rem', borderRadius: '0 12px 12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {isCash && (
                        <form action={addCash} style={{ 
                          display: 'flex', 
                          gap: '0.25rem', 
                          alignItems: 'center', 
                          backgroundColor: 'rgba(16, 185, 129, 0.05)', 
                          padding: '3px', 
                          borderRadius: '10px',
                          border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          <input type="hidden" name="id" value={h.id} />
                          <input 
                            type="number" 
                            name="quantity" 
                            placeholder="Add" 
                            step="any"
                            required
                            style={{ 
                              width: '60px', 
                              background: 'transparent', 
                              border: 'none', 
                              padding: '4px 8px', 
                              fontSize: '0.8125rem', 
                              outline: 'none', 
                              textAlign: 'center',
                              color: 'var(--success)',
                              fontWeight: '600'
                            }}
                          />
                          <button className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--success)', color: 'white' }}>Add</button>
                        </form>
                      )}
                      
                      <form action={sellHolding} style={{ 
                        display: 'flex', 
                        gap: '0.25rem', 
                        alignItems: 'center', 
                        backgroundColor: isCash ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-surface)', 
                        padding: '3px', 
                        borderRadius: '10px',
                        border: isCash ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border)'
                      }}>
                        <input type="hidden" name="id" value={h.id} />
                        <input 
                          type="number" 
                          name="quantity" 
                          placeholder={isCash ? "Withdraw" : "Qty"} 
                          step="any"
                          required
                          max={h.quantity}
                          style={{ 
                            width: isCash ? '80px' : '50px', 
                            background: 'transparent', 
                            border: 'none', 
                            padding: '4px 8px', 
                            fontSize: '0.8125rem', 
                            outline: 'none', 
                            textAlign: 'center',
                            color: isCash ? 'var(--error)' : 'var(--text-main)',
                            fontWeight: '600'
                          }}
                        />
                        <button className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '8px', backgroundColor: isCash ? 'var(--error)' : 'var(--primary)', color: 'white' }}>
                          {isCash ? 'Withdraw' : 'Sell'}
                        </button>
                      </form>

                      <form action={deleteHolding}>
                        <input type="hidden" name="id" value={h.id} />
                        <button className="btn" style={{ 
                          padding: '0.5rem', 
                          color: 'var(--text-muted)', 
                          borderRadius: '8px',
                          transition: 'all 0.2s ease'
                        }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--error)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ width: '100%', maxWidth: '200px' }}
          >
            {isExpanded ? (
              <>
                Show Less <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}><path d="m18 15-6-6-6 6"/></svg>
              </>
            ) : (
              <>
                Show {holdings.length - 5} More <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}><path d="m6 9 6 6 6-6"/></svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}


'use client'

import { useState } from 'react'
import { addHolding } from '@/app/dashboard/actions'

export default function AddHoldingForm() {
  const [loading, setLoading] = useState(false)
  const [assetType, setAssetType] = useState('STOCK')
  const [fundType, setFundType] = useState('Savings')
  const [customFundType, setCustomFundType] = useState('')

  async function handleSubmit(formData) {
    setLoading(true)
    // If it's CASH, ensure purchase_price is 1
    if (assetType === 'CASH') {
      formData.set('purchase_price', '1')
      formData.set('asset_name', formData.get('bank_name'))
      if (fundType === 'Other') {
        formData.set('fund_type', customFundType)
      } else {
        formData.set('fund_type', fundType)
      }
    }
    try {
      await addHolding(formData)
      document.getElementById('add-holding-form').reset()
      setAssetType('STOCK')
      setFundType('Savings')
      setCustomFundType('')
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card card-elevated" style={{ height: '100%' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--primary)' }}>Register Asset</h3>
      <form id="add-holding-form" action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {assetType !== 'CASH' ? (
          <div>
            <label className="label" htmlFor="asset_name">Asset Name / Symbol</label>
            <input className="input" placeholder="e.g., TCS.NS, RELIANCE" id="asset_name" name="asset_name" type="text" required />
          </div>
        ) : (
          <div>
            <label className="label" htmlFor="bank_name">Bank Name</label>
            <input className="input" placeholder="e.g. HDFC, SBI, ICICI" id="bank_name" name="bank_name" type="text" required />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label className="label" htmlFor="asset_type">Asset Type</label>
            <select className="input" id="asset_type" name="asset_type" required value={assetType} onChange={(e) => setAssetType(e.target.value)}>
              <option value="STOCK">Stock</option>
              <option value="MUTUAL_FUND">Mutual Fund</option>
              <option value="GOLD_ETF">Gold ETF</option>
              <option value="SILVER_ETF">Silver ETF</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="quantity">Quantity / Amount</label>
            <input className="input" placeholder="0.00" id="quantity" name="quantity" type="number" step="any" min="0" required />
          </div>
        </div>
        {assetType === 'CASH' && (
          <div style={{ display: 'grid', gridTemplateColumns: fundType === 'Other' ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
            <div>
              <label className="label" htmlFor="fund_type_select">Fund Type</label>
              <select className="input" id="fund_type_select" required value={fundType} onChange={(e) => setFundType(e.target.value)}>
                <option value="Savings">Savings</option>
                <option value="Emergency Fund">Emergency Fund</option>
                <option value="Fixed Deposit (FD)">Fixed Deposit (FD)</option>
                <option value="Liquid Fund">Liquid Fund</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {fundType === 'Other' && (
              <div>
                <label className="label" htmlFor="custom_fund_type">Custom Fund Type</label>
                <input className="input" placeholder="e.g. PPF, Wallet" id="custom_fund_type" type="text" required value={customFundType} onChange={(e) => setCustomFundType(e.target.value)} />
              </div>
            )}
          </div>
        )}
        {assetType !== 'CASH' && (
          <div>
            <label className="label" htmlFor="purchase_price">Buy Price (Average Cost)</label>
            <input className="input" placeholder="₹0.00" id="purchase_price" name="purchase_price" type="number" step="any" min="0" required />
          </div>
        )}
        <div style={{ marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', borderRadius: '10px' }} disabled={loading}>
            {loading ? 'Registering...' : 'Add to Portfolio'}
          </button>
        </div>
      </form>
    </div>
  )
}

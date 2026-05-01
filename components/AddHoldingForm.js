'use client'

import { useState } from 'react'
import { addHolding } from '@/app/dashboard/actions'

export default function AddHoldingForm() {
  const [loading, setLoading] = useState(false)
  const [assetType, setAssetType] = useState('STOCK')

  async function handleSubmit(formData) {
    setLoading(true)
    // If it's CASH, ensure purchase_price is 1
    if (assetType === 'CASH') {
      formData.set('purchase_price', '1')
    }
    try {
      await addHolding(formData)
      document.getElementById('add-holding-form').reset()
      setAssetType('STOCK')
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
        <div>
          <label className="label" htmlFor="asset_name">Asset Name / Symbol</label>
          <input className="input" placeholder={assetType === 'CASH' ? "e.g. Savings Account, Emergency Fund" : "e.g., TCS.NS, RELIANCE"} id="asset_name" name="asset_name" type="text" required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label className="label" htmlFor="asset_type">Asset Type</label>
            <select className="input" id="asset_type" name="asset_type" required value={assetType} onChange={(e) => setAssetType(e.target.value)}>
              <option value="STOCK">Stock</option>
              <option value="MUTUAL_FUND">Mutual Fund</option>
              <option value="GOLD_ETF">Gold ETF</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="quantity">Quantity / Amount</label>
            <input className="input" placeholder="0.00" id="quantity" name="quantity" type="number" step="any" min="0" required />
          </div>
        </div>
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

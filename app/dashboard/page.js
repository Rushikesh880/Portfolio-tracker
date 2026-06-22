import { getUserDb, getAdminDb } from '@/lib/db'
import DashboardCard from '@/components/DashboardCard'
import AddHoldingForm from '@/components/AddHoldingForm'
import AllocationChart from '@/components/AllocationChart'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { updatePricesInCache } from '@/lib/prices'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await getUserDb()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch holdings
  let { data: holdings, error } = await supabase.from('holdings').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching holdings:', error)
  }
  
  holdings = holdings || []

  // Fetch price cache
  const adminDb = getAdminDb()
  const { data: priceCache } = await adminDb.from('price_cache').select('*')
  
  const priceMap = {}
  let globalLastUpdated = null
  let hasErrorFallback = false
  
  if (priceCache) {
    priceCache.forEach(pc => {
      priceMap[`${pc.asset_type}-${pc.asset_name}`] = pc
      if (!globalLastUpdated || new Date(pc.last_updated) > new Date(globalLastUpdated)) {
        globalLastUpdated = pc.last_updated
      }
      if (pc.is_error_fallback) {
        hasErrorFallback = true
      }
    })
  }

  // Merge holdings with prices
  const enrichedHoldings = holdings.map(h => {
    const cache = priceMap[`${h.asset_type}-${h.asset_name}`]
    // If no cache, fallback to purchase price temporarily
    const current_price = cache ? cache.current_price : h.purchase_price
    return { ...h, current_price }
  })

  const stocks = enrichedHoldings.filter(h => h.asset_type === 'STOCK')
  const mutualFunds = enrichedHoldings.filter(h => h.asset_type === 'MUTUAL_FUND')
  const goldETFs = enrichedHoldings.filter(h => h.asset_type === 'GOLD_ETF')
  const cash = enrichedHoldings.filter(h => h.asset_type === 'CASH')

  // Calculate Global Summary
  const totalInvestment = enrichedHoldings.reduce((acc, h) => acc + (h.quantity * h.purchase_price), 0)
  const totalCurrentValue = enrichedHoldings.reduce((acc, h) => acc + (h.quantity * h.current_price), 0)
  const totalGainLoss = totalCurrentValue - totalInvestment
  const overallReturn = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0

  async function manualRefresh() {
    'use server'
    try {
      await updatePricesInCache()
      revalidatePath('/dashboard')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Dashboard</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
                Market Live
             </span>
             <span style={{ color: 'var(--border)' }}>|</span>
             <span>Refreshed: {globalLastUpdated ? new Date(globalLastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : 'Never'}</span>

             {hasErrorFallback && (
               <span style={{ color: '#f59e0b', fontWeight: '500', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>• Using Cached Data</span>
             )}

          </div>
        </div>
        <form action={manualRefresh}>
          <button className="btn btn-secondary" style={{ height: '44px', borderRadius: '10px', padding: '0 1.25rem' }}>
            Refresh Data
          </button>
        </form>
      </header>

      {/* Portfolio Summary Card */}
      <div className="card card-elevated" style={{ 
        marginBottom: '3rem', 
        padding: '2rem', 
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
        border: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem'
      }}>
        <div>
          <div className="label">Total Net Worth</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
            ₹{totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div>
          <div className="label">Total Investment</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            ₹{totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div>
          <div className="label">Total Returns</div>
          <div className={totalGainLoss >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {totalGainLoss >= 0 ? '↗' : '↘'} ₹{Math.abs(totalGainLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            <span style={{ fontSize: '0.875rem', fontWeight: '500', opacity: 0.9 }}>
              ({totalGainLoss >= 0 ? '+' : ''}{overallReturn.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card card-elevated" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)', fontWeight: '600' }}>Allocation</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Portfolio weight by asset class</p>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <AllocationChart holdings={enrichedHoldings} />
          </div>
        </div>
        <div style={{ minHeight: '380px' }}>
          <AddHoldingForm />
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2.5rem' }}>
        <DashboardCard type="STOCK" title="Equities" holdings={stocks} />
        <DashboardCard type="MUTUAL_FUND" title="Mutual Funds" holdings={mutualFunds} />
        <DashboardCard type="GOLD_ETF" title="Commodities" holdings={goldETFs} />
        <DashboardCard type="CASH" title="Liquid Assets" holdings={cash} />
      </div>

    </div>
  )
}


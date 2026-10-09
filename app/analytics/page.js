import { getUserDb } from '@/lib/db'
import { getPortfolioAnalytics } from '@/lib/analytics'
import { redirect } from 'next/navigation'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'StockBeacon - Portfolio Analytics & Insights',
  description: 'Daily performance tracking, benchmark comparison, and portfolio risk insights.',
}

export default async function AnalyticsPage() {
  const supabase = await getUserDb()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Pre-fetch default 1M data on the server for instant page load
  const initialAnalytics = await getPortfolioAnalytics(user.id, '1M')

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '6rem' }}>
      <AnalyticsDashboard initialData={initialAnalytics} />
    </div>
  )
}

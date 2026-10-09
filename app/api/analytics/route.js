import { NextResponse } from 'next/server'
import { getUserDb } from '@/lib/db'
import { getPortfolioAnalytics, clearAnalyticsCache } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const supabase = await getUserDb()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '1M'
    const refresh = searchParams.get('refresh') === 'true'

    if (refresh) {
      clearAnalyticsCache(user.id)
    }

    const analytics = await getPortfolioAnalytics(user.id, timeframe)
    return NextResponse.json({ success: true, data: analytics })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

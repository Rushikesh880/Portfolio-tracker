import { NextResponse } from 'next/server'
import { updatePricesInCache } from '@/lib/prices'

export async function POST(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== 'Bearer CRON_SECRET') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await updatePricesInCache()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Refresh API Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


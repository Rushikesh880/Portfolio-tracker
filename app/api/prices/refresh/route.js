import { NextResponse } from 'next/server'
import { updatePricesInCache } from '@/lib/prices'

export async function POST(request) {
  try {
    await updatePricesInCache()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Refresh API Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

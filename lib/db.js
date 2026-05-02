import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'

// For Admin actions (like cron job)
export function getAdminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase Admin environment variables (URL or Service Role Key)')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}


// For user actions
export async function getUserDb() {
  const supabase = await createServerClient()
  return supabase
}

// Helper to prepopulate sample data for a user
export async function prepopulateSampleData(userId, supabase) {
  const sampleData = [
    { user_id: userId, asset_name: 'TCS', asset_type: 'STOCK', quantity: 100, purchase_price: 3500 },
    { user_id: userId, asset_name: 'HDFC Mutual Fund', asset_type: 'MUTUAL_FUND', quantity: 500, purchase_price: 150 },
    { user_id: userId, asset_name: 'Gold ETF', asset_type: 'GOLD_ETF', quantity: 10, purchase_price: 6000 },
    { user_id: userId, asset_name: 'Bank Cash', asset_type: 'CASH', quantity: 50000, purchase_price: 1 }
  ];

  const { error } = await supabase.from('holdings').insert(sampleData)
  if (error) {
    console.error("Error prepopulating sample data:", error)
  }
}

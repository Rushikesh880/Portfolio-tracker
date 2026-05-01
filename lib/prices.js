import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()
import { getAdminDb } from './db'

export async function fetchCurrentPrice(asset_name, asset_type) {
  if (asset_type === 'CASH') {
    return 1.0;
  }

  try {
    // 1. Try to fetch directly if it's a valid symbol
    try {
      const directQuote = await yahooFinance.quote(asset_name)
      if (directQuote && directQuote.regularMarketPrice) return directQuote.regularMarketPrice
    } catch (e) {
      // Ignored, will fall back to search
    }

    // 2. Search for the asset and pick the best match
    const searchResults = await yahooFinance.search(asset_name)
    if (searchResults && searchResults.quotes && searchResults.quotes.length > 0) {
      // Prefer Indian exchanges (NSI/BSE), else first result
      const bestMatch = searchResults.quotes.find(q => q.exchange === 'NSI' || q.exchange === 'BSE') || searchResults.quotes[0]
      
      const quote = await yahooFinance.quote(bestMatch.symbol)
      if (quote && quote.regularMarketPrice) {
        return quote.regularMarketPrice
      }
    }
  } catch (error) {
    console.error(`Error fetching price for ${asset_name}:`, error.message)
  }
  
  return null; // Return null if failed
}

export async function updatePricesInCache() {
  const db = getAdminDb()
  
  // Get all unique assets across all users
  const { data: holdings, error } = await db.from('holdings').select('asset_name, asset_type')
  if (error) {
    console.error("Failed to fetch holdings for price update:", error)
    return
  }

  // Deduplicate
  const uniqueAssets = []
  const seen = new Set()
  for (const h of holdings) {
    const key = `${h.asset_type}-${h.asset_name}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueAssets.push(h)
    }
  }

  for (const asset of uniqueAssets) {
    const currentPrice = await fetchCurrentPrice(asset.asset_name, asset.asset_type)
    
    if (currentPrice !== null) {
      // Upsert into price cache
      await db.from('price_cache').upsert({
        asset_name: asset.asset_name,
        asset_type: asset.asset_type,
        current_price: currentPrice,
        last_updated: new Date().toISOString(),
        is_error_fallback: false
      }, { onConflict: 'asset_name,asset_type' })
    } else {
      // Mark as error fallback if not already exists, or just leave it
      const { data: existing } = await db.from('price_cache')
        .select('current_price')
        .eq('asset_name', asset.asset_name)
        .eq('asset_type', asset.asset_type)
        .single()
        
      if (!existing) {
        // We have no price at all, just use 1 as fallback
        await db.from('price_cache').upsert({
          asset_name: asset.asset_name,
          asset_type: asset.asset_type,
          current_price: 1, // Fallback
          last_updated: new Date().toISOString(),
          is_error_fallback: true
        }, { onConflict: 'asset_name,asset_type' })
      } else {
        await db.from('price_cache').update({
          is_error_fallback: true
        }).eq('asset_name', asset.asset_name).eq('asset_type', asset.asset_type)
      }
    }
  }

  // Cleanup: Remove assets from price_cache that are no longer in holdings
  // This prevents the "Using cached prices" warning from showing for deleted assets
  if (uniqueAssets.length > 0) {
    // We construct a filter to keep only currently held assets
    // Since Supabase doesn't support complex NOT IN with multiple columns easily in one go,
    // we'll fetch all cache IDs and delete the ones not in our current list.
    const { data: fullCache } = await db.from('price_cache').select('id, asset_name, asset_type')
    if (fullCache) {
      const currentKeys = new Set(uniqueAssets.map(a => `${a.asset_type}-${a.asset_name}`))
      const toDelete = fullCache.filter(c => !currentKeys.has(`${c.asset_type}-${c.asset_name}`)).map(c => c.id)
      
      if (toDelete.length > 0) {
        await db.from('price_cache').delete().in('id', toDelete)
      }
    }
  }
}

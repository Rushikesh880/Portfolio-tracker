import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()
import { getUserDb, getAdminDb } from './db.js'

// Simple in-memory cache to avoid hammering Yahoo Finance
// key: `${userId}_${timeframe}`, value: { timestamp, data }
const analyticsCache = new Map()
const CACHE_TTL_MS = 3 * 60 * 1000 // 3 minutes

export function clearAnalyticsCache(userId) {
  if (userId) {
    for (const key of analyticsCache.keys()) {
      if (key.startsWith(`${userId}_`)) {
        analyticsCache.delete(key)
      }
    }
  } else {
    analyticsCache.clear()
  }
}

export async function getPortfolioAnalytics(userId, timeframe = '1M') {
  const cacheKey = `${userId}_${timeframe}`
  const cached = analyticsCache.get(cacheKey)
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data
  }

  const supabase = await getUserDb()
  const { data: holdings, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error || !holdings || holdings.length === 0) {
    return {
      hasData: false,
      holdings: [],
      chartData: [],
      summary: null,
      insights: null
    }
  }

  // 1. Determine period start date
  const now = new Date()
  let daysBack = 30
  if (timeframe === '7D') daysBack = 7
  else if (timeframe === '1M') daysBack = 30
  else if (timeframe === '3M') daysBack = 90
  else if (timeframe === '6M') daysBack = 180
  else if (timeframe === '1Y') daysBack = 365
  else if (timeframe === 'ALL') daysBack = 500

  // Go back a few extra days to ensure we capture the first trading day of the range
  const period1 = new Date(now.getTime() - (daysBack + 5) * 86400000).toISOString().split('T')[0]

  // 2. Fetch NIFTY 50 Benchmark for date alignment and relative performance
  let benchQuotes = []
  try {
    const bench = await yahooFinance.chart('^NSEI', { period1, interval: '1d' }, { validateResult: false })
    if (bench && bench.quotes) {
      benchQuotes = bench.quotes
    }
  } catch (err) {
    console.warn("Could not fetch NIFTY 50 benchmark:", err.message)
  }

  // 3. Fetch historical quotes for all held market assets in parallel
  const marketHoldings = holdings.filter(h => h.asset_type !== 'CASH')
  const symbolQuotesMap = {}

  await Promise.all(
    marketHoldings.map(async (h) => {
      try {
        const res = await yahooFinance.chart(h.asset_name, { period1, interval: '1d' }, { validateResult: false })
        symbolQuotesMap[h.asset_name] = res?.quotes || []
      } catch (e) {
        symbolQuotesMap[h.asset_name] = []
      }
    })
  )

  // 4. Synthesize trading dates
  // If benchmark quotes exist, use their dates. Otherwise, merge unique dates from asset quotes.
  let tradingDates = []
  if (benchQuotes.length > 0) {
    tradingDates = benchQuotes.map(q => q.date.toISOString().split('T')[0])
  } else {
    const dateSet = new Set()
    Object.values(symbolQuotesMap).forEach(qList => {
      qList.forEach(q => dateSet.add(q.date.toISOString().split('T')[0]))
    })
    tradingDates = Array.from(dateSet).sort()
  }

  // Slice trading dates to target range limit (e.g. last 7, 21, 63, etc.)
  let targetTradingDays = daysBack
  if (daysBack === 7) targetTradingDays = 5
  else if (daysBack === 30) targetTradingDays = 22
  else if (daysBack === 90) targetTradingDays = 64
  else if (daysBack === 180) targetTradingDays = 126
  else if (daysBack === 365) targetTradingDays = 252

  if (tradingDates.length > targetTradingDays) {
    tradingDates = tradingDates.slice(-targetTradingDays)
  }

  // 5. Build daily price progression with forward-filling
  // Initialize last known price with purchase price or first available quote
  const lastKnownPrices = {}
  holdings.forEach(h => {
    lastKnownPrices[h.asset_name] = h.purchase_price
  })

  // Pre-seed with earliest quote if available
  holdings.forEach(h => {
    const list = symbolQuotesMap[h.asset_name] || []
    if (list.length > 0 && list[0].close != null) {
      lastKnownPrices[h.asset_name] = list[0].close
    }
  })

  const firstBenchQuote = benchQuotes.find(q => tradingDates.includes(q.date.toISOString().split('T')[0]))
  const firstBenchClose = firstBenchQuote?.close || 1

  let prevTotalVal = null
  let initialPeriodValue = 0

  const chartData = tradingDates.map((dateStr, idx) => {
    let dayTotalValue = 0
    let dayTotalInvested = 0

    holdings.forEach(h => {
      dayTotalInvested += (h.quantity * h.purchase_price)

      if (h.asset_type === 'CASH') {
        dayTotalValue += h.quantity
      } else {
        const list = symbolQuotesMap[h.asset_name] || []
        const match = list.find(q => q.date.toISOString().split('T')[0] === dateStr)
        if (match && match.close != null) {
          lastKnownPrices[h.asset_name] = match.close
        }
        dayTotalValue += (h.quantity * (lastKnownPrices[h.asset_name] || h.purchase_price))
      }
    })

    if (idx === 0) {
      initialPeriodValue = dayTotalValue
    }

    const dayChange = prevTotalVal === null ? 0 : Math.round(dayTotalValue - prevTotalVal)
    const dayChangePercent = prevTotalVal === null || prevTotalVal === 0 ? 0 : Number(((dayChange / prevTotalVal) * 100).toFixed(2))
    prevTotalVal = dayTotalValue

    // Benchmark comparison for this date
    const bMatch = benchQuotes.find(q => q.date.toISOString().split('T')[0] === dateStr)
    const benchReturnPercent = bMatch && firstBenchClose > 0 
      ? Number((((bMatch.close - firstBenchClose) / firstBenchClose) * 100).toFixed(2))
      : 0

    const cumulativePeriodReturnPercent = initialPeriodValue > 0
      ? Number((((dayTotalValue - initialPeriodValue) / initialPeriodValue) * 100).toFixed(2))
      : 0

    // Format human-friendly display date, e.g. "09 Oct"
    const parsedDate = new Date(dateStr)
    const displayDate = parsedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

    return {
      date: dateStr,
      displayDate,
      value: Math.round(dayTotalValue),
      invested: Math.round(dayTotalInvested),
      dayChange,
      dayChangePercent,
      isUp: dayChange >= 0,
      periodReturnPercent: cumulativePeriodReturnPercent,
      niftyReturnPercent: benchReturnPercent
    }
  })

  // 6. Compute period summary metrics
  const latestPoint = chartData[chartData.length - 1] || { value: 0, invested: 0, dayChange: 0, dayChangePercent: 0 }
  const firstPoint = chartData[0] || { value: 0 }

  const currentNetWorth = latestPoint.value
  const totalInvested = latestPoint.invested
  const totalGainLoss = currentNetWorth - totalInvested
  const totalReturnPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  const periodGainLoss = currentNetWorth - firstPoint.value
  const periodReturnPercent = firstPoint.value > 0 ? ((periodGainLoss / firstPoint.value) * 100) : 0

  // Up/down stats
  let upDays = 0
  let downDays = 0
  let maxUpDay = { date: '', amount: 0, percent: 0 }
  let maxDownDay = { date: '', amount: 0, percent: 0 }

  chartData.slice(1).forEach(pt => {
    if (pt.dayChange > 0) {
      upDays++
      if (pt.dayChange > maxUpDay.amount) {
        maxUpDay = { date: pt.displayDate, amount: pt.dayChange, percent: pt.dayChangePercent }
      }
    } else if (pt.dayChange < 0) {
      downDays++
      if (pt.dayChange < maxDownDay.amount) {
        maxDownDay = { date: pt.displayDate, amount: pt.dayChange, percent: pt.dayChangePercent }
      }
    }
  })

  const winRatePercent = (upDays + downDays) > 0 ? Math.round((upDays / (upDays + downDays)) * 100) : 0

  // Benchmark Alpha
  const lastNiftyReturn = latestPoint.niftyReturnPercent || 0
  const alpha = Number((periodReturnPercent - lastNiftyReturn).toFixed(2))

  // 7. Enriched Holdings with Latest Prices for Asset-level Insights
  const enrichedHoldings = holdings.map(h => {
    const currentPrice = h.asset_type === 'CASH' ? 1 : (lastKnownPrices[h.asset_name] || h.purchase_price)
    const currentValue = h.quantity * currentPrice
    const cost = h.quantity * h.purchase_price
    const gainLoss = currentValue - cost
    const returnPercent = cost > 0 ? (gainLoss / cost) * 100 : 0
    const weight = currentNetWorth > 0 ? (currentValue / currentNetWorth) * 100 : 0

    return {
      ...h,
      currentPrice,
      currentValue,
      gainLoss,
      returnPercent,
      weight
    }
  })

  // 8. Generate Smart Portfolio Insights
  const insights = generatePortfolioInsights(enrichedHoldings, currentNetWorth, {
    alpha,
    periodReturnPercent,
    winRatePercent,
    upDays,
    downDays,
    maxUpDay,
    maxDownDay
  })

  const result = {
    hasData: true,
    timeframe,
    chartData,
    summary: {
      currentNetWorth,
      totalInvested,
      totalGainLoss,
      totalReturnPercent: Number(totalReturnPercent.toFixed(2)),
      todayChange: latestPoint.dayChange,
      todayChangePercent: latestPoint.dayChangePercent,
      periodGainLoss,
      periodReturnPercent: Number(periodReturnPercent.toFixed(2)),
      niftyPeriodReturn: lastNiftyReturn,
      alpha,
      upDays,
      downDays,
      winRatePercent,
      maxUpDay,
      maxDownDay
    },
    insights
  }

  analyticsCache.set(cacheKey, { timestamp: Date.now(), data: result })
  return result
}

function generatePortfolioInsights(holdings, totalWorth, performance) {
  // A. Asset breakdown
  const assetClassTotals = {
    STOCK: 0,
    MUTUAL_FUND: 0,
    GOLD_ETF: 0,
    SILVER_ETF: 0,
    CASH: 0
  }

  holdings.forEach(h => {
    assetClassTotals[h.asset_type] = (assetClassTotals[h.asset_type] || 0) + h.currentValue
  })

  const equityTotal = assetClassTotals.STOCK + assetClassTotals.MUTUAL_FUND
  const metalsTotal = assetClassTotals.GOLD_ETF + assetClassTotals.SILVER_ETF
  const cashTotal = assetClassTotals.CASH

  const equityShare = totalWorth > 0 ? (equityTotal / totalWorth) * 100 : 0
  const metalsShare = totalWorth > 0 ? (metalsTotal / totalWorth) * 100 : 0
  const cashShare = totalWorth > 0 ? (cashTotal / totalWorth) * 100 : 0

  // B. Concentration Analysis
  const sortedByWeight = [...holdings].sort((a, b) => b.weight - a.weight)
  const largestHolding = sortedByWeight[0] || { asset_name: 'None', weight: 0 }

  // C. Health Score Calculation (0 to 100)
  // 1. Diversification Score (Max 35 pts)
  const activeClasses = Object.values(assetClassTotals).filter(v => (v / (totalWorth || 1)) >= 0.05).length
  let diversificationScore = 15
  if (activeClasses >= 4) diversificationScore = 35
  else if (activeClasses === 3) diversificationScore = 30
  else if (activeClasses === 2) diversificationScore = 22
  else diversificationScore = 15

  // 2. Concentration Risk (Max 35 pts)
  let concentrationScore = 35
  if (largestHolding.weight > 40) concentrationScore = 10
  else if (largestHolding.weight > 28) concentrationScore = 20
  else if (largestHolding.weight > 20) concentrationScore = 28
  else concentrationScore = 35

  // 3. Liquidity Safety Buffer (Max 30 pts)
  let liquidityScore = 30
  if (cashShare >= 8 && cashShare <= 25) liquidityScore = 30 // optimal
  else if (cashShare >= 4 && cashShare < 8) liquidityScore = 22
  else if (cashShare > 25 && cashShare <= 40) liquidityScore = 20
  else if (cashShare < 4) liquidityScore = 12 // liquidity crunch risk
  else liquidityScore = 15 // high cash drag

  const healthScore = Math.min(100, Math.max(10, diversificationScore + concentrationScore + liquidityScore))

  let healthStatus = 'Exceptional'
  let healthColor = '#10b981' // Emerald
  if (healthScore < 55) {
    healthStatus = 'High Concentration Risk'
    healthColor = '#ef4444' // Red
  } else if (healthScore < 72) {
    healthStatus = 'Moderate Diversification'
    healthColor = '#f59e0b' // Amber
  } else if (healthScore < 85) {
    healthStatus = 'Healthy & Balanced'
    healthColor = '#0d9488' // Teal
  }

  // D. Risk Profile
  let riskProfile = 'Balanced Growth'
  let riskBadgeColor = 'var(--secondary)'
  if (equityShare >= 65) {
    riskProfile = 'Aggressive Growth'
    riskBadgeColor = '#6366f1' // Indigo
  } else if (equityShare < 35 && cashShare >= 20) {
    riskProfile = 'Conservative Shield'
    riskBadgeColor = '#10b981' // Green
  }

  // E. Top Gainers & Draggers
  const nonCashHoldings = holdings.filter(h => h.asset_type !== 'CASH')
  const sortedByReturn = [...nonCashHoldings].sort((a, b) => b.returnPercent - a.returnPercent)
  const topGainers = sortedByReturn.slice(0, 3)
  const topLosers = [...nonCashHoldings].sort((a, b) => a.returnPercent - b.returnPercent).slice(0, 3)

  // F. Actionable Alerts & Opportunities
  const alerts = []

  if (largestHolding.weight > 25) {
    alerts.push({
      type: 'warning',
      title: 'High Single-Asset Exposure',
      description: `${largestHolding.asset_name} accounts for ${largestHolding.weight.toFixed(1)}% of your portfolio. Consider rebalancing if you wish to mitigate single-stock volatility.`
    })
  }

  if (cashShare < 5) {
    alerts.push({
      type: 'warning',
      title: 'Thin Liquid Cushion',
      description: `Only ${cashShare.toFixed(1)}% of your capital is in liquid cash or savings. Building a 10-15% emergency reserve helps seize market pullbacks.`
    })
  } else if (cashShare >= 10 && cashShare <= 25) {
    alerts.push({
      type: 'success',
      title: 'Optimal Cash Buffer',
      description: `You have ${cashShare.toFixed(1)}% in liquid funds (₹${Math.round(cashTotal).toLocaleString('en-IN')}), providing strong defense and dip-buying power.`
    })
  }

  if (metalsShare > 0) {
    alerts.push({
      type: 'info',
      title: 'Commodity Inflation Hedge Active',
      description: `You hold ${metalsShare.toFixed(1)}% in Gold/Silver ETFs, providing inflation hedge and non-correlated market protection.`
    })
  } else {
    alerts.push({
      type: 'info',
      title: 'Consider Precious Metals',
      description: `Allocating 5–10% to Gold or Silver ETFs can dampen portfolio drawdowns during equity market corrections.`
    })
  }

  if (performance.alpha > 0) {
    alerts.push({
      type: 'success',
      title: `Outperforming NIFTY 50 by +${performance.alpha.toFixed(1)}%`,
      description: `Your portfolio generated positive alpha compared to India's benchmark index over this timeframe.`
    })
  }

  return {
    healthScore,
    healthStatus,
    healthColor,
    riskProfile,
    riskBadgeColor,
    scoresBreakdown: {
      diversificationScore,
      concentrationScore,
      liquidityScore
    },
    assetBreakdown: {
      equityShare: Number(equityShare.toFixed(1)),
      metalsShare: Number(metalsShare.toFixed(1)),
      cashShare: Number(cashShare.toFixed(1)),
      equityTotal: Math.round(equityTotal),
      metalsTotal: Math.round(metalsTotal),
      cashTotal: Math.round(cashTotal)
    },
    largestHolding: {
      name: largestHolding.asset_name,
      weight: Number(largestHolding.weight.toFixed(1)),
      value: Math.round(largestHolding.currentValue)
    },
    topGainers,
    topLosers,
    alerts
  }
}

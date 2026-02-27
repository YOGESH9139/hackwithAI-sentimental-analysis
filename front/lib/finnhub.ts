// Finnhub API client - server-side only, never import this from client components
const FINNHUB_BASE = 'https://finnhub.io/api/v1'

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY
  if (!key || key === 'your_finnhub_api_key_here') {
    console.warn('FINNHUB_API_KEY is not set in .env.local')
  }
  return key || ''
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FinnhubQuote {
  c: number   // current price
  d: number   // change
  dp: number  // percent change
  h: number   // high of the day
  l: number   // low of the day
  o: number   // open price
  pc: number  // previous close
}

export interface FinnhubProfile {
  country: string
  currency: string
  exchange: string
  ipo: string
  logo: string
  marketCapitalization: number
  name: string
  phone: string
  shareOutstanding: number
  ticker: string
  weburl: string
  finnhubIndustry: string
}

export interface FinnhubMetric {
  metric: {
    '52WeekHigh': number
    '52WeekLow': number
    peBasicExclExtraTTM: number
    [key: string]: number
  }
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getQuote(symbol: string): Promise<FinnhubQuote> {
  const apiKey = getApiKey()
  const res = await fetch(
    `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
    { next: { revalidate: 30 } } // cache for 30 seconds
  )
  if (!res.ok) throw new Error(`Finnhub quote error: ${res.status}`)
  return res.json()
}

export async function getCompanyProfile(symbol: string): Promise<FinnhubProfile> {
  const apiKey = getApiKey()
  const res = await fetch(
    `${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
    { next: { revalidate: 3600 } } // profile changes rarely
  )
  if (!res.ok) throw new Error(`Finnhub profile error: ${res.status}`)
  return res.json()
}

export async function getBasicFinancials(symbol: string): Promise<FinnhubMetric> {
  const apiKey = getApiKey()
  const res = await fetch(
    `${FINNHUB_BASE}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${apiKey}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error(`Finnhub metrics error: ${res.status}`)
  return res.json()
}

export interface FinnhubSymbolLookup {
  count: number
  result: Array<{
    description: string
    displaySymbol: string
    symbol: string
    type: string
  }>
}

export async function searchSymbols(query: string): Promise<FinnhubSymbolLookup> {
  const apiKey = getApiKey()
  const res = await fetch(
    `${FINNHUB_BASE}/search?q=${encodeURIComponent(query)}&token=${apiKey}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error(`Finnhub search error: ${res.status}`)
  return res.json()
}

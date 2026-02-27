import { NextRequest, NextResponse } from 'next/server'

// Map our periods to Yahoo Finance ranges and intervals
function periodToYahoo(period: string): { range: string; interval: string } {
    switch (period) {
        case '1D': return { range: '1d', interval: '5m' }
        case '1W': return { range: '5d', interval: '15m' }
        case '1M': return { range: '1mo', interval: '1d' }
        case '3M': return { range: '3mo', interval: '1d' }
        case '1Y': return { range: '1y', interval: '1wk' }
        case 'ALL': return { range: 'max', interval: '1mo' }
        default: return { range: '1d', interval: '5m' }
    }
}

export async function GET(request: NextRequest) {
    const symbol = request.nextUrl.searchParams.get('symbol')
    const period = request.nextUrl.searchParams.get('period') || '1D'

    if (!symbol) {
        return NextResponse.json({ error: 'symbol is required' }, { status: 400 })
    }

    try {
        const { range, interval } = periodToYahoo(period)
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`

        const res = await fetch(url, { next: { revalidate: 60 } })

        if (!res.ok) {
            console.error(`Yahoo Finance Error: ${res.status} ${res.statusText}`)
            return NextResponse.json({ error: 'Failed to fetch from Yahoo Finance' }, { status: 502 })
        }

        const json = await res.json()
        const result = json?.chart?.result?.[0]

        if (!result || !result.timestamp) {
            return NextResponse.json({ error: 'No candle data available', s: 'no_data' }, { status: 404 })
        }

        const timestamps = result.timestamp
        const quote = result.indicators?.quote?.[0] || {}

        try {
            // Shape the data for recharts consumption
            const data = timestamps.map((timestamp: number, i: number) => {
                const date = new Date(timestamp * 1000)
                let timeLabel: string

                switch (period) {
                    case '1D':
                        timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        break
                    case '1W':
                        timeLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                        break
                    case '1M':
                    case '3M':
                        timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        break
                    case '1Y':
                        timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        break
                    case 'ALL':
                        timeLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                        break
                    default:
                        timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }

                const c = quote.close?.[i]
                const o = quote.open?.[i]
                const h = quote.high?.[i]
                const l = quote.low?.[i]
                const v = quote.volume?.[i]

                return {
                    time: timeLabel,
                    price: typeof c === 'number' ? c : (typeof o === 'number' ? o : 0),
                    open: typeof o === 'number' ? o : 0,
                    high: typeof h === 'number' ? h : 0,
                    low: typeof l === 'number' ? l : 0,
                    volume: typeof v === 'number' ? v : 0,
                }
            }).filter((d: { price: number }) => d.price > 0)

            if (data.length === 0) {
                return NextResponse.json({ error: 'No valid candle data available', s: 'no_data' }, { status: 404 })
            }

            return NextResponse.json({ data })
        } catch (mapError) {
            console.error('Mapping error:', mapError)
            return NextResponse.json({ error: 'Mapping error' }, { status: 500 })
        }
    } catch (error) {
        console.error('[/api/stock/candles]', error)
        return NextResponse.json(
            { error: 'Failed to fetch candle data' },
            { status: 500 }
        )
    }
}

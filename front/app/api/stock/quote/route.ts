import { NextRequest, NextResponse } from 'next/server'
import { getQuote } from '@/lib/finnhub'

export async function GET(request: NextRequest) {
    const symbol = request.nextUrl.searchParams.get('symbol')

    if (!symbol) {
        return NextResponse.json({ error: 'symbol is required' }, { status: 400 })
    }

    try {
        const quote = await getQuote(symbol.toUpperCase())
        return NextResponse.json(quote)
    } catch (error) {
        console.error('[/api/stock/quote]', error)
        return NextResponse.json(
            { error: 'Failed to fetch quote' },
            { status: 500 }
        )
    }
}

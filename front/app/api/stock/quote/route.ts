import { NextRequest, NextResponse } from 'next/server'
import { getQuote } from '@/lib/finnhub'

export async function GET(request: NextRequest) {
    const symbol = request.nextUrl.searchParams.get('symbol')

    if (!symbol) {
        return NextResponse.json({ error: 'symbol is required' }, { status: 400 })
    }

    try {
        const quote = await getQuote(symbol.toUpperCase())

        // Sanitize nulls to 0 to prevent frontend crashes on unsupported international stocks
        return NextResponse.json({
            c: quote.c ?? 0,
            d: quote.d ?? 0,
            dp: quote.dp ?? 0,
            h: quote.h ?? 0,
            l: quote.l ?? 0,
            o: quote.o ?? 0,
            pc: quote.pc ?? 0
        })
    } catch (error) {
        console.error('[/api/stock/quote]', error)
        return NextResponse.json(
            { error: 'Failed to fetch quote' },
            { status: 500 }
        )
    }
}

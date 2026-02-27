import { NextRequest, NextResponse } from 'next/server'
import { searchSymbols } from '@/lib/finnhub'

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('q')

    if (!query) {
        return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    try {
        const data = await searchSymbols(query)

        // Filter to only return common stocks, and limit to 10 results
        const results = data.result
            .filter(item => item.type === 'Common Stock')
            .slice(0, 10)
            .map(item => ({
                symbol: item.displaySymbol,
                name: item.description
            }))

        return NextResponse.json({ results })
    } catch (error) {
        console.error('[/api/stock/search]', error)
        return NextResponse.json(
            { error: 'Failed to search symbols' },
            { status: 500 }
        )
    }
}

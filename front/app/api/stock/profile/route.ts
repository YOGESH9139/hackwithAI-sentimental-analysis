import { NextRequest, NextResponse } from 'next/server'
import { getCompanyProfile, getBasicFinancials } from '@/lib/finnhub'

export async function GET(request: NextRequest) {
    const symbol = request.nextUrl.searchParams.get('symbol')

    if (!symbol) {
        return NextResponse.json({ error: 'symbol is required' }, { status: 400 })
    }

    try {
        const [profile, metrics] = await Promise.all([
            getCompanyProfile(symbol.toUpperCase()),
            getBasicFinancials(symbol.toUpperCase()),
        ])

        return NextResponse.json({
            name: profile.name || symbol.toUpperCase(),
            sector: profile.finnhubIndustry || 'Unknown',
            exchange: profile.exchange || 'Unknown',
            marketCap: profile.marketCapitalization || 0,
            logo: profile.logo || '',
            weburl: profile.weburl || '',
            high52w: metrics?.metric?.['52WeekHigh'] || 0,
            low52w: metrics?.metric?.['52WeekLow'] || 0,
            peRatio: metrics?.metric?.peBasicExclExtraTTM || 0,
        })
    } catch (error) {
        console.error('[/api/stock/profile]', error)
        return NextResponse.json(
            { error: 'Failed to fetch company profile' },
            { status: 500 }
        )
    }
}

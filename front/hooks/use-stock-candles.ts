"use client"

import { useState, useEffect } from 'react'

export interface CandlePoint {
    time: string
    price: number
    open: number
    high: number
    low: number
    volume: number
}

interface UseStockCandlesResult {
    data: CandlePoint[]
    isLoading: boolean
    error: string | null
}

export function useStockCandles(symbol: string, period: string): UseStockCandlesResult {
    const [data, setData] = useState<CandlePoint[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!symbol) return

        let cancelled = false

        async function fetchCandles() {
            setIsLoading(true)
            setError(null)
            try {
                const res = await fetch(
                    `/api/stock/candles?symbol=${encodeURIComponent(symbol)}&period=${encodeURIComponent(period)}`
                )
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const json = await res.json()
                if (!cancelled) setData(json.data || [])
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchCandles()

        return () => {
            cancelled = true
        }
    }, [symbol, period])

    return { data, isLoading, error }
}

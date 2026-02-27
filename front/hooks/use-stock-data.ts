"use client"

import { useState, useEffect } from 'react'

export interface StockQuote {
    c: number   // current price
    d: number   // change
    dp: number  // percent change
    h: number   // high of the day
    l: number   // low of the day
    o: number   // open price
    pc: number  // previous close
}

interface UseStockDataResult {
    data: StockQuote | null
    isLoading: boolean
    error: string | null
}

export function useStockData(symbol: string): UseStockDataResult {
    const [data, setData] = useState<StockQuote | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!symbol) return

        let cancelled = false

        async function fetchQuote() {
            setIsLoading(true)
            setError(null)
            try {
                const res = await fetch(`/api/stock/quote?symbol=${encodeURIComponent(symbol)}`)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const json = await res.json()
                if (!cancelled) setData(json)
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchQuote()
        // Refresh every 30 seconds
        const interval = setInterval(fetchQuote, 30_000)

        return () => {
            cancelled = true
            clearInterval(interval)
        }
    }, [symbol])

    return { data, isLoading, error }
}

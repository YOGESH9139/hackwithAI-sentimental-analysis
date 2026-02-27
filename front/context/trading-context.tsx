"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/auth-context'

export interface Position {
    symbol: string
    shares: number
    averageCost: number
}

export interface Order {
    id: string
    symbol: string
    type: 'buy' | 'sell'
    shares: number
    price: number
    timestamp: string
    total: number
}

interface TradingContextType {
    cashBalance: number
    positions: Position[]
    orders: Order[]
    executeTrade: (symbol: string, action: 'buy' | 'sell', shares: number, currentPrice: number) => { success: boolean, message: string }
    resetPortfolio: () => void
}

const STARTING_BALANCE = 10000

const TradingContext = createContext<TradingContextType | undefined>(undefined)

export function TradingProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoading: authLoading } = useAuth()
    const storageKey = user ? `aegis_trading_state_${user.username}` : null

    const [cashBalance, setCashBalance] = useState<number>(STARTING_BALANCE)
    const [positions, setPositions] = useState<Position[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load state from localStorage on mount or when user changes
    useEffect(() => {
        if (authLoading) return

        if (!storageKey) {
            setCashBalance(STARTING_BALANCE)
            setPositions([])
            setOrders([])
            setIsLoaded(true)
            return
        }

        try {
            const savedData = localStorage.getItem(storageKey)
            if (savedData) {
                const parsed = JSON.parse(savedData)
                setCashBalance(typeof parsed.cashBalance === 'number' ? parsed.cashBalance : STARTING_BALANCE)
                setPositions(Array.isArray(parsed.positions) ? parsed.positions : [])
                setOrders(Array.isArray(parsed.orders) ? parsed.orders : [])
            } else {
                setCashBalance(STARTING_BALANCE)
                setPositions([])
                setOrders([])
            }
        } catch (error) {
            console.error('Failed to load trading state:', error)
            setCashBalance(STARTING_BALANCE)
            setPositions([])
            setOrders([])
        } finally {
            setIsLoaded(true)
        }
    }, [storageKey, authLoading])

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (!isLoaded || !storageKey) return
        try {
            localStorage.setItem(storageKey, JSON.stringify({ cashBalance, positions, orders }))
        } catch (error) {
            console.error('Failed to save trading state:', error)
        }
    }, [cashBalance, positions, orders, isLoaded, storageKey])

    const executeTrade = useCallback((symbol: string, action: 'buy' | 'sell', shares: number, currentPrice: number) => {
        const totalCost = shares * currentPrice
        const upperSymbol = symbol.toUpperCase()

        // Validations
        if (shares <= 0) return { success: false, message: 'Invalid share quantity.' }
        if (action === 'buy' && cashBalance < totalCost) {
            return { success: false, message: 'Insufficient cash balance.' }
        }

        const existingPositionIndex = positions.findIndex(p => p.symbol === upperSymbol)
        const existingPosition = existingPositionIndex >= 0 ? positions[existingPositionIndex] : null

        if (action === 'sell') {
            if (!existingPosition || existingPosition.shares < shares) {
                return { success: false, message: 'Insufficient shares to sell.' }
            }
        }

        // Execute Trade
        const newContextState = { ... { cashBalance, positions, orders } }

        if (action === 'buy') {
            newContextState.cashBalance -= totalCost

            if (existingPosition) {
                // Update average cost
                const currentTotalCost = existingPosition.shares * existingPosition.averageCost
                const newTotalShares = existingPosition.shares + shares
                const newAverageCost = (currentTotalCost + totalCost) / newTotalShares

                const newPositions = [...positions]
                newPositions[existingPositionIndex] = {
                    symbol: upperSymbol,
                    shares: newTotalShares,
                    averageCost: newAverageCost
                }
                newContextState.positions = newPositions
            } else {
                // Add new position
                newContextState.positions = [...positions, { symbol: upperSymbol, shares, averageCost: currentPrice }]
            }
        } else {
            // Sell
            newContextState.cashBalance += totalCost

            const newPositions = [...positions]
            const newShares = existingPosition!.shares - shares

            if (newShares <= 0) {
                newPositions.splice(existingPositionIndex, 1) // Remove position if fully closed
            } else {
                newPositions[existingPositionIndex] = { ...existingPosition!, shares: newShares }
            }
            newContextState.positions = newPositions
        }

        // Log Order
        const newOrder: Order = {
            id: crypto.randomUUID(),
            symbol: upperSymbol,
            type: action,
            shares,
            price: currentPrice,
            timestamp: new Date().toISOString(),
            total: totalCost
        }

        setCashBalance(newContextState.cashBalance)
        setPositions(newContextState.positions)
        setOrders(prev => [newOrder, ...prev])

        return {
            success: true,
            message: `Successfully ${action === 'buy' ? 'bought' : 'sold'} ${shares} shares of ${upperSymbol}.`
        }
    }, [cashBalance, positions, orders])

    const resetPortfolio = useCallback(() => {
        setCashBalance(STARTING_BALANCE)
        setPositions([])
        setOrders([])
    }, [])

    return (
        <TradingContext.Provider value={{ cashBalance, positions, orders, executeTrade, resetPortfolio }}>
            {children}
        </TradingContext.Provider>
    )
}

export function useTrading() {
    const context = useContext(TradingContext)
    if (context === undefined) {
        throw new Error('useTrading must be used within a TradingProvider')
    }
    return context
}

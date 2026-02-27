"use client"

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTrading } from '@/context/trading-context'
import { formatCurrency } from '@/lib/utils'

interface TradeDialogProps {
    isOpen: boolean
    onClose: () => void
    symbol: string
    action: 'buy' | 'sell' | null
    currentPrice: number
}

export function TradeDialog({ isOpen, onClose, symbol, action, currentPrice }: TradeDialogProps) {
    const { cashBalance, positions, executeTrade } = useTrading()
    const [sharesStr, setSharesStr] = useState('1')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const shares = parseInt(sharesStr) || 0
    const totalCost = shares * currentPrice

    const existingPosition = positions.find(p => p.symbol === symbol.toUpperCase())
    const ownedShares = existingPosition?.shares || 0

    useEffect(() => {
        if (isOpen) {
            setSharesStr('1')
            setError(null)
            setSuccess(null)
        }
    }, [isOpen])

    const handleTrade = () => {
        setError(null)
        if (shares <= 0) {
            setError('Please enter a valid number of shares.')
            return
        }

        if (action === 'buy' && totalCost > cashBalance) {
            setError('Insufficient funds for this trade.')
            return
        }

        if (action === 'sell' && shares > ownedShares) {
            setError(`You only own ${ownedShares} shares.`)
            return
        }

        const result = executeTrade(symbol, action!, shares, currentPrice)
        if (result.success) {
            setSuccess(result.message)
            setTimeout(() => {
                onClose()
            }, 1500)
        } else {
            setError(result.message)
        }
    }

    if (!action) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-[#0a0a0f] border-white/10 text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        {action === 'buy' ? 'Buy' : 'Sell'} {symbol.toUpperCase()}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Current Price: <span className="text-foreground font-mono">{formatCurrency(currentPrice, symbol)}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Number of Shares</label>
                        <Input
                            type="number"
                            min="1"
                            value={sharesStr}
                            onChange={(e) => setSharesStr(e.target.value)}
                            className="bg-white/5 border-white/10 font-mono text-lg"
                            autoFocus
                        />
                    </div>

                    <div className="p-4 rounded-lg bg-white/5 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Available Cash</span>
                            <span className="font-mono">{formatCurrency(cashBalance)}</span>
                        </div>
                        {action === 'sell' && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shares Owned</span>
                                <span className="font-mono">{ownedShares}</span>
                            </div>
                        )}
                        <div className="h-px bg-white/10 my-2" />
                        <div className="flex justify-between font-medium">
                            <span>Estimated {action === 'buy' ? 'Cost' : 'Credit'}</span>
                            <span className="font-mono text-primary">{formatCurrency(totalCost, symbol)}</span>
                        </div>
                        {action === 'buy' && (
                            <div className="flex justify-between text-sm pt-1">
                                <span className="text-muted-foreground">Remaining Cash</span>
                                <span className={`font-mono ${cashBalance - totalCost < 0 ? 'text-red-500' : ''}`}>
                                    {formatCurrency(cashBalance - totalCost)}
                                </span>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>}
                    {success && <p className="text-sm text-[#00D094] bg-[#00D094]/10 p-2 rounded">{success}</p>}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="border-white/10">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleTrade}
                        disabled={!!success || shares <= 0 || (action === 'buy' && totalCost > cashBalance) || (action === 'sell' && shares > ownedShares)}
                        className={action === 'buy' ? 'bg-[#00D094] text-[#0a0a0f] hover:bg-[#00D094]/90' : 'bg-red-500 text-white hover:bg-red-600'}
                    >
                        {success ? 'Success!' : `Confirm ${action === 'buy' ? 'Buy' : 'Sell'}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

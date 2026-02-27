import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, symbol: string = '', currencyCode?: string): string {
  let code = currencyCode || 'USD';
  const sym = symbol.toUpperCase();

  if (!currencyCode) {
    if (sym.endsWith('.NS') || sym.endsWith('.BO')) code = 'INR';
    else if (sym.endsWith('.L')) code = 'GBP';
    else if (sym.endsWith('.TO')) code = 'CAD';
    else if (sym.endsWith('.AX')) code = 'AUD';
    else if (sym.endsWith('.T')) code = 'JPY';
    else if (sym.endsWith('.HK')) code = 'HKD';
    else if (sym.endsWith('.SZ') || sym.endsWith('.SS')) code = 'CNY';
    else if (sym.endsWith('.DE') || sym.endsWith('.PA') || sym.endsWith('.AS') || sym.endsWith('.MI') || sym.endsWith('.MC')) code = 'EUR';
    else if (sym.endsWith('.KS')) code = 'KRW';
    else if (sym.endsWith('.TW')) code = 'TWD';
    else if (sym.endsWith('.SA')) code = 'BRL';
    else if (sym.endsWith('.ME')) code = 'RUB';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  } catch (e) {
    // Fallback if currency code is unsupported
    return `¤${value.toFixed(2)}`;
  }
}

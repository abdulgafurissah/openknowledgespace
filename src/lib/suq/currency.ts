/**
 * Open Suq Currency & Financial Utilities
 * Ensures precision arithmetic for monetary amounts.
 */

export const DEFAULT_CURRENCY = 'GHS';
export const CURRENCY_SYMBOLS: Record<string, string> = {
  GHS: 'GH₵',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

// Indicative FX rates for international customer preview
// Note: Final settlement at Paystack checkout is in GHS.
export const FX_RATES_TO_GHS: Record<string, number> = {
  GHS: 1.0,
  USD: 0.065,  // ~15.4 GHS per USD
  GBP: 0.051,  // ~19.6 GHS per GBP
  EUR: 0.060,  // ~16.6 GHS per EUR
};

/**
 * Format monetary amount in GHS or other currency
 */
export function formatCurrency(
  amountInGHS: number | string,
  currency: string = 'GHS',
  showCode: boolean = false
): string {
  const numericAmount = typeof amountInGHS === 'string' ? parseFloat(amountInGHS) : amountInGHS;
  if (isNaN(numericAmount)) return `${CURRENCY_SYMBOLS[currency] ?? ''}0.00`;

  const rate = FX_RATES_TO_GHS[currency] ?? 1.0;
  const converted = currency === 'GHS' ? numericAmount : numericAmount * rate;

  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formatted = converted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showCode ? `${symbol}${formatted} ${currency}` : `${symbol}${formatted}`;
}

/**
 * Converts decimal GHS to integer minor unit (pesewas) for Paystack
 * Example: 25.50 GHS -> 2550 pesewas
 */
export function toPesewas(amountInGHS: number | string): number {
  const numericAmount = typeof amountInGHS === 'string' ? parseFloat(amountInGHS) : amountInGHS;
  return Math.round(numericAmount * 100);
}

/**
 * Converts integer minor unit (pesewas) to decimal GHS
 * Example: 2550 pesewas -> 25.50 GHS
 */
export function fromPesewas(pesewas: number): string {
  return (pesewas / 100).toFixed(2);
}

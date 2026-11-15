/**
 * Open Suq Intelligent Pricing Engine
 * Calculates retail prices, payment processing costs, production expenses,
 * and estimated net profit margins using precision-safe financial mathematics.
 */

export interface PricingBreakdown {
  retailPrice: number;        // Final customer price in GHS
  productionCost: number;     // POD cost in GHS
  shippingCost: number;       // Shipping rate in GHS
  paystackFee: number;        // Estimated Paystack gateway fee in GHS
  estimatedGrossProfit: number; // Retail - Production
  estimatedNetProfit: number;   // Retail - Production - PaystackFee
  profitMarginPercent: number;  // (Net Profit / Retail Price) * 100
}

export interface PricingRule {
  type: 'fixed_markup' | 'percentage_markup';
  value: number; // e.g. 50 (GHS) or 45 (%)
}

/**
 * Calculates Paystack transaction fee for Ghana merchant
 * Local transactions: 1.95% (capped/standard in Ghana)
 * International cards: 3.9% standard cross-border
 */
export function calculatePaystackFee(
  amountInGHS: number,
  isInternational: boolean = false
): number {
  if (amountInGHS <= 0) return 0;
  const rate = isInternational ? 0.039 : 0.0195;
  const flatFee = isInternational ? 0 : 0.50; // 50 pesewas local fee
  const fee = amountInGHS * rate + flatFee;
  return Math.round(fee * 100) / 100;
}

/**
 * Calculate complete pricing breakdown
 */
export function calculatePricingBreakdown(
  retailPriceInGHS: number,
  productionCostInGHS: number,
  shippingCostInGHS: number = 0,
  isInternational: boolean = false
): PricingBreakdown {
  const paystackFee = calculatePaystackFee(retailPriceInGHS + shippingCostInGHS, isInternational);
  const estimatedGrossProfit = retailPriceInGHS - productionCostInGHS;
  const estimatedNetProfit = estimatedGrossProfit - paystackFee;
  const profitMarginPercent = retailPriceInGHS > 0
    ? Math.round((estimatedNetProfit / retailPriceInGHS) * 1000) / 10
    : 0;

  return {
    retailPrice: Math.round(retailPriceInGHS * 100) / 100,
    productionCost: Math.round(productionCostInGHS * 100) / 100,
    shippingCost: Math.round(shippingCostInGHS * 100) / 100,
    paystackFee: Math.round(paystackFee * 100) / 100,
    estimatedGrossProfit: Math.round(estimatedGrossProfit * 100) / 100,
    estimatedNetProfit: Math.round(estimatedNetProfit * 100) / 100,
    profitMarginPercent,
  };
}

/**
 * Apply automated pricing rule on top of POD production cost
 */
export function applyPricingRule(
  podProductionCostGHS: number,
  rule: PricingRule
): number {
  if (rule.type === 'percentage_markup') {
    return Math.round(podProductionCostGHS * (1 + rule.value / 100) * 100) / 100;
  }
  return Math.round((podProductionCostGHS + rule.value) * 100) / 100;
}

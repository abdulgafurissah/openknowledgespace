/**
 * Fulfilment Provider Abstraction
 * Allows seamless addition of Printful, Gelato, or local Ghanaian print facilities
 * in the future without modifying core order management or checkout logic.
 */

export interface FulfilmentRecipient {
  name: string;
  email?: string;
  phoneNumber?: string;
  address: {
    line1: string;
    line2?: string;
    postalOrZipCode?: string;
    townOrCity: string;
    stateOrCounty?: string;
    countryCode: string; // ISO 2-letter, e.g. "GH", "GB", "US"
  };
}

export interface FulfilmentAsset {
  printArea: string; // 'default' | 'front' | 'back' | 'wrap'
  url: string;       // Public URL of print-ready PDF or high-res PNG/JPEG
}

export interface FulfilmentItem {
  sku: string;         // Prodigi SKU e.g. "GLOBAL-TSH-M-BLK" or "GLOBAL-CAN-16X24-BLK"
  copies: number;
  sizing?: 'fillPrintArea' | 'fitPrintArea' | 'stretchToPrintArea';
  assets: FulfilmentAsset[];
  attributes?: Record<string, string>;
}

export interface ShippingQuoteRequest {
  destination: {
    countryCode: string;
    postalOrZipCode?: string;
    townOrCity?: string;
  };
  items: {
    sku: string;
    copies: number;
    assets?: FulfilmentAsset[];
  }[];
  shippingMethod?: 'Standard' | 'Express' | 'Overnight';
}

export interface ShippingQuoteOption {
  method: string;          // 'Standard' | 'Express' | 'Budget'
  carrier?: string;
  cost: number;            // Cost in currency
  currency: string;        // 'GBP', 'USD', 'EUR', etc.
  estimatedDays?: string;  // e.g. "3-5 business days"
}

export interface FulfilmentOrderRequest {
  merchantReference: string; // e.g. "OS-2026-0001"
  shippingMethod: string;    // 'Standard' | 'Express'
  recipient: FulfilmentRecipient;
  items: FulfilmentItem[];
  callbackUrl?: string;      // Webhook URL
  metadata?: Record<string, any>;
}

export interface FulfilmentOrderResponse {
  id: string;                // External provider ID e.g. "ord_12345"
  status: 'draft' | 'submitted' | 'in_production' | 'shipped' | 'cancelled' | 'failed';
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  totalCost?: number;
  currency?: string;
  rawResponse?: any;
}

export interface FulfilmentProvider {
  name: string;
  getShippingQuote(request: ShippingQuoteRequest): Promise<ShippingQuoteOption[]>;
  createOrder(request: FulfilmentOrderRequest): Promise<FulfilmentOrderResponse>;
  getOrderStatus(orderId: string): Promise<FulfilmentOrderResponse>;
  cancelOrder(orderId: string): Promise<boolean>;
}

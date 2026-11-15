/**
 * Official Prodigi Print API v4.0 Client
 * Documentation: https://www.prodigi.com/print-api/docs/
 */

import {
  FulfilmentProvider,
  ShippingQuoteRequest,
  ShippingQuoteOption,
  FulfilmentOrderRequest,
  FulfilmentOrderResponse,
} from '@/lib/fulfilment/types';

export class ProdigiClient implements FulfilmentProvider {
  name = 'PRODIGI';

  private apiKey: string;
  private baseUrl: string;
  private isSandbox: boolean;

  constructor() {
    this.apiKey = process.env.PRODIGI_API_KEY || '';
    const env = (process.env.PRODIGI_ENVIRONMENT || 'sandbox').toLowerCase();
    this.isSandbox = env !== 'production';
    this.baseUrl = this.isSandbox
      ? 'https://api.sandbox.prodigi.com/v4.0'
      : 'https://api.prodigi.com/v4.0';
  }

  private get headers(): HeadersInit {
    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Check whether Prodigi credentials are configured
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5 && !this.apiKey.includes('your-'));
  }

  /**
   * Calculate Shipping and Production Quotes via POST /quotes
   */
  async getShippingQuote(request: ShippingQuoteRequest): Promise<ShippingQuoteOption[]> {
    if (!this.isConfigured()) {
      return this.getSimulatedQuote(request);
    }

    try {
      const payload = {
        shippingMethod: request.shippingMethod || 'Standard',
        recipient: {
          address: {
            postalOrZipCode: request.destination.postalOrZipCode || '00233',
            countryCode: request.destination.countryCode,
            townOrCity: request.destination.townOrCity || '',
          },
        },
        items: request.items.map(i => ({
          sku: i.sku,
          copies: i.copies,
          sizing: 'fillPrintArea',
          assets: i.assets && i.assets.length > 0
            ? i.assets.map(a => ({ printArea: a.printArea || 'default', url: a.url }))
            : [{ printArea: 'default', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80' }],
        })),
      };

      const res = await fetch(`${this.baseUrl}/quotes`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn('[Prodigi Quotes Warning]', res.status, errorData);
        // Fallback to destination-aware estimate if Prodigi quote fails (e.g. invalid test SKU)
        return this.getSimulatedQuote(request);
      }

      const data = await res.json();
      const quotes: ShippingQuoteOption[] = [];

      if (data.quotes && Array.isArray(data.quotes)) {
        for (const q of data.quotes) {
          const costAmount = parseFloat(q.cost?.amount || '0');
          quotes.push({
            method: q.shippingMethod || 'Standard',
            carrier: q.fulfillmentLocation?.carrier || 'International Express',
            cost: costAmount,
            currency: q.cost?.currency || 'GBP',
            estimatedDays: q.fulfillmentLocation?.estimatedDeliveryDays || '4-7 business days',
          });
        }
      }

      return quotes.length > 0 ? quotes : this.getSimulatedQuote(request);
    } catch (err) {
      console.error('[Prodigi Quote Fetch Exception]', err);
      return this.getSimulatedQuote(request);
    }
  }

  /**
   * Submit an order for manufacturing via POST /orders
   */
  async createOrder(request: FulfilmentOrderRequest): Promise<FulfilmentOrderResponse> {
    if (!this.isConfigured()) {
      return this.getSimulatedOrderResponse(request);
    }

    try {
      const payload = {
        merchantReference: request.merchantReference,
        shippingMethod: request.shippingMethod || 'Standard',
        recipient: {
          name: request.recipient.name,
          phoneNumber: request.recipient.phoneNumber,
          email: request.recipient.email,
          address: {
            line1: request.recipient.address.line1,
            line2: request.recipient.address.line2 || '',
            postalOrZipCode: request.recipient.address.postalOrZipCode || '',
            townOrCity: request.recipient.address.townOrCity,
            stateOrCounty: request.recipient.address.stateOrCounty || '',
            countryCode: request.recipient.address.countryCode,
          },
        },
        items: request.items.map(i => ({
          sku: i.sku,
          copies: i.copies,
          sizing: i.sizing || 'fillPrintArea',
          assets: i.assets.map(a => ({
            printArea: a.printArea || 'default',
            url: a.url,
          })),
        })),
        callbackUrl: request.callbackUrl,
        metadata: {
          ...request.metadata,
          source: 'OpenSuq_OpenKnowledgeSpace',
        },
      };

      const res = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.details || `Prodigi API error: ${res.statusText}`
        );
      }

      const order = data.order || {};
      const stage = (order.status?.stage || 'Draft').toLowerCase();

      return {
        id: order.id,
        status: stage === 'inprogress' ? 'in_production' : (stage as any),
        totalCost: order.charges?.[0]?.total?.amount ? parseFloat(order.charges[0].total.amount) : undefined,
        currency: order.charges?.[0]?.total?.currency || 'GBP',
        rawResponse: data,
      };
    } catch (err: any) {
      console.error('[Prodigi Create Order Error]', err);
      return {
        id: `failed_${Date.now()}`,
        status: 'failed',
        rawResponse: { error: err.message },
      };
    }
  }

  /**
   * Get order status and tracking details via GET /orders/{orderId}
   */
  async getOrderStatus(orderId: string): Promise<FulfilmentOrderResponse> {
    if (!this.isConfigured() || orderId.startsWith('sim_')) {
      return {
        id: orderId,
        status: 'in_production',
        trackingNumber: 'TRK-GH-998811',
        trackingUrl: 'https://track.example.com',
        carrier: 'DHL Express International',
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch order status from Prodigi: ${res.status}`);
      }

      const data = await res.json();
      const order = data.order || {};
      const shipments = order.shipments || [];
      const primaryShipment = shipments[0];

      let mappedStatus: FulfilmentOrderResponse['status'] = 'in_production';
      const stage = (order.status?.stage || '').toLowerCase();
      if (stage === 'complete' || stage === 'shipped') mappedStatus = 'shipped';
      else if (stage === 'cancelled') mappedStatus = 'cancelled';
      else if (stage === 'draft') mappedStatus = 'draft';

      return {
        id: order.id,
        status: mappedStatus,
        trackingNumber: primaryShipment?.tracking?.number,
        trackingUrl: primaryShipment?.tracking?.url,
        carrier: primaryShipment?.carrier?.name,
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        id: orderId,
        status: 'failed',
        rawResponse: { error: err.message },
      };
    }
  }

  /**
   * Cancel order via POST /orders/{orderId}/actions/cancel
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    if (!this.isConfigured()) return true;

    try {
      const res = await fetch(`${this.baseUrl}/orders/${orderId}/actions/cancel`, {
        method: 'POST',
        headers: this.headers,
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Query product catalogue specifications via GET /products/{sku}
   */
  async getProductCatalogueDetails(sku: string): Promise<any | null> {
    if (!this.isConfigured()) return null;

    try {
      const res = await fetch(`${this.baseUrl}/products/${sku}`, {
        method: 'GET',
        headers: this.headers,
        next: { revalidate: 3600 }, // Cache catalogue responses for 1 hour
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Realistic shipping simulation for local/international destinations
   * Used as fallback or during initial test setup before production API key is active.
   */
  private getSimulatedQuote(request: ShippingQuoteRequest): ShippingQuoteOption[] {
    const isGhana = request.destination.countryCode.toUpperCase() === 'GH';
    const isUK = request.destination.countryCode.toUpperCase() === 'GB';
    const isUS = request.destination.countryCode.toUpperCase() === 'US';

    let standardCost = 15.0; // in GBP
    let expressCost = 28.0;

    if (isGhana) {
      standardCost = 18.0; // ~GHS 270 int'l courier
      expressCost = 35.0;
    } else if (isUK) {
      standardCost = 4.5;
      expressCost = 8.5;
    } else if (isUS) {
      standardCost = 6.0;
      expressCost = 14.0;
    }

    // Multiply for copies/weight
    const itemCount = request.items.reduce((s, i) => s + i.copies, 0);
    const scaleFactor = Math.max(1, 1 + (itemCount - 1) * 0.35);

    return [
      {
        method: 'Standard',
        carrier: isGhana ? 'DHL International' : isUK ? 'Royal Mail Tracked' : 'USPS Priority',
        cost: Math.round(standardCost * scaleFactor * 100) / 100,
        currency: 'GBP',
        estimatedDays: isGhana ? '7-12 business days' : isUK ? '2-4 business days' : '3-5 business days',
      },
      {
        method: 'Express',
        carrier: 'FedEx International Priority',
        cost: Math.round(expressCost * scaleFactor * 100) / 100,
        currency: 'GBP',
        estimatedDays: isGhana ? '4-6 business days' : isUK ? '1-2 business days' : '2-3 business days',
      },
    ];
  }

  private getSimulatedOrderResponse(request: FulfilmentOrderRequest): FulfilmentOrderResponse {
    const fakeId = `prodigi_sim_${Date.now()}`;
    return {
      id: fakeId,
      status: 'submitted',
      totalCost: 18.50,
      currency: 'GBP',
      rawResponse: {
        outcome: 'Created (Sandbox Simulation)',
        order: {
          id: fakeId,
          merchantReference: request.merchantReference,
          created: new Date().toISOString(),
          status: { stage: 'InProgress' },
        },
      },
    };
  }
}

export const prodigi = new ProdigiClient();

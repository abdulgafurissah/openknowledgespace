/**
 * Dedicated Paystack Client for Open Suq
 * Supports Ghanaian Merchant Account (GHS currency, Mobile Money & International Cards)
 * Documentation: https://paystack.com/docs/
 */

import crypto from 'crypto';
import {
  PaystackInitializeRequest,
  PaystackInitializeResponse,
  PaystackVerifyResponse,
} from './types';

export class PaystackClient {
  private secretKey: string;
  private baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
  }

  isConfigured(): boolean {
    return Boolean(
      this.secretKey &&
      this.secretKey.length > 8 &&
      !this.secretKey.includes('your-')
    );
  }

  private get headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Initialize Transaction via POST /transaction/initialize
   */
  async initializeTransaction(
    request: PaystackInitializeRequest
  ): Promise<PaystackInitializeResponse> {
    if (!this.isConfigured()) {
      return this.getSimulatedInitializeResponse(request);
    }

    const payload = {
      email: request.email,
      amount: request.amount, // in pesewas
      currency: request.currency || 'GHS',
      reference: request.reference,
      callback_url: request.callback_url,
      metadata: request.metadata,
      channels: request.channels || ['card', 'mobile_money'],
    };

    const res = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      throw new Error(
        data.message || `Paystack initialization error (${res.statusText})`
      );
    }

    return data;
  }

  /**
   * Verify Transaction Server-Side via GET /transaction/verify/:reference
   * NEVER trust client redirect alone.
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    if (!this.isConfigured() || reference.startsWith('sim_')) {
      return this.getSimulatedVerifyResponse(reference);
    }

    const res = await fetch(`${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: this.headers,
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      throw new Error(
        data.message || `Paystack verification failed for ref: ${reference}`
      );
    }

    return data;
  }

  /**
   * Cryptographically verify x-paystack-signature using HMAC SHA-512
   * @param rawBody - Exact raw body text of the webhook request
   * @param signatureHeader - Value of 'x-paystack-signature' header
   */
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    if (!this.secretKey || !signatureHeader) return false;

    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(rawBody)
      .digest('hex');

    // Constant-time string comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'utf8'),
      Buffer.from(signatureHeader, 'utf8')
    );
  }

  /**
   * Sandbox simulation for local development without active credentials
   */
  private getSimulatedInitializeResponse(
    request: PaystackInitializeRequest
  ): PaystackInitializeResponse {
    const callbackWithRef = new URL(request.callback_url);
    callbackWithRef.searchParams.set('reference', request.reference);
    callbackWithRef.searchParams.set('simulated', 'true');

    return {
      status: true,
      message: 'Authorization URL created (Sandbox Simulation Mode)',
      data: {
        authorization_url: callbackWithRef.toString(),
        access_code: `sim_access_${Date.now()}`,
        reference: request.reference,
      },
    };
  }

  private getSimulatedVerifyResponse(reference: string): PaystackVerifyResponse {
    return {
      status: true,
      message: 'Verification successful (Sandbox Simulation)',
      data: {
        id: 999999,
        status: 'success',
        reference,
        amount: 28000, // 280.00 GHS in pesewas
        gateway_response: 'Successful (Simulated)',
        paid_at: new Date().toISOString(),
        channel: 'mobile_money',
        currency: 'GHS',
        customer: {
          id: 12345,
          email: 'customer@example.com',
          customer_code: 'CUS_simulated123',
          phone: '+233240000000',
        },
      },
    };
  }
}

export const paystack = new PaystackClient();

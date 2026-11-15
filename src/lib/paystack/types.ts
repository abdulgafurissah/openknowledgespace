/**
 * Paystack Payment Gateway Types
 */

export interface PaystackInitializeRequest {
  email: string;
  amount: number; // In pesewas (e.g. GHS 100.00 = 10000 pesewas)
  currency?: string; // 'GHS'
  reference: string; // Unique order reference
  callback_url: string;
  metadata?: Record<string, any>;
  channels?: string[]; // ['card', 'mobile_money', 'bank']
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number; // In pesewas
    gateway_response: string;
    paid_at: string;
    channel: string; // 'card', 'mobile_money', etc.
    currency: string;
    authorization?: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
    };
    customer: {
      id: number;
      email: string;
      customer_code: string;
      phone?: string;
    };
    metadata?: Record<string, any>;
  };
}

export interface PaystackWebhookEvent {
  event: string; // e.g. 'charge.success'
  data: PaystackVerifyResponse['data'];
}

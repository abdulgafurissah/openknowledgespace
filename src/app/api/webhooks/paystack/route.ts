import { NextRequest, NextResponse } from 'next/server';
import { paystack } from '@/lib/paystack/client';
import { orderManager } from '@/lib/fulfilment/order-manager';
import { db } from '@/db';
import { suqPaymentEvents } from '@/db/schema';
import { fromPesewas } from '@/lib/suq/currency';

export async function POST(req: NextRequest) {
  try {
    // 1. Read raw body as text for HMAC verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature') || '';

    // If Paystack is configured, enforce cryptographic HMAC verification
    if (paystack.isConfigured()) {
      const isValid = paystack.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn('[Paystack Webhook] Invalid HMAC signature rejected');
        return new NextResponse('Invalid signature', { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    // 2. Record raw event in payment events audit table
    try {
      await db.insert(suqPaymentEvents).values({
        reference: data?.reference || 'unknown',
        eventType: event || 'unknown',
        rawPayload: payload,
      });
    } catch (auditErr) {
      console.warn('[Paystack Webhook Audit Warning]', auditErr);
    }

    // 3. Process Charge Success Event
    if (event === 'charge.success') {
      const reference = data.reference;
      const amountGHS = parseFloat(fromPesewas(data.amount));

      console.log(`[Paystack Webhook] Processing charge.success for ref: ${reference}`);

      await orderManager.processVerifiedPayment({
        orderNumber: reference,
        paymentReference: reference,
        amountPaidGHS: amountGHS,
        channel: data.channel,
        authorizationCode: data.authorization?.authorization_code,
        rawPayload: data,
      });
    }

    // Always respond 200 OK quickly to Paystack to prevent retries
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (err: any) {
    console.error('[Paystack Webhook Handler Error]', err);
    return new NextResponse('Webhook processing error', { status: 500 });
  }
}

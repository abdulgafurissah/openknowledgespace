import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import VerifyClient from './VerifyClient';
import { paystack } from '@/lib/paystack/client';
import { orderManager } from '@/lib/fulfilment/order-manager';
import { db } from '@/db';
import { suqOrders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { fromPesewas } from '@/lib/suq/currency';

export const metadata: Metadata = {
  title: 'Order Status & Payment Verification — Open Suq',
};

export default async function CheckoutVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string; simulated?: string }>;
}) {
  const { reference, trxref, simulated } = await searchParams;
  const targetRef = reference || trxref;

  if (!targetRef) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f4efe6)' }}>
        <Navbar />
        <VerifyClient
          success={false}
          orderNumber="N/A"
          amountGHS={0}
          errorMessage="No transaction reference was provided by the payment gateway."
        />
      </div>
    );
  }

  try {
    // 1. Server-side verification with Paystack
    const verifyRes = await paystack.verifyTransaction(targetRef);

    if (verifyRes.data.status !== 'success') {
      return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f4efe6)' }}>
          <Navbar />
          <VerifyClient
            success={false}
            orderNumber={targetRef}
            amountGHS={0}
            errorMessage={`Transaction status is: ${verifyRes.data.status}. Reason: ${verifyRes.data.gateway_response}`}
          />
        </div>
      );
    }

    const amountGHS = parseFloat(fromPesewas(verifyRes.data.amount));

    // 2. Process order payment settlement (queues order for merchant fulfilment)
    await orderManager.processVerifiedPayment({
      orderNumber: targetRef,
      paymentReference: targetRef,
      amountPaidGHS: amountGHS,
      channel: verifyRes.data.channel,
      authorizationCode: verifyRes.data.authorization?.authorization_code,
      rawPayload: verifyRes.data,
    });

    // 3. Fetch latest order state
    const [order] = await db
      .select()
      .from(suqOrders)
      .where(eq(suqOrders.orderNumber, targetRef));

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f4efe6)' }}>
        <Navbar />
        <main>
          <VerifyClient
            success={true}
            orderNumber={targetRef}
            amountGHS={amountGHS}
            customerName={order?.guestName ?? undefined}
            customerEmail={order?.guestEmail ?? undefined}
            fulfilmentStatus={order?.fulfilmentStatus || 'pending'}
          />
        </main>
      </div>
    );
  } catch (err: any) {
    console.error('[Verify Page Error]', err);
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #f4efe6)' }}>
        <Navbar />
        <VerifyClient
          success={false}
          orderNumber={targetRef}
          amountGHS={0}
          errorMessage={err.message || 'Payment verification failed.'}
        />
      </div>
    );
  }
}

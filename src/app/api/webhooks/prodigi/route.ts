import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { suqFulfilmentOrders, suqFulfilmentEvents, suqOrders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('[Prodigi Callback Received]', JSON.stringify(payload).slice(0, 200));

    const externalOrderId = payload.order?.id || payload.id;
    const stage = (payload.order?.status?.stage || payload.stage || '').toLowerCase();
    const shipments = payload.order?.shipments || payload.shipments || [];
    const primaryShipment = shipments[0];

    if (externalOrderId) {
      const [fulfilmentOrder] = await db
        .select()
        .from(suqFulfilmentOrders)
        .where(eq(suqFulfilmentOrders.externalOrderId, externalOrderId));

      if (fulfilmentOrder) {
        let mappedStatus: 'submitted' | 'in_production' | 'shipped' | 'cancelled' | 'failed' = 'in_production';
        if (stage === 'complete' || stage === 'shipped') mappedStatus = 'shipped';
        else if (stage === 'cancelled') mappedStatus = 'cancelled';
        else if (stage === 'failed') mappedStatus = 'failed';

        await db
          .update(suqFulfilmentOrders)
          .set({
            status: mappedStatus,
            trackingNumber: primaryShipment?.tracking?.number ?? fulfilmentOrder.trackingNumber,
            trackingUrl: primaryShipment?.tracking?.url ?? fulfilmentOrder.trackingUrl,
            carrier: primaryShipment?.carrier?.name ?? fulfilmentOrder.carrier,
            updatedAt: new Date(),
          })
          .where(eq(suqFulfilmentOrders.id, fulfilmentOrder.id));

        // Update main order status
        await db
          .update(suqOrders)
          .set({
            fulfilmentStatus: mappedStatus,
            updatedAt: new Date(),
          })
          .where(eq(suqOrders.id, fulfilmentOrder.orderId));

        // Record fulfilment event
        await db.insert(suqFulfilmentEvents).values({
          fulfilmentOrderId: fulfilmentOrder.id,
          eventName: payload.event || stage || 'STATUS_UPDATE',
          description: `Prodigi stage changed to: ${stage}`,
          rawPayload: payload,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Prodigi Webhook Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

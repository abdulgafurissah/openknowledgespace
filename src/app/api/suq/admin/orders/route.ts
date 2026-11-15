import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { suqOrders, suqOrderItems, suqFulfilmentOrders, suqPayments } from '@/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await db
      .select()
      .from(suqOrders)
      .orderBy(desc(suqOrders.createdAt));

    if (orders.length === 0) {
      return NextResponse.json([]);
    }

    const orderIds = orders.map(o => o.id);

    const [items, fulfilments, payments] = await Promise.all([
      db.select().from(suqOrderItems).where(inArray(suqOrderItems.orderId, orderIds)),
      db.select().from(suqFulfilmentOrders).where(inArray(suqFulfilmentOrders.orderId, orderIds)),
      db.select().from(suqPayments).where(inArray(suqPayments.orderId, orderIds)),
    ]);

    const enriched = orders.map(ord => ({
      ...ord,
      items: items.filter(i => i.orderId === ord.id),
      fulfilment: fulfilments.find(f => f.orderId === ord.id) || null,
      payment: payments.find(p => p.orderId === ord.id) || null,
    }));

    return NextResponse.json(enriched);
  } catch (err: any) {
    console.error('[Admin Orders Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

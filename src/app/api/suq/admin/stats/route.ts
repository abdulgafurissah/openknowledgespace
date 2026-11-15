import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import {
  suqOrders,
  suqOrderItems,
  suqFulfilmentOrders,
  suqProducts,
  suqPaymentEvents,
} from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { prodigi } from '@/lib/prodigi/client';
import { paystack } from '@/lib/paystack/client';
import { calculatePaystackFee } from '@/lib/suq/pricing';

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Orders
    const orders = await db
      .select()
      .from(suqOrders)
      .orderBy(desc(suqOrders.createdAt));

    // 2. Fetch Order Items
    const items = await db.select().from(suqOrderItems);

    // 3. Calculate Financial Metrics
    let totalGrossSales = 0;
    let totalShippingCost = 0;
    let totalProductionCost = 0;
    let paidOrdersCount = 0;
    let pendingFulfilmentCount = 0;

    for (const ord of orders) {
      if (ord.paymentStatus === 'paid') {
        paidOrdersCount++;
        totalGrossSales += parseFloat(ord.totalAmount || '0');
        totalShippingCost += parseFloat(ord.shippingCost || '0');

        if (ord.fulfilmentStatus === 'pending' || ord.fulfilmentStatus === 'failed') {
          pendingFulfilmentCount++;
        }
      }
    }

    // Sum production costs for paid orders
    const paidOrderIds = new Set(orders.filter(o => o.paymentStatus === 'paid').map(o => o.id));
    for (const item of items) {
      if (paidOrderIds.has(item.orderId)) {
        const prodCost = parseFloat(item.productionCostSnapshot || '0') * item.quantity;
        totalProductionCost += prodCost;
      }
    }

    const estimatedPaystackFees = calculatePaystackFee(totalGrossSales, false);
    const estimatedNetProfit = totalGrossSales - totalProductionCost - totalShippingCost - estimatedPaystackFees;

    // 4. Products Count
    const products = await db.select().from(suqProducts);

    // 5. Recent Webhook Events
    const recentEvents = await db
      .select()
      .from(suqPaymentEvents)
      .orderBy(desc(suqPaymentEvents.processedAt))
      .limit(6);

    return NextResponse.json({
      metrics: {
        totalGrossSales: Math.round(totalGrossSales * 100) / 100,
        totalProductionCost: Math.round(totalProductionCost * 100) / 100,
        totalShippingCost: Math.round(totalShippingCost * 100) / 100,
        estimatedPaystackFees: Math.round(estimatedPaystackFees * 100) / 100,
        estimatedNetProfit: Math.round(estimatedNetProfit * 100) / 100,
        totalOrders: orders.length,
        paidOrdersCount,
        pendingFulfilmentCount,
        totalProducts: products.length,
      },
      recentOrders: orders.slice(0, 10),
      recentEvents,
      integrations: {
        prodigi: {
          configured: prodigi.isConfigured(),
          environment: process.env.PRODIGI_ENVIRONMENT || 'sandbox',
        },
        paystack: {
          configured: paystack.isConfigured(),
          currency: process.env.PAYSTACK_MERCHANT_CURRENCY || 'GHS',
        },
      },
    });
  } catch (err: any) {
    console.error('[Admin Stats Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

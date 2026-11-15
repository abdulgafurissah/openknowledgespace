import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { suqOrders, suqOrderItems, suqProductVariants, suqProducts } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import { paystack } from '@/lib/paystack/client';
import { toPesewas } from '@/lib/suq/currency';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const body = await req.json();
    const { customer, shippingAddress, items, shippingCost, currency = 'GHS' } = body;

    // 1. Basic validation
    if (!customer?.email || !customer?.name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required customer or item information' },
        { status: 400 }
      );
    }

    if (!shippingAddress?.line1 || !shippingAddress?.countryCode || !shippingAddress?.city) {
      return NextResponse.json(
        { error: 'Incomplete shipping destination address' },
        { status: 400 }
      );
    }

    // 2. Database Price Verification (Never trust prices submitted by the client!)
    const variantIds = items.map((i: any) => i.variantId);
    const dbVariants = await db
      .select({
        id: suqProductVariants.id,
        productId: suqProductVariants.productId,
        sku: suqProductVariants.sku,
        podSku: suqProductVariants.podSku,
        title: suqProductVariants.title,
        retailPrice: suqProductVariants.retailPrice,
        costPrice: suqProductVariants.costPrice,
      })
      .from(suqProductVariants)
      .where(inArray(suqProductVariants.id, variantIds));

    const variantMap = new Map(dbVariants.map(v => [v.id, v]));

    // Fetch product titles
    const productIds = dbVariants.map(v => v.productId);
    const dbProducts = await db
      .select({
        id: suqProducts.id,
        title: suqProducts.title,
      })
      .from(suqProducts)
      .where(inArray(suqProducts.id, productIds));

    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    let calculatedSubtotal = 0;
    const validatedItems: {
      variantId: string;
      productId: string;
      titleSnapshot: string;
      variantTitleSnapshot: string;
      skuSnapshot: string;
      quantity: number;
      unitPrice: string;
      productionCostSnapshot: string;
      shippingCostSnapshot: string;
      total: string;
      artworkUrl?: string;
    }[] = [];

    for (const item of items) {
      const v = variantMap.get(item.variantId);
      if (!v) {
        return NextResponse.json(
          { error: `Variant not found: ${item.variantId}` },
          { status: 400 }
        );
      }

      const prod = productMap.get(v.productId);
      const unitPrice = parseFloat(v.retailPrice);
      const qty = parseInt(item.quantity, 10) || 1;
      const itemTotal = unitPrice * qty;

      calculatedSubtotal += itemTotal;

      validatedItems.push({
        variantId: v.id,
        productId: v.productId,
        titleSnapshot: prod?.title || 'Open Suq Item',
        variantTitleSnapshot: v.title,
        skuSnapshot: v.podSku || v.sku,
        quantity: qty,
        unitPrice: v.retailPrice,
        productionCostSnapshot: v.costPrice,
        shippingCostSnapshot: '0.00',
        total: itemTotal.toFixed(2),
        artworkUrl: item.artworkUrl || undefined,
      });
    }

    const finalShippingCost = parseFloat(shippingCost) || 0;
    const finalTotalAmount = calculatedSubtotal + finalShippingCost;

    // 3. Generate unique Order Number: e.g. "OS-2026-XXXX"
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `OS-${new Date().getFullYear()}-${randomHex}`;

    // 4. Create Order in Database
    const [order] = await db
      .insert(suqOrders)
      .values({
        orderNumber,
        userId: userId ?? null,
        guestEmail: customer.email,
        guestName: customer.name,
        guestPhone: customer.phone ?? null,
        shippingAddress,
        billingAddress: shippingAddress,
        currency: 'GHS',
        subtotal: calculatedSubtotal.toFixed(2),
        shippingCost: finalShippingCost.toFixed(2),
        discountAmount: '0.00',
        taxAmount: '0.00',
        totalAmount: finalTotalAmount.toFixed(2),
        paymentStatus: 'pending',
        fulfilmentStatus: 'pending',
        notes: customer.notes ?? null,
      })
      .returning();

    // 5. Create Order Items
    for (const vi of validatedItems) {
      await db.insert(suqOrderItems).values({
        orderId: order.id,
        variantId: vi.variantId,
        productId: vi.productId,
        titleSnapshot: vi.titleSnapshot,
        skuSnapshot: vi.skuSnapshot,
        variantTitleSnapshot: vi.variantTitleSnapshot,
        quantity: vi.quantity,
        unitPrice: vi.unitPrice,
        productionCostSnapshot: vi.productionCostSnapshot,
        shippingCostSnapshot: vi.shippingCostSnapshot,
        total: vi.total,
        artworkUrl: vi.artworkUrl,
      });
    }

    // 6. Initialize Paystack Transaction
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/suq/checkout/verify`;

    const paystackInit = await paystack.initializeTransaction({
      email: customer.email,
      amount: toPesewas(finalTotalAmount), // Convert to pesewas
      currency: 'GHS',
      reference: orderNumber,
      callback_url: callbackUrl,
      metadata: {
        orderId: order.id,
        orderNumber,
        customerName: customer.name,
        customerPhone: customer.phone,
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      authorizationUrl: paystackInit.data.authorization_url,
      reference: paystackInit.data.reference,
    });
  } catch (err: any) {
    console.error('[Checkout API Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initialize checkout transaction' },
      { status: 500 }
    );
  }
}

/**
 * Open Suq Order Fulfilment Manager
 * Handles the complete lifecycle from verified payment to automated Prodigi POD dispatch.
 * Enforces strict idempotency and safe recovery.
 */

import { db } from '@/db';
import {
  suqOrders,
  suqOrderItems,
  suqPayments,
  suqFulfilmentOrders,
  suqFulfilmentEvents,
  suqProductVariants,
  suqProductDesigns,
  suqAdminAuditLogs,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { prodigi } from '@/lib/prodigi/client';
import { FulfilmentItem, FulfilmentRecipient } from './types';

export class OrderManager {
  /**
   * Settle an order after verified payment and trigger automated POD fulfilment.
   * Completely idempotent: if called multiple times with the same payment reference,
   * it skips duplicate submissions.
   */
  async processVerifiedPayment(params: {
    orderNumber: string;
    paymentReference: string;
    amountPaidGHS: number;
    channel?: string;
    authorizationCode?: string;
    rawPayload?: any;
  }): Promise<{ success: boolean; message: string; fulfilmentId?: string }> {
    const { orderNumber, paymentReference, amountPaidGHS, channel, authorizationCode, rawPayload } = params;

    // 1. Fetch Order
    const [order] = await db
      .select()
      .from(suqOrders)
      .where(eq(suqOrders.orderNumber, orderNumber));

    if (!order) {
      console.error(`[OrderManager] Order not found: ${orderNumber}`);
      return { success: false, message: `Order not found: ${orderNumber}` };
    }

    // 2. Check Idempotency: If already paid and fulfilment already submitted, return safely
    if (order.paymentStatus === 'paid') {
      const existingFulfilment = await db
        .select()
        .from(suqFulfilmentOrders)
        .where(eq(suqFulfilmentOrders.orderId, order.id));

      if (existingFulfilment.length > 0 && existingFulfilment[0].status !== 'failed') {
        console.log(`[OrderManager] Order ${orderNumber} already processed. Skipping duplicate.`);
        return {
          success: true,
          message: 'Order already fulfilled',
          fulfilmentId: existingFulfilment[0].id,
        };
      }
    }

    // 3. Mark Order as Paid
    await db
      .update(suqOrders)
      .set({
        paymentStatus: 'paid',
        updatedAt: new Date(),
      })
      .where(eq(suqOrders.id, order.id));

    // 4. Record Payment Record
    const existingPayment = await db
      .select()
      .from(suqPayments)
      .where(eq(suqPayments.reference, paymentReference));

    if (existingPayment.length === 0) {
      await db.insert(suqPayments).values({
        orderId: order.id,
        provider: 'PAYSTACK',
        reference: paymentReference,
        amount: amountPaidGHS.toFixed(2),
        currency: 'GHS',
        status: 'success',
        authorizationCode: authorizationCode ?? null,
        channel: channel ?? 'card',
        paidAt: new Date(),
        rawResponse: rawPayload ?? null,
      });
    }

    // 5. Fetch Order Items & Variants to prepare POD Submission
    const items = await db
      .select()
      .from(suqOrderItems)
      .where(eq(suqOrderItems.orderId, order.id));

    const address = order.shippingAddress as any;
    const recipient: FulfilmentRecipient = {
      name: order.guestName || address?.name || 'Customer',
      email: order.guestEmail || undefined,
      phoneNumber: order.guestPhone || address?.phone || undefined,
      address: {
        line1: address?.line1 || address?.addressLine1 || '',
        line2: address?.line2 || address?.addressLine2 || '',
        postalOrZipCode: address?.postalCode || address?.postalOrZipCode || '',
        townOrCity: address?.city || '',
        stateOrCounty: address?.stateOrRegion || address?.state || '',
        countryCode: address?.countryCode || 'GH',
      },
    };

    // Build Prodigi items
    const prodigiItems: FulfilmentItem[] = [];

    for (const item of items) {
      // Look up variant for default artwork or POD SKU
      let podSku = item.skuSnapshot;
      let artworkUrl = item.artworkUrl;

      if (item.variantId) {
        const [variant] = await db
          .select()
          .from(suqProductVariants)
          .where(eq(suqProductVariants.id, item.variantId));

        if (variant?.podSku) {
          podSku = variant.podSku;
        }

        // Look up artwork design if not already snapshot
        if (!artworkUrl) {
          const designs = await db
            .select()
            .from(suqProductDesigns)
            .where(eq(suqProductDesigns.productId, item.productId!));

          if (designs.length > 0) {
            artworkUrl = designs[0].artworkUrl;
          }
        }
      }

      prodigiItems.push({
        sku: podSku || 'GLOBAL-TSH-M-BLK',
        copies: item.quantity,
        sizing: 'fillPrintArea',
        assets: [
          {
            printArea: 'default',
            url: artworkUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
          },
        ],
      });
    }

    // 6. Submit to Prodigi Print API
    let fulfilmentRecordId: string;
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'https://openknowledgespace.com';
      const prodigiRes = await prodigi.createOrder({
        merchantReference: order.orderNumber,
        shippingMethod: 'Standard',
        recipient,
        items: prodigiItems,
        callbackUrl: `${baseUrl}/api/webhooks/prodigi`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      });

      // Insert or Update Fulfilment Record
      const [fulfilmentOrder] = await db
        .insert(suqFulfilmentOrders)
        .values({
          orderId: order.id,
          provider: 'PRODIGI',
          externalOrderId: prodigiRes.id,
          status: prodigiRes.status === 'failed' ? 'failed' : 'submitted',
          shippingMethod: 'Standard',
          cost: prodigiRes.totalCost ? String(prodigiRes.totalCost) : null,
          rawPayload: prodigiRes.rawResponse,
          errorMessage: prodigiRes.status === 'failed' ? JSON.stringify(prodigiRes.rawResponse) : null,
        })
        .returning();

      fulfilmentRecordId = fulfilmentOrder.id;

      // Update Order Status
      await db
        .update(suqOrders)
        .set({
          fulfilmentStatus: prodigiRes.status === 'failed' ? 'failed' : 'submitted',
          updatedAt: new Date(),
        })
        .where(eq(suqOrders.id, order.id));

      // Record Event
      await db.insert(suqFulfilmentEvents).values({
        fulfilmentOrderId: fulfilmentRecordId,
        eventName: prodigiRes.status === 'failed' ? 'SUBMISSION_FAILED' : 'SUBMITTED_TO_PRODIGI',
        description: `Order ${order.orderNumber} submitted to Prodigi with external ID ${prodigiRes.id}`,
        rawPayload: prodigiRes.rawResponse,
      });

      return {
        success: prodigiRes.status !== 'failed',
        message: prodigiRes.status === 'failed' ? 'Fulfilment submission failed' : 'Order submitted to Prodigi',
        fulfilmentId: fulfilmentRecordId,
      };
    } catch (err: any) {
      console.error('[OrderManager Prodigi Submission Error]', err);

      const [failedRecord] = await db
        .insert(suqFulfilmentOrders)
        .values({
          orderId: order.id,
          provider: 'PRODIGI',
          status: 'failed',
          shippingMethod: 'Standard',
          errorMessage: err.message,
        })
        .returning();

      await db
        .update(suqOrders)
        .set({
          fulfilmentStatus: 'failed',
          updatedAt: new Date(),
        })
        .where(eq(suqOrders.id, order.id));

      return {
        success: false,
        message: `Fulfilment failed: ${err.message}`,
        fulfilmentId: failedRecord.id,
      };
    }
  }

  /**
   * Safe Admin Retry for Failed Fulfilment
   */
  async retryFailedFulfilment(orderId: string): Promise<boolean> {
    const [order] = await db
      .select()
      .from(suqOrders)
      .where(eq(suqOrders.id, orderId));

    if (!order || order.paymentStatus !== 'paid') return false;

    // Reset status and re-process
    await db
      .update(suqOrders)
      .set({ fulfilmentStatus: 'pending' })
      .where(eq(suqOrders.id, orderId));

    const result = await this.processVerifiedPayment({
      orderNumber: order.orderNumber,
      paymentReference: `retry_${Date.now()}`,
      amountPaidGHS: parseFloat(order.totalAmount),
    });

    return result.success;
  }
}

export const orderManager = new OrderManager();

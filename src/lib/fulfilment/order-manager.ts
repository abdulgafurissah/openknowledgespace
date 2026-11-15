/**
 * Open Suq Order Fulfilment Manager
 *
 * Manual merchant fulfilment model:
 * - When payment is verified, order is secured and marked as paid ('pending' fulfilment).
 * - Automatic connection to Prodigi is SEVERED.
 * - Local / African orders: merchant prints and fulfils locally, clicking "Fulfill Locally".
 * - International orders: merchant manually reviews and dispatches to Prodigi via "Send to Prodigi".
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
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { prodigi } from '@/lib/prodigi/client';
import { FulfilmentItem, FulfilmentRecipient } from './types';

export class OrderManager {
  /**
   * Settle an order after verified payment.
   * Completely idempotent: records payment, updates order to 'paid',
   * and queues it for merchant review (DOES NOT dispatch to Prodigi automatically).
   */
  async processVerifiedPayment(params: {
    orderNumber: string;
    paymentReference: string;
    amountPaidGHS: number;
    channel?: string;
    authorizationCode?: string;
    rawPayload?: any;
  }): Promise<{ success: boolean; message: string }> {
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

    // 2. Check Idempotency: If already paid, return safely
    if (order.paymentStatus === 'paid') {
      console.log(`[OrderManager] Order ${orderNumber} is already marked as paid. Skipping.`);
      return {
        success: true,
        message: 'Order already marked as paid',
      };
    }

    // 3. Mark Order as Paid (Fulfilment status stays 'pending' for manual merchant processing)
    await db
      .update(suqOrders)
      .set({
        paymentStatus: 'paid',
        fulfilmentStatus: 'pending',
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

    console.log(`[OrderManager] Payment secured for order ${orderNumber}. Queued for merchant review.`);
    return {
      success: true,
      message: 'Payment confirmed. Order queued for merchant review.',
    };
  }

  /**
   * Manual Merchant Action: Dispatch an International Order to Prodigi POD API
   */
  async submitToProdigi(orderId: string): Promise<{
    success: boolean;
    message: string;
    externalOrderId?: string;
  }> {
    // 1. Fetch Order
    const [order] = await db
      .select()
      .from(suqOrders)
      .where(eq(suqOrders.id, orderId));

    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.paymentStatus !== 'paid') {
      return { success: false, message: 'Cannot fulfil an unpaid order' };
    }

    // Check existing fulfilment to prevent double-dispatch
    const [existingFulfilment] = await db
      .select()
      .from(suqFulfilmentOrders)
      .where(eq(suqFulfilmentOrders.orderId, order.id));

    if (
      existingFulfilment &&
      existingFulfilment.provider === 'PRODIGI' &&
      ['submitted', 'in_production', 'shipped'].includes(existingFulfilment.status)
    ) {
      return {
        success: true,
        message: `Order already dispatched to Prodigi (${existingFulfilment.externalOrderId})`,
        externalOrderId: existingFulfilment.externalOrderId ?? undefined,
      };
    }

    // 2. Fetch Order Items & Variants
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
        countryCode: address?.countryCode || 'US',
      },
    };

    // 3. Build Prodigi Items
    const prodigiItems: FulfilmentItem[] = [];

    for (const item of items) {
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

    // 4. Submit to Prodigi Print API
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'https://openknowledge.us.ci';
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

      let fulfilmentRecordId: string;

      if (existingFulfilment) {
        await db
          .update(suqFulfilmentOrders)
          .set({
            provider: 'PRODIGI',
            externalOrderId: prodigiRes.id,
            status: prodigiRes.status === 'failed' ? 'failed' : 'submitted',
            shippingMethod: 'Standard',
            cost: prodigiRes.totalCost ? String(prodigiRes.totalCost) : null,
            rawPayload: prodigiRes.rawResponse,
            errorMessage: prodigiRes.status === 'failed' ? JSON.stringify(prodigiRes.rawResponse) : null,
            updatedAt: new Date(),
          })
          .where(eq(suqFulfilmentOrders.id, existingFulfilment.id));
        fulfilmentRecordId = existingFulfilment.id;
      } else {
        const [inserted] = await db
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
        fulfilmentRecordId = inserted.id;
      }

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
        description: `Order ${order.orderNumber} manually submitted to Prodigi by admin with external ID ${prodigiRes.id}`,
        rawPayload: prodigiRes.rawResponse,
      });

      return {
        success: prodigiRes.status !== 'failed',
        message: prodigiRes.status === 'failed' ? 'Fulfilment submission failed' : 'Order submitted to Prodigi',
        externalOrderId: prodigiRes.id,
      };
    } catch (err: any) {
      console.error('[OrderManager Prodigi Submission Error]', err);

      if (existingFulfilment) {
        await db
          .update(suqFulfilmentOrders)
          .set({
            provider: 'PRODIGI',
            status: 'failed',
            errorMessage: err.message,
            updatedAt: new Date(),
          })
          .where(eq(suqFulfilmentOrders.id, existingFulfilment.id));
      } else {
        await db.insert(suqFulfilmentOrders).values({
          orderId: order.id,
          provider: 'PRODIGI',
          status: 'failed',
          shippingMethod: 'Standard',
          errorMessage: err.message,
        });
      }

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
      };
    }
  }

  /**
   * Manual Merchant Action: Fulfill a Local Ghana or African Order
   * (Printed and packaged directly by the website owner)
   */
  async fulfilLocally(
    orderId: string,
    params: {
      carrier?: string;
      trackingNumber?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const [order] = await db
      .select()
      .from(suqOrders)
      .where(eq(suqOrders.id, orderId));

    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.paymentStatus !== 'paid') {
      return { success: false, message: 'Cannot fulfil an unpaid order' };
    }

    const carrierName = params.carrier?.trim() || 'Local / Self-Print';
    const trackingNum = params.trackingNumber?.trim() || null;

    // Check existing fulfilment record
    const [existingFulfilment] = await db
      .select()
      .from(suqFulfilmentOrders)
      .where(eq(suqFulfilmentOrders.orderId, order.id));

    let fulfilmentRecordId: string;

    if (existingFulfilment) {
      await db
        .update(suqFulfilmentOrders)
        .set({
          provider: 'LOCAL_PRINT',
          status: 'shipped',
          carrier: carrierName,
          trackingNumber: trackingNum,
          shippingMethod: 'Local Fulfilment',
          updatedAt: new Date(),
        })
        .where(eq(suqFulfilmentOrders.id, existingFulfilment.id));
      fulfilmentRecordId = existingFulfilment.id;
    } else {
      const [inserted] = await db
        .insert(suqFulfilmentOrders)
        .values({
          orderId: order.id,
          provider: 'LOCAL_PRINT',
          status: 'shipped',
          carrier: carrierName,
          trackingNumber: trackingNum,
          shippingMethod: 'Local Fulfilment',
        })
        .returning();
      fulfilmentRecordId = inserted.id;
    }

    // Update main order
    const updatedNotes = params.notes
      ? `${order.notes ? order.notes + ' | ' : ''}${params.notes}`
      : order.notes;

    await db
      .update(suqOrders)
      .set({
        fulfilmentStatus: 'shipped',
        notes: updatedNotes,
        updatedAt: new Date(),
      })
      .where(eq(suqOrders.id, order.id));

    // Record Event
    await db.insert(suqFulfilmentEvents).values({
      fulfilmentOrderId: fulfilmentRecordId,
      eventName: 'FULFILLED_LOCALLY',
      description: `Order printed and dispatched locally via ${carrierName}${trackingNum ? ` (Trk: ${trackingNum})` : ''}`,
    });

    return {
      success: true,
      message: 'Order marked as fulfilled locally and status updated to shipped.',
    };
  }

  /**
   * Manual Merchant Action: Mark Order Delivered
   */
  async markDelivered(orderId: string): Promise<{ success: boolean; message: string }> {
    const [order] = await db
      .select()
      .from(suqOrders)
      .where(eq(suqOrders.id, orderId));

    if (!order) return { success: false, message: 'Order not found' };

    await db
      .update(suqOrders)
      .set({
        fulfilmentStatus: 'delivered',
        updatedAt: new Date(),
      })
      .where(eq(suqOrders.id, order.id));

    const [existingFulfilment] = await db
      .select()
      .from(suqFulfilmentOrders)
      .where(eq(suqFulfilmentOrders.orderId, order.id));

    if (existingFulfilment) {
      await db
        .update(suqFulfilmentOrders)
        .set({ status: 'shipped', updatedAt: new Date() })
        .where(eq(suqFulfilmentOrders.id, existingFulfilment.id));
    }

    return { success: true, message: 'Order marked as delivered.' };
  }

  /**
   * Safe Admin Retry for Failed Fulfilment
   */
  async retryFailedFulfilment(orderId: string): Promise<boolean> {
    const result = await this.submitToProdigi(orderId);
    return result.success;
  }
}

export const orderManager = new OrderManager();

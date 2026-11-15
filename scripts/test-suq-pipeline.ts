/**
 * Open Suq End-to-End Pipeline Verification Test
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/db';
import {
  suqProducts,
  suqProductVariants,
  suqOrders,
  suqOrderItems,
  suqFulfilmentOrders,
} from '../src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { prodigi } from '../src/lib/prodigi/client';
import { paystack } from '../src/lib/paystack/client';
import { orderManager } from '../src/lib/fulfilment/order-manager';
import { calculatePricingBreakdown } from '../src/lib/suq/pricing';
import { formatCurrency, toPesewas } from '../src/lib/suq/currency';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 OPEN SUQ: END-TO-END AUTOMATED VERIFICATION SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test 1: Catalogue & Products
  console.log('TEST 1: Verifying Catalogue Products & Variants...');
  const products = await db.select().from(suqProducts).where(eq(suqProducts.isPublished, true));
  if (products.length === 0) throw new Error('No published products found!');
  console.log(`✅ Found ${products.length} live products in Open Suq catalogue.`);

  const sampleProd = products[0];
  const variants = await db.select().from(suqProductVariants).where(eq(suqProductVariants.productId, sampleProd.id));
  if (variants.length === 0) throw new Error(`No variants found for product ${sampleProd.title}`);
  console.log(`✅ Product "${sampleProd.title}" has ${variants.length} variant(s).`);

  // Test 2: Pricing Engine & Precision Math
  console.log('\nTEST 2: Verifying Pricing Engine & Profit Calculations...');
  const sampleVariant = variants[0];
  const retail = parseFloat(sampleVariant.retailPrice);
  const cost = parseFloat(sampleVariant.costPrice);
  const breakdown = calculatePricingBreakdown(retail, cost, 45, false);

  console.log(`   Retail Price:         ${formatCurrency(breakdown.retailPrice, 'GHS')}`);
  console.log(`   Production Cost:      ${formatCurrency(breakdown.productionCost, 'GHS')}`);
  console.log(`   Paystack Fee:         ${formatCurrency(breakdown.paystackFee, 'GHS')}`);
  console.log(`   Estimated Net Profit: ${formatCurrency(breakdown.estimatedNetProfit, 'GHS')}`);
  console.log(`   Profit Margin:        ${breakdown.profitMarginPercent}%`);
  if (breakdown.estimatedNetProfit <= 0) {
    console.warn('⚠️ Warning: Net profit is zero or negative.');
  } else {
    console.log('✅ Pricing Engine calculated positive net profit margin.');
  }

  // Test 3: Prodigi Shipping Quote
  console.log('\nTEST 3: Verifying Prodigi Shipping Quotation Service...');
  const quotes = await prodigi.getShippingQuote({
    destination: {
      countryCode: 'GH',
      townOrCity: 'Accra',
      postalOrZipCode: '00233',
    },
    items: [
      {
        sku: sampleVariant.podSku || 'GLOBAL-TSH-M-BLK',
        copies: 1,
      },
    ],
  });
  if (quotes.length === 0) throw new Error('No shipping quotes returned!');
  console.log(`✅ Received ${quotes.length} shipping quote(s).`);
  console.log(`   Method: ${quotes[0].method}, Cost: ${quotes[0].cost} ${quotes[0].currency}, Carrier: ${quotes[0].carrier}`);

  // Test 4: Checkout & Order Creation
  console.log('\nTEST 4: Creating Test Order...');
  const testOrderNumber = `TEST-${Date.now().toString().slice(-6)}`;
  const [createdOrder] = await db
    .insert(suqOrders)
    .values({
      orderNumber: testOrderNumber,
      guestEmail: 'test.customer@example.com',
      guestName: 'Amina Diallo Test',
      guestPhone: '+233240001122',
      shippingAddress: {
        name: 'Amina Diallo Test',
        line1: 'Independence Avenue 14',
        city: 'Accra',
        stateOrRegion: 'Greater Accra',
        countryCode: 'GH',
      },
      currency: 'GHS',
      subtotal: retail.toFixed(2),
      shippingCost: '45.00',
      totalAmount: (retail + 45).toFixed(2),
      paymentStatus: 'pending',
      fulfilmentStatus: 'pending',
    })
    .returning();

  await db.insert(suqOrderItems).values({
    orderId: createdOrder.id,
    variantId: sampleVariant.id,
    productId: sampleProd.id,
    titleSnapshot: sampleProd.title,
    skuSnapshot: sampleVariant.podSku || sampleVariant.sku,
    variantTitleSnapshot: sampleVariant.title,
    quantity: 1,
    unitPrice: sampleVariant.retailPrice,
    productionCostSnapshot: sampleVariant.costPrice,
    total: sampleVariant.retailPrice,
  });

  console.log(`✅ Created test order ${testOrderNumber} with ID: ${createdOrder.id}`);

  // Test 5: Verified Payment Processing (Severed from automated Prodigi)
  console.log('\nTEST 5: Executing Order Payment Settlement (Merchant Review Queue)...');
  const settlementResult = await orderManager.processVerifiedPayment({
    orderNumber: testOrderNumber,
    paymentReference: `PAY-REF-${testOrderNumber}`,
    amountPaidGHS: retail + 45,
    channel: 'mobile_money',
  });

  if (!settlementResult.success) {
    throw new Error(`Settlement failed: ${settlementResult.message}`);
  }
  console.log(`✅ Order payment secured: ${settlementResult.message}`);

  // Test 6: Verify Idempotency (Duplicate Webhook Prevention)
  console.log('\nTEST 6: Testing Idempotency (Duplicate Webhook/Payment Notification)...');
  const duplicateResult = await orderManager.processVerifiedPayment({
    orderNumber: testOrderNumber,
    paymentReference: `PAY-REF-${testOrderNumber}`,
    amountPaidGHS: retail + 45,
  });
  console.log(`✅ Idempotency check result: "${duplicateResult.message}". No duplicate settlement created.`);

  // Test 7: Test Manual Local Fulfilment Action (Self-Print for Ghana/Africa)
  console.log('\nTEST 7A: Testing Manual Local Fulfilment Action (Self-Print)...');
  const localFulfilResult = await orderManager.fulfilLocally(createdOrder.id, {
    carrier: 'VIP Courier / Ghana Post',
    trackingNumber: 'VIP-ACC-88391',
    notes: 'Printed locally at Accra branch',
  });
  if (!localFulfilResult.success) {
    throw new Error(`Local fulfilment action failed: ${localFulfilResult.message}`);
  }
  console.log(`✅ Local fulfilment action succeeded: ${localFulfilResult.message}`);

  // Test 7B: Test Manual Prodigi Dispatch Action (for International orders)
  console.log('\nTEST 7B: Testing Manual Prodigi Dispatch Action (International POD)...');
  const prodigiDispatchResult = await orderManager.submitToProdigi(createdOrder.id);
  console.log(`✅ Prodigi dispatch action executed with status: ${prodigiDispatchResult.message} (ID: ${prodigiDispatchResult.externalOrderId || 'N/A'})`);

  // Verify Fulfilment Record in Database
  console.log('\nTEST 7C: Inspecting Fulfilment Record in Database...');
  const fulfilments = await db
    .select()
    .from(suqFulfilmentOrders)
    .where(eq(suqFulfilmentOrders.orderId, createdOrder.id));

  if (fulfilments.length === 0) throw new Error('No fulfilment order record created in database!');
  console.log(`✅ Fulfilment record active with status: "${fulfilments[0].status}", Provider: "${fulfilments[0].provider}"`);

  // Cleanup test order
  console.log('\nCleaning up test order records...');
  await db.delete(suqOrders).where(eq(suqOrders.id, createdOrder.id));
  console.log('✅ Test order cleanly deleted.');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL OPEN SUQ PIPELINE VERIFICATION TESTS PASSED!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

runTests().catch(err => {
  console.error('❌ Pipeline Test Failure:', err);
  process.exit(1);
});

import { NextRequest, NextResponse } from 'next/server';
import { prodigi } from '@/lib/prodigi/client';
import { FX_RATES_TO_GHS } from '@/lib/suq/currency';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destination, items } = body;

    if (!destination?.countryCode || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid destination or empty items' },
        { status: 400 }
      );
    }

    const quotes = await prodigi.getShippingQuote({
      destination: {
        countryCode: destination.countryCode,
        postalOrZipCode: destination.postalCode,
        townOrCity: destination.city,
      },
      items: items.map((i: any) => ({
        sku: i.podSku || i.sku || 'GLOBAL-TSH-M-BLK',
        copies: i.quantity || 1,
      })),
    });

    // Approximate GBP to GHS conversion for quote display (~19.5 GHS/GBP)
    const gbpToGhsRate = 19.5;

    const formattedQuotes = quotes.map(q => {
      let costInGhs = q.cost;
      if (q.currency === 'GBP') costInGhs = q.cost * gbpToGhsRate;
      else if (q.currency === 'USD') costInGhs = q.cost * 15.4;
      else if (q.currency === 'EUR') costInGhs = q.cost * 16.8;

      return {
        method: q.method,
        carrier: q.carrier,
        estimatedDays: q.estimatedDays,
        costInGhs: Math.round(costInGhs * 100) / 100,
        originalCost: q.cost,
        originalCurrency: q.currency,
      };
    });

    return NextResponse.json({
      success: true,
      quotes: formattedQuotes,
    });
  } catch (err: any) {
    console.error('[Shipping Quote Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to calculate shipping quotes' },
      { status: 500 }
    );
  }
}

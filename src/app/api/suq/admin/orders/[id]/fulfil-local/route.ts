import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { orderManager } from '@/lib/fulfilment/order-manager';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { carrier, trackingNumber, notes } = body;

    const result = await orderManager.fulfilLocally(id, {
      carrier,
      trackingNumber,
      notes,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Admin Fulfil Local Error]', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

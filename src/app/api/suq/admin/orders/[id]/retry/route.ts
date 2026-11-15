import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { orderManager } from '@/lib/fulfilment/order-manager';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const success = await orderManager.retryFailedFulfilment(id);

    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

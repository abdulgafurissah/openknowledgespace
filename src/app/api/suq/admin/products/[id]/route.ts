import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { suqProducts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
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
    const body = await req.json();

    const [updated] = await db
      .update(suqProducts)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(suqProducts.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
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
    await db.delete(suqProducts).where(eq(suqProducts.id, id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

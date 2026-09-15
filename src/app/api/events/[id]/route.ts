import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { events, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// ─── GET /api/events/[id] ───────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        eventDate: events.eventDate,
        bannerUrl: events.bannerUrl,
        googleFormUrl: events.googleFormUrl,
        isPublished: events.isPublished,
        createdAt: events.createdAt,
        organizerName: users.fullName,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.id, id));

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('[Event GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// ─── PATCH /api/events/[id] ─────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;

    if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(events)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[Event PATCH Error]', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// ─── DELETE /api/events/[id] ────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;

    if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await db.delete(events).where(eq(events.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Event DELETE Error]', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}

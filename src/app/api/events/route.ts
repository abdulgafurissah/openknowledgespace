import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { events, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// ─── GET /api/events ─────────────────────────────────────────────────────
// Returns all published events (public)

export async function GET() {
  try {
    const allEvents = await db
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
      .where(eq(events.isPublished, true))
      .orderBy(desc(events.eventDate));

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error('[Events GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// ─── POST /api/events ────────────────────────────────────────────────────
// Creates a new event (Admin/Instructor only)

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = (session.user as { role?: string; id?: string }).role;
    const userId = (session.user as { role?: string; id?: string }).id;

    if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      eventDate,
      bannerUrl,
      bannerDriveId,
      googleFormUrl,
      isPublished,
    } = body;

    if (!title || !eventDate) {
      return NextResponse.json({ error: 'title and eventDate are required' }, { status: 400 });
    }

    const [event] = await db
      .insert(events)
      .values({
        title,
        description,
        eventDate: new Date(eventDate),
        bannerUrl,
        bannerDriveId,
        googleFormUrl,
        organizerId: userId!,
        isPublished: isPublished ?? false,
      })
      .returning();

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('[Events POST Error]', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

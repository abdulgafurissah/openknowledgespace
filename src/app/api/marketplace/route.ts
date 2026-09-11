import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { marketplaceItems, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// ─── GET /api/marketplace ─────────────────────────────────────────────────────
// Returns all published marketplace items (public)

export async function GET() {
  try {
    const items = await db
      .select({
        id: marketplaceItems.id,
        title: marketplaceItems.title,
        description: marketplaceItems.description,
        fileType: marketplaceItems.fileType,
        price: marketplaceItems.price,
        isFree: marketplaceItems.isFree,
        downloadUrl: marketplaceItems.downloadUrl,
        thumbnailUrl: marketplaceItems.thumbnailUrl,
        fileMimeType: marketplaceItems.fileMimeType,
        fileSize: marketplaceItems.fileSize,
        downloadCount: marketplaceItems.downloadCount,
        createdAt: marketplaceItems.createdAt,
        sellerName: users.fullName,
      })
      .from(marketplaceItems)
      .leftJoin(users, eq(marketplaceItems.sellerId, users.id))
      .where(eq(marketplaceItems.isPublished, true))
      .orderBy(desc(marketplaceItems.createdAt));

    return NextResponse.json(items);
  } catch (error) {
    console.error('[Marketplace GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch marketplace items' }, { status: 500 });
  }
}

// ─── POST /api/marketplace ────────────────────────────────────────────────────
// Creates a new marketplace item (Admin/Instructor only)

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
      fileType,
      price,
      isFree,
      driveFileId,
      downloadUrl,
      fileMimeType,
      fileSize,
      thumbnailUrl,
      thumbnailDriveId,
      isPublished,
    } = body;

    if (!title || !fileType) {
      return NextResponse.json({ error: 'title and fileType are required' }, { status: 400 });
    }

    const [item] = await db
      .insert(marketplaceItems)
      .values({
        title,
        description,
        fileType,
        price: price ?? '0',
        isFree: isFree ?? true,
        driveFileId,
        downloadUrl,
        fileMimeType,
        fileSize,
        thumbnailUrl,
        thumbnailDriveId,
        sellerId: userId!,
        isPublished: isPublished ?? false,
      })
      .returning();

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('[Marketplace POST Error]', error);
    return NextResponse.json({ error: 'Failed to create marketplace item' }, { status: 500 });
  }
}

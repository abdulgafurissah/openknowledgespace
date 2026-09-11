import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { marketplaceItems, users, purchases } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteFileFromDrive } from '@/lib/google-drive';

type RouteParams = { params: Promise<{ id: string }> };

// ─── GET /api/marketplace/[id] ────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [item] = await db
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
        isPublished: marketplaceItems.isPublished,
        createdAt: marketplaceItems.createdAt,
        sellerName: users.fullName,
        sellerId: marketplaceItems.sellerId,
      })
      .from(marketplaceItems)
      .leftJoin(users, eq(marketplaceItems.sellerId, users.id))
      .where(and(eq(marketplaceItems.id, id), eq(marketplaceItems.isPublished, true)));

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('[Marketplace Item GET Error]', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

// ─── PATCH /api/marketplace/[id] ─────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
      .update(marketplaceItems)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(marketplaceItems.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[Marketplace Item PATCH Error]', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// ─── DELETE /api/marketplace/[id] ────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Get the item first to clean up Drive file
    const [item] = await db
      .select()
      .from(marketplaceItems)
      .where(eq(marketplaceItems.id, id));

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Delete purchases first, then item
    await db.delete(purchases).where(eq(purchases.itemId, id));
    await db.delete(marketplaceItems).where(eq(marketplaceItems.id, id));

    // Clean up files from Google Drive (non-fatal if fails)
    try {
      if (item.driveFileId) await deleteFileFromDrive(item.driveFileId);
      if (item.thumbnailDriveId) await deleteFileFromDrive(item.thumbnailDriveId);
    } catch (driveError) {
      console.warn('[Drive cleanup warning]', driveError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Marketplace Item DELETE Error]', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

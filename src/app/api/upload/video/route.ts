import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createGumletUploadUrl, uploadVideoToGumlet } from '@/lib/gumlet';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, sourceUrl } = body as { title?: string; sourceUrl?: string };

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    if (sourceUrl) {
      // Upload by URL — Gumlet fetches the video from the given URL
      const result = await uploadVideoToGumlet(sourceUrl, title);
      return NextResponse.json(result, { status: 200 });
    } else {
      // Return a signed upload URL for direct browser upload
      const result = await createGumletUploadUrl(title);
      return NextResponse.json(result, { status: 200 });
    }
  } catch (error) {
    console.error('[Gumlet Upload Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

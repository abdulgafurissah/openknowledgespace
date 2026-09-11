import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFileToDrive } from '@/lib/google-drive';

export const runtime = 'nodejs';
// Increase body size limit for file uploads (Next.js default is 4MB)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Auth check — only admins and instructors can upload
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderId = formData.get('folderId') as string | undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 100 MB)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 100 MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadFileToDrive(
      buffer,
      file.type || 'application/octet-stream',
      file.name,
      folderId
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[Drive Upload Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

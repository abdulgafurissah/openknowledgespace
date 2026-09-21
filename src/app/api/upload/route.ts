import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Auth check — only admins and instructors can upload
        const session = await auth();
        if (!session?.user) {
          throw new Error('Unauthorized');
        }
        const role = (session.user as { role?: string }).role;
        if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
          throw new Error('Forbidden');
        }

        // Return the client payload which we can store or use later
        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/epub+zip', 'application/vnd.android.package-archive',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'video/mp4' // in case they upload some small videos
          ],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            role,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // You can run some logic here, like storing the blob URL in your DB
        console.log('Upload completed:', blob.url);
        console.log('Token Payload:', tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Blob upload error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}

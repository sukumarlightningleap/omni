import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname,
        /* clientPayload */
      ) => {
        // Authenticate user
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
          throw new Error('Unauthenticated or missing administrative clearance.');
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This is called after the file is uploaded to Vercel Blob.
        // You can update your database here if needed.
        console.log('Blob upload completed:', blob, tokenPayload);

        try {
          // Token payload was stringified JSON
          const { userId } = JSON.parse(tokenPayload || '{}');
          console.log(`User ${userId} uploaded ${blob.url}`);
        } catch (error) {
          throw new Error('Could not parse tokenPayload');
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}

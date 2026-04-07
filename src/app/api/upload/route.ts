import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  console.log('Incoming Vercel Blob Token Request...');
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
        console.log('Session check in upload API:', !!session, session?.user?.role);
        
        if (!session || session.user?.role !== 'ADMIN') {
          console.error('Upload blocked: User is not an ADMIN or session missing', session?.user?.email);
          throw new Error('Unauthenticated or missing administrative clearance.');
        }

        console.log('Generating token for:', pathname);

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
          addRandomSuffix: true,
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
    console.error('Vercel Blob API Error:', error);
    
    const message = (error as Error).message;
    let status = 400;
    let code = 'UNKNOWN_ERROR';

    if (message.includes('administrative clearance') || message.includes('not an ADMIN')) {
      status = 403;
      code = 'UNAUTHORIZED_ADMIN';
    } else if (message.includes('Session check failed') || message.includes('session missing')) {
      status = 401;
      code = 'SESSION_MISSING';
    } else if (!process.env.BLOB_READ_WRITE_TOKEN) {
      status = 500;
      code = 'MISSING_ENV_TOKEN';
    }

    return NextResponse.json(
      { error: message, code },
      { status },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { folder, resource_type = 'image' } = await req.json();

    if (!folder) {
      return NextResponse.json(
        { success: false, message: 'folder is required' },
        { status: 400 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      resource_type,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

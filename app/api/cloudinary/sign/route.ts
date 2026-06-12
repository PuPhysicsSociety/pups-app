import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  console.log('[API CLOUDINARY SIGN] Received signature request');
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) {
    console.warn('[API CLOUDINARY SIGN] Authentication failed');
    return auth;
  }

  try {
    const { folder, resource_type = 'image' } = await req.json();
    console.log('[API CLOUDINARY SIGN] Parameters:', { folder, resource_type });

    if (!folder) {
      console.warn('[API CLOUDINARY SIGN] Missing folder');
      return NextResponse.json(
        { success: false, message: 'folder is required' },
        { status: 400 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    
    // Log configuration details safely
    console.log('[API CLOUDINARY SIGN] Config Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('[API CLOUDINARY SIGN] Config Secret Length:', process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0);
    console.log('[API CLOUDINARY SIGN] Config Secret preview:', process.env.CLOUDINARY_API_SECRET ? `${process.env.CLOUDINARY_API_SECRET.slice(0, 3)}...${process.env.CLOUDINARY_API_SECRET.slice(-3)}` : 'undefined');

    const paramsToSign = { timestamp, folder };
    console.log('[API CLOUDINARY SIGN] Params to sign:', paramsToSign);

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );
    console.log('[API CLOUDINARY SIGN] Generated signature:', signature);

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
    console.error('[API CLOUDINARY SIGN] Error:', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

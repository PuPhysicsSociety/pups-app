import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Event from '@/lib/models/Event';
import { verifyAuth } from '@/lib/auth';
import { deleteCloudinaryAsset, deleteCloudinaryAssets } from '@/lib/cloudinary';

const dbReady = connectDB();

type Context = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await dbReady;
    const item = await Event.findOne({ _id: id, deletedAt: { $ne: null } });
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Not found in trash' },
        { status: 404 }
      );
    }
    await Event.deleteOne({ _id: id });
    await Promise.all([
      deleteCloudinaryAsset(item.thumbnail),
      deleteCloudinaryAssets(item.past_images_preview),
    ]);
    return NextResponse.json({ success: true, message: 'Permanently deleted' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

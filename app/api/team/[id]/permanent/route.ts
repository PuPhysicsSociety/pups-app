import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TeamMember from '@/lib/models/TeamMember';
import { verifyAuth } from '@/lib/auth';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';

const dbReady = connectDB();

type Context = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await dbReady;
    // Require the record to be in the trash first — a permanent delete
    // should never be one click away from the normal list view, only
    // reachable from the confirm-again step in the Trash view.
    const item = await TeamMember.findOne({ _id: id, deletedAt: { $ne: null } });
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Not found in trash' },
        { status: 404 }
      );
    }
    await TeamMember.deleteOne({ _id: id });
    if (item.photo) await deleteCloudinaryAsset(item.photo);
    return NextResponse.json({ success: true, message: 'Permanently deleted' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

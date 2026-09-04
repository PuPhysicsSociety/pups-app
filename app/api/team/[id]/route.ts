import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TeamMember from '@/lib/models/TeamMember';
import { verifyAuth, isAuthenticated } from '@/lib/auth';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';

const dbReady = connectDB();

type Context = { params: Promise<{ id: string }> };

interface TeamMemberUpdateBody {
  name?: string;
  role?: string;
  email?: string;
  linkedin_url?: string;
  department?: string;
  bio?: string;
  photo?: string;
  active?: boolean;
  order?: number;
}

export async function GET(req: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    await dbReady;
    const item = await TeamMember.findById(id);
    const admin = isAuthenticated(req);
    // Treat an inactive or soft-deleted member as not-found for anonymous
    // visitors, same as the collection endpoint — no distinguishing
    // "exists but hidden" response that would confirm a guessed ID
    // belongs to a real record.
    if (!item || (!admin && (!item.active || item.deletedAt))) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await dbReady;
    const body: TeamMemberUpdateBody = await req.json();

    // If the photo is being replaced or explicitly cleared, delete the old
    // Cloudinary asset so it doesn't sit around unused. Only fires when
    // `photo` is actually present in the body and differs from what's
    // stored — omitting the key entirely (e.g. editing just the bio) never
    // touches the photo.
    if (typeof body.photo === 'string') {
      const existing = await TeamMember.findById(id).select('photo').lean();
      if (existing?.photo && existing.photo !== body.photo) {
        await deleteCloudinaryAsset(existing.photo);
      }
    }

    const item = await TeamMember.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await dbReady;
    // Soft delete — moves the record into the admin Trash view instead of
    // removing it outright. The Cloudinary photo is left alone until a
    // permanent delete, since the member might still be restored.
    const item = await TeamMember.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Moved to trash' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

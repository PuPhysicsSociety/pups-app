import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Event from '@/lib/models/Event';
import { verifyAuth, isAuthenticated } from '@/lib/auth';

const dbReady = connectDB();

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    await dbReady;
    const item = await Event.findById(id);
    if (!item || (item.deletedAt && !isAuthenticated(req))) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const { id } = await params;
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbReady;
    const body = await req.json();
    const item = await Event.findByIdAndUpdate(id, body, { new: true, runValidators: true });
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
  const { id } = await params;
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbReady;
    // Soft delete — see TeamMember's DELETE handler for the same pattern.
    const item = await Event.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Moved to trash' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

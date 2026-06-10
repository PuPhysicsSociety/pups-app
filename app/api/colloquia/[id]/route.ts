import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Colloquium from '@/lib/models/Colloquium';
import { verifyAuth } from '@/lib/auth';

const dbReady = connectDB();

type Context = { params: Promise<{ id: string }> };

interface ColloquiumUpdateBody {
  title?: string;
  speaker?: { name: string; affiliation?: string };
  abstract?: string;
  time?: string;
  venue?: string;
  ytLink?: string;
  poster?: string;
  reg_form_link?: string;
}

export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    await dbReady;
    const item = await Colloquium.findById(id);
    if (!item) {
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
    const body: ColloquiumUpdateBody = await req.json();
    const item = await Colloquium.findByIdAndUpdate(id, body, {
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
    const item = await Colloquium.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

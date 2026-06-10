import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LectureSeries from '@/lib/models/LectureSeries';
import { verifyAuth } from '@/lib/auth';

const dbReady = connectDB();

type Context = { params: Promise<{ id: string }> };

type SupplimentSource = 'cloudinary' | 'drive' | 'external';

interface AddSupplimentBody {
  url: string;
  name?: string;
  type?: string;
  source?: SupplimentSource;
}

interface RemoveSupplimentBody {
  url: string;
}

const VALID_SOURCES: SupplimentSource[] = ['cloudinary', 'drive', 'external'];

export async function POST(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await dbReady;
    const { url, name, type, source }: AddSupplimentBody = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, message: 'url is required' }, { status: 400 });
    }
    if (source && !VALID_SOURCES.includes(source)) {
      return NextResponse.json(
        { success: false, message: 'source must be cloudinary, drive, or external' },
        { status: 400 }
      );
    }

    const item = await LectureSeries.findByIdAndUpdate(
      id,
      { $push: { suppliments: { url, name, type, source } } },
      { new: true }
    );
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await dbReady;
    const { url }: RemoveSupplimentBody = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, message: 'url is required' }, { status: 400 });
    }

    const item = await LectureSeries.findByIdAndUpdate(
      id,
      { $pull: { suppliments: { url } } },
      { new: true }
    );
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

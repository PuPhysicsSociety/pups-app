import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Workshop from '@/lib/models/Workshop';
import { verifyAuth } from '@/lib/auth';

const dbReady = connectDB();

type Context = { params: Promise<{ id: string }> };

interface LecturerDetail {
  name: string;
  affiliation?: string;
  image?: string;
}

interface DateTime {
  start?: string;
  end?: string;
  schedule?: string;
}

interface ContactPerson {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface Subevent {
  title?: string;
  description?: string;
  date_time?: DateTime;
  speaker?: string;
}

interface WorkshopUpdateBody {
  title?: string;
  mode?: 'online' | 'offline';
  description?: string;
  lecturer_details?: LecturerDetail[];
  date_time?: DateTime;
  reg_form_link?: string;
  to_contact?: ContactPerson[];
  suppliments?: unknown[];
  past_images_preview?: string[];
  drive_link?: string;
  subevent?: Subevent[];
}

export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    await dbReady;
    const item = await Workshop.findById(id);
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
    const body: WorkshopUpdateBody = await req.json();
    const item = await Workshop.findByIdAndUpdate(id, body, {
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
    const item = await Workshop.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LectureSeries from '@/lib/models/LectureSeries';
import { verifyAuth } from '@/lib/auth';

const dbReady = connectDB();

type Context = { params: Promise<{ id: string }> };

interface LecturerDetail {
  name: string;
  affiliation?: string;
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

interface LectureSeriesUpdateBody {
  title?: string;
  mode?: 'online' | 'offline';
  description?: string;
  thumbnail?: string;
  lecturer_details?: LecturerDetail[];
  date_time?: DateTime;
  no_of_classes?: number;
  reg_form_link?: string;
  to_contact?: ContactPerson[];
  suppliments?: unknown[];
}

export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    await dbReady;
    const item = await LectureSeries.findById(id);
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
    const body: LectureSeriesUpdateBody = await req.json();
    const item = await LectureSeries.findByIdAndUpdate(id, body, {
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
    const item = await LectureSeries.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

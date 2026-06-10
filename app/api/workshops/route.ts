import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Workshop from '@/lib/models/Workshop';
import { verifyAuth } from '@/lib/auth';

const dbReady = connectDB();

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

interface WorkshopBody {
  title: string;
  mode: 'online' | 'offline';
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

export async function GET() {
  try {
    await dbReady;
    const items = await Workshop.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbReady;
    const body: WorkshopBody = await req.json();
    const item = await Workshop.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

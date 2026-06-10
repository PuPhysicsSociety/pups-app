import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Colloquium from '@/lib/models/Colloquium';
import { verifyAuth } from '@/lib/auth';

const dbReady = connectDB();

interface ColloquiumBody {
  title: string;
  speaker?: { name: string; affiliation?: string };
  abstract?: string;
  time?: string;
  venue?: string;
  ytLink?: string;
  poster?: string;
  reg_form_link?: string;
}

export async function GET() {
  try {
    await dbReady;
    const items = await Colloquium.find().sort({ createdAt: -1 });
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
    const body: ColloquiumBody = await req.json();
    const item = await Colloquium.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

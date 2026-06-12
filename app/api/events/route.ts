import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Event from '@/lib/models/Event';
import { verifyAuth } from '@/lib/auth';

const dbReady = connectDB();

export async function GET() {
  console.log('[API EVENTS GET] Fetching all events');
  try {
    await dbReady;
    const items = await Event.find().sort({ createdAt: -1 });
    console.log(`[API EVENTS GET] Successfully retrieved ${items.length} events`);
    return NextResponse.json({ success: true, data: items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API EVENTS GET] Error fetching events:', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('[API EVENTS POST] Creating new event');
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) {
    console.warn('[API EVENTS POST] Authentication failed');
    return auth;
  }

  try {
    await dbReady;
    const body = await req.json();
    console.log('[API EVENTS POST] Event payload title:', body?.title);
    const item = await Event.create(body);
    console.log('[API EVENTS POST] Event created successfully with ID:', item._id);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API EVENTS POST] Error creating event:', message);
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

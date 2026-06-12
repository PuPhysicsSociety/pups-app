import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Event from '@/lib/models/Event';
import { verifyAuth } from '@/lib/auth';

const dbReady = connectDB();

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const { id } = await params;
  console.log(`[API EVENTS GET BY ID] Fetching event with ID: ${id}`);
  try {
    await dbReady;
    const item = await Event.findById(id);
    if (!item) {
      console.warn(`[API EVENTS GET BY ID] Event with ID ${id} not found`);
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    console.log(`[API EVENTS GET BY ID] Event retrieved successfully: ${item.title}`);
    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[API EVENTS GET BY ID] Error fetching event ${id}:`, message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const { id } = await params;
  console.log(`[API EVENTS PUT] Updating event with ID: ${id}`);
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) {
    console.warn(`[API EVENTS PUT] Authentication failed for event ${id}`);
    return auth;
  }

  try {
    await dbReady;
    const body = await req.json();
    console.log(`[API EVENTS PUT] Payload title:`, body?.title);
    const item = await Event.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!item) {
      console.warn(`[API EVENTS PUT] Event with ID ${id} not found for update`);
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    console.log(`[API EVENTS PUT] Event with ID ${id} updated successfully`);
    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[API EVENTS PUT] Error updating event ${id}:`, message);
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const { id } = await params;
  console.log(`[API EVENTS DELETE] Deleting event with ID: ${id}`);
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) {
    console.warn(`[API EVENTS DELETE] Authentication failed for event ${id}`);
    return auth;
  }

  try {
    await dbReady;
    const item = await Event.findByIdAndDelete(id);
    if (!item) {
      console.warn(`[API EVENTS DELETE] Event with ID ${id} not found for deletion`);
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    console.log(`[API EVENTS DELETE] Event with ID ${id} deleted successfully`);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[API EVENTS DELETE] Error deleting event ${id}:`, message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

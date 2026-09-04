import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TeamMember from '@/lib/models/TeamMember';
import { verifyAuth } from '@/lib/auth';

const dbReady = connectDB();

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await dbReady;
    const item = await TeamMember.findByIdAndUpdate(id, { deletedAt: null }, { new: true });
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

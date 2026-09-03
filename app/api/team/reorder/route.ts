import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TeamMember from '@/lib/models/TeamMember';
import { verifyAuth } from '@/lib/auth';

const dbReady = connectDB();

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbReady;
    const { ids }: { ids: string[] } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ids must be a non-empty array' },
        { status: 400 }
      );
    }

    await TeamMember.bulkWrite(
      ids.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
      }))
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

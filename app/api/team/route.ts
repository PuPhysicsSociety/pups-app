import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TeamMember from '@/lib/models/TeamMember';
import { verifyAuth } from '@/lib/auth';

const dbReady = connectDB();

interface TeamMemberBody {
  name: string;
  role: string;
  email?: string;
  linkedin_url?: string;
  department?: string;
  bio?: string;
  photo?: string;
  active?: boolean;
  order?: number;
}

export async function GET(req: NextRequest) {
  try {
    await dbReady;
    const activeOnly = req.nextUrl.searchParams.get('active') === 'true';
    const filter = activeOnly ? { active: true } : {};
    const items = await TeamMember.find(filter).sort({ order: 1, createdAt: 1 });
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
    const body: TeamMemberBody = await req.json();

    if (!body.name?.trim() || !body.role?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name and role are required' },
        { status: 400 }
      );
    }

    const item = await TeamMember.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

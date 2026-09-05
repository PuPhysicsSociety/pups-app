import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { verifyAuth } from '@/lib/auth';

type Context = { params: Promise<{ page: string }> };

const VALID_PAGES = new Set(['home', 'about', 'contact']);

export async function POST(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { page } = await params;
  if (!VALID_PAGES.has(page)) {
    return NextResponse.json({ success: false, message: 'Unknown page' }, { status: 404 });
  }

  // Deliberately short-lived and single-purpose — this token only ever
  // proves "an admin asked to preview this one page recently", nothing more.
  const token = jwt.sign(
    { purpose: 'preview', page },
    process.env.JWT_SECRET!,
    { expiresIn: '10m' }
  );

  return NextResponse.json({ success: true, token });
}

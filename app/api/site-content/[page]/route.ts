import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SiteContent from '@/lib/models/SiteContent';
import { verifyAuth } from '@/lib/auth';
import { DEFAULT_HOME, DEFAULT_ABOUT, DEFAULT_CONTACT } from '@/lib/defaultSiteContent';

const dbReady = connectDB();

const DEFAULTS: Record<string, unknown> = {
  home: DEFAULT_HOME,
  about: DEFAULT_ABOUT,
  contact: DEFAULT_CONTACT,
};

type Context = { params: Promise<{ page: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const { page } = await params;
  if (!DEFAULTS[page]) {
    return NextResponse.json({ success: false, message: 'Unknown page' }, { status: 404 });
  }
  try {
    await dbReady;
    const doc = await SiteContent.findOne({ page });
    // Merge over the default so a field added to the default shape after
    // an admin last saved doesn't just disappear from the rendered page.
    const data = doc ? { ...DEFAULTS[page] as object, ...doc.data } : DEFAULTS[page];
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { page } = await params;
  if (!DEFAULTS[page]) {
    return NextResponse.json({ success: false, message: 'Unknown page' }, { status: 404 });
  }

  try {
    await dbReady;
    const data = await req.json();
    const doc = await SiteContent.findOneAndUpdate(
      { page },
      { page, data },
      { new: true, upsert: true, runValidators: true }
    );
    return NextResponse.json({ success: true, data: doc.data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { page } = await params;
  if (!DEFAULTS[page]) {
    return NextResponse.json({ success: false, message: 'Unknown page' }, { status: 404 });
  }

  try {
    await dbReady;
    await SiteContent.deleteOne({ page });
    return NextResponse.json({ success: true, data: DEFAULTS[page] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

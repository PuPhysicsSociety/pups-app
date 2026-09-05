import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SiteContent from '@/lib/models/SiteContent';
import { verifyAuth, isAuthenticated } from '@/lib/auth';
import { DEFAULT_HOME, DEFAULT_ABOUT, DEFAULT_CONTACT } from '@/lib/defaultSiteContent';

const dbReady = connectDB();

const DEFAULTS: Record<string, unknown> = {
  home: DEFAULT_HOME,
  about: DEFAULT_ABOUT,
  contact: DEFAULT_CONTACT,
};

type Context = { params: Promise<{ page: string }> };

export async function GET(req: NextRequest, { params }: Context) {
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

    // Admins editing the page need to know about an unpublished draft
    // (and see it in the form) — public visitors only ever get `data`.
    if (isAuthenticated(req) && req.nextUrl.searchParams.get('admin') === 'true') {
      const draft = doc?.draft ? { ...(data as object), ...doc.draft } : null;
      return NextResponse.json({ success: true, data, draft });
    }

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

  // ?mode=draft saves into the draft slot only, leaving the live site
  // untouched. Anything else (including no mode at all, for backward
  // compatibility) publishes immediately, same as before, and clears any
  // pending draft since it's now superseded by what was just published.
  const mode = req.nextUrl.searchParams.get('mode');

  try {
    await dbReady;
    const body = await req.json();

    if (mode === 'draft') {
      const doc = await SiteContent.findOneAndUpdate(
        { page },
        { page, draft: body, $setOnInsert: { data: DEFAULTS[page] } },
        { new: true, upsert: true, runValidators: true }
      );
      return NextResponse.json({ success: true, draft: doc.draft });
    }

    const doc = await SiteContent.findOneAndUpdate(
      { page },
      { page, data: body, draft: null },
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
    // Removes the whole document — published content and any pending
    // draft both reset to default.
    await SiteContent.deleteOne({ page });
    return NextResponse.json({ success: true, data: DEFAULTS[page] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

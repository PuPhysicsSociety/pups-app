import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AdminPayload {
  email: string;
}

export function verifyAuth(
  req: NextRequest
): { admin: AdminPayload } | NextResponse {
  const header = req.headers.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'No token provided' },
      { status: 401 }
    );
  }

  const token = header.split(' ')[1];

  try {
    const admin = jwt.verify(token, process.env.JWT_SECRET!) as AdminPayload;
    return { admin };
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}

/**
 * Non-throwing, non-rejecting auth check for endpoints that serve both
 * public and admin traffic (e.g. a public listing that should hide
 * unpublished/inactive records from anonymous visitors, but show
 * everything to a logged-in admin). Never returns a 401 — just tells the
 * caller whether to apply the public-facing filter.
 */
export function isAuthenticated(req: NextRequest): boolean {
  return !(verifyAuth(req) instanceof NextResponse);
}

export interface PreviewPayload {
  purpose: 'preview';
  page: 'home' | 'about' | 'contact';
}

/**
 * Verifies a short-lived preview token (see
 * /api/site-content/[page]/preview-token). Distinct from the main admin
 * JWT so a leaked preview link — which by design travels in a URL, e.g.
 * pasted into a Slack message — can't be used for anything beyond
 * viewing one page's draft for a few minutes.
 */
export function verifyPreviewToken(token: string, page: string): boolean {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as PreviewPayload;
    return payload.purpose === 'preview' && payload.page === page;
  } catch {
    return false;
  }
}

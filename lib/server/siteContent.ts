import { connectDB } from '@/lib/db';
import SiteContent from '@/lib/models/SiteContent';
import {
  DEFAULT_HOME, DEFAULT_ABOUT, DEFAULT_CONTACT,
  HomeContent, AboutContent, ContactContent,
} from '@/lib/defaultSiteContent';

const DEFAULTS = { home: DEFAULT_HOME, about: DEFAULT_ABOUT, contact: DEFAULT_CONTACT };

type ContentFor<T extends keyof typeof DEFAULTS> =
  T extends 'home' ? HomeContent : T extends 'about' ? AboutContent : ContactContent;

/**
 * Server-side counterpart to `getSiteContent()` in lib/api.ts. Used by
 * server components (Home/About/Contact) so page content is baked into
 * the initial HTML instead of appearing after a client-side fetch — same
 * merge-over-defaults behaviour as the API route, just without the
 * network round trip since it's the same process.
 */
export async function getSiteContentServer<T extends keyof typeof DEFAULTS>(
  page: T
): Promise<ContentFor<T>> {
  try {
    await connectDB();
    const doc = await SiteContent.findOne({ page }).lean<{ data: object } | null>();
    return (doc ? { ...DEFAULTS[page], ...doc.data } : DEFAULTS[page]) as ContentFor<T>;
  } catch {
    // DB unreachable, etc. — fall back to defaults rather than a broken page.
    return DEFAULTS[page] as ContentFor<T>;
  }
}

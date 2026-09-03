import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TeamMember from '@/lib/models/TeamMember';
import { verifyAuth } from '@/lib/auth';
import teamJson from '@/data/team.json';

interface LegacyTeamMember {
  id: number;
  name: string;
  role: string;
  linkedin_url?: string;
  email?: string;
  image?: string;
}

// A handful of legacy records carry this literal placeholder instead of a
// real profile URL, or no linkedin_url at all — treat both as "unset".
const PLACEHOLDER_LINKEDIN = new Set([
  'https://www.linkedin.com/',
  'http://www.linkedin.com/',
  'https://www.linkedin.com',
  'http://www.linkedin.com',
]);

function clean(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();

    const legacy = teamJson as LegacyTeamMember[];
    const results = { migrated: 0, skipped: 0, errors: [] as string[] };

    for (let i = 0; i < legacy.length; i++) {
      const m = legacy[i];
      try {
        const name = clean(m.name);
        const role = clean(m.role);
        if (!name || !role) {
          results.errors.push(`Record ${m.id ?? i}: missing name or role`);
          continue;
        }

        // Match on name+role since legacy numeric ids don't map to Mongo _ids.
        const exists = await TeamMember.findOne({ name, role });
        if (exists) { results.skipped++; continue; }

        const linkedin = clean(m.linkedin_url);

        await TeamMember.create({
          name,
          role,
          email: clean(m.email),
          linkedin_url: linkedin && !PLACEHOLDER_LINKEDIN.has(linkedin) ? linkedin : undefined,
          photo: clean(m.image),
          active: true,
          order: i,
        });
        results.migrated++;
      } catch (e: any) {
        results.errors.push(`Record ${m.id ?? i}: ${e.message}`);
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LectureSeries from '@/lib/models/LectureSeries';
import Workshop from '@/lib/models/Workshop';
import Event from '@/lib/models/Event';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();

    const [lectureSeries, workshops] = await Promise.all([
      LectureSeries.find().lean(),
      Workshop.find().lean(),
    ]);

    const results = { migrated: 0, skipped: 0, errors: [] as string[] };

    // Migrate LectureSeries → Event
    for (const ls of lectureSeries as any[]) {
      try {
        // Skip if already migrated (check by title + type)
        const exists = await Event.findOne({ title: ls.title, type: 'lecture_series' });
        if (exists) { results.skipped++; continue; }

        await Event.create({
          type:                'lecture_series',
          title:               ls.title,
          description:         ls.description,
          mode:                ls.mode,
          lecturer_details:    ls.lecturer_details || [],
          date_time:           ls.date_time,
          thumbnail:           ls.thumbnail,
          reg_form_link:       ls.reg_form_link,
          to_contact:          ls.to_contact || [],
          suppliments:         ls.suppliments || [],
          no_of_classes:       ls.no_of_classes,
          createdAt:           ls.createdAt,
          updatedAt:           ls.updatedAt,
        });
        results.migrated++;
      } catch (e: any) {
        results.errors.push(`LectureSeries ${ls._id}: ${e.message}`);
      }
    }

    // Migrate Workshop → Event
    for (const ws of workshops as any[]) {
      try {
        const exists = await Event.findOne({ title: ws.title, type: 'workshop' });
        if (exists) { results.skipped++; continue; }

        await Event.create({
          type:                'workshop',
          title:               ws.title,
          description:         ws.description,
          mode:                ws.mode,
          lecturer_details:    ws.lecturer_details || [],
          date_time:           ws.date_time,
          reg_form_link:       ws.reg_form_link,
          to_contact:          ws.to_contact || [],
          suppliments:         ws.suppliments || [],
          past_images_preview: ws.past_images_preview || [],
          drive_link:          ws.drive_link,
          subevent:            ws.subevent || [],
          createdAt:           ws.createdAt,
          updatedAt:           ws.updatedAt,
        });
        results.migrated++;
      } catch (e: any) {
        results.errors.push(`Workshop ${ws._id}: ${e.message}`);
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

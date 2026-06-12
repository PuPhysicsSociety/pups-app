import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import Event from '@/lib/models/Event';
import Colloquium from '@/lib/models/Colloquium';
import LectureSeries from '@/lib/models/LectureSeries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://puphysicssociety.vercel.app';

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/colloquium',
    '/events',
    '/team',
    '/contact',
    '/lecture-series',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    await connectDB();

    // 1. Fetch Events
    const events = await Event.find({}, '_id updatedAt').lean();
    events.forEach((event: any) => {
      sitemapEntries.push({
        url: `${baseUrl}/events/${event._id}`,
        lastModified: event.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });

    // 2. Fetch Colloquia
    const colloquia = await Colloquium.find({}, '_id updatedAt').lean();
    colloquia.forEach((colloquium: any) => {
      sitemapEntries.push({
        url: `${baseUrl}/colloquium/${colloquium._id}`,
        lastModified: colloquium.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });

    // 3. Fetch Lecture Series
    const lectureSeries = await LectureSeries.find({}, '_id updatedAt').lean();
    lectureSeries.forEach((series: any) => {
      sitemapEntries.push({
        url: `${baseUrl}/lecture-series/${series._id}`,
        lastModified: series.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });

  } catch (error) {
    console.error('[SITEMAP GENERATION] Error fetching dynamic routes:', error);
  }

  return sitemapEntries;
}
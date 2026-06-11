import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://puphysicssociety.vercel.app';

  const routes = [
    '',
    '/about',
    '/colloquium',
    '/events',
    '/team',
    '/contact',
    '/lecture-series',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
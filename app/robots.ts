import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/admin'],
      },
    ],
    sitemap: 'https://puphysicssociety.vercel.app/sitemap.xml',
  };
}
import { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import LectureSeries from '@/lib/models/LectureSeries';
import React from 'react';

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    const series = await LectureSeries.findById(id);
    if (!series) return { title: 'Lecture Series Not Found | PUPS' };
    
    const title = `${series.title} | Lecture Series | Presidency University Physics Society`;
    const description = series.description || 'Specialised lecture series organised by the Presidency University Physics Society.';
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: series.thumbnail ? [series.thumbnail] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: series.thumbnail ? [series.thumbnail] : [],
      },
    };
  } catch (e) {
    console.error('[SEO LECTURE SERIES METADATA] Error:', e);
    return { title: 'Lecture Series | PUPS' };
  }
}

export default function Layout({ children }: Props) {
  return <>{children}</>;
}

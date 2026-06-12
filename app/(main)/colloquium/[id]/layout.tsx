import { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import Colloquium from '@/lib/models/Colloquium';
import React from 'react';

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    const colloquium = await Colloquium.findById(id);
    if (!colloquium) return { title: 'Colloquium Not Found | PUPS' };
    
    const speakerName = colloquium.speaker?.name ? ` by ${colloquium.speaker.name}` : '';
    const title = `${colloquium.title}${speakerName} | Colloquium | Presidency University Physics Society`;
    const description = colloquium.abstract || 'Scientific Discussion Forum weekly colloquium organised by the Presidency University Physics Society.';
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: colloquium.poster ? [colloquium.poster] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: colloquium.poster ? [colloquium.poster] : [],
      },
    };
  } catch (e) {
    console.error('[SEO COLLOQUIUM METADATA] Error:', e);
    return { title: 'Colloquium | PUPS' };
  }
}

export default function Layout({ children }: Props) {
  return <>{children}</>;
}

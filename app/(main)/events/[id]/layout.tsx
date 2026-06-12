import { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import Event from '@/lib/models/Event';
import React from 'react';

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    const event = await Event.findById(id);
    if (!event) return { title: 'Event Not Found | PUPS' };
    
    const title = `${event.title} | Presidency University Physics Society`;
    const description = event.description || 'Join us for this event hosted by the Presidency University Physics Society.';
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: event.thumbnail ? [event.thumbnail] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: event.thumbnail ? [event.thumbnail] : [],
      },
    };
  } catch (e) {
    console.error('[SEO EVENTS METADATA] Error:', e);
    return { title: 'Event | PUPS' };
  }
}

export default function Layout({ children }: Props) {
  return <>{children}</>;
}

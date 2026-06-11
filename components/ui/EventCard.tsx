'use client';
import React from 'react';
import Link from 'next/link';
import type { Event } from '../../types';
import { getImageUrl } from '../../lib/api';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'carousel';
}

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
  const cardClasses = variant === 'carousel'
    ? 'flex-none w-[280px] snap-start no-underline bg-white dark:bg-[#25293c] text-black dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg'
    : 'no-underline text-black dark:text-white bg-white dark:bg-[#25293c] border border-gray-400 dark:border-gray-700 rounded-lg p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg';

  return (
    <Link href={`/events/${event.id}`} className={cardClasses}>
      <img
        src={getImageUrl(event.poster)}
        alt={event.name}
        onError={e => (e.currentTarget.src = '/placeholders/default.jpg')}
        className="w-full h-[200px] object-cover rounded-md"
      />
      <h3 className="mt-2 font-semibold text-lg">{event.name}</h3>
      <div className="text-sm opacity-70 mt-1">
        {event.date}{event.location ? ` • ${event.location}` : ''}
      </div>
      {event.tagline && <p className="mt-2 italic text-sm opacity-80">{event.tagline}</p>}
    </Link>
  );
}

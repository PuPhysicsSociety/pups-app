import React from 'react';
import Link from 'next/link';
import { Colloquium } from '../../types';
import { getImageUrl } from '../../lib/api';

interface ColloquiumCardProps {
  colloquium: Colloquium;
}

export default function ColloquiumCard({ colloquium }: ColloquiumCardProps) {
  return (
    <Link 
      href={`/colloquium/${colloquium.id}`} 
      className="no-underline text-black dark:text-white bg-white dark:bg-[#25293c] rounded-lg p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <h3 className="font-semibold text-lg">{colloquium.name}</h3>
      <div className="text-sm opacity-70 mt-1">{colloquium.date}</div>
      {colloquium.speaker && (
        <div className="italic mt-1 text-sm">
          Speaker: {colloquium.speaker}
        </div>
      )}
      <p className="mt-2 text-sm">
        {colloquium.abstract.slice(0, 120)}
        {colloquium.abstract.length > 120 ? '...' : ''}{' '}
        <span className="underline">Read more</span>
      </p>
    </Link>
  );
}

import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Events | Presidency University Physics Society',
  description: 'Conferences, workshops, and thematic gatherings organised by the Presidency University Physics Society (PUPS).',
  openGraph: {
    title: 'Events | Presidency University Physics Society',
    description: 'Conferences, workshops, and thematic gatherings organised by the Presidency University Physics Society (PUPS).',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

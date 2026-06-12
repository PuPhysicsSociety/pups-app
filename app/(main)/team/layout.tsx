import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Our Team | Presidency University Physics Society',
  description: 'Meet the executive committee, faculty coordinators, and student organizers behind the Presidency University Physics Society (PUPS).',
  openGraph: {
    title: 'Our Team | Presidency University Physics Society',
    description: 'Meet the executive committee, faculty coordinators, and student organizers behind the Presidency University Physics Society (PUPS).',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

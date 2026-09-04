import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'About Us | Presidency University Physics Society',
  description: 'Learn about the legacy of Presidency University Physics Department and the mission of the Presidency University Physics Society (PUPS).',
  openGraph: {
    title: 'About Us | Presidency University Physics Society',
    description: 'Learn about the legacy of Presidency University Physics Department and the mission of the Presidency University Physics Society (PUPS).',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

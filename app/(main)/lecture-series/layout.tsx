import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Lecture Series | Presidency University Physics Society',
  description: 'Specialised physics lecture series and academic discussions organised by the Presidency University Physics Society (PUPS).',
  openGraph: {
    title: 'Lecture Series | Presidency University Physics Society',
    description: 'Specialised physics lecture series and academic discussions organised by the Presidency University Physics Society (PUPS).',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

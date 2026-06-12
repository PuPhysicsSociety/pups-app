import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Colloquium | Presidency University Physics Society',
  description: 'Weekly colloquiums under the Scientific Discussion Forum organized by the Presidency University Physics Society (PUPS).',
  openGraph: {
    title: 'Colloquium | Presidency University Physics Society',
    description: 'Weekly colloquiums under the Scientific Discussion Forum organized by the Presidency University Physics Society (PUPS).',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

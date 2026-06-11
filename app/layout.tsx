import '../styles/globals.css';
import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { AuthProvider } from '../context/AuthContext';
import IntroOverlay from '../components/IntroOverlay';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'PUPS — Presidency University Physics Society',
  description: 'The Presidency University Physics Society organises weekly colloquia, panel discussions, and thematic events that cultivate a vibrant academic culture centred around the exploration of physics.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* Intro overlay — only on first visit per session */}
          <IntroOverlay />
          <Header />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
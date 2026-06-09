import '../styles/globals.css';
import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'PUPS — Presidency University Physics Society',
  description: 'The Presidency University Physics Society organises weekly colloquia, panel discussions, and thematic events that cultivate a vibrant academic culture centred around the exploration of physics.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

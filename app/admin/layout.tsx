'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ padding: '80px 0', textAlign: 'center', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--tx4)' }}>
      Loading…
    </div>
  );

  if (!user) return null;

  return <>{children}</>;
}

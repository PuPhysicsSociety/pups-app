'use client';
import React, { useEffect, useState } from 'react';
import { getAdminStats } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      getAdminStats()
        .then(d => setStats(d.data))
        .catch(() => setError('Could not load stats'));
    }
  }, [user]);

  const cards = stats ? [
    { label: 'Events', count: stats.events, href: '/admin/events', icon: '📅' },
    { label: 'Colloquium', count: stats.colloquium, href: '/admin/colloquium', icon: '🎓' },
    { label: 'Team Members', count: stats.team, href: '/admin/team', icon: '👥' },
    { label: 'Users', count: stats.users, href: '/admin/users', icon: '🔑' },
  ] : [];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Welcome back, {user?.name} 👋</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(c => (
            <Link
              key={c.label}
              href={c.href}
              className="no-underline bg-white dark:bg-[#25293c] border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="text-3xl font-bold text-inherit">{c.count}</div>
              <div className="text-sm opacity-60 mt-1 text-inherit">{c.label}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-[#25293c] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h3 className="font-semibold mb-3">Quick Links</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/admin/events', label: '+ Add Event' },
            { href: '/admin/colloquium', label: '+ Add Colloquium' },
            { href: '/admin/team', label: '+ Add Team Member' },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="no-underline text-inherit px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

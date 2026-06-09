'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNav = [
  { href: '/admin', label: '📊 Overview', exact: true },
  { href: '/admin/events', label: '📅 Events' },
  { href: '/admin/colloquium', label: '🎓 Colloquium' },
  { href: '/admin/team', label: '👥 Team' },
  { href: '/admin/users', label: '🔑 Users' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, canEdit } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center opacity-60">
          <div className="text-4xl mb-4 animate-pulse">⚛️</div>
          <p>Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[80vh]">
      {/* Admin header bar */}
      <div className="bg-white dark:bg-[#25293c] border border-gray-200 dark:border-gray-700 rounded-xl mb-6 p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚛️</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin Dashboard</h1>
            <p className="text-xs opacity-60">Logged in as <strong>{user.name}</strong> · {user.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm opacity-70 hover:opacity-100 transition-opacity no-underline text-inherit">
            ← Back to site
          </Link>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="text-sm px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar nav */}
        <aside className="md:w-48 flex-shrink-0">
          <nav className="bg-white dark:bg-[#25293c] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {adminNav.map(item => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3 text-sm no-underline text-inherit border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors
                    ${isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black font-semibold'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 opacity-80 hover:opacity-100'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

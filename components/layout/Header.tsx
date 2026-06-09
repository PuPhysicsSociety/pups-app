'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/colloquium', label: 'Colloquium' },
  { href: '/team', label: 'Team' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="nav-logo">
          <img src="/logo.png" alt="PUPS" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          <span className="nav-wm"><b>PUPS</b> Presidency University Physics Society</span>
        </Link>

        <ul className="nav-links">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={isActive(href) ? 'active' : ''}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/login" className="nav-login">Login</Link>

        <button
          className="nav-hamburger"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mob-drawer${mobileOpen ? ' open' : ''}`}>
        <ul className="mob-nav-links">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={isActive(href) ? 'active' : ''}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/login" className="mob-login-btn" onClick={() => setMobileOpen(false)}>
          Login
        </Link>
      </div>
    </>
  );
}

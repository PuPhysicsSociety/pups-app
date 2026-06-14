import React from 'react';
import Link from 'next/link';
import { Instagram, Linkedin, Youtube } from 'lucide-react';

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const SOCIALS = [
  {
    label: 'Facebook',
    href:  'https://www.facebook.com/share/1Ji9crLVGh/',
    icon:  <FacebookIcon size={16} />,
  },
  {
    label: 'Instagram',
    href:  'https://www.instagram.com/puphysicssociety',
    icon:  <Instagram size={16} strokeWidth={1.5} />,
  },
  {
    label: 'LinkedIn',
    href:  'https://www.linkedin.com/in/presidency-university-physics-society-3b6a87383',
    icon:  <Linkedin size={16} strokeWidth={1.5} />,
  },
  {
    label: 'YouTube',
    href:  'https://youtube.com/@puphysicssociety',
    icon:  <Youtube size={16} strokeWidth={1.5} />,
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="footer-inner">
      <div className="wrap">
        <div className="footer-grid">

          {/* Brand + address */}
          <div>
            <div className="footer-brand">
              Presidency University<br />
              <em style={{ color: '#5d0707', fontStyle: 'italic' }}>Physics</em> Society
            </div>
            <div className="footer-addr">
              86/1 College Street<br />
              Kolkata 700 073<br />
              West Bengal, India
            </div>
          </div>

          {/* Pages */}
          <div className="footer-col">
            <h5>Pages</h5>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/events">Events</Link>
            <Link href="/colloquium">Colloquium</Link>
            <Link href="/team">Team</Link>
            <Link href="/contact">Contact</Link>
          </div>

          {/* Society */}
          <div className="footer-col">
            <h5>Society</h5>
            <a href="https://www.presiuniv.ac.in/web/physics.php" target="_blank" rel="noopener">
              Dept. of Physics
            </a>
            <Link href="/contact">Contact</Link>
            <a href="mailto:puphysicssociety@gmail.com">puphysicssociety@gmail.com</a>

            {/* Social icons — sits below the text links */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
              {SOCIALS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`PUPS on ${label}`}
                  className="social-icon-link"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Events and Colloquia */}
          <div className="footer-col">
            <h5>Events and Colloquia</h5>
            <Link href="/colloquium">All Colloquia</Link>
            <Link href="/events">All Events</Link>
          </div>

        </div>

        <div className="foot-rule">
          <span>© {year} Presidency University Physics Society</span>
          <span>Kolkata, India</span>
        </div>
      </div>
    </div>
  );
}

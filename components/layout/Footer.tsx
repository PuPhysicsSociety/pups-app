import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="footer-inner">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              Presidency University<br /><em>Physics</em> Society
            </div>
            <div className="footer-addr">
              86/1 College Street<br />
              Kolkata 700 073<br />
              West Bengal, India
            </div>
          </div>

          <div className="footer-col">
            <h5>Pages</h5>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/events">Events</Link>
            <Link href="/colloquium">Colloquium</Link>
            <Link href="/team">Team</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className="footer-col">
            <h5>Society</h5>
            <a href="https://www.presiuniv.ac.in/web/physics.php" target="_blank" rel="noopener">
              Dept. of Physics
            </a>
            <Link href="/contact">Contact</Link>
            <a href="mailto:contact@pups.edu">contact@pups.edu</a>
          </div>

          <div className="footer-col">
            <h5>Colloquia</h5>
            <a href="https://www.youtube.com/watch?v=w1iAuKD-9Ks" target="_blank" rel="noopener">
              Talk 01 — YouTube
            </a>
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

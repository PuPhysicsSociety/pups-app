'use client';
import React from 'react';

/**
 * A simple swinging pendulum, drawn with CSS transforms (no animation
 * library) in the site's own palette. Doubles as a page-loading indicator
 * and, because it's cheap and self-contained, as a lightweight "something
 * is changing" transition cue between data states.
 *
 * Geometry is drawn in a fixed 0-100 viewBox (relative units), and the
 * actual on-screen size is controlled by CSS `clamp()` on the wrapper -
 * so it renders large on desktop but automatically scales down on
 * narrower screens instead of overflowing or needing a manual breakpoint.
 * `maxSize` raises/lowers the clamp ceiling; `minSize` the floor.
 */
export default function PendulumLoader({
  maxSize = 220,
  minSize = 120,
  label,
  inline = false,
}: {
  maxSize?: number;
  minSize?: number;
  label?: string;
  inline?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: inline ? 0 : '48px 0',
      }}
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading'}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          overflow: 'visible',
          width: `clamp(${minSize}px, 24vw, ${maxSize}px)`,
          aspectRatio: '1 / 1',
        }}
      >
        <rect x="35" y="1" width="30" height="8" rx="2" fill="var(--tx3)" />

        <g style={{
          transformOrigin: '50px 9px',
          animation: 'pendulum-swing 1.6s cubic-bezier(.45,0,.55,1) infinite alternate',
        }}>
          <line
            x1="50" y1="9" x2="50" y2="79"
            stroke="var(--tx4)" strokeWidth={1}
          />
          <circle cx="50" cy="79" r="9" fill="var(--cr)" />
        </g>

        <circle cx="50" cy="9" r="1.6" fill="var(--bg)" />
      </svg>
      {label && (
        <div style={{
          fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
          fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase',
          color: 'var(--tx4)',
        }}>
          {label}
        </div>
      )}
      <style>{`
        @keyframes pendulum-swing {
          from { transform: rotate(-24deg); }
          to   { transform: rotate(24deg); }
        }
      `}</style>
    </div>
  );
}

'use client';

/**
 * LectureSeriesCard
 * -----------------
 * Event card for a single lecture — poster image on the right,
 * date + content on the left. Matches PUPS design system variables.
 *
 * Usage:
 *   import LectureSeriesCard from '@/components/LectureSeriesCard';
 *
 *   <LectureSeriesCard
 *     date="28 June 2025"
 *     title="Quantum Entanglement & the Arrow of Time"
 *     speaker="Prof. Arnab Bose"
 *     affiliation="IISER Kolkata"
 *     description="A talk exploring the deep connections between quantum non-locality and thermodynamic irreversibility."
 *     venue="Room 301, Centenary Building"
 *     time="4:30 PM"
 *     posterSrc="/posters/quantum-talk.jpg"
 *     posterAlt="Quantum Entanglement lecture poster"
 *     onClick={() => router.push('/events/quantum-entanglement')}
 *   />
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LectureSeriesCardProps {
  /** Day + Month + Year — displayed as big typographic date */
  date: string;
  /** Talk title (displayed in Cormorant Garamond) */
  title: string;
  /** Speaker full name */
  speaker: string;
  /** Speaker affiliation / institution */
  affiliation?: string;
  /** Short description / abstract excerpt */
  description?: string;
  /** Venue / room */
  venue?: string;
  /** Time string e.g. "4:30 PM" */
  time?: string;
  /** Poster image src — portrait ratio recommended (e.g. 2:3) */
  posterSrc: string;
  /** Alt text for poster image */
  posterAlt?: string;
  /** Poster width in px. Default: 180 */
  posterWidth?: number;
  /** Called when card is clicked */
  onClick?: () => void;
  /** Extra className on the root element */
  className?: string;
  style?: React.CSSProperties;
  /** Override the tag label. Default: "Lecture Series" */
  tagLabel?: string;
}

// ─── Tokens (fall back gracefully when PUPS CSS vars aren't present) ──────────

const T = {
  tx:    'var(--tx,   #1f1b16)',
  tx2:   'var(--tx2,  rgba(31,27,22,.78))',
  tx3:   'var(--tx3,  rgba(31,27,22,.55))',
  tx4:   'var(--tx4,  rgba(31,27,22,.32))',
  rule:  'var(--rule, rgba(31,27,22,.14))',
  cr:    'var(--cr,   #a07a36)',
  serif: "'Cormorant Garamond', Georgia, serif",
  mono:  "'IBM Plex Mono', 'Courier New', monospace",
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: T.mono,
      fontSize: 9,
      letterSpacing: '0.22em',
      textTransform: 'uppercase' as const,
      color: T.tx4,
    }}>
      {children}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: T.mono,
      fontSize: 9,
      letterSpacing: '0.18em',
      textTransform: 'uppercase' as const,
      border: `1px solid ${T.rule}`,
      color: T.tx3,
      padding: '5px 10px',
      whiteSpace: 'nowrap' as const,
      alignSelf: 'flex-start' as const,
    }}>
      {children}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LectureSeriesCard({
  date,
  title,
  speaker,
  affiliation,
  description,
  venue,
  time,
  posterSrc,
  posterAlt = '',
  posterWidth = 180,
  onClick,
  className = '',
  style,
  tagLabel = 'Lecture Series',
}: LectureSeriesCardProps) {

  // Parse date into parts for the typographic date display
  const dateParts = date.split(' ');
  const day   = dateParts[0] ?? '';
  const month = dateParts[1] ?? '';
  const year  = dateParts[2] ?? '';

  return (
    <article
      className={`pups-lecture-card${className ? ` ${className}` : ''}`}
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: `96px 1fr ${posterWidth}px`,
        gap: '28px',
        alignItems: 'start',
        padding: '28px 0',
        borderTop: `1px solid ${T.rule}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s',
        ...style,
      }}
      onMouseEnter={e => {
        if (onClick) (e.currentTarget as HTMLElement).style.background = 'rgba(31,27,22,.03)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {/* ── Column 1: Typographic date ─────────────────────────────── */}
      <div style={{ paddingTop: 2 }}>
        <b style={{
          display: 'block',
          fontFamily: T.serif,
          fontSize: 42,
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: T.tx,
        }}>
          {day}
        </b>
        <div style={{
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: T.tx3,
          lineHeight: 2,
          marginTop: 4,
        }}>
          {month}{year && <><br />{year}</>}
        </div>
      </div>

      {/* ── Column 2: Content ──────────────────────────────────────── */}
      <div style={{ minWidth: 0 }}>
        {/* Tag row */}
        <div style={{ marginBottom: 10 }}>
          <Tag>{tagLabel}</Tag>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: T.serif,
          fontSize: 24,
          fontWeight: 400,
          lineHeight: 1.18,
          letterSpacing: '-0.01em',
          color: T.tx,
          marginBottom: 10,
        }}>
          {title}
        </h3>

        {/* Speaker */}
        <p style={{
          fontFamily: T.mono,
          fontSize: 10.5,
          letterSpacing: '0.04em',
          color: T.tx3,
          lineHeight: 1.75,
          marginBottom: description ? 10 : 0,
        }}>
          <span style={{ color: T.tx2, fontWeight: 500 }}>{speaker}</span>
          {affiliation && <span style={{ color: T.tx4 }}> · {affiliation}</span>}
        </p>

        {/* Description */}
        {description && (
          <p style={{
            fontFamily: T.mono,
            fontSize: 11.5,
            lineHeight: 1.75,
            color: T.tx3,
            marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>
            {description}
          </p>
        )}

        {/* Venue + time */}
        {(venue || time) && (
          <div style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap' as const,
          }}>
            {time && (
              <Label>
                <span style={{ color: T.cr, marginRight: 6 }}>◦</span>{time}
              </Label>
            )}
            {venue && <Label>{venue}</Label>}
          </div>
        )}
      </div>

      {/* ── Column 3: Poster image ─────────────────────────────────── */}
      <div style={{
        width: posterWidth,
        aspectRatio: '2/3',
        overflow: 'hidden',
        border: `1px solid ${T.rule}`,
        flexShrink: 0,
      }}>
        <img
          src={posterSrc}
          alt={posterAlt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s cubic-bezier(.2,0,.4,1)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
          }}
        />
      </div>
    </article>
  );
}

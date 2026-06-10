'use client';

/**
 * WorkshopCard
 * ------------
 * Event card for a hands-on workshop — content row at top,
 * 2–3 landscape photos displayed below as a tight image strip.
 * Matches PUPS design system variables.
 *
 * Usage:
 *   import WorkshopCard from '@/components/WorkshopCard';
 *
 *   <WorkshopCard
 *     date="12 July 2025"
 *     title="Experimental Optics: Building a Michelson Interferometer"
 *     facilitator="Dr. Priya Sengupta"
 *     affiliation="Dept. of Physics"
 *     description="A hands-on session where participants assemble and calibrate a Michelson interferometer from scratch."
 *     venue="Optics Lab, 2nd Floor"
 *     time="10:00 AM – 1:00 PM"
 *     capacity="20 participants"
 *     images={[
 *       { src: '/workshop/optics-1.jpg', alt: 'Students assembling the interferometer' },
 *       { src: '/workshop/optics-2.jpg', alt: 'Laser alignment demonstration' },
 *       { src: '/workshop/optics-3.jpg', alt: 'Fringe pattern on projection screen' },
 *     ]}
 *     onClick={() => router.push('/events/optics-workshop')}
 *   />
 */

import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkshopImage {
  src: string;
  alt?: string;
}

export interface WorkshopCardProps {
  /** Day + Month + Year — displayed as big typographic date */
  date: string;
  /** Workshop title */
  title: string;
  /** Facilitator / instructor name */
  facilitator: string;
  /** Facilitator affiliation / department */
  affiliation?: string;
  /** Short description */
  description?: string;
  /** Venue / room */
  venue?: string;
  /** Time / duration string e.g. "10:00 AM – 1:00 PM" */
  time?: string;
  /** Max participants or any capacity string */
  capacity?: string;
  /**
   * 2 or 3 workshop images (landscape ratio recommended, e.g. 4:3 or 16:9).
   * Min: 1, Max: 3. The strip adapts to the count automatically.
   */
  images: WorkshopImage[];
  /** Image strip height in px. Default: 200 */
  imageHeight?: number;
  /** Called when the card is clicked */
  onClick?: () => void;
  /** Extra className on the root element */
  className?: string;
  style?: React.CSSProperties;
  /** Override the tag label. Default: "Workshop" */
  tagLabel?: string;
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

const T = {
  tx:    'var(--tx,   #1f1b16)',
  tx2:   'var(--tx2,  rgba(31,27,22,.78))',
  tx3:   'var(--tx3,  rgba(31,27,22,.55))',
  tx4:   'var(--tx4,  rgba(31,27,22,.32))',
  rule:  'var(--rule, rgba(31,27,22,.14))',
  s1:    'var(--s1,   #efe6d2)',
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
      color: T.cr,
      borderColor: T.cr,
      padding: '5px 10px',
      whiteSpace: 'nowrap' as const,
    }}>
      {children}
    </span>
  );
}

// ─── Image strip ──────────────────────────────────────────────────────────────

function ImageStrip({
  images,
  height,
  rule,
}: {
  images: WorkshopImage[];
  height: number;
  rule: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const clamped = images.slice(0, 3);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${clamped.length}, 1fr)`,
      gap: 2,
      height,
      marginTop: 20,
      border: `1px solid ${rule}`,
      overflow: 'hidden',
    }}>
      {clamped.map((img, i) => (
        <div
          key={i}
          style={{
            overflow: 'hidden',
            position: 'relative',
            borderRight: i < clamped.length - 1 ? `1px solid ${rule}` : 'none',
          }}
          onMouseEnter={() => setHoveredIdx(i)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <img
            src={img.src}
            alt={img.alt ?? ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.5s cubic-bezier(.2,0,.4,1)',
              transform: hoveredIdx === i ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          {/* subtle vignette on hover */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(31,27,22,.0)',
            transition: 'background 0.3s',
            pointerEvents: 'none',
            ...(hoveredIdx === i ? { background: 'rgba(31,27,22,.06)' } : {}),
          }} />
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WorkshopCard({
  date,
  title,
  facilitator,
  affiliation,
  description,
  venue,
  time,
  capacity,
  images,
  imageHeight = 200,
  onClick,
  className = '',
  style,
  tagLabel = 'Workshop',
}: WorkshopCardProps) {

  const dateParts = date.split(' ');
  const day   = dateParts[0] ?? '';
  const month = dateParts[1] ?? '';
  const year  = dateParts[2] ?? '';

  return (
    <article
      className={`pups-workshop-card${className ? ` ${className}` : ''}`}
      onClick={onClick}
      style={{
        padding: '28px 0',
        borderTop: `1px solid ${T.rule}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s',
        ...style,
      }}
      onMouseEnter={e => {
        if (onClick) (e.currentTarget as HTMLElement).style.background = 'rgba(31,27,22,.025)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {/* ── Top row: date | content | tag ─────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '96px 1fr auto',
        gap: '28px',
        alignItems: 'start',
      }}>

        {/* Date column */}
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

        {/* Content column */}
        <div style={{ minWidth: 0 }}>
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

          {/* Facilitator */}
          <p style={{
            fontFamily: T.mono,
            fontSize: 10.5,
            letterSpacing: '0.04em',
            color: T.tx3,
            lineHeight: 1.75,
            marginBottom: description ? 10 : 0,
          }}>
            <span style={{ color: T.tx2, fontWeight: 500 }}>{facilitator}</span>
            {affiliation && (
              <span style={{ color: T.tx4 }}> · {affiliation}</span>
            )}
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
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}>
              {description}
            </p>
          )}

          {/* Meta row */}
          {(time || venue || capacity) && (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
              {time && (
                <Label>
                  <span style={{ color: T.cr, marginRight: 6 }}>◦</span>{time}
                </Label>
              )}
              {venue && <Label>{venue}</Label>}
              {capacity && (
                <Label>
                  <span style={{ color: T.cr, marginRight: 6 }}>↑</span>{capacity}
                </Label>
              )}
            </div>
          )}
        </div>

        {/* Tag column */}
        <div style={{ paddingTop: 4 }}>
          <Tag>{tagLabel}</Tag>
        </div>
      </div>

      {/* ── Image strip ────────────────────────────────────────────── */}
      {images.length > 0 && (
        <ImageStrip
          images={images}
          height={imageHeight}
          rule={T.rule}
        />
      )}
    </article>
  );
}

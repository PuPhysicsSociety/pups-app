'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLectureSeries } from '@/lib/api';
import { LectureSeries } from '../../../types';

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

function fmtDay(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : String(d.getDate());
}

function fmtMonthYear(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

interface EventRowProps {
  day: string;
  monthYear: string;
  title: string;
  speaker?: string;
  affiliation?: string;
  description?: string;
  time?: string;
  venue?: string;
  tag: string;
  onClick?: () => void;
}

function EventRow({ day, monthYear, title, speaker, affiliation, description, time, venue, tag, onClick }: EventRowProps) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '96px 1fr auto',
        gap: '28px',
        alignItems: 'start',
        padding: '28px 0',
        borderTop: `1px solid ${T.rule}`,
        cursor: onClick ? 'pointer' : 'default',
        background: hovered && onClick ? 'rgba(31,27,22,.025)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
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
          lineHeight: 1.8,
          marginTop: 4,
        }}>
          {monthYear}
        </div>
      </div>

      {/* Content column */}
      <div style={{ minWidth: 0 }}>
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

        {speaker && (
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
        )}

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

        {(time || venue) && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
            {time && (
              <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.tx4 }}>
                <span style={{ color: T.cr, marginRight: 6 }}>◦</span>{time}
              </span>
            )}
            {venue && (
              <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.tx4 }}>
                {venue}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tag column */}
      <div style={{ paddingTop: 4 }}>
        <span style={{
          fontFamily: T.mono,
          fontSize: 9,
          letterSpacing: '0.18em',
          textTransform: 'uppercase' as const,
          border: `1px solid ${T.rule}`,
          color: T.tx3,
          padding: '5px 10px',
          whiteSpace: 'nowrap' as const,
        }}>
          {tag}
        </span>
      </div>
    </article>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [series, setSeries] = useState<LectureSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getLectureSeries()
      .then(data => setSeries(data.data || []))
      .catch(() => setError('Could not load events.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-label"><b>iii</b>Events</div>
          <h2 className="sec-title">Conferences, workshops &amp; <em>gatherings</em>.</h2>
        </div>

        {loading && (
          <div style={{ padding: '40px 0', color: 'var(--tx4)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Loading…
          </div>
        )}
        {error && (
          <div style={{ padding: '40px 0', color: '#8c1c1c', fontSize: 12 }}>{error}</div>
        )}
        {!loading && !error && series.length === 0 && (
          <div style={{ padding: '40px 0', color: 'var(--tx4)', fontSize: 12 }}>No events available yet.</div>
        )}

        {!loading && !error && series.length > 0 && (
          <div>
            {series.map(ls => {
              const firstLecturer = ls.lecturerDetails?.[0];
              return (
                <EventRow
                  key={ls.id}
                  day={fmtDay(ls.dateTime?.start)}
                  monthYear={fmtMonthYear(ls.dateTime?.start)}
                  title={ls.title}
                  speaker={firstLecturer?.name}
                  affiliation={firstLecturer?.affiliation}
                  description={ls.description}
                  time={ls.dateTime?.schedule}
                  venue={ls.mode === 'online' ? 'Online' : undefined}
                  tag="Lecture Series"
                  onClick={() => router.push(`/lecture-series/${ls.id}`)}
                />
              );
            })}
            {/* Workshop rows will slot in here once /api/workshop is ready */}
          </div>
        )}
      </div>
    </section>
  );
}

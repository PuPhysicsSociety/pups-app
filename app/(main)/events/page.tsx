'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEvents } from '@/lib/api';
import { UnifiedEvent } from '../../../types';

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

const TYPE_LABELS: Record<string, string> = {
  lecture_series: 'Lecture Series',
  workshop:       'Workshop',
  conference:     'Conference',
};

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
  event: UnifiedEvent;
  onClick?: () => void;
}

function EventRow({ event, onClick }: EventRowProps) {
  const [hovered, setHovered] = React.useState(false);
  const firstLecturer = event.lecturerDetails?.[0];
  const day       = fmtDay(event.dateTime?.start);
  const monthYear = fmtMonthYear(event.dateTime?.start);
  const tag       = TYPE_LABELS[event.type] || event.type;

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
        {day && (
          <b style={{
            display: 'block', fontFamily: T.serif, fontSize: 42,
            fontWeight: 300, lineHeight: 1, letterSpacing: '-0.02em', color: T.tx,
          }}>
            {day}
          </b>
        )}
        <div style={{
          fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: T.tx3, lineHeight: 1.8, marginTop: 4,
        }}>
          {monthYear || (event.dateTime?.schedule ? '' : '—')}
        </div>
      </div>

      {/* Content column */}
      <div style={{ minWidth: 0 }}>
        <h3 style={{
          fontFamily: T.serif, fontSize: 24, fontWeight: 400,
          lineHeight: 1.18, letterSpacing: '-0.01em', color: T.tx, marginBottom: 10,
        }}>
          {event.title}
        </h3>

        {firstLecturer && (
          <p style={{
            fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.04em',
            color: T.tx3, lineHeight: 1.75, marginBottom: event.description ? 10 : 0,
          }}>
            <span style={{ color: T.tx2, fontWeight: 500 }}>{firstLecturer.name}</span>
            {firstLecturer.affiliation && (
              <span style={{ color: T.tx4 }}> · {firstLecturer.affiliation}</span>
            )}
          </p>
        )}

        {event.description && (
          <p style={{
            fontFamily: T.mono, fontSize: 11.5, lineHeight: 1.75, color: T.tx3,
            marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>
            {event.description}
          </p>
        )}

        {(event.dateTime?.schedule || event.venue || event.mode === 'online') && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
            {event.dateTime?.schedule && (
              <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.tx4 }}>
                <span style={{ color: T.cr, marginRight: 6 }}>◦</span>{event.dateTime.schedule}
              </span>
            )}
            {(event.venue || event.mode === 'online') && (
              <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.tx4 }}>
                {event.venue || 'Online'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tag column */}
      <div style={{ paddingTop: 4 }}>
        <span style={{
          fontFamily: T.mono, fontSize: 9, letterSpacing: '0.18em',
          textTransform: 'uppercase' as const,
          border: `1px solid ${T.rule}`, color: T.tx3,
          padding: '5px 10px', whiteSpace: 'nowrap' as const,
        }}>
          {tag}
        </span>
      </div>
    </article>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [events,  setEvents]  = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getEvents()
      .then(data => setEvents(data.data || []))
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
        {!loading && !error && events.length === 0 && (
          <div style={{ padding: '40px 0', color: 'var(--tx4)', fontSize: 12 }}>No events available yet.</div>
        )}

        {!loading && !error && events.length > 0 && (
          <div>
            {events.map(ev => (
              <EventRow
                key={ev.id}
                event={ev}
                onClick={() => router.push(`/events/${ev.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

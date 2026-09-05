'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEvents } from '@/lib/api';
import { withMinDelay } from '@/lib/withMinDelay';
import { UnifiedEvent } from '../../../types';
import PendulumLoader from '@/components/ui/PendulumLoader';

const T = {
  tx:    'var(--tx,   #1a1710)',
  tx2:   'var(--tx2,  rgba(26,23,16,.94))',
  tx3:   'var(--tx3,  rgba(26,23,16,.72))',
  tx4:   'var(--tx4,  rgba(26,23,16,.50))',
  rule:  'var(--rule, rgba(26,23,16,.13))',
  cr:    'var(--cr,   #9b7230)',
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
  const firstLecturer = event.lecturerDetails?.[0];
  const day           = fmtDay(event.dateTime?.start);
  const monthYear     = fmtMonthYear(event.dateTime?.start);
  const tag           = TYPE_LABELS[event.type] || event.type;

  return (
    <article
      className="ev-row"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', color: T.tx }}
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

        {/* Tag — mobile only, sits below title, hidden on desktop */}
        <div className="ev-row-tag-mobile">{tag}</div>

        {firstLecturer && (
          <p style={{
            fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.04em',
            color: T.tx3, lineHeight: 1.75,
            marginBottom: event.description ? 10 : 0,
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
              <span style={{
                fontFamily: T.mono, fontSize: 9, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: T.tx4,
              }}>
                <span style={{ color: T.cr, marginRight: 6 }}>◦</span>
                {event.dateTime.schedule}
              </span>
            )}
            {(event.venue || event.mode === 'online') && (
              <span style={{
                fontFamily: T.mono, fontSize: 9, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: T.tx4,
              }}>
                {event.venue || 'Online'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tag — desktop only, far-right column, hidden on mobile */}
      <div className="ev-row-tag-desktop">{tag}</div>
    </article>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [events,  setEvents]  = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [query, setQuery]     = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  useEffect(() => {
    withMinDelay(getEvents())
      .then(data => setEvents(data.data || []))
      .catch(() => setError('Could not load events.'))
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(() => {
    const set = new Set<string>();
    events.forEach(ev => {
      const y = ev.dateTime?.start ? new Date(ev.dateTime.start).getFullYear() : null;
      if (y && !isNaN(y)) set.add(String(y));
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter(ev => {
      if (typeFilter !== 'all' && ev.type !== typeFilter) return false;
      if (yearFilter !== 'all') {
        const y = ev.dateTime?.start ? new Date(ev.dateTime.start).getFullYear() : null;
        if (String(y) !== yearFilter) return false;
      }
      if (!q) return true;
      const speakerMatch = ev.lecturerDetails?.some(l => l.name?.toLowerCase().includes(q));
      return (
        ev.title?.toLowerCase().includes(q) ||
        ev.description?.toLowerCase().includes(q) ||
        !!speakerMatch
      );
    });
  }, [events, query, typeFilter, yearFilter]);

  const hasFilters = query.trim() !== '' || typeFilter !== 'all' || yearFilter !== 'all';

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-label"><b>iii</b>Events</div>
          <h2 className="sec-title">Conferences, workshops &amp; <em>gatherings</em>.</h2>
        </div>

        {!loading && !error && events.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap' as const, gap: 12,
            marginBottom: 32, alignItems: 'center',
          }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, speaker…"
              style={{
                flex: '1 1 220px', minWidth: 180, padding: '10px 14px',
                fontFamily: T.mono, fontSize: 12.5, color: T.tx,
                background: 'transparent', border: `1px solid ${T.rule}`,
                outline: 'none',
              }}
            />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{
                padding: '10px 12px', fontFamily: T.mono, fontSize: 11.5,
                color: T.tx2, background: 'transparent', border: `1px solid ${T.rule}`,
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="all">All types</option>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            {years.length > 0 && (
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                style={{
                  padding: '10px 12px', fontFamily: T.mono, fontSize: 11.5,
                  color: T.tx2, background: 'transparent', border: `1px solid ${T.rule}`,
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all">All years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
          </div>
        )}

        {loading && <PendulumLoader label="Loading events" />}

        {error && (
          <div style={{ padding: '40px 0', color: '#8c1c1c', fontSize: 12 }}>
            {error}
          </div>
        )}
        {!loading && !error && events.length === 0 && (
          <div style={{ padding: '40px 0', color: 'var(--tx4)', fontSize: 12 }}>
            No events available yet.
          </div>
        )}
        {!loading && !error && events.length > 0 && filtered.length === 0 && (
          <div style={{ padding: '40px 0', color: 'var(--tx4)', fontSize: 12 }}>
            No events match{hasFilters ? ' your search' : ''}.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div>
            {filtered.map(ev => (
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
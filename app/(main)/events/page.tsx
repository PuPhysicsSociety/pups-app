'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEvents } from '@/lib/api';
import { Event } from '../../../types';

function parseDateParts(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: dateStr, mon: '' };
  return {
    day: d.getDate().toString(),
    mon: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          <h2 className="sec-title">All <em>events</em>.</h2>
        </div>

        {loading && (
          <div style={{ padding: '40px 0', color: 'var(--tx4)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Loading events…
          </div>
        )}
        {error && (
          <div style={{ padding: '40px 0', color: '#8c1c1c', fontSize: 12 }}>{error}</div>
        )}
        {!loading && !error && events.length === 0 && (
          <div style={{ padding: '40px 0', color: 'var(--tx4)', fontSize: 12 }}>No events available yet.</div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="ev-list">
            {events.map((ev, i) => {
              const { day, mon } = parseDateParts(ev.date);
              const speakers = Array.isArray(ev.speakers) ? ev.speakers : [];
              return (
                <Link key={ev.id || i} href={`/events/${ev.id}`} className="ev">
                  <div className="ev-dc">
                    <b>{day}</b>
                    <div className="ym">{mon}</div>
                  </div>
                  <div>
                    <h3>{ev.name}</h3>
                    {ev.description && (
                      <p className="ev-desc">{ev.description.slice(0, 140)}{ev.description.length > 140 ? '…' : ''}</p>
                    )}
                    {speakers.length > 0 && (
                      <p className="ev-spk"><b>Speakers:</b> {speakers.join(', ')}</p>
                    )}
                    {ev.location && <div className="ev-meta">{ev.location}</div>}
                  </div>
                  {ev.type && <div className="ev-tag">{ev.type}</div>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLectureSeries } from '@/lib/api';
import { LectureSeries } from '../../../types';

function parseDateParts(iso?: string) {
  if (!iso) return { day: '—', mon: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { day: '—', mon: '' };
  return {
    day: d.getDate().toString(),
    mon: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
  };
}

export default function EventsPage() {
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
          <div className="ev-list">
            {series.map(ls => {
              const { day, mon } = parseDateParts(ls.dateTime?.start);
              const lecturers = ls.lecturerDetails || [];
              return (
                <Link key={ls.id} href={`/lecture-series/${ls.id}`} className="ev">
                  <div className="ev-dc">
                    <b>{day}</b>
                    <div className="ym">{mon}</div>
                  </div>
                  <div>
                    <h3>{ls.title}</h3>
                    {ls.description && (
                      <p className="ev-desc">{ls.description.slice(0, 160)}{ls.description.length > 160 ? '…' : ''}</p>
                    )}
                    {lecturers.length > 0 && (
                      <p className="ev-spk"><b>Speakers:</b> {lecturers.map(l => l.name).join(', ')}</p>
                    )}
                    {ls.dateTime?.schedule && (
                      <div className="ev-meta">{ls.dateTime.schedule}</div>
                    )}
                  </div>
                  {ls.thumbnail ? (
                    <img
                      src={ls.thumbnail}
                      alt={ls.title}
                      onError={e => (e.currentTarget.style.display = 'none')}
                      style={{ width: 100, height: 70, objectFit: 'cover', alignSelf: 'start', marginTop: 4, border: '1px solid var(--rule)' }}
                    />
                  ) : (
                    <div className="ev-tag">{ls.mode}</div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

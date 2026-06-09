'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLectureSeries } from '@/lib/api';
import { LectureSeries } from '../../../types';

export default function LectureSeriesPage() {
  const [list, setList]     = useState<LectureSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLectureSeries()
      .then(d => setList(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-label"><b>iii</b>Lecture Series</div>
          <h2 className="sec-title">Structured <em>learning</em> in physics.</h2>
        </div>

        {loading && (
          <div style={{ color: 'var(--tx4)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', padding: '40px 0' }}>
            Loading…
          </div>
        )}

        {!loading && list.length === 0 && (
          <div style={{ color: 'var(--tx4)', fontSize: 12, padding: '40px 0' }}>No lecture series available yet.</div>
        )}

        {!loading && list.length > 0 && (
          <div className="ls-grid">
            {list.map(ls => (
              <Link key={ls.id} href={`/lecture-series/${ls.id}`} className="ls-card">
                <div className="ls-mode">{ls.mode}</div>
                <div className="ls-card-title">{ls.title}</div>
                {ls.lecturerDetails?.length > 0 && (
                  <div className="ls-card-meta">
                    {ls.lecturerDetails.map(l => l.name).join(', ')}
                  </div>
                )}
                {ls.description && <div className="ls-card-desc">{ls.description}</div>}
                {ls.dateTime?.schedule && (
                  <div className="ls-card-meta" style={{ marginTop: 10 }}>{ls.dateTime.schedule}</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

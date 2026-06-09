'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getColloquium } from '@/lib/api';
import { Colloquium } from '../../../types';

export default function ColloquiumPage() {
  const [entries, setEntries] = useState<Colloquium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getColloquium()
      .then(data => setEntries(data.data || []))
      .catch(() => setError('Could not load colloquium entries.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-label"><b>iv</b>Colloquium</div>
          <h2 className="sec-title">Weekly <em>talks</em>.</h2>
        </div>

        {loading && (
          <div style={{ color: 'var(--tx4)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', padding: '40px 0' }}>
            Loading…
          </div>
        )}
        {error && (
          <div style={{ color: '#8c1c1c', fontSize: 12, padding: '40px 0' }}>{error}</div>
        )}
        {!loading && !error && entries.length === 0 && (
          <div style={{ color: 'var(--tx4)', fontSize: 12, padding: '40px 0' }}>No colloquium entries yet.</div>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="coll-grid">
            {entries.map((c, i) => (
              <Link key={c.id} href={`/colloquium/${c.id}`} className="coll-card">
                <div className="coll-num">{String(i + 1).padStart(2, '0')}</div>
                <h3>{c.name}</h3>
                {c.speaker && <div className="coll-spk">{c.speaker}{c.department ? ` · ${c.department}` : ''}</div>}
                {c.abstract && <p className="coll-abs">{c.abstract}</p>}
                <div className="coll-ft">
                  <span className="coll-time">{c.date}{c.time ? ` · ${c.time}` : ''}</span>
                  {c.video && <span className="coll-watch">Watch →</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

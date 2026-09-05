'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getColloquium } from '@/lib/api';
import { withMinDelay } from '@/lib/withMinDelay';
import { Colloquium } from '../../../types';
import PendulumLoader from '@/components/ui/PendulumLoader';

export default function ColloquiumPage() {
  const [entries, setEntries] = useState<Colloquium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('all');

  useEffect(() => {
    withMinDelay(getColloquium())
      .then(data => setEntries(data.data || []))
      .catch(() => setError('Could not load colloquium entries.'))
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(c => {
      const y = c.date ? new Date(c.date).getFullYear() : (c.time ? new Date(c.time).getFullYear() : null);
      if (y && !isNaN(y)) set.add(String(y));
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(c => {
      if (yearFilter !== 'all') {
        const y = c.date ? new Date(c.date).getFullYear() : (c.time ? new Date(c.time).getFullYear() : null);
        if (String(y) !== yearFilter) return false;
      }
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.speaker?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.abstract?.toLowerCase().includes(q)
      );
    });
  }, [entries, query, yearFilter]);

  const hasFilters = query.trim() !== '' || yearFilter !== 'all';

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-label"><b>iv</b>Colloquium</div>
          <h2 className="sec-title">Scientific Discussion <em>Forum</em>.</h2>
        </div>

        {!loading && !error && entries.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap' as const, gap: 12,
            marginBottom: 32, alignItems: 'center',
          }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, speaker, department…"
              style={{
                flex: '1 1 220px', minWidth: 180, padding: '10px 14px',
                fontFamily: "'IBM Plex Mono', 'Courier New', monospace", fontSize: 12.5,
                color: 'var(--tx)', background: 'transparent', border: '1px solid var(--rule)',
                outline: 'none',
              }}
            />
            {years.length > 0 && (
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                style={{
                  padding: '10px 12px', fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
                  fontSize: 11.5, color: 'var(--tx2)', background: 'transparent',
                  border: '1px solid var(--rule)', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all">All years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
          </div>
        )}

        {loading && <PendulumLoader label="Loading colloquia" />}

        {error && (
          <div style={{ color: '#8c1c1c', fontSize: 12, padding: '40px 0' }}>{error}</div>
        )}
        {!loading && !error && entries.length === 0 && (
          <div style={{ color: 'var(--tx4)', fontSize: 12, padding: '40px 0' }}>No colloquium entries yet.</div>
        )}
        {!loading && !error && entries.length > 0 && filtered.length === 0 && (
          <div style={{ color: 'var(--tx4)', fontSize: 12, padding: '40px 0' }}>
            No colloquium entries match{hasFilters ? ' your search' : ''}.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="coll-grid">
            {filtered.map((c, i) => (
              <Link key={c.id} href={`/colloquium/${c.id}`} className="coll-card">
                <div className="coll-num">{String(i + 1).padStart(2, '0')}</div>
                <h3>{c.name}</h3>
                {c.speaker && <div className="coll-spk">{c.speaker}{c.department ? ` · ${c.department}` : ''}</div>}
                {c.abstract && <p className="coll-abs">{c.abstract}</p>}
                <div className="coll-ft">
                  <span className="coll-time">{c.date}{c.time ? ` · ${new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
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

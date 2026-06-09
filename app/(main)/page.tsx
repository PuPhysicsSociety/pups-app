'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLectureSeries, getColloquium } from '@/lib/api';
import EquationStrip from '@/components/ui/EquationStrip';

function parseDateParts(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: dateStr, mon: '' };
  return {
    day: d.getDate().toString(),
    mon: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
  };
}

export default function Home() {
  const [series, setSeries] = useState<any[]>([]);
  const [colloquia, setColloquia] = useState<any[]>([]);

  useEffect(() => {
    getLectureSeries().then(d => setSeries(d.data || [])).catch(() => {});
    getColloquium().then(d => setColloquia(d.data || [])).catch(() => {});
  }, []);

  const latestEvent = series[0];
  const latestColl = colloquia[0];

  return (
    <>
      {/* Hero */}
      <section className="section" style={{ borderBottom: '1px solid var(--rule)' }}>
        <div className="wrap">
          <div className="home-hero" style={{ border: 'none', padding: '72px 0 64px' }}>
            <div>
              <div className="home-kicker">Presidency University · Est. 2025</div>
              <h1 className="home-h1">
                Fostering scientific<br />
                dialogue, outreach<br />
                &amp; <em>community</em>.
              </h1>
              <p className="home-lede">
                The Presidency University Physics Society organises weekly colloquia, panel discussions,
                and thematic events that cultivate a vibrant academic culture centred around the exploration
                of physics.
              </p>
              <div className="home-cta">
                <Link href="/events" className="btn primary">Explore events</Link>
                <Link href="/colloquium" className="btn">Browse colloquia</Link>
              </div>
            </div>

            <div className="home-aside">
              <Link href="/events" className="aside-item">
                <div className="aside-lbl">Latest Event</div>
                <div className="aside-title">
                  <em className="aside-arr">→</em>
                  {latestEvent ? latestEvent.title : 'Annual National Conference'}
                </div>
                <div className="aside-meta">
                  {latestEvent ? `${latestEvent.mode}${latestEvent.dateTime?.schedule ? ' · ' + latestEvent.dateTime.schedule : ''}` : 'Baker Building'}
                </div>
              </Link>

              <Link href="/colloquium" className="aside-item">
                <div className="aside-lbl">Latest Colloquium</div>
                <div className="aside-title">
                  <em className="aside-arr">→</em>
                  {latestColl ? latestColl.name : 'Gravitational Wave Detection using PSO'}
                </div>
                <div className="aside-meta">
                  {latestColl ? `${latestColl.date}${latestColl.speaker ? ' · ' + latestColl.speaker : ''}` : 'Aritra Bakshi'}
                </div>
              </Link>

              <Link href="/team" className="aside-item">
                <div className="aside-lbl">Society</div>
                <div className="aside-title">
                  <em className="aside-arr">→</em>
                  Meet the people behind PUPS
                </div>
                <div className="aside-meta">Exec committee · PhD scholars · Members</div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <EquationStrip />

      {/* What We Do */}
      <section className="section alt">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-label"><b>ii</b>What We Do</div>
            <h2 className="sec-title">Built around <em>exploration</em>.</h2>
          </div>
          <div className="pillars">
            <div className="pillar">
              <div className="pillar-num">01</div>
              <h3>Weekly Colloquia</h3>
              <p>Expert talks on cutting-edge physics research, open to all students and faculty each week.</p>
            </div>
            <div className="pillar">
              <div className="pillar-num">02</div>
              <h3>Panel Discussions</h3>
              <p>Interdisciplinary conversations bringing together researchers to examine pressing questions in science.</p>
            </div>
            <div className="pillar">
              <div className="pillar-num">03</div>
              <h3>Thematic Events</h3>
              <p>Workshops, seminars, and conferences focused on specific areas of modern and classical physics.</p>
            </div>
            <div className="pillar">
              <div className="pillar-num">04</div>
              <h3>Community</h3>
              <p>A vibrant community where students collaborate and grow through shared curiosity each term.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent events */}
      {series.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-label"><b>iii</b>Events</div>
              <h2 className="sec-title">Recent &amp; upcoming <em>events</em>.</h2>
            </div>
            <div className="ls-grid">
              {series.slice(0, 4).map((ls: any) => (
                <Link key={ls.id} href={`/lecture-series/${ls.id}`} className="ls-card">
                  <div className="ls-mode">{ls.mode}</div>
                  <div className="ls-card-title">{ls.title}</div>
                  {ls.lecturerDetails?.length > 0 && (
                    <div className="ls-card-meta">{ls.lecturerDetails.map((l: any) => l.name).join(', ')}</div>
                  )}
                  {ls.description && <div className="ls-card-desc">{ls.description}</div>}
                  {ls.dateTime?.schedule && (
                    <div className="ls-card-meta" style={{ marginTop: 10 }}>{ls.dateTime.schedule}</div>
                  )}
                </Link>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <Link href="/events" className="btn">View all events</Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

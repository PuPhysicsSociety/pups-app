'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEvents, getColloquium } from '@/lib/api';

function parseDateParts(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: dateStr, mon: '' };
  return {
    day: d.getDate().toString(),
    mon: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
  };
}

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [colloquia, setColloquia] = useState<any[]>([]);

  useEffect(() => {
    getEvents().then(d => setEvents(d.data || [])).catch(() => {});
    getColloquium().then(d => setColloquia(d.data || [])).catch(() => {});
  }, []);

  const latestEvent = events[0];
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
                  {latestEvent ? latestEvent.name : 'Annual National Conference'}
                </div>
                <div className="aside-meta">
                  {latestEvent ? `${latestEvent.date}${latestEvent.location ? ' · ' + latestEvent.location : ''}` : 'Baker Building'}
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
      {events.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-label"><b>iii</b>Events</div>
              <h2 className="sec-title">Recent &amp; upcoming <em>events</em>.</h2>
            </div>
            <div className="ev-list">
              {events.slice(0, 4).map((ev, i) => {
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
                      {ev.description && <p className="ev-desc">{ev.description.slice(0, 120)}{ev.description.length > 120 ? '…' : ''}</p>}
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
            <div style={{ marginTop: 32 }}>
              <Link href="/events" className="btn">View all events</Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

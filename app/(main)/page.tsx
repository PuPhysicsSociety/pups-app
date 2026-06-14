'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEvents, getColloquium } from '@/lib/api';
import EquationStrip from '@/components/ui/EquationStrip';
import EventImageMarquee from '@/components/ui/EventImageMarquee';

export default function Home() {
  const [latestEvent, setLatestEvent] = useState<any>(null);
  const [latestColl, setLatestColl]   = useState<any>(null);

  useEffect(() => {
    getEvents().then(d => {
      const items = d.data || [];
      if (items.length > 0) setLatestEvent(items[0]);
    }).catch(() => {});

    getColloquium().then(d => {
      const items = d.data || [];
      if (items.length > 0) setLatestColl(items[0]);
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* <EventImageMarquee /> */}
      {/* Hero */}
      <section className="section" style={{ borderBottom: '1px solid var(--rule)' }}>
        <div className="wrap">
          <div className="home-hero" style={{ border: 'none' }}>
            <div>
              <div className="home-kicker">Presidency University · Est. 1817</div>
              <h1 className="home-h1">
                Fostering scientific<br />
                dialogue, outreach<br />
                &amp; <em>community</em>.
              </h1>
              <p className="home-lede">
                The Presidency University Physics Society organises weekly colloquia under the Scientific Discussion Forum, panel discussions,
                and thematic events that cultivate a vibrant academic culture centred around the exploration
                of physics.
              </p>
              <div className="home-cta">
                <Link href="/events" className="btn primary">Explore events</Link>
                <Link href="/colloquium" className="btn">Browse colloquia</Link>
              </div>
            </div>

            {/* FIX: Only render aside-items when data actually exists */}
            {(latestEvent || latestColl) && (
              <div className="home-aside">
                {latestEvent && (
                  <Link href="/events" className="aside-item">
                    <div className="aside-lbl">Latest Event</div>
                    <div className="aside-title">
                      <em className="aside-arr">→</em>
                      {latestEvent.title}
                    </div>
                    <div className="aside-meta">
                      {latestEvent.mode}
                      {latestEvent.dateTime?.schedule ? ` · ${latestEvent.dateTime.schedule}` : ''}
                    </div>
                  </Link>
                )}

                {latestColl && (
                  <Link href="/colloquium" className="aside-item">
                    <div className="aside-lbl">Latest Colloquium</div>
                    <div className="aside-title">
                      <em className="aside-arr">→</em>
                      {latestColl.name}
                    </div>
                    <div className="aside-meta">
                      {latestColl.date}
                      {latestColl.speaker ? ` · ${latestColl.speaker}` : ''}
                    </div>
                  </Link>
                )}

                <Link href="/team" className="aside-item">
                  <div className="aside-lbl">Society</div>
                  <div className="aside-title">
                    <em className="aside-arr">→</em>
                    Meet the people behind PUPS
                  </div>
                  <div className="aside-meta">Core committee · Sub committee · Academic committee</div>
                </Link>
              </div>
            )}
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
              <h3>Scientific Discussion Forum</h3>
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

      {/* Recent events — only shown when data exists */}
      {latestEvent && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <div className="sec-label"><b>iii</b>Events</div>
              <h2 className="sec-title">Recent &amp; upcoming <em>events</em>.</h2>
            </div>
            <div className="ls-grid">
              <Link href={`/events/${latestEvent.id}`} className="ls-card">
                <div className="ls-mode">{latestEvent.type?.replace('_', ' ') || latestEvent.mode}</div>
                <div className="ls-card-title">{latestEvent.title}</div>
                {latestEvent.lecturerDetails?.length > 0 && (
                  <div className="ls-card-meta">
                    {latestEvent.lecturerDetails.map((l: any) => l.name).join(', ')}
                  </div>
                )}
                {latestEvent.description && (
                  <div className="ls-card-desc">{latestEvent.description}</div>
                )}
                {latestEvent.dateTime?.schedule && (
                  <div className="ls-card-meta" style={{ marginTop: 10 }}>
                    {latestEvent.dateTime.schedule}
                  </div>
                )}
              </Link>
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

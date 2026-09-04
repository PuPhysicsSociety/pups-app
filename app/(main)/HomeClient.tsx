'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEvents, getColloquium } from '@/lib/api';
import EquationStrip from '@/components/ui/EquationStrip';
import { renderRichText } from '@/components/ui/emphasis';
import { HomeContent } from '@/lib/defaultSiteContent';

// Static copy (hero, pillars, etc.) comes in as a prop, already resolved
// server-side — no flash of default content. Latest event/colloquium are
// still fetched client-side since they're live, frequently-changing data
// rather than admin-edited copy; that part behaves exactly as it did
// before this page had server-rendered content.
export default function HomeClient({ content }: { content: HomeContent }) {
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
      {/* Hero */}
      <section className="section" style={{ borderBottom: '1px solid var(--rule)' }}>
        <div className="wrap">
          <div className="home-hero" style={{ border: 'none' }}>
            <div>
              <div className="home-kicker">{content.kicker}</div>
              <h1 className="home-h1">{renderRichText(content.heroTitle)}</h1>
              <p className="home-lede">{content.heroLede}</p>
              <div className="home-cta">
                <Link href={content.ctaPrimary.href} className="btn primary">{content.ctaPrimary.label}</Link>
                <Link href={content.ctaSecondary.href} className="btn">{content.ctaSecondary.label}</Link>
              </div>
            </div>

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
            <div className="sec-label"><b>{content.whatWeDoLabel}</b>What We Do</div>
            <h2 className="sec-title">{renderRichText(content.whatWeDoTitle)}</h2>
          </div>
          <div className="pillars">
            {content.pillars.map((p, i) => (
              <div className="pillar" key={i}>
                <div className="pillar-num">{String(i + 1).padStart(2, '0')}</div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            ))}
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

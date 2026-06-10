'use client';
import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { getLectureSeriesById, getImageUrl } from '@/lib/api';
import { LectureSeries } from '../../../../types';

const T = {
  tx:    'var(--tx,   #1f1b16)',
  tx2:   'var(--tx2,  rgba(31,27,22,.78))',
  tx3:   'var(--tx3,  rgba(31,27,22,.55))',
  tx4:   'var(--tx4,  rgba(31,27,22,.32))',
  rule:  'var(--rule, rgba(31,27,22,.14))',
  cr:    'var(--cr,   #a07a36)',
  s1:    'var(--s1,   #efe6d2)',
  serif: "'Cormorant Garamond', Georgia, serif",
  mono:  "'IBM Plex Mono', 'Courier New', monospace",
} as const;

function fmtDateRange(start?: string, end?: string): string {
  if (!start) return '';
  const s = new Date(start);
  if (isNaN(s.getTime())) return '';
  const sLabel = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (!end) return sLabel;
  const e = new Date(end);
  if (isNaN(e.getTime())) return sLabel;
  const eLabel = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${s.getDate()}–${eLabel}`;
}

function fmtTime(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: T.mono,
      fontSize: 9,
      letterSpacing: '0.2em',
      textTransform: 'uppercase' as const,
      color: T.tx4,
      marginBottom: 6,
    }}>
      {children}
    </div>
  );
}

export default function LectureSeriesDetail() {
  const { id } = useParams() as { id: string };
  const [entry, setEntry] = useState<LectureSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    getLectureSeriesById(id)
      .then(d => setEntry(d.data))
      .catch(() => setNotFoundFlag(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <section className="section">
      <div className="wrap">
        <div style={{ color: T.tx4, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', padding: '60px 0' }}>
          Loading…
        </div>
      </div>
    </section>
  );

  if (notFoundFlag || !entry) return notFound();

  const thumbnail = entry.thumbnail ? getImageUrl(entry.thumbnail) : null;
  const images = thumbnail ? [{ src: thumbnail, alt: entry.title }] : [];
  const total = images.length;

  const dateStr = fmtDateRange(entry.dateTime?.start, entry.dateTime?.end);
  const timeStr = entry.dateTime?.schedule || fmtTime(entry.dateTime?.start);
  const durationStr = entry.noOfClasses ? `${entry.noOfClasses} class${entry.noOfClasses > 1 ? 'es' : ''}` : '';
  const venueStr = entry.mode === 'online' ? 'Online' : '';

  return (
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="wrap">

        {/* Back link */}
        <Link href="/events" style={{
          fontFamily: T.mono,
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: T.tx4,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 28,
        }}>
          ← Back to Events
        </Link>

        {/* Section label */}
        <div style={{
          fontFamily: T.mono,
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: T.cr,
          marginBottom: 16,
        }}>
          Lecture Series
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: T.serif,
          fontSize: 'clamp(32px, 5vw, 60px)',
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: T.tx,
          maxWidth: 820,
          marginBottom: 40,
        }}>
          {entry.title}
        </h1>

        {/* Image area */}
        {total > 0 && (
          <div style={{ marginBottom: 0 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: total === 1 ? '1fr' : total === 2 ? '1fr 1fr' : '1fr 1fr 1fr',
              gap: 2,
              border: `1px solid ${T.rule}`,
              overflow: 'hidden',
              maxWidth: 640,
            }}>
              {images.map((img, i) => (
                <div key={i} style={{ overflow: 'hidden', borderRight: i < total - 1 ? `1px solid ${T.rule}` : 'none' }}>
                  <img
                    src={img.src}
                    alt={img.alt ?? ''}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No image placeholder */}
        {total === 0 && (
          <div style={{
            height: 240,
            border: `1px solid ${T.rule}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 0,
          }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.tx4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              No image
            </span>
          </div>
        )}

        {/* ← → arrows */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 56 }}>
          {(['←', '→'] as const).map((arrow, idx) => (
            <button
              key={arrow}
              onClick={() => {
                if (idx === 0) setImgIdx(i => Math.max(0, i - 1));
                else setImgIdx(i => Math.min(total - 1, i + 1));
              }}
              style={{
                width: 36,
                height: 36,
                border: `1px solid ${T.rule}`,
                background: 'transparent',
                cursor: total > 1 ? 'pointer' : 'default',
                fontFamily: T.serif,
                fontSize: 16,
                color: total > 1 ? T.tx2 : T.tx4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.15s',
              }}
            >
              {arrow}
            </button>
          ))}
        </div>

        {/* 2-column layout: main + sidebar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: 48,
          alignItems: 'start',
        }}>

          {/* Left: content */}
          <div>
            {/* Description */}
            {entry.description && (
              <p style={{
                fontFamily: T.serif,
                fontSize: 'clamp(18px, 2.2vw, 23px)',
                lineHeight: 1.6,
                color: T.tx2,
                marginBottom: 48,
                maxWidth: 680,
              }}>
                {entry.description}
              </p>
            )}

            {/* Speakers */}
            {entry.lecturerDetails?.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <Label>Speakers</Label>
                {entry.lecturerDetails.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      borderBottom: `1px solid ${T.rule}`,
                      padding: '14px 0',
                    }}
                  >
                    <div style={{
                      fontFamily: T.serif,
                      fontSize: 20,
                      fontWeight: 400,
                      color: T.tx,
                      lineHeight: 1.3,
                    }}>
                      {l.name}
                    </div>
                    {l.affiliation && (
                      <div style={{
                        fontFamily: T.mono,
                        fontSize: 10,
                        color: T.tx4,
                        letterSpacing: '0.08em',
                        marginTop: 4,
                      }}>
                        {l.affiliation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Links */}
            {(entry.regFormLink || entry.toContact?.length > 0) && (
              <div style={{ marginBottom: 48 }}>
                <Label>Links</Label>
                {entry.regFormLink && (
                  <a
                    href={entry.regFormLink}
                    target="_blank"
                    rel="noopener"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: T.mono,
                      fontSize: 12,
                      color: T.tx3,
                      textDecoration: 'none',
                      padding: '12px 0',
                      borderBottom: `1px solid ${T.rule}`,
                    }}
                  >
                    <span>Registration Form</span>
                    <span style={{ color: T.cr }}>→</span>
                  </a>
                )}
                {entry.toContact?.map((c, i) => c.email && (
                  <a
                    key={i}
                    href={`mailto:${c.email}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: T.mono,
                      fontSize: 12,
                      color: T.tx3,
                      textDecoration: 'none',
                      padding: '12px 0',
                      borderBottom: `1px solid ${T.rule}`,
                    }}
                  >
                    <span>{c.name}{c.role ? ` · ${c.role}` : ''}</span>
                    <span style={{ color: T.cr }}>→</span>
                  </a>
                ))}
              </div>
            )}

            {/* Documents */}
            {entry.supplements?.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <Label>Documents</Label>
                {entry.supplements.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 0',
                      borderBottom: `1px solid ${T.rule}`,
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{
                      fontFamily: T.mono,
                      fontSize: 8,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      border: `1px solid ${T.rule}`,
                      color: T.tx4,
                      padding: '3px 7px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {s.type || s.source || 'PDF'}
                    </span>
                    <span style={{
                      fontFamily: T.mono,
                      fontSize: 12,
                      color: T.tx3,
                    }}>
                      {s.name || s.url}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <aside style={{
            border: `1px solid ${T.rule}`,
            padding: '28px 24px',
          }}>
            {dateStr && (
              <div style={{ marginBottom: 24 }}>
                <Label>Date</Label>
                <div style={{ fontFamily: T.mono, fontSize: 14, color: T.tx, lineHeight: 1.4 }}>{dateStr}</div>
              </div>
            )}
            {timeStr && (
              <div style={{ marginBottom: 24 }}>
                <Label>Time</Label>
                <div style={{ fontFamily: T.mono, fontSize: 14, color: T.tx }}>{timeStr}</div>
              </div>
            )}
            {durationStr && (
              <div style={{ marginBottom: 24 }}>
                <Label>Duration</Label>
                <div style={{ fontFamily: T.mono, fontSize: 14, color: T.tx }}>{durationStr}</div>
              </div>
            )}
            <div style={{ marginBottom: 24 }}>
              <Label>Audience</Label>
              <div style={{ fontFamily: T.mono, fontSize: 14, color: T.tx }}>Open to all</div>
            </div>
            {venueStr && (
              <div style={{ marginBottom: 24 }}>
                <Label>Venue</Label>
                <div style={{ fontFamily: T.mono, fontSize: 14, color: T.tx }}>{venueStr}</div>
              </div>
            )}
            {entry.toContact?.length > 0 && (
              <div style={{ marginTop: 32, borderTop: `1px solid ${T.rule}`, paddingTop: 24 }}>
                <Label>Contact</Label>
                {entry.toContact.map((c, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: T.serif, fontSize: 15, color: T.tx, lineHeight: 1.3 }}>{c.name}</div>
                    {c.role && <div style={{ fontFamily: T.mono, fontSize: 10, color: T.tx4, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{c.role}</div>}
                    {c.email && <a href={`mailto:${c.email}`} style={{ fontFamily: T.mono, fontSize: 11, color: T.cr, display: 'block', marginTop: 4, textDecoration: 'none' }}>{c.email}</a>}
                    {c.phone && <div style={{ fontFamily: T.mono, fontSize: 11, color: T.tx4, marginTop: 2 }}>{c.phone}</div>}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

      </div>
    </section>
  );
}

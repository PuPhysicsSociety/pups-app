'use client';
import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { getEventById } from '@/lib/api';
import { UnifiedEvent } from '../../../../types';

// T object — fallbacks updated to match current token values
const T = {
  tx:    'var(--tx,   #1a1710)',
  tx2:   'var(--tx2,  rgba(26,23,16,.94))',
  tx3:   'var(--tx3,  rgba(26,23,16,.72))',
  tx4:   'var(--tx4,  rgba(26,23,16,.50))',
  rule:  'var(--rule, rgba(26,23,16,.13))',
  cr:    'var(--cr,   #9b7230)',
  s1:    'var(--s1,   #ede4cf)',
  serif: "'Cormorant Garamond', Georgia, serif",
  mono:  "'IBM Plex Mono', 'Courier New', monospace",
} as const;

const TYPE_LABELS: Record<string, string> = {
  lecture_series: 'Lecture Series',
  workshop:       'Workshop',
  conference:     'Conference',
};

function fmtDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtDateRange(start?: string, end?: string): string {
  if (!start) return '';
  const s = fmtDate(start);
  if (!end) return s;
  const e = fmtDate(end);
  return `${s} – ${e}`;
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: T.mono, fontSize: 8.5, letterSpacing: '0.22em',
      textTransform: 'uppercase' as const, color: T.tx4, marginBottom: 5,
    }}>
      {children}
    </div>
  );
}

function MetaValue({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: T.mono, fontSize: 12.5, color: T.tx, lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: T.mono, fontSize: 8.5, letterSpacing: '0.22em',
      textTransform: 'uppercase' as const, color: T.tx4,
      borderTop: `1px solid ${T.rule}`, paddingTop: 20, marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

// ── Image Carousel ─────────────────────────────────────────────────────────

function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);
  if (images.length === 0) return null;

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Main image */}
      <div style={{
        position: 'relative',
        border: `1px solid ${T.rule}`,
        overflow: 'hidden',
        background: T.s1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        width: '100%',
      }}>
        <img
          src={images[idx]}
          alt={`${title} — image ${idx + 1}`}
          style={{
            width: '100%',
            maxHeight: 560,
            objectFit: 'contain',
            display: 'block',
          }}
        />
        {images.length > 1 && (
          <>
            <button onClick={prev} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              width: 36, height: 36, border: `1px solid ${T.rule}`,
              background: 'rgba(237,228,207,.9)', cursor: 'pointer',
              fontFamily: T.serif, fontSize: 17, color: T.tx2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>←</button>
            <button onClick={next} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              width: 36, height: 36, border: `1px solid ${T.rule}`,
              background: 'rgba(237,228,207,.9)', cursor: 'pointer',
              fontFamily: T.serif, fontSize: 17, color: T.tx2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>→</button>
            <div style={{
              position: 'absolute', bottom: 10, right: 12,
              fontFamily: T.mono, fontSize: 8.5, letterSpacing: '0.14em',
              color: T.tx4, background: 'rgba(237,228,207,.85)', padding: '3px 8px',
            }}>
              {idx + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
          {images.map((src, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              flexShrink: 0, width: 56, height: 40,
              border: `2px solid ${i === idx ? T.cr : T.rule}`,
              overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'none',
              transition: 'border-color 0.15s',
            }}>
              <img src={src} alt="" style={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const { id } = useParams() as { id: string };
  const [entry,        setEntry]        = useState<UnifiedEvent | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEventById(id)
      .then(d => setEntry(d.data))
      .catch(() => setNotFoundFlag(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <section className="section">
      <div className="wrap">
        <div style={{
          color: T.tx4, fontSize: 11, letterSpacing: '.14em',
          textTransform: 'uppercase', padding: '80px 0',
        }}>
          Loading…
        </div>
      </div>
    </section>
  );

  if (notFoundFlag || !entry) return notFound();

  const dateStr   = fmtDateRange(entry.dateTime?.start, entry.dateTime?.end);
  const typeLabel = TYPE_LABELS[entry.type] || entry.type;
  const allImages = [
    ...(entry.thumbnail ? [entry.thumbnail] : []),
    ...(entry.pastImagesPreview || []),
  ];

  const hasSupplements = entry.supplements?.length > 0;
  const hasDrive       = !!entry.driveLink;
  const hasReg         = !!entry.regFormLink;
  const hasLinks       = hasReg || hasDrive || hasSupplements;
  const hasSidebar     = hasLinks || (entry.toContact?.length > 0);

  return (
    <>
      {/* ── Hero strip ──────────────────────────────────────────── */}
      <div style={{
        borderBottom: `1px solid ${T.rule}`,
        paddingTop: 40,
        paddingBottom: 40,
        background: T.s1,
        // Prevent hero from overflowing horizontally
        overflow: 'hidden',
      }}>
        <div className="wrap">

          {/* Back + type breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
          }}>
            <Link href="/events" style={{
              fontFamily: T.mono, fontSize: 9, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.tx4, textDecoration: 'none',
            }}>
              ← Events
            </Link>
            <span style={{ color: T.rule }}>·</span>
            <span style={{
              fontFamily: T.mono, fontSize: 9, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.cr,
            }}>
              {typeLabel}
            </span>
          </div>

          {/*
            ev-detail-hero-grid handles:
            Desktop: 1fr 340px side-by-side
            Mobile:  1fr single column, image moves above title via order:-1
            If no images, stays single column always
          */}
          <div className={allImages.length > 0 ? 'ev-detail-hero-grid' : undefined}>

            {/* Left: title + meta */}
            <div style={{ minWidth: 0 }}>
              <h1 style={{
                fontFamily: T.serif,
                fontSize: 'clamp(28px, 5vw, 64px)',
                fontWeight: 400,
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                color: T.tx,
                marginBottom: 28,
                wordBreak: 'break-word',
              }}>
                {entry.title}
              </h1>

              {/* Speaker chips */}
              {entry.lecturerDetails?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                  {entry.lecturerDetails.map((l, i) => (
                    <div key={i} style={{
                      border: `1px solid ${T.rule}`,
                      padding: '8px 14px',
                      background: 'rgba(255,255,255,.5)',
                    }}>
                      <div style={{
                        fontFamily: T.serif, fontSize: 15, color: T.tx, lineHeight: 1.2,
                      }}>
                        {l.name}
                      </div>
                      {l.affiliation && (
                        <div style={{
                          fontFamily: T.mono, fontSize: 9, color: T.tx4,
                          letterSpacing: '0.08em', marginTop: 3,
                        }}>
                          {l.affiliation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick meta strip */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 24,
                borderTop: `1px solid ${T.rule}`, paddingTop: 20,
              }}>
                {dateStr && (
                  <div>
                    <MetaLabel>Date</MetaLabel>
                    <MetaValue>{dateStr}</MetaValue>
                  </div>
                )}
                {entry.dateTime?.schedule && (
                  <div>
                    <MetaLabel>Schedule</MetaLabel>
                    <MetaValue>{entry.dateTime.schedule}</MetaValue>
                  </div>
                )}
                {(entry.venue || entry.mode) && (
                  <div>
                    <MetaLabel>Venue</MetaLabel>
                    <MetaValue>
                      {entry.venue || (entry.mode === 'online' ? 'Online' : '—')}
                    </MetaValue>
                  </div>
                )}
                {entry.type === 'lecture_series' && entry.noOfClasses && (
                  <div>
                    <MetaLabel>Classes</MetaLabel>
                    <MetaValue>{entry.noOfClasses}</MetaValue>
                  </div>
                )}
                {entry.duration && (
                  <div>
                    <MetaLabel>Duration</MetaLabel>
                    <MetaValue>{entry.duration}</MetaValue>
                  </div>
                )}
                {entry.audience && (
                  <div>
                    <MetaLabel>Audience</MetaLabel>
                    <MetaValue>{entry.audience}</MetaValue>
                  </div>
                )}
              </div>

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 20 }}>
                  {entry.tags.map((tag, i) => (
                    <span key={i} style={{
                      fontFamily: T.mono, fontSize: 8.5, letterSpacing: '0.14em',
                      textTransform: 'uppercase', border: `1px solid ${T.rule}`,
                      color: T.tx4, padding: '4px 10px',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: poster — moves above title on mobile via order:-1 in CSS */}
            {allImages.length > 0 && (
              <div style={{
                border: `1px solid ${T.rule}`,
                overflow: 'hidden',
                background: 'rgba(255,255,255,.4)',
                flexShrink: 0,
                width: '100%',
              }}>
                <img
                  src={allImages[0]}
                  alt={entry.title}
                  style={{
                    width: '100%',
                    maxHeight: 420,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          {/*
            ev-detail-body-grid handles:
            Desktop: 1fr 260px (content + sidebar)
            Mobile:  1fr single column (sidebar drops below)
            If no sidebar content, always single column
          */}
          <div className={hasSidebar ? 'ev-detail-body-grid' : undefined}>

            {/* Left: description + gallery + docs */}
            <div style={{ minWidth: 0 }}>
              {entry.description && (
                <p style={{
                  fontFamily: T.serif,
                  fontSize: 'clamp(17px, 2vw, 22px)',
                  lineHeight: 1.65,
                  color: T.tx2,
                  marginBottom: 48,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}>
                  {entry.description}
                </p>
              )}

              {/* Gallery — only shown if more than 1 image */}
              {allImages.length > 1 && (
                <div style={{ marginBottom: 48 }}>
                  <SectionLabel>Gallery</SectionLabel>
                  <ImageCarousel images={allImages} title={entry.title} />
                </div>
              )}

              {/* Documents */}
              {hasSupplements && (
                <div style={{ marginBottom: 48 }}>
                  <SectionLabel>Documents &amp; Files</SectionLabel>
                  {entry.supplements.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 0', borderBottom: `1px solid ${T.rule}`,
                      textDecoration: 'none',
                    }}>
                      <span style={{
                        fontFamily: T.mono, fontSize: 8, letterSpacing: '0.14em',
                        textTransform: 'uppercase', border: `1px solid ${T.rule}`,
                        color: T.tx4, padding: '3px 7px', whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {s.source === 'drive'
                          ? 'drive'
                          : (s.type?.split('/')[1] || s.type || 'file')}
                      </span>
                      <span style={{
                        fontFamily: T.mono, fontSize: 12, color: T.tx3, flex: 1,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {s.name || s.url}
                      </span>
                      <span style={{ color: T.cr, fontSize: 14, flexShrink: 0 }}>→</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Right: sidebar */}
            {hasSidebar && (
              <aside style={{ minWidth: 0 }}>

                {hasReg && (
                  <a href={entry.regFormLink} target="_blank" rel="noopener" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: T.cr, color: '#fff', padding: '14px 18px',
                    fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em',
                    textTransform: 'uppercase', textDecoration: 'none',
                    marginBottom: 8,
                  }}>
                    <span>Register Now</span>
                    <span>→</span>
                  </a>
                )}

                {hasDrive && (
                  <a href={entry.driveLink} target="_blank" rel="noopener" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    border: `1px solid ${T.rule}`, padding: '14px 18px',
                    fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em',
                    textTransform: 'uppercase', textDecoration: 'none', color: T.tx3,
                    marginBottom: 24,
                  }}>
                    <span>Drive Folder</span>
                    <span style={{ color: T.cr }}>→</span>
                  </a>
                )}

                {entry.toContact?.length > 0 && (
                  <div style={{ border: `1px solid ${T.rule}`, padding: '20px 18px' }}>
                    <div style={{
                      fontFamily: T.mono, fontSize: 8.5, letterSpacing: '0.2em',
                      textTransform: 'uppercase', color: T.tx4, marginBottom: 16,
                    }}>
                      Contact
                    </div>
                    {entry.toContact.map((c, i) => (
                      <div key={i} style={{
                        paddingBottom: 14, marginBottom: 14,
                        borderBottom: i < entry.toContact.length - 1
                          ? `1px solid ${T.rule}` : 'none',
                      }}>
                        <div style={{
                          fontFamily: T.serif, fontSize: 16, color: T.tx, lineHeight: 1.3,
                        }}>
                          {c.name}
                        </div>
                        {c.role && (
                          <div style={{
                            fontFamily: T.mono, fontSize: 9, color: T.tx4,
                            letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3,
                          }}>
                            {c.role}
                          </div>
                        )}
                        {c.email && (
                          <a href={`mailto:${c.email}`} style={{
                            fontFamily: T.mono, fontSize: 11, color: T.cr,
                            display: 'block', marginTop: 5, textDecoration: 'none',
                            wordBreak: 'break-all',
                          }}>
                            {c.email}
                          </a>
                        )}
                        {c.phone && (
                          <div style={{
                            fontFamily: T.mono, fontSize: 11, color: T.tx4, marginTop: 3,
                          }}>
                            {c.phone}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </aside>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

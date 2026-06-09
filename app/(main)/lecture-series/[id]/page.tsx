'use client';
import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { getLectureSeriesById } from '@/lib/api';
import { LectureSeries } from '../../../../types';

function fmtDate(iso?: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return iso; }
}

export default function LectureSeriesDetail() {
  const { id } = useParams() as { id: string };
  const [entry, setEntry] = useState<LectureSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

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
        <div style={{ color: 'var(--tx4)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', padding: '40px 0' }}>Loading…</div>
      </div>
    </section>
  );

  if (notFoundFlag || !entry) return notFound();

  return (
    <section className="section">
      <div className="wrap">
        <Link href="/lecture-series" className="detail-back">← Lecture Series</Link>

        <div className="ls-mode">{entry.mode}</div>
        <h1 className="detail-h1">{entry.title}</h1>

        {entry.regFormLink && (
          <a href={entry.regFormLink} target="_blank" rel="noopener" className="btn" style={{ marginBottom: 32, display: 'inline-block' }}>
            Register →
          </a>
        )}

        <div className="ls-detail-meta">
          <div>
            {entry.description && (
              <div style={{ marginBottom: 32 }}>
                <div className="detail-abs-label">About this series</div>
                <p className="detail-abstract">{entry.description}</p>
              </div>
            )}

            {entry.lecturerDetails?.length > 0 && (
              <div className="ls-lecturers">
                <div className="section-label-sm">Lecturers</div>
                {entry.lecturerDetails.map((l, i) => (
                  <div key={i} className="ls-lect">
                    <div className="ls-lect-name">{l.name}</div>
                    {l.affiliation && <div className="ls-lect-aff">{l.affiliation}</div>}
                  </div>
                ))}
              </div>
            )}

            {entry.supplements?.length > 0 && (
              <div style={{ marginTop: 36 }}>
                <div className="section-label-sm">Materials</div>
                {entry.supplements.map((s, i) => (
                  <div key={i} className="detail-doc">
                    <span className="detail-doc-type">{s.type || s.source || 'File'}</span>
                    <a href={s.url} target="_blank" rel="noreferrer" className="detail-doc-name" style={{ color: 'var(--tx3)', textDecoration: 'none' }}>
                      {s.name || s.url}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ls-info-box">
            {entry.noOfClasses && <><dt>Classes</dt><dd>{entry.noOfClasses}</dd></>}
            {entry.dateTime?.start && <><dt>Starts</dt><dd>{fmtDate(entry.dateTime.start)}</dd></>}
            {entry.dateTime?.end && <><dt>Ends</dt><dd>{fmtDate(entry.dateTime.end)}</dd></>}
            {entry.dateTime?.schedule && <><dt>Schedule</dt><dd>{entry.dateTime.schedule}</dd></>}

            {entry.toContact?.length > 0 && (
              <>
                <dt style={{ marginTop: 20 }}>Contact</dt>
                {entry.toContact.map((c, i) => (
                  <dd key={i} style={{ marginTop: 6 }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 15 }}>{c.name}</div>
                    {c.role && <div style={{ fontSize: 11, color: 'var(--tx4)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{c.role}</div>}
                    {c.email && <a href={`mailto:${c.email}`} style={{ fontSize: 12, color: 'var(--tx3)' }}>{c.email}</a>}
                    {c.phone && <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{c.phone}</div>}
                  </dd>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

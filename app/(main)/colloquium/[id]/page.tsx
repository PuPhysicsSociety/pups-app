'use client';
import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { getColloquiumById } from '@/lib/api';
import { Colloquium } from '../../../../types';

export default function ColloquiumDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [entry, setEntry] = useState<Colloquium | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    if (!id) return;
    getColloquiumById(id)
      .then(data => setEntry(data.data))
      .catch(() => setNotFoundFlag(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <section className="section">
      <div className="wrap">
        <div style={{ color: 'var(--tx4)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', padding: '40px 0' }}>
          Loading…
        </div>
      </div>
    </section>
  );

  if (notFoundFlag || !entry) return notFound();

  const embedUrl = entry.video
    ? entry.video.includes('youtube.com/watch')
      ? entry.video.replace('watch?v=', 'embed/')
      : entry.video
    : null;

  return (
    <section className="section">
      <div className="wrap">
        <Link href="/colloquium" className="detail-back">← Colloquium</Link>

        {entry.tags && entry.tags.length > 0 && (
          <div className="detail-tag">{entry.tags.join(' · ')}</div>
        )}

        <h1 className="detail-h1">{entry.name}</h1>

        {entry.speaker && (
          <div className="detail-spk">
            <div className="detail-spk-name">{entry.speaker}</div>
            {entry.department && <div className="detail-spk-aff">{entry.department}</div>}
          </div>
        )}

        {embedUrl && (
          <div className="yt-wrap">
            <iframe
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={entry.name}
            />
          </div>
        )}

        <div style={{ marginTop: 36 }}>
          <div className="detail-abs-label">Abstract</div>
          <p className="detail-abstract">{entry.abstract}</p>
        </div>

        {entry.speakerBio && (
          <div style={{ marginTop: 36 }}>
            <div className="detail-abs-label">About the Speaker</div>
            <p className="detail-abstract" style={{ fontSize: 16 }}>{entry.speakerBio}</p>
          </div>
        )}

        {entry.materials && entry.materials.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <div className="section-label-sm">Materials</div>
            {entry.materials.map((m, i) => (
              <div key={i} className="detail-doc">
                <span className="detail-doc-type">{typeof m === 'string' ? 'Link' : (m.fileType || 'File')}</span>
                <a
                  href={typeof m === 'string' ? m : m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="detail-doc-name"
                  style={{ color: 'var(--tx3)', textDecoration: 'none' }}
                >
                  {typeof m === 'string' ? m : (m.title || m.url)}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

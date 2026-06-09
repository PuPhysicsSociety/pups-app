'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getEventById, getImageUrl } from '@/lib/api';
import { Event } from '../../../../types';

export default function EventDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEventById(id)
      .then(data => {
        const ev = data.data;
        const parseArr = (v: any) => {
          if (Array.isArray(v)) return v;
          if (typeof v === 'string') { try { return JSON.parse(v); } catch {} }
          return [];
        };
        ev.tags      = parseArr(ev.tags);
        ev.speakers  = parseArr(ev.speakers);
        ev.resources = parseArr(ev.resources);
        ev.photos    = parseArr(ev.photos);
        setEvent(ev);
      })
      .catch(() => setNotFound(true))
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

  if (notFound || !event) return (
    <section className="section">
      <div className="wrap">
        <div style={{ color: 'var(--tx4)', fontSize: 12, padding: '40px 0' }}>Event not found.</div>
      </div>
    </section>
  );

  return (
    <section className="section">
      <div className="wrap">
        <Link href="/events" className="detail-back">← Events</Link>

        {event.type && <div className="detail-tag">{event.type}</div>}
        <h1 className="detail-h1">{event.name}</h1>

        {event.speakers && event.speakers.length > 0 && (
          <div className="detail-spk">
            {event.speakers.map((s, i) => (
              <div key={i} className="detail-spk-name">{s}</div>
            ))}
          </div>
        )}

        {event.video && (
          <div className="yt-wrap">
            <iframe
              src={event.video.includes('youtube.com/watch') ? event.video.replace('watch?v=', 'embed/') : event.video}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={event.name}
            />
          </div>
        )}

        {event.photos && event.photos.length > 0 && (
          <div className="carousel-section">
            <div className="carousel-label">Photos</div>
            <div className="carousel">
              {event.photos.map((p, i) => (
                <div key={i} className="carousel-slot">
                  <img
                    src={getImageUrl(typeof p === 'string' ? p : p.url)}
                    alt={`Photo ${i + 1}`}
                    onError={e => { (e.target as HTMLImageElement).src = '/placeholders/default.jpg'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ev-detail-grid">
          <div>
            {event.description && (
              <>
                <div className="detail-abs-label">About</div>
                <p className="detail-abstract">{event.description}</p>
              </>
            )}

            {event.resources && event.resources.length > 0 && (
              <>
                <div className="section-label-sm">Resources</div>
                <div className="detail-links-list">
                  {event.resources.map((r, i) => (
                    <a
                      key={i}
                      href={typeof r === 'string' ? r : r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="detail-link"
                    >
                      {typeof r === 'string' ? r : (r.title || r.url)}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="ev-detail-info">
            <dl>
              {event.date && (<><dt>Date</dt><dd>{event.date}</dd></>)}
              {event.time && (<><dt>Time</dt><dd>{event.time}</dd></>)}
              {event.location && (<><dt>Venue</dt><dd>{event.location}</dd></>)}
              {event.organizer && (<><dt>Organiser</dt><dd>{event.organizer}</dd></>)}
              {event.audience && (<><dt>Audience</dt><dd>{event.audience}</dd></>)}
              {event.duration && (<><dt>Duration</dt><dd>{event.duration}</dd></>)}
            </dl>

            {event.speakers && event.speakers.length > 0 && (
              <div className="ev-spk-list">
                {event.speakers.map((s, i) => (
                  <div key={i} className="ev-spk-item">{s}</div>
                ))}
              </div>
            )}

            {event.rsvpLink && (
              <div style={{ marginTop: 20 }}>
                <a href={event.rsvpLink} target="_blank" rel="noreferrer" className="btn primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                  Register →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import React, { useEffect, useState } from 'react';
import { getEvents } from '@/lib/api';
import Link from 'next/link';

export default function PanelDiscussionPage(){
  const [panels, setPanels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPanels = async () => {
      try {
        const data = await getEvents('?type=panel-discussion');
        setPanels(data.data);
      } catch (error) {
        console.error('Failed to fetch panel discussions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPanels();
  }, []);

  return (
    <div>
      <h1>Panel Discussions</h1>
      <p className="small-muted">
        Engaging conversations on contemporary topics in science, technology, and society — hosted by the Physics Society and guest collaborators.
      </p>

      {loading ? (
        <div className="text-center py-8">Loading panel discussions...</div>
      ) : panels.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No panel discussions available</div>
      ) : (
        <div className="grid" style={{marginTop:12}}>
          {panels.map(ev => (
            <Link
              key={ev.id}
              href={`/events/${ev.id}`}
              className="card"
              style={{textDecoration:'none', color:'inherit'}}
            >
              <img
                src={ev.poster || '/placeholders/default.jpg'}
                alt={ev.name}
                onError={(e) => (e.currentTarget.src = "/placeholders/default.jpg")}
                style={{width:'100%', height:140, objectFit:'cover', borderRadius:6}}
              />
              <h3 style={{marginTop:8}}>{ev.name}</h3>
              <div className="small-muted">
                {ev.date} • {ev.location}
              </div>
              {ev.tagline && (
                <p style={{marginTop:8, fontStyle:'italic'}}>{ev.tagline}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
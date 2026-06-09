import React from 'react';

const ITEMS = [
  'Weekly Colloquia',
  'Panel Discussions',
  'Thematic Events',
  'Gravitational Wave Detection',
  'Quantum Mechanics',
  'Particle Physics Workshop',
  'Annual National Conference',
  'Outreach & Community',
  'Satyendra Nath Bose Legacy',
  'Experimental Physics',
  'Scientific Dialogue',
  'Presidency University · Est. 2025',
];

export default function EqStrip() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="eq-strip">
      <div className="eq-track">
        {doubled.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}

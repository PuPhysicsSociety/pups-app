import React from 'react';

export default function EventRowSkeleton() {
  return (
    <div className="ev-row" style={{ pointerEvents: 'none' }}>
      <div style={{ paddingTop: 2 }}>
        <div className="skeleton" style={{ width: 34, height: 38, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: 54, height: 10 }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="skeleton" style={{ width: '70%', height: 22, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: '40%', height: 11, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: '90%', height: 11, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: '60%', height: 11 }} />
      </div>
      <div className="ev-row-tag-desktop">
        <div className="skeleton" style={{ width: 60, height: 10 }} />
      </div>
    </div>
  );
}

export function EventRowSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => <EventRowSkeleton key={i} />)}
    </div>
  );
}

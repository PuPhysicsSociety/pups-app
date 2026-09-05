import React from 'react';

export default function ColloquiumCardSkeleton() {
  return (
    <div className="coll-card" style={{ pointerEvents: 'none' }}>
      <div className="skeleton" style={{ width: 32, height: 20, marginBottom: 14 }} />
      <div className="skeleton" style={{ width: '85%', height: 20, marginBottom: 10 }} />
      <div className="skeleton" style={{ width: '55%', height: 12, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: '100%', height: 11, marginBottom: 6 }} />
      <div className="skeleton" style={{ width: '92%', height: 11, marginBottom: 6 }} />
      <div className="skeleton" style={{ width: '70%', height: 11, marginBottom: 18 }} />
      <div className="skeleton" style={{ width: '40%', height: 10 }} />
    </div>
  );
}

export function ColloquiumCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="coll-grid">
      {Array.from({ length: count }).map((_, i) => <ColloquiumCardSkeleton key={i} />)}
    </div>
  );
}

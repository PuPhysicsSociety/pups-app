import React from 'react';

export default function TeamCardSkeleton() {
  return (
    <div className="team-card" style={{ pointerEvents: 'none' }}>
      <div className="team-avatar-wrap">
        <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
      </div>
      <div className="team-card-body">
        <div className="skeleton" style={{ width: '65%', height: 16, margin: '0 auto 8px' }} />
        <div className="skeleton" style={{ width: '45%', height: 12, margin: '0 auto' }} />
      </div>
    </div>
  );
}

export function TeamCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => <TeamCardSkeleton key={i} />)}
    </>
  );
}

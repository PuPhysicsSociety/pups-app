import React from 'react';

export default function PreviewBanner() {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        background: 'var(--cr)',
        color: '#fff',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        fontSize: 11.5,
        letterSpacing: '.08em',
        textAlign: 'center',
        padding: '8px 12px',
      }}
    >
      PREVIEW — you're viewing an unpublished draft. This link expires shortly and isn't visible to other visitors.
    </div>
  );
}

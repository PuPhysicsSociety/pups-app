'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <section className="section">
      <div className="wrap" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--tx4, rgba(31,27,22,.32))',
          marginBottom: 24,
        }}>
          Something went wrong
        </div>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 400,
          color: 'var(--tx, #1f1b16)',
          marginBottom: 16,
          lineHeight: 1.2,
        }}>
          We're currently facing some issues.
        </h2>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: 'var(--tx3, rgba(31,27,22,.55))',
          marginBottom: 40,
          lineHeight: 1.8,
        }}>
          Please try again in a moment.
        </p>
        <button
          onClick={reset}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            border: '1px solid var(--rule, rgba(31,27,22,.14))',
            background: 'transparent',
            color: 'var(--tx3, rgba(31,27,22,.55))',
            padding: '10px 24px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    </section>
  );
}

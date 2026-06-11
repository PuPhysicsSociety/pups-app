'use client';
import { useEffect, useState, useRef } from 'react';

export default function IntroOverlay() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0); // 0 → 1 as user scrolls
  const doneRef = useRef(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem('pups_intro_done')) return;
    setVisible(true);

    // Lock body scroll briefly so the overlay is seen first
    document.body.style.overflow = 'hidden';

    // After 600ms unlock scroll so user can start scrolling
    const unlockTimer = setTimeout(() => {
      document.body.style.overflow = '';
    }, 600);

    const SCROLL_RANGE = 320; // px of scroll to complete the transition

    const onScroll = () => {
      if (doneRef.current) return;
      const y = window.scrollY;
      const p = Math.min(y / SCROLL_RANGE, 1);
      setProgress(p);

      if (p >= 1) {
        doneRef.current = true;
        setVisible(false);
        sessionStorage.setItem('pups_intro_done', '1');
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(unlockTimer);
      window.removeEventListener('scroll', onScroll);
      document.body.style.overflow = '';
    };
  }, []);

  if (!visible) return null;

  // Derive styles from progress (0 = fully visible, 1 = gone)
  const overlayOpacity = 1 - progress;
  const logoScale      = 1 - progress * 0.45;   // shrinks to 55% of original
  const logoOpacity    = 1 - progress * 1.4;     // fades out faster than overlay
  const promptOpacity  = Math.max(0, 1 - progress * 3); // prompt vanishes quickly

  return (
    <div
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         300,
        background:     'var(--bg)',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        opacity:        overlayOpacity,
        pointerEvents:  progress > 0.85 ? 'none' : 'auto',
        // No transition — driven purely by scroll position for responsiveness
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          transform:  `scale(${logoScale})`,
          opacity:    Math.max(0, logoOpacity),
          transformOrigin: 'center center',
          willChange: 'transform, opacity',
        }}
      >
        <img
          src="/placeholders/logo.png"
          alt="PUPS"
          style={{
            width:        250,
            height:       250,
            borderRadius: '50%',
            objectFit:    'cover',
            display:      'block',
          }}
        />
      </div>

      {/* Scroll prompt */}
      <div
        style={{
          marginTop:      48,
          opacity:        promptOpacity,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          gap:            10,
        }}
      >
        {/* Animated chevron */}
        <svg
          width="16"
          height="24"
          viewBox="0 0 16 24"
          fill="none"
          style={{ animation: 'introChevron 1.4s ease-in-out infinite' }}
        >
          <path
            d="M2 6 L8 14 L14 6"
            stroke="var(--tx4)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12 L8 20 L14 12"
            stroke="var(--tx4)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.45 }}
          />
        </svg>

        <span
          style={{
            fontFamily:    "'IBM Plex Mono', monospace",
            fontSize:      9,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color:         'var(--tx4)',
          }}
        >
          Scroll
        </span>
      </div>

      {/* Keyframe for chevron bounce */}
      <style>{`
        @keyframes introChevron {
          0%, 100% { transform: translateY(0);   opacity: 1;    }
          50%       { transform: translateY(5px); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

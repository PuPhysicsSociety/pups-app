'use client';

/**
 * EquationStrip
 * -------------
 * Seamlessly scrolling ticker of physics equations (or any text strings).
 * Drop into any Next.js / React project — zero dependencies.
 *
 * Usage:
 *   import EquationStrip from '@/components/EquationStrip';
 *   <EquationStrip />
 *
 * With custom equations + styling:
 *   <EquationStrip
 *     equations={['E = mc²', 'F = ma', 'ΔS ≥ 0']}
 *     speed={20}
 *     fontSize={18}
 *     color="rgba(30,24,16,0.50)"
 *     background="#efe6d2"
 *     borderColor="rgba(30,24,16,0.14)"
 *     direction="right"
 *   />
 */

import React, { useId } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EquationStripProps {
  /** Array of equation strings to display. Defaults to classic physics equations. */
  equations?: string[];

  /** Scroll duration in seconds for one full loop. Default: 34 */
  speed?: number;

  /** Font size for the equations. Default: 19 */
  fontSize?: number | string;

  /**
   * Font family for the equations.
   * Default: 'Cormorant Garamond', Georgia, serif
   * Tip: import the font yourself (Google Fonts / next/font) if you want it to match.
   */
  fontFamily?: string;

  /** Text color. Default: 'rgba(30, 24, 16, 0.50)' */
  color?: string;

  /** Strip background color. Default: 'transparent' */
  background?: string;

  /** Color of the dividers between items and the top/bottom borders. Default: 'rgba(30,24,16,0.14)' */
  borderColor?: string;

  /** Show top + bottom border on the strip. Default: true */
  showBorder?: boolean;

  /** Horizontal padding around each equation item in px. Default: 28 */
  itemPadding?: number;

  /** Vertical padding of the strip in px (top + bottom). Default: 14 */
  stripPadding?: number;

  /** Scroll direction. Default: 'left' */
  direction?: 'left' | 'right';

  /** Width of the fade-out mask on each edge, as a percentage string. Default: '8%' */
  fadeWidth?: string;

  /** Extra className on the outer wrapper. */
  className?: string;

  /** Extra inline styles on the outer wrapper. */
  style?: React.CSSProperties;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_EQUATIONS: string[] = [
  'iℏ ∂Ψ/∂t = ĤΨ',
  '∮ B · dℓ = μ₀ I\u1D49\u207F\u1D9C',
  'S = k\u0299 ln Ω',
  'E = mc²',
  'R\u03bc\u03bd \u2212 \u00bdg\u03bc\u03bdR = 8\u03c0G T\u03bc\u03bd/c\u2074',
  '\u0394x\u0394p \u2265 \u210f/2',
  '\u2207\u00b7E = \u03c1/\u03b5\u2080',
  'n\u1D62 = g\u1D62\u00a0/\u00a0(e\u207B\u207B\u00b9 \u2212 1)',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EquationStrip({
  equations = DEFAULT_EQUATIONS,
  speed = 34,
  fontSize = 19,
  fontFamily = "'Cormorant Garamond', Georgia, serif",
  color = 'rgba(30, 24, 16, 0.50)',
  background = 'transparent',
  borderColor = 'rgba(30, 24, 16, 0.14)',
  showBorder = true,
  itemPadding = 28,
  stripPadding = 14,
  direction = 'left',
  fadeWidth = '8%',
  className = '',
  style,
}: EquationStripProps) {
  // Unique ID so multiple instances on the same page don't share keyframe names
  const uid = useId().replace(/:/g, '');
  const keyframeName = `eqTicker_${uid}`;

  const translateFrom = direction === 'left' ? '0%' : '-50%';
  const translateTo   = direction === 'left' ? '-50%' : '0%';

  const css = `
    @keyframes ${keyframeName} {
      from { transform: translateX(${translateFrom}); }
      to   { transform: translateX(${translateTo}); }
    }
  `.trim();

  // Double the items so the loop is seamless
  const items = [...equations, ...equations];

  const stripStyle: React.CSSProperties = {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    padding: `${stripPadding}px 0`,
    background,
    borderTop:    showBorder ? `1px solid ${borderColor}` : undefined,
    borderBottom: showBorder ? `1px solid ${borderColor}` : undefined,
    WebkitMaskImage: `linear-gradient(90deg, transparent, #000 ${fadeWidth}, #000 calc(100% - ${fadeWidth}), transparent)`,
    maskImage:       `linear-gradient(90deg, transparent, #000 ${fadeWidth}, #000 calc(100% - ${fadeWidth}), transparent)`,
    ...style,
  };

  const trackStyle: React.CSSProperties = {
    display: 'inline-flex',
    animation: `${keyframeName} ${speed}s linear infinite`,
  };

  const itemStyle: React.CSSProperties = {
    padding: `0 ${itemPadding}px`,
    borderRight: `1px solid ${borderColor}`,
    fontFamily,
    fontStyle: 'italic',
    fontSize,
    color,
    lineHeight: 1,
    userSelect: 'none',
  };

  return (
    <>
      {/* Scoped keyframe — injected per-instance so direction + speed are reactive */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className={`eq-strip${className ? ` ${className}` : ''}`} style={stripStyle}>
        <div style={trackStyle}>
          {items.map((eq, i) => (
            <span key={i} style={itemStyle}>{eq}</span>
          ))}
        </div>
      </div>
    </>
  );
}

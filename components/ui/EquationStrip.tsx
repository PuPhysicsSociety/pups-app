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
import katex from 'katex';

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
  'i\\hbar \\frac{\\partial \\Psi}{\\partial t} = \\hat{H}\\Psi',
  '\\oint \\mathbf{B} \\cdot d\\boldsymbol{\\ell} = \\mu_0 I_{\\text{enc}}',
  'S = k_B \\ln \\Omega',
  'E^2 = p^2c^2 + m_0^2c^4',
  '\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}',
  '\\mathbf{F} = m\\mathbf{a}',
  '\\Delta x \\Delta p \\ge \\frac{\\hbar}{2}',
  '\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}',
  'n_i = \\frac{g_i}{e^{\\beta(\\varepsilon_i - \\mu)} - 1}',
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
    fontSize,
    color,
    lineHeight: 1,
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  };

  return (
    <>
      {/* Scoped keyframe — injected per-instance so direction + speed are reactive */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className={`eq-strip${className ? ` ${className}` : ''}`} style={stripStyle}>
        <div style={trackStyle}>
          {items.map((eq, i) => {
            const html = katex.renderToString(eq, {
              throwOnError: false,
              displayMode: false,
            });
            return (
              <span
                key={i}
                style={itemStyle}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

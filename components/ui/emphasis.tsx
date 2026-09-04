import React from 'react';

/**
 * Renders admin-authored text with a tiny markdown-like convention:
 * `**word**` → <em>word</em>, and literal newlines → <br/>. Keeps the
 * admin form to a plain textarea instead of a rich text editor while
 * still allowing the site's usual "emphasised word" heading style.
 */
export function renderRichText(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, li) => (
    <React.Fragment key={li}>
      {li > 0 && <br />}
      {line.split(/\*\*(.+?)\*\*/g).map((part, pi) =>
        pi % 2 === 1 ? <em key={pi}>{part}</em> : <React.Fragment key={pi}>{part}</React.Fragment>
      )}
    </React.Fragment>
  ));
}

/** Splits admin-authored copy into paragraphs on blank lines. */
export function splitParagraphs(text: string): string[] {
  return (text || '')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
}

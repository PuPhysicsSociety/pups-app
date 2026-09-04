import React from 'react';
import { getSiteContentServer } from '@/lib/server/siteContent';
import { renderRichText, splitParagraphs } from '@/components/ui/emphasis';

// See app/(main)/page.tsx for why this is needed on fixed-path pages that
// read admin-editable content server-side.
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const content = await getSiteContentServer('about');

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-label"><b>{content.sectionLabel}</b>About</div>
          <h2 className="sec-title">{renderRichText(content.title)}</h2>
        </div>
        <div className="about-grid">
          <dl className="about-dl">
            {content.facts.map((f, i) => (
              <React.Fragment key={i}>
                <dt>{f.label}</dt>
                <dd>
                  {f.href ? (
                    <a href={f.href} target="_blank" rel="noopener">{f.value}</a>
                  ) : f.value}
                </dd>
              </React.Fragment>
            ))}
          </dl>

          <div className="about-col">
            {splitParagraphs(content.column1).map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <div className="about-col">
            {splitParagraphs(content.column2).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}

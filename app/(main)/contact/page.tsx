import React from 'react';
import { Instagram, Linkedin, Youtube, Link2 } from 'lucide-react';
import { getSiteContentServer } from '@/lib/server/siteContent';
import { renderRichText, splitParagraphs } from '@/components/ui/emphasis';

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

// Icon is chosen by matching the admin-entered label — unrecognised
// platforms (or a typo) still render a sensible generic link icon rather
// than breaking the row.
function socialIcon(label: string) {
  switch (label.trim().toLowerCase()) {
    case 'facebook':  return <FacebookIcon size={18} />;
    case 'instagram': return <Instagram size={18} strokeWidth={1.5} />;
    case 'linkedin':  return <Linkedin size={18} strokeWidth={1.5} />;
    case 'youtube':   return <Youtube size={18} strokeWidth={1.5} />;
    default:          return <Link2 size={18} strokeWidth={1.5} />;
  }
}

// See app/(main)/page.tsx for why this is needed on fixed-path pages that
// read admin-editable content server-side.
export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const content = await getSiteContentServer('contact');

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-label"><b>{content.sectionLabel}</b>Contact</div>
          <h2 className="sec-title">{renderRichText(content.title)}</h2>
        </div>

        <div className="contact-grid">
          <div>
            <h3>{renderRichText(content.introTitle)}</h3>
            {splitParagraphs(content.introBody).map((p, i) => <p key={i}>{p}</p>)}
            <p>
              You can email us at{' '}
              <a href={`mailto:${content.contactEmail}`} className="lnk">{content.contactEmail}</a>.
            </p>
          </div>

          <div>
            <div className="cb">
              <div className="cb-lbl">Contact Information</div>

              <div className="ci">
                <span className="ci-k">Address</span>
                <span>{content.address}</span>
              </div>
              <div className="ci">
                <span className="ci-k">Email</span>
                <span><a href={`mailto:${content.contactEmail}`}>{content.contactEmail}</a></span>
              </div>
              <div className="ci">
                <span className="ci-k">Colloquia</span>
                <span>{content.colloquiaVenue}</span>
              </div>
              <div className="ci">
                <span className="ci-k">Events</span>
                <span>{content.eventsVenue}</span>
              </div>
              <div className="ci">
                <span className="ci-k">Department</span>
                <span>
                  <a href={content.departmentUrl} target="_blank" rel="noopener">
                    {content.departmentName} →
                  </a>
                </span>
              </div>

              {content.socials.length > 0 && (
                <div className="ci" style={{ alignItems: 'center' }}>
                  <span className="ci-k">Social</span>
                  <span style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    {content.socials.map(({ label, href }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`PUPS on ${label}`}
                        className="social-icon-link"
                      >
                        {socialIcon(label)}
                      </a>
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

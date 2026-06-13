import React from 'react';
import { Instagram, Linkedin, Youtube } from 'lucide-react';

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

const SOCIALS = [
  {
    label: 'Facebook',
    href:  'https://www.facebook.com/share/1Ji9crLVGh/',
    icon:  <FacebookIcon size={18} />,
  },
  {
    label: 'Instagram',
    href:  'https://www.instagram.com/puphysicssociety',
    icon:  <Instagram size={18} strokeWidth={1.5} />,
  },
  {
    label: 'LinkedIn',
    href:  'https://www.linkedin.com/in/presidency-university-physics-society-3b6a87383',
    icon:  <Linkedin size={18} strokeWidth={1.5} />,
  },
  {
    label: 'YouTube',
    href:  'https://youtube.com/@puphysicssociety',
    icon:  <Youtube size={18} strokeWidth={1.5} />,
  },
];

export default function ContactPage() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-label"><b>vi</b>Contact</div>
          <h2 className="sec-title">Get in <em>touch</em>.</h2>
        </div>

        <div className="contact-grid">
          <div>
            <h3>We'd love to <em>hear from you</em>.</h3>
            <p>
              Whether you have a question about our events, want to collaborate, or are interested
              in delivering a colloquium — reach out to the team.
            </p>
            <p>
              You can email us at{' '}
              <a href="mailto:puphysicssociety@gmail.com" className="lnk">
                puphysicssociety@gmail.com
              </a>.
            </p>
            <p>
              For departmental information, visit the{' '}
              <a
                href="https://www.presiuniv.ac.in/web/physics.php"
                target="_blank"
                rel="noopener"
                className="lnk"
              >
                Department of Physics
              </a>{' '}
              website.
            </p>
          </div>

          <div>
            <div className="cb">
              <div className="cb-lbl">Contact Information</div>

              <div className="ci">
                <span className="ci-k">Address</span>
                <span>86/1 College Street, Kolkata 700 073, West Bengal, India</span>
              </div>
              <div className="ci">
                <span className="ci-k">Email</span>
                <span>
                  <a href="mailto:puphysicssociety@gmail.com">puphysicssociety@gmail.com</a>
                </span>
              </div>
              <div className="ci">
                <span className="ci-k">Colloquia</span>
                <span>PLT-2, Baker Building</span>
              </div>
              <div className="ci">
                <span className="ci-k">Events</span>
                <span>P.C.M. Auditorium, Baker Building</span>
              </div>
              <div className="ci">
                <span className="ci-k">Department</span>
                <span>
                  <a href="https://www.presiuniv.ac.in/web/physics.php" target="_blank" rel="noopener">
                    presiuniv.ac.in →
                  </a>
                </span>
              </div>

              {/* Social icons row */}
              <div className="ci" style={{ alignItems: 'center' }}>
                <span className="ci-k">Social</span>
                <span style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  {SOCIALS.map(({ label, href, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`PUPS on ${label}`}
                      className="social-icon-link"
                    >
                      {icon}
                    </a>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

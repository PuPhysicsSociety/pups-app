import React from 'react';

export default function ContactPage() {
  return (
    <section className="section cream">
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
              <a href="mailto:puphysicssociety@gmail.com" className="lnk">puphysicssociety@gmail.com</a>.
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
                <span><a href="mailto:puphysicssociety@gmail.com">puphysicssociety@gmail.com</a></span>
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

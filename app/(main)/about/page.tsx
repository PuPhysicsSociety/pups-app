import { Metadata } from 'next';
import React from 'react';
import ResearchInterestsCloud from '@/components/ui/ResearchInterestsCloud'; // 1. Import the cloud

export const metadata: Metadata = {
  title: 'About Us | Presidency University Physics Society',
  description: 'Learn about the legacy of Presidency University Physics Department and the mission of the Presidency University Physics Society (PUPS).',
  openGraph: {
    title: 'About Us | Presidency University Physics Society',
    description: 'Learn about the legacy of Presidency University Physics Department and the mission of the Presidency University Physics Society (PUPS).',
  },
};

export default function AboutPage() {
  return (
    <>
      {/* 2. Insert the fixed watermark layer at the root level */}
      <ResearchInterestsCloud />

      <section className="section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-label"><b>ii</b>About</div>
            <h2 className="sec-title">A society built on <em>inquiry</em>.</h2>
          </div>
          <div className="about-grid">
            <dl className="about-dl">
              <dt>Founded</dt><dd>November 2025</dd>
              <dt>Institution</dt><dd>Presidency University, Kolkata</dd>
              <dt>Department</dt><dd>Department of Physics</dd>
              <dt>Colloquia venue</dt><dd>PLT-2, Baker Building</dd>
              <dt>Events venue</dt><dd>P.C.M. Auditorium, Baker Building</dd>
              <dt>Website</dt>
              <dd>
                <a href="https://www.presiuniv.ac.in/web/physics.php" target="_blank" rel="noopener">
                  presiuniv.ac.in →
                </a>
              </dd>
            </dl>

            <div className="about-col">
              <p>
                The Department of Physics at Presidency University, Kolkata, is renowned for its legacy of
                excellence in teaching and research. With a strong emphasis on both theoretical and
                experimental physics, the department has nurtured generations of scientists and scholars.
                It continues to evolve through curriculum modernisation, infrastructure upgrades, and
                active research initiatives.
              </p>
              <p>
                The department traces an extraordinary intellectual lineage: Satyendra Nath Bose developed
                the foundations of quantum statistics here; Meghnad Saha formulated his ionisation
                equation in these halls; Jagadish Chandra Bose conducted early wireless experiments nearby.
              </p>
            </div>

            <div className="about-col">
              <p>
                The Presidency University Physics Society (PUPS), founded in 2025, serves as a dynamic
                platform for students and faculty to engage in scientific dialogue and outreach. The society
                organises weekly colloquia, panel discussions, and thematic events that foster intellectual
                curiosity and community participation.
              </p>
              <p>
                Through these initiatives, PUPS aims to cultivate a vibrant academic culture centred around
                the exploration of physics and create opportunities for students to engage with cutting-edge
                research and ideas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

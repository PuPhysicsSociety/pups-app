// Fallback content for the editable public pages. Used whenever no
// SiteContent document exists yet for a page (e.g. fresh install, or a
// page nobody has customized), so the site renders exactly as it did
// before this became admin-editable — no forced migration step.

export interface HomeContent {
  kicker: string;
  heroTitle: string;   // '\n' = line break, **word** = emphasis
  heroLede: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  whatWeDoLabel: string;
  whatWeDoTitle: string; // **word** = emphasis
  pillars: { title: string; description: string }[];
}

export interface AboutContent {
  sectionLabel: string;
  title: string; // **word** = emphasis
  facts: { label: string; value: string; href?: string }[];
  column1: string; // paragraphs separated by a blank line
  column2: string;
}

export interface ContactContent {
  sectionLabel: string;
  title: string;       // **word** = emphasis
  introTitle: string;  // **word** = emphasis
  introBody: string;   // paragraphs separated by a blank line
  contactEmail: string;
  address: string;
  colloquiaVenue: string;
  eventsVenue: string;
  departmentName: string;
  departmentUrl: string;
  socials: { label: string; href: string }[];
}

export const DEFAULT_HOME: HomeContent = {
  kicker: 'Presidency University · Est. 1817',
  heroTitle: 'Fostering scientific\ndialogue, outreach\n& **community**.',
  heroLede:
    'The Presidency University Physics Society organises weekly colloquia under the Scientific Discussion Forum, panel discussions, and thematic events that cultivate a vibrant academic culture centred around the exploration of physics.',
  ctaPrimary: { label: 'Explore events', href: '/events' },
  ctaSecondary: { label: 'Browse colloquia', href: '/colloquium' },
  whatWeDoLabel: 'ii',
  whatWeDoTitle: 'Built around **exploration**.',
  pillars: [
    { title: 'Scientific Discussion Forum', description: 'Expert talks on cutting-edge physics research, open to all students and faculty each week.' },
    { title: 'Panel Discussions', description: 'Interdisciplinary conversations bringing together researchers to examine pressing questions in science.' },
    { title: 'Thematic Events', description: 'Workshops, seminars, and conferences focused on specific areas of modern and classical physics.' },
    { title: 'Community', description: 'A vibrant community where students collaborate and grow through shared curiosity each term.' },
  ],
};

export const DEFAULT_ABOUT: AboutContent = {
  sectionLabel: 'ii',
  title: 'A society built on **inquiry**.',
  facts: [
    { label: 'Founded', value: 'November 2025' },
    { label: 'Institution', value: 'Presidency University, Kolkata' },
    { label: 'Department', value: 'Department of Physics' },
    { label: 'Colloquia venue', value: 'PLT-2, Baker Building' },
    { label: 'Events venue', value: 'P.C.M. Auditorium, Baker Building' },
    { label: 'Website', value: 'presiuniv.ac.in →', href: 'https://www.presiuniv.ac.in/web/physics.php' },
  ],
  column1:
    'The Department of Physics at Presidency University, Kolkata, is renowned for its legacy of excellence in teaching and research. With a strong emphasis on both theoretical and experimental physics, the department has nurtured generations of scientists and scholars. It continues to evolve through curriculum modernisation, infrastructure upgrades, and active research initiatives.\n\nThe department traces an extraordinary intellectual lineage: Satyendra Nath Bose developed the foundations of quantum statistics here; Meghnad Saha formulated his ionisation equation in these halls; Jagadish Chandra Bose conducted early wireless experiments nearby.',
  column2:
    'The Presidency University Physics Society (PUPS), founded in 2025, serves as a dynamic platform for students and faculty to engage in scientific dialogue and outreach. The society organises weekly colloquia, panel discussions, and thematic events that foster intellectual curiosity and community participation.\n\nThrough these initiatives, PUPS aims to cultivate a vibrant academic culture centred around the exploration of physics and create opportunities for students to engage with cutting-edge research and ideas.',
};

export const DEFAULT_CONTACT: ContactContent = {
  sectionLabel: 'vi',
  title: 'Get in **touch**.',
  introTitle: "We'd love to **hear from you**.",
  introBody:
    "Whether you have a question about our events, want to collaborate, or are interested in delivering a colloquium — reach out to the team.\n\nFor departmental information, visit the Department of Physics website.",
  contactEmail: 'puphysicssociety@gmail.com',
  address: '86/1 College Street, Kolkata 700 073, West Bengal, India',
  colloquiaVenue: 'PLT-2, Baker Building',
  eventsVenue: 'P.C.M. Auditorium, Baker Building',
  departmentName: 'presiuniv.ac.in',
  departmentUrl: 'https://www.presiuniv.ac.in/web/physics.php',
  socials: [
    { label: 'Facebook', href: 'https://www.facebook.com/share/1Ji9crLVGh/' },
    { label: 'Instagram', href: 'https://www.instagram.com/puphysicssociety' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/presidency-university-physics-society-3b6a87383' },
    { label: 'YouTube', href: 'https://youtube.com/@puphysicssociety' },
  ],
};

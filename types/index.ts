// Kept for backward compat with colloquium pages
export interface Colloquium {
  id: string;
  name: string;
  speaker?: string;
  department?: string;
  abstract: string;
  date: string;
  time?: string;
  location?: string;
  speakerBio?: string;
  video?: string;
  thumbnail?: string;
  poster?: string;
  regFormLink?: string;
  materials?: { title: string; url: string; fileType?: string }[];
  tags?: string[];
  published?: boolean;
  createdAt?: string;
}

// Unified event type covering lecture_series | workshop | conference
export interface UnifiedEvent {
  id: string;
  type: 'lecture_series' | 'workshop' | 'conference';
  title: string;
  description?: string;
  mode: 'online' | 'offline';
  thumbnail?: string;
  lecturerDetails: { name: string; affiliation?: string; image?: string }[];
  dateTime: { start?: string; end?: string; schedule?: string };
  noOfClasses?: number;
  regFormLink?: string;
  toContact: { name?: string; email?: string; phone?: string; role?: string }[];
  supplements: { url: string; name?: string; type?: string; source?: string }[];
  pastImagesPreview: string[];
  driveLink?: string;
  subevent?: { title?: string; description?: string; speaker?: string }[];
  venue?: string;
  audience?: string;
  duration?: string;
  tags?: string[];
  createdAt?: string;
}

// Keep old LectureSeries type for any remaining references
export interface LectureSeries {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  lecturerDetails: { name: string; affiliation?: string }[];
  dateTime: { start?: string; end?: string; schedule?: string };
  mode: 'online' | 'offline';
  noOfClasses?: number;
  regFormLink?: string;
  toContact: { name: string; email?: string; phone?: string; role?: string }[];
  supplements: { url: string; name?: string; type?: string; source?: string }[];
  createdAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  linkedin_url?: string;
  email?: string;
  bio?: string;
  photo?: string;
  department?: string;
  active?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  permissions: {
    canCreateEvents: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
    canCreateColloquium: boolean;
    canEditColloquium: boolean;
    canDeleteColloquium: boolean;
    canManageTeam: boolean;
    canManageUsers: boolean;
    canAccessAnalytics: boolean;
  };
}

export interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  endDate?: string;
  time?: string;
  location?: string;
  organizer?: string;
  poster?: string;
  tagline?: string;
  description?: string;
  audience?: string;
  duration?: string;
  rsvpLink?: string;
  speakers?: string[];
  tags?: string[];
  resources?: { title: string; url: string; fileType?: string }[];
  photos?: { url: string; publicId?: string }[];
  video?: string;
  past?: boolean;
  featured?: boolean;
  published?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface Colloquium {
  id: string;
  name: string;
  speaker?: string;
  abstract: string;
  date: string;
  time?: string;
  location?: string;
  department?: string;
  speakerBio?: string;
  video?: string;
  thumbnail?: string;
  materials?: { title: string; url: string; fileType?: string }[];
  tags?: string[];
  published?: boolean;
  createdAt?: string;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Token management
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

const headers = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const getImageUrl = (path?: string): string => {
  if (!path) return '/placeholders/default.jpg';
  if (path.startsWith('/uploads/')) {
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')
      .replace('/api', '');
    return `${base}${path}`;
  }
  return path;
};

// ==================== AUTH ====================

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await res.json();
  setToken(data.token);
  return data;
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data = await res.json();
  setToken(data.token);
  return data;
}

export async function getCurrentUser() {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: headers()
  });

  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

// ==================== EVENTS ====================

export async function getEvents(query?: string) {
  const url = `${API_URL}/events${query || ''}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function getEventById(id: string) {
  const res = await fetch(`${API_URL}/events/${id}`);

  if (!res.ok) throw new Error('Failed to fetch event');
  return res.json();
}

export async function createEvent(formData: FormData) {
  const res = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create event');
  }

  return res.json();
}

export async function updateEvent(id: string, formData: FormData) {
  const res = await fetch(`${API_URL}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update event');
  }

  return res.json();
}

export async function deleteEvent(id: string) {
  const res = await fetch(`${API_URL}/events/${id}`, {
    method: 'DELETE',
    headers: headers()
  });

  if (!res.ok) throw new Error('Failed to delete event');
  return res.json();
}

// ==================== COLLOQUIUM ====================

export async function getColloquium(query?: string) {
  const url = `${API_URL}/colloquium${query || ''}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error('Failed to fetch colloquium');
  return res.json();
}

export async function getColloquiumById(id: string) {
  const res = await fetch(`${API_URL}/colloquium/${id}`);

  if (!res.ok) throw new Error('Failed to fetch colloquium');
  return res.json();
}

export async function createColloquium(formData: FormData) {
  const res = await fetch(`${API_URL}/colloquium`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create colloquium');
  }

  return res.json();
}

export async function updateColloquium(id: string, formData: FormData) {
  const res = await fetch(`${API_URL}/colloquium/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update colloquium');
  }

  return res.json();
}

export async function deleteColloquium(id: string) {
  const res = await fetch(`${API_URL}/colloquium/${id}`, {
    method: 'DELETE',
    headers: headers()
  });

  if (!res.ok) throw new Error('Failed to delete colloquium');
  return res.json();
}

// ==================== TEAM ====================

export async function getTeam(query?: string) {
  const url = `${API_URL}/team${query || ''}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error('Failed to fetch team');
  return res.json();
}

export async function getTeamById(id: string) {
  const res = await fetch(`${API_URL}/team/${id}`);

  if (!res.ok) throw new Error('Failed to fetch team member');
  return res.json();
}

export async function createTeamMember(formData: FormData) {
  const res = await fetch(`${API_URL}/team`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create team member');
  }

  return res.json();
}

export async function updateTeamMember(id: string, formData: FormData) {
  const res = await fetch(`${API_URL}/team/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update team member');
  }

  return res.json();
}

export async function deleteTeamMember(id: string) {
  const res = await fetch(`${API_URL}/team/${id}`, {
    method: 'DELETE',
    headers: headers()
  });

  if (!res.ok) throw new Error('Failed to delete team member');
  return res.json();
}

// ==================== ADMIN ====================

export async function getAdminStats() {
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: headers()
  });

  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function getAllUsers() {
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: headers()
  });

  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function updateUserRole(userId: string, role: string) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ role })
  });

  if (!res.ok) throw new Error('Failed to update user role');
  return res.json();
}
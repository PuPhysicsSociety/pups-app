const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ── Token ────────────────────────────────────────────────────────────────────

export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem('authToken', token);
};

export const removeToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem('authToken');
};

// ── 401 handler ───────────────────────────────────────────────────────────────

function dispatch401() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:401'));
}

async function handleRes(res: Response) {
  if (res.status === 401) {
    dispatch401();
    let msg = 'Unauthorized';
    try { const d = await res.json(); msg = d.message || d.error || msg; } catch {}
    throw new Error(msg);
  }
  if (!res.ok) {
    let msg = 'Request failed';
    try { const d = await res.json(); msg = d.message || d.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

const authHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${getToken()}`,
});


export const getImageUrl = (path?: string): string => {
  if (!path) return '/placeholders/default.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) {
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${base}${path}`;
  }
  return path;
};

// ── Normalizers ───────────────────────────────────────────────────────────────

function fmtDate(iso?: string): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export function normColloquium(raw: any) {
  const sp = raw.speaker;
  const speakerName = typeof sp === 'string' ? sp : (sp?.name || '');
  const speakerAff  = typeof sp === 'string' ? '' : (sp?.affiliation || '');
  return {
    id:          raw._id || raw.id || '',
    name:        raw.title || raw.name || '',
    speaker:     speakerName,
    department:  speakerAff || raw.department || '',
    abstract:    raw.abstract || '',
    date:        fmtDate(raw.time) || raw.date || '',
    time:        raw.time || '',
    location:    raw.venue || raw.location || '',
    video:       raw.ytLink || raw.video || '',
    thumbnail:   raw.poster || raw.thumbnail || '',
    poster:      raw.poster || '',
    regFormLink: raw.reg_form_link || '',
    speakerBio:  raw.speakerBio || '',
    materials:   Array.isArray(raw.materials) ? raw.materials : [],
    tags:        Array.isArray(raw.tags) ? raw.tags : [],
    published:   raw.published ?? true,
  };
}

export function normLectureSeries(raw: any) {
  return {
    id:              raw._id || raw.id || '',
    title:           raw.title || '',
    description:     raw.description || '',
    thumbnail:       raw.thumbnail || '',
    lecturerDetails: raw.lecturer_details || [],
    dateTime:        raw.date_time || {},
    mode:            raw.mode || 'offline',
    noOfClasses:     raw.no_of_classes,
    regFormLink:     raw.reg_form_link || '',
    toContact:       raw.to_contact || [],
    supplements:     raw.suppliments || [],
    createdAt:       raw.createdAt || '',
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleRes(res);
  if (data.token) setToken(data.token);
  return data;
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await handleRes(res);
  if (data.token) setToken(data.token);
  return data;
}


// ── Colloquia ─────────────────────────────────────────────────────────────────

export async function getColloquium(query?: string) {
  const res = await fetch(`${API_URL}/colloquia${query || ''}`);
  const data = await handleRes(res);
  return { ...data, data: (data.data || []).map(normColloquium) };
}

export async function getColloquiumById(id: string) {
  const res = await fetch(`${API_URL}/colloquia/${id}`);
  const data = await handleRes(res);
  return { ...data, data: normColloquium(data.data) };
}

export async function createColloquium(formData: FormData) {
  const res = await fetch(`${API_URL}/colloquia`, {
    method: 'POST', headers: authHeaders(), body: formData,
  });
  return handleRes(res);
}

export async function updateColloquium(id: string, formData: FormData) {
  const res = await fetch(`${API_URL}/colloquia/${id}`, {
    method: 'PUT', headers: authHeaders(), body: formData,
  });
  return handleRes(res);
}

export async function deleteColloquium(id: string) {
  const res = await fetch(`${API_URL}/colloquia/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  return handleRes(res);
}

// ── Lecture Series ────────────────────────────────────────────────────────────

export async function getLectureSeries(query?: string) {
  const res = await fetch(`${API_URL}/lecture-series${query || ''}`);
  const data = await handleRes(res);
  return { ...data, data: (data.data || []).map(normLectureSeries) };
}

export async function getLectureSeriesById(id: string) {
  const res = await fetch(`${API_URL}/lecture-series/${id}`);
  const data = await handleRes(res);
  return { ...data, data: normLectureSeries(data.data) };
}

export async function createLectureSeries(formData: FormData) {
  const res = await fetch(`${API_URL}/lecture-series`, {
    method: 'POST', headers: authHeaders(), body: formData,
  });
  return handleRes(res);
}

export async function updateLectureSeries(id: string, formData: FormData) {
  const res = await fetch(`${API_URL}/lecture-series/${id}`, {
    method: 'PUT', headers: authHeaders(), body: formData,
  });
  return handleRes(res);
}

export async function deleteLectureSeries(id: string) {
  const res = await fetch(`${API_URL}/lecture-series/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  return handleRes(res);
}

export async function addLectureSeriesSupplement(id: string, payload: object) {
  const res = await fetch(`${API_URL}/lecture-series/${id}/suppliments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function removeLectureSeriesSupplement(id: string, url: string) {
  const res = await fetch(`${API_URL}/lecture-series/${id}/suppliments`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ url }),
  });
  return handleRes(res);
}

// ── Team ──────────────────────────────────────────────────────────────────────

export async function getTeam(query?: string) {
  const res = await fetch(`${API_URL}/team${query || ''}`);
  return handleRes(res);
}

export async function getTeamById(id: string) {
  const res = await fetch(`${API_URL}/team/${id}`);
  return handleRes(res);
}

export async function createTeamMember(formData: FormData) {
  const res = await fetch(`${API_URL}/team`, {
    method: 'POST', headers: authHeaders(), body: formData,
  });
  return handleRes(res);
}

export async function updateTeamMember(id: string, formData: FormData) {
  const res = await fetch(`${API_URL}/team/${id}`, {
    method: 'PUT', headers: authHeaders(), body: formData,
  });
  return handleRes(res);
}

export async function deleteTeamMember(id: string) {
  const res = await fetch(`${API_URL}/team/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  return handleRes(res);
}


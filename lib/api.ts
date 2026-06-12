const API = '/api';

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

const jsonHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const getImageUrl = (path?: string): string => {
  if (!path) return '/placeholders/default.jpg';
  if (path.startsWith('http')) return path;
  return path;
};

// ── Cloudinary upload helper ──────────────────────────────────────────────────

export async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const signRes = await fetch(`${API}/cloudinary/sign`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ folder, resource_type: 'image' }),
  });
  if (!signRes.ok) throw new Error('Could not get upload signature');
  const { signature, timestamp, cloudName, apiKey, folder: f } = await signRes.json();

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', f);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  if (!uploadRes.ok) throw new Error('Cloudinary upload failed');
  const { secure_url } = await uploadRes.json();
  return secure_url as string;
}

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
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleRes(res);
  if (data.token) setToken(data.token);
  return data;
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API}/auth/register`, {
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
  const res = await fetch(`${API}/colloquia${query || ''}`);
  const data = await handleRes(res);
  return { ...data, data: (data.data || []).map(normColloquium) };
}

export async function getColloquiumById(id: string) {
  const res = await fetch(`${API}/colloquia/${id}`);
  const data = await handleRes(res);
  return { ...data, data: normColloquium(data.data) };
}

export async function createColloquium(body: object) {
  const res = await fetch(`${API}/colloquia`, {
    method: 'POST', headers: jsonHeaders(), body: JSON.stringify(body),
  });
  return handleRes(res);
}

export async function updateColloquium(id: string, body: object) {
  const res = await fetch(`${API}/colloquia/${id}`, {
    method: 'PUT', headers: jsonHeaders(), body: JSON.stringify(body),
  });
  return handleRes(res);
}

export async function deleteColloquium(id: string) {
  const res = await fetch(`${API}/colloquia/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  return handleRes(res);
}

// ── Lecture Series ────────────────────────────────────────────────────────────

export async function getLectureSeries(query?: string) {
  const res = await fetch(`${API}/lecture-series${query || ''}`);
  const data = await handleRes(res);
  return { ...data, data: (data.data || []).map(normLectureSeries) };
}

export async function getLectureSeriesById(id: string) {
  const res = await fetch(`${API}/lecture-series/${id}`);
  const data = await handleRes(res);
  return { ...data, data: normLectureSeries(data.data) };
}

export async function createLectureSeries(body: object) {
  const res = await fetch(`${API}/lecture-series`, {
    method: 'POST', headers: jsonHeaders(), body: JSON.stringify(body),
  });
  return handleRes(res);
}

export async function updateLectureSeries(id: string, body: object) {
  const res = await fetch(`${API}/lecture-series/${id}`, {
    method: 'PUT', headers: jsonHeaders(), body: JSON.stringify(body),
  });
  return handleRes(res);
}

export async function deleteLectureSeries(id: string) {
  const res = await fetch(`${API}/lecture-series/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  return handleRes(res);
}

export async function addLectureSeriesSupplement(id: string, payload: object) {
  const res = await fetch(`${API}/lecture-series/${id}/suppliments`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function removeLectureSeriesSupplement(id: string, url: string) {
  const res = await fetch(`${API}/lecture-series/${id}/suppliments`, {
    method: 'DELETE',
    headers: jsonHeaders(),
    body: JSON.stringify({ url }),
  });
  return handleRes(res);
}

// ── Events ──────────────────────────────────────────────────────────────────────

export function normEvent(raw: any) {
  return {
    id:                  raw._id || raw.id || '',
    type:                raw.type || 'lecture_series',
    title:               raw.title || '',
    description:         raw.description || '',
    mode:                raw.mode || 'offline',
    thumbnail:           raw.thumbnail || '',
    lecturerDetails:     raw.lecturer_details || [],
    dateTime:            raw.date_time || {},
    noOfClasses:         raw.no_of_classes,
    regFormLink:         raw.reg_form_link || '',
    toContact:           raw.to_contact || [],
    supplements:         raw.suppliments || [],
    pastImagesPreview:   raw.past_images_preview || [],
    driveLink:           raw.drive_link || '',
    subevent:            raw.subevent || [],
    venue:               raw.venue || '',
    audience:            raw.audience || '',
    duration:            raw.duration || '',
    tags:                raw.tags || [],
    createdAt:           raw.createdAt || '',
  };
}

export async function getEvents(query?: string) {
  const res = await fetch(`${API}/events${query || ''}`);
  const data = await handleRes(res);
  return { ...data, data: (data.data || []).map(normEvent) };
}

export async function getEventById(id: string) {
  const res = await fetch(`${API}/events/${id}`);
  const data = await handleRes(res);
  return { ...data, data: normEvent(data.data) };
}

export async function createEvent(body: object) {
  const res = await fetch(`${API}/events`, {
    method: 'POST', headers: jsonHeaders(), body: JSON.stringify(body),
  });
  return handleRes(res);
}

export async function updateEvent(id: string, body: object) {
  const res = await fetch(`${API}/events/${id}`, {
    method: 'PUT', headers: jsonHeaders(), body: JSON.stringify(body),
  });
  return handleRes(res);
}

export async function deleteEvent(id: string) {
  const res = await fetch(`${API}/events/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  return handleRes(res);
}

export async function addEventSupplement(id: string, payload: object) {
  const res = await fetch(`${API}/events/${id}/suppliments`, {
    method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function removeEventSupplement(id: string, url: string) {
  const res = await fetch(`${API}/events/${id}/suppliments`, {
    method: 'DELETE', headers: jsonHeaders(), body: JSON.stringify({ url }),
  });
  return handleRes(res);
}

// Also export uploadToCloudinaryRaw for non-image files (PDFs etc.)
export async function uploadFileToCloudinary(file: File, folder: string): Promise<{ url: string; name: string; type: string }> {
  const isImage = file.type.startsWith('image/');
  const resource_type = isImage ? 'image' : 'raw';

  const signRes = await fetch(`${API}/cloudinary/sign`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ folder, resource_type }),
  });
  if (!signRes.ok) throw new Error('Could not get upload signature');
  const { signature, timestamp, cloudName, apiKey, folder: f } = await signRes.json();

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', f);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/upload`,
    { method: 'POST', body: form }
  );
  if (!uploadRes.ok) {
    console.error('Cloudinary upload failed', await uploadRes.text());
    throw new Error('Cloudinary upload failed');
  }
  const result = await uploadRes.json();
  return {
    url:  result.secure_url as string,
    name: file.name,
    type: file.type,
  };
}


// ── Team ──────────────────────────────────────────────────────────────────────

export async function getTeam(query?: string) {
  const res = await fetch(`${API}/team${query || ''}`);
  return handleRes(res);
}

export async function getTeamById(id: string) {
  const res = await fetch(`${API}/team/${id}`);
  return handleRes(res);
}

export async function createTeamMember(formData: FormData) {
  const res = await fetch(`${API}/team`, {
    method: 'POST', headers: authHeaders(), body: formData,
  });
  return handleRes(res);
}

export async function updateTeamMember(id: string, formData: FormData) {
  const res = await fetch(`${API}/team/${id}`, {
    method: 'PUT', headers: authHeaders(), body: formData,
  });
  return handleRes(res);
}

export async function deleteTeamMember(id: string) {
  const res = await fetch(`${API}/team/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  return handleRes(res);
}

'use client';
import React, { useEffect, useState } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent, getImageUrl } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Event } from '../../../types';

const EMPTY: any = {
  name: '', type: 'general', description: '', date: '', time: '', location: '',
  organizer: 'Department of Physics', tagline: '', audience: '', duration: '',
  rsvpLink: '', speakersRaw: '', tagsRaw: '', video: '',
  resources: [], photos: [],
  featured: false, past: false, published: true,
};

const parseArr = (v: any) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch {} }
  return [];
};

export default function AdminEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const canCreate = user?.role === 'admin' || user?.permissions?.canCreateEvents;
  const canDel = user?.role === 'admin' || user?.permissions?.canDeleteEvents;

  const load = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      const normalized = (data.data || []).map((ev: Event) => ({
        ...ev,
        tags:      parseArr(ev.tags),
        speakers:  parseArr(ev.speakers),
        resources: parseArr(ev.resources),
        photos:    parseArr(ev.photos),
      }));
      setEvents(normalized);
    } catch { setError('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ ...EMPTY });
    setEditId(null);
    setPosterFile(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (ev: Event) => {
    setForm({
      ...ev,
      speakersRaw: parseArr(ev.speakers).join(', '),
      tagsRaw:     parseArr(ev.tags).join(', '),
      video:       (ev as any).video || '',
      resources:   parseArr(ev.resources),
      photos:      parseArr(ev.photos),
    });
    setEditId(ev.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      const fields = ['name','type','description','date','time','location','organizer','tagline','audience','duration','rsvpLink','video'];
      fields.forEach(k => fd.append(k, String(form[k] || '')));
      fd.append('featured',  String(form.featured));
      fd.append('past',      String(form.past));
      fd.append('published', String(form.published));
      fd.append('speakers', JSON.stringify(
        (form.speakersRaw || '').split(',').map((s: string) => s.trim()).filter(Boolean)
      ));
      fd.append('tags', JSON.stringify(
        (form.tagsRaw || '').split(',').map((s: string) => s.trim()).filter(Boolean)
      ));
      fd.append('resources', JSON.stringify(form.resources || []));
      fd.append('photos',    JSON.stringify(form.photos    || []));
      if (posterFile) fd.append('poster', posterFile);

      if (editId) {
        await updateEvent(editId, fd);
        setSuccessMsg('Event updated!');
      } else {
        await createEvent(fd);
        setSuccessMsg('Event created!');
      }
      setTimeout(() => setSuccessMsg(''), 3000);
      resetForm();
      load();
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try { await deleteEvent(id); load(); }
    catch { setError('Delete failed'); }
  };

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold">Events</h2>
        {canCreate && (
          <button
            onClick={() => { resetForm(); setShowForm(s => !s); }}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
          >
            {showForm && !editId ? '✕ Cancel' : '+ New Event'}
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-sm">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#25293c] border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4">{editId ? 'Edit Event' : 'New Event'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Event Name *">
              <input required value={form.name || ''} onChange={e => set('name', e.target.value)} className={iCls} placeholder="e.g. Quantum Mechanics Workshop" />
            </Field>
            <Field label="Type *">
              <select required value={form.type || 'general'} onChange={e => set('type', e.target.value)} className={iCls}>
                {['general','workshop','conference','panel-discussion','seminar'].map(t =>
                  <option key={t} value={t}>{t}</option>
                )}
              </select>
            </Field>
            <Field label="Date *">
              <input required type="date" value={form.date || ''} onChange={e => set('date', e.target.value)} className={iCls} />
            </Field>
            <Field label="Time">
              <input type="time" value={form.time || ''} onChange={e => set('time', e.target.value)} className={iCls} />
            </Field>
            <Field label="Location *">
              <input required value={form.location || ''} onChange={e => set('location', e.target.value)} className={iCls} placeholder="e.g. Room 301, Physics Block" />
            </Field>
            <Field label="Organizer">
              <input value={form.organizer || ''} onChange={e => set('organizer', e.target.value)} className={iCls} />
            </Field>
            <Field label="Tagline">
              <input value={form.tagline || ''} onChange={e => set('tagline', e.target.value)} className={iCls} placeholder="Short catchy line" />
            </Field>
            <Field label="Audience">
              <input value={form.audience || ''} onChange={e => set('audience', e.target.value)} className={iCls} placeholder="e.g. UG & PG students" />
            </Field>
            <Field label="Duration">
              <input value={form.duration || ''} onChange={e => set('duration', e.target.value)} className={iCls} placeholder="e.g. 2 hours" />
            </Field>
            <Field label="RSVP Link">
              <input type="url" value={form.rsvpLink || ''} onChange={e => set('rsvpLink', e.target.value)} className={iCls} placeholder="https://..." />
            </Field>
            <Field label="Speakers (comma-separated)">
              <input value={form.speakersRaw || ''} onChange={e => set('speakersRaw', e.target.value)} className={iCls} placeholder="Dr. A, Prof. B" />
            </Field>
            <Field label="Tags (comma-separated)">
              <input value={form.tagsRaw || ''} onChange={e => set('tagsRaw', e.target.value)} className={iCls} placeholder="physics, quantum, workshop" />
            </Field>
            <Field label="Poster Image">
              <input type="file" accept="image/*" onChange={e => setPosterFile(e.target.files?.[0] || null)} className={iCls} />
            </Field>
            <Field label="Video URL (YouTube embed)">
              <input type="url" value={form.video || ''} onChange={e => set('video', e.target.value)} className={iCls} placeholder="https://www.youtube.com/embed/..." />
            </Field>
            <Field label="Description *" className="md:col-span-2">
              <textarea required rows={4} value={form.description || ''} onChange={e => set('description', e.target.value)} className={iCls} placeholder="Describe the event..." />
            </Field>
          </div>

          {/* Resources */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium opacity-70">Resources</label>
              <button
                type="button"
                onClick={() => set('resources', [...(form.resources || []), { title: '', url: '' }])}
                className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                + Add Resource
              </button>
            </div>
            {(form.resources || []).length === 0 && (
              <p className="text-xs opacity-40 italic">No resources added.</p>
            )}
            {(form.resources || []).map((r: any, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={r.title || ''}
                  onChange={e => {
                    const updated = [...form.resources];
                    updated[i] = { ...updated[i], title: e.target.value };
                    set('resources', updated);
                  }}
                  placeholder="Title (e.g. Slides)"
                  className={iCls}
                />
                <input
                  value={r.url || ''}
                  onChange={e => {
                    const updated = [...form.resources];
                    updated[i] = { ...updated[i], url: e.target.value };
                    set('resources', updated);
                  }}
                  placeholder="URL"
                  className={iCls}
                />
                <button
                  type="button"
                  onClick={() => set('resources', form.resources.filter((_: any, j: number) => j !== i))}
                  className="px-2 text-red-500 hover:text-red-700 text-xl leading-none flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Photos */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium opacity-70">Photo URLs</label>
              <button
                type="button"
                onClick={() => set('photos', [...(form.photos || []), { url: '' }])}
                className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                + Add Photo
              </button>
            </div>
            {(form.photos || []).length === 0 && (
              <p className="text-xs opacity-40 italic">No photos added.</p>
            )}
            {(form.photos || []).map((p: any, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={typeof p === 'string' ? p : (p.url || '')}
                  onChange={e => {
                    const updated = [...form.photos];
                    updated[i] = { url: e.target.value };
                    set('photos', updated);
                  }}
                  placeholder="https://..."
                  className={iCls}
                />
                <button
                  type="button"
                  onClick={() => set('photos', form.photos.filter((_: any, j: number) => j !== i))}
                  className="px-2 text-red-500 hover:text-red-700 text-xl leading-none flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6 mt-5 flex-wrap">
            {[
              { key: 'featured', label: 'Featured' },
              { key: 'past',     label: 'Past event' },
              { key: 'published',label: 'Published' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)} className="w-4 h-4" />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-sm disabled:opacity-50 hover:opacity-80 transition-opacity">
              {submitting ? 'Saving…' : editId ? 'Update Event' : 'Create Event'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 opacity-60">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="text-center py-10 opacity-60 bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-gray-700">
          No events yet. Create your first one!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map(ev => (
            <div key={ev.id} className="bg-white dark:bg-[#25293c] border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 flex-wrap">
              <img
                src={getImageUrl(ev.poster)}
                onError={e => (e.currentTarget.src = '/placeholders/default.jpg')}
                alt={ev.name}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{ev.name}</div>
                <div className="text-xs opacity-60 mt-0.5">
                  {ev.date} · {ev.type}
                  {ev.past      && ' · Past'}
                  {ev.featured  && ' · ⭐ Featured'}
                  {!ev.published && ' · Draft'}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(ev)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Edit
                </button>
                {canDel && (
                  <button onClick={() => handleDelete(ev.id)} className="px-3 py-1.5 text-sm rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const iCls = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a2e] text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium opacity-70 mb-1">{label}</label>
      {children}
    </div>
  );
}
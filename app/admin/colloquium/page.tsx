'use client';
import React, { useEffect, useState } from 'react';
import { getColloquium, createColloquium, updateColloquium, deleteColloquium } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Colloquium } from '../../../types';

const EMPTY: any = {
  name: '', speaker: '', abstract: '', date: '', time: '',
  location: '', department: '', speakerBio: '', video: '',
  tagsRaw: '', materials: [], published: true,
};

const parseArr = (v: any) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch {} }
  return [];
};

export default function AdminColloquium() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Colloquium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const canCreate = user?.role === 'admin' || user?.permissions?.canCreateColloquium;
  const canDel    = user?.role === 'admin' || user?.permissions?.canDeleteColloquium;

  const load = async () => {
    try {
      setLoading(true);
      const data = await getColloquium();
      const normalized = (data.data || []).map((c: Colloquium) => ({
        ...c,
        tags:      parseArr(c.tags),
        materials: parseArr(c.materials),
      }));
      setEntries(normalized);
    } catch { setError('Failed to load colloquium'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ ...EMPTY });
    setEditId(null);
    setThumbFile(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (c: Colloquium) => {
    setForm({
      name:       c.name,
      speaker:    c.speaker    || '',
      abstract:   c.abstract,
      date:       c.date,
      time:       c.time       || '',
      location:   c.location   || '',
      department: c.department || '',
      speakerBio: c.speakerBio || '',
      video:      c.video      || '',
      tagsRaw:    parseArr(c.tags).join(', '),
      materials:  parseArr(c.materials),
      published:  c.published  ?? true,
    });
    setEditId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      (['name','speaker','abstract','date','time','location','department','speakerBio','video'] as const)
        .forEach(k => fd.append(k, String(form[k] || '')));
      fd.append('published',  String(form.published));
      fd.append('tags', JSON.stringify(
        (form.tagsRaw || '').split(',').map((s: string) => s.trim()).filter(Boolean)
      ));
      fd.append('materials', JSON.stringify(form.materials || []));
      if (thumbFile) fd.append('thumbnail', thumbFile);

      if (editId) {
        await updateColloquium(editId, fd);
        setSuccessMsg('Colloquium updated!');
      } else {
        await createColloquium(fd);
        setSuccessMsg('Colloquium created!');
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
    if (!confirm('Delete this colloquium entry?')) return;
    try { await deleteColloquium(id); load(); }
    catch { setError('Delete failed'); }
  };

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold">Colloquium</h2>
        {canCreate && (
          <button
            onClick={() => { resetForm(); setShowForm(s => !s); }}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            {showForm && !editId ? '✕ Cancel' : '+ New Entry'}
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
          <h3 className="font-semibold mb-4">{editId ? 'Edit Colloquium' : 'New Colloquium'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title *">
              <input required value={form.name} onChange={e => set('name', e.target.value)} className={iCls} placeholder="Talk title" />
            </Field>
            <Field label="Speaker *">
              <input required value={form.speaker} onChange={e => set('speaker', e.target.value)} className={iCls} placeholder="Dr. Name, Affiliation" />
            </Field>
            <Field label="Date *">
              <input required type="date" value={form.date} onChange={e => set('date', e.target.value)} className={iCls} />
            </Field>
            <Field label="Time">
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={iCls} />
            </Field>
            <Field label="Location *">
              <input required value={form.location} onChange={e => set('location', e.target.value)} className={iCls} placeholder="Room / venue" />
            </Field>
            <Field label="Department / Affiliation">
              <input value={form.department} onChange={e => set('department', e.target.value)} className={iCls} placeholder="e.g. Dept. of Physics, IIT" />
            </Field>
            <Field label="Video URL (YouTube embed)">
              <input type="url" value={form.video} onChange={e => set('video', e.target.value)} className={iCls} placeholder="https://www.youtube.com/embed/..." />
            </Field>
            <Field label="Tags (comma-separated)">
              <input value={form.tagsRaw} onChange={e => set('tagsRaw', e.target.value)} className={iCls} placeholder="physics, astrophysics" />
            </Field>
            <Field label="Thumbnail Image">
              <input type="file" accept="image/*" onChange={e => setThumbFile(e.target.files?.[0] || null)} className={iCls} />
            </Field>
            <Field label="Abstract *" className="md:col-span-2">
              <textarea required rows={4} value={form.abstract} onChange={e => set('abstract', e.target.value)} className={iCls} placeholder="Describe the talk..." />
            </Field>
            <Field label="Speaker Bio" className="md:col-span-2">
              <textarea rows={3} value={form.speakerBio} onChange={e => set('speakerBio', e.target.value)} className={iCls} placeholder="Brief bio of the speaker..." />
            </Field>
          </div>

          {/* Materials */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium opacity-70">Materials</label>
              <button
                type="button"
                onClick={() => set('materials', [...(form.materials || []), { title: '', url: '' }])}
                className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                + Add Material
              </button>
            </div>
            {(form.materials || []).length === 0 && (
              <p className="text-xs opacity-40 italic">No materials added.</p>
            )}
            {(form.materials || []).map((m: any, i: number) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={m.title || ''}
                  onChange={e => {
                    const updated = [...form.materials];
                    updated[i] = { ...updated[i], title: e.target.value };
                    set('materials', updated);
                  }}
                  placeholder="Title (e.g. Slides, Paper)"
                  className={iCls}
                />
                <input
                  value={m.url || ''}
                  onChange={e => {
                    const updated = [...form.materials];
                    updated[i] = { ...updated[i], url: e.target.value };
                    set('materials', updated);
                  }}
                  placeholder="URL"
                  className={iCls}
                />
                <button
                  type="button"
                  onClick={() => set('materials', form.materials.filter((_: any, j: number) => j !== i))}
                  className="px-2 text-red-500 hover:text-red-700 text-xl leading-none flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Published */}
          <div className="flex gap-6 mt-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} className="w-4 h-4" />
              Published
            </label>
          </div>

          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-sm disabled:opacity-50 hover:opacity-80 transition-opacity">
              {submitting ? 'Saving…' : editId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 opacity-60">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-10 opacity-60 bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-gray-700">
          No colloquium entries yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map(c => (
            <div key={c.id} className="bg-white dark:bg-[#25293c] border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-xs opacity-60 mt-0.5">
                  {c.date}{c.speaker ? ` · ${c.speaker}` : ''}
                  {!c.published && ' · Draft'}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(c)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Edit
                </button>
                {canDel && (
                  <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 text-sm rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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
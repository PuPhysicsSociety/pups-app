'use client';
import React, { useEffect, useState } from 'react';
import {
  getEvents, createEvent, updateEvent, deleteEvent,
  uploadToCloudinary, uploadFileToCloudinary,
} from '../../lib/api';

// ── helpers ───────────────────────────────────────────────────────────────────

function Msg({ ok, err }: { ok?: string; err?: string }) {
  if (ok)  return <div className="adm-msg-ok">✓ {ok}</div>;
  if (err) return <div className="adm-msg-err">{err}</div>;
  return null;
}

function AField({ label, children, col2 = false }: {
  label: string; children: React.ReactNode; col2?: boolean;
}) {
  return (
    <div className={`adm-field${col2 ? ' adm-col2' : ''}`}>
      <label className="adm-label">{label}</label>
      {children}
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  lecture_series: 'Lecture Series',
  workshop:       'Workshop',
  conference:     'Conference',
};

// ── empty form state ──────────────────────────────────────────────────────────

const EV_EMPTY: any = {
  type:           'lecture_series',
  title:          '',
  mode:           'offline',
  description:    '',
  dateStartDate:  '',
  dateStartTime:  '',
  dateEndDate:    '',
  dateEndTime:    '',
  schedule:       '',
  noOfClasses:    '',
  reg_form_link:  '',
  venue:          '',
  audience:       '',
  duration:       '',
  tagsRaw:        '',
  drive_link:     '',
  lecturers:      [],
  contacts:       [],
  existingThumb:  '',
  // pastImagesPreview and suppliments managed separately
};

// ── Main panel ────────────────────────────────────────────────────────────────

export default function EventsPanel() {
  const [list,    setList]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState<any>({ ...EV_EMPTY });
  const [editId,  setEditId]  = useState<string | null>(null);
  const [open,    setOpen]    = useState(false);

  // file states
  const [thumb,       setThumb]       = useState<File | null>(null);
  const [newImages,   setNewImages]   = useState<File[]>([]);
  const [existImages, setExistImages] = useState<string[]>([]);
  const [newFiles,    setNewFiles]    = useState<File[]>([]);
  const [existFiles,  setExistFiles]  = useState<any[]>([]);
  const [driveInputs, setDriveInputs] = useState<{ url: string; name: string }[]>([]);

  const [busy, setBusy] = useState(false);
  const [ok,   setOk]   = useState('');
  const [err,  setErr]  = useState('');

  const load = () => {
    setLoading(true);
    getEvents()
      .then(d => setList(d.data || []))
      .catch(() => setErr('Load failed'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const s = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const reset = () => {
    setForm({ ...EV_EMPTY });
    setEditId(null);
    setOpen(false);
    setThumb(null);
    setNewImages([]);
    setExistImages([]);
    setNewFiles([]);
    setExistFiles([]);
    setDriveInputs([]);
    setErr('');
  };

  const startEdit = (ev: any) => {
    setForm({
      type:          ev.type || 'lecture_series',
      title:         ev.title,
      mode:          ev.mode || 'offline',
      description:   ev.description || '',
      dateStartDate: ev.dateTime?.start ? new Date(ev.dateTime.start).toISOString().slice(0, 10) : '',
      dateStartTime: ev.dateTime?.start ? new Date(ev.dateTime.start).toISOString().slice(11, 16) : '',
      dateEndDate:   ev.dateTime?.end   ? new Date(ev.dateTime.end).toISOString().slice(0, 10)   : '',
      dateEndTime:   ev.dateTime?.end   ? new Date(ev.dateTime.end).toISOString().slice(11, 16)  : '',
      schedule:      ev.dateTime?.schedule || '',
      noOfClasses:   ev.noOfClasses || '',
      reg_form_link: ev.regFormLink || '',
      venue:         ev.venue || '',
      audience:      ev.audience || '',
      duration:      ev.duration || '',
      tagsRaw:       (ev.tags || []).join(', '),
      drive_link:    ev.driveLink || '',
      lecturers:     ev.lecturerDetails || [],
      contacts:      ev.toContact || [],
      existingThumb: ev.thumbnail || '',
    });
    setExistImages(ev.pastImagesPreview || []);
    setExistFiles(ev.supplements || []);
    setDriveInputs([]);
    setNewImages([]);
    setNewFiles([]);
    setThumb(null);
    setEditId(ev.id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      // 1. Thumbnail
      let thumbUrl = form.existingThumb || undefined;
      if (thumb) thumbUrl = await uploadToCloudinary(thumb, 'physics-society/events/thumbnails');

      // 2. New gallery images → upload + merge with existing
      const uploadedImages: string[] = [];
      for (const img of newImages) {
        const url = await uploadToCloudinary(img, 'physics-society/events/gallery');
        uploadedImages.push(url);
      }
      const allImages = [...existImages, ...uploadedImages];

      // 3. New files/PDFs → upload + merge with existing
      const uploadedFiles: any[] = [];
      for (const file of newFiles) {
        const result = await uploadFileToCloudinary(file, 'physics-society/events/files');
        uploadedFiles.push({ ...result, source: 'cloudinary' });
      }
      // Drive inputs
      const driveSupplements = driveInputs
        .filter(d => d.url.trim())
        .map(d => ({ url: d.url.trim(), name: d.name.trim() || d.url.trim(), source: 'drive' }));

      const allSupplements = [...existFiles, ...uploadedFiles, ...driveSupplements];

      const body: any = {
        type:         form.type,
        title:        form.title,
        mode:         form.mode,
        description:  form.description || undefined,
        date_time: {
          start:    form.dateStartDate ? `${form.dateStartDate}T${form.dateStartTime || '00:00'}:00.000Z` : undefined,
          end:      form.dateEndDate   ? `${form.dateEndDate}T${form.dateEndTime || '00:00'}:00.000Z`     : undefined,
          schedule: form.schedule || undefined,
        },
        reg_form_link:       form.reg_form_link || undefined,
        venue:               form.venue || undefined,
        audience:            form.audience || undefined,
        duration:            form.duration || undefined,
        drive_link:          form.drive_link || undefined,
        tags:                form.tagsRaw ? form.tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        lecturer_details:    form.lecturers || [],
        to_contact:          form.contacts  || [],
        past_images_preview: allImages,
        suppliments:         allSupplements,
      };
      if (thumbUrl) body.thumbnail = thumbUrl;
      if (form.noOfClasses) body.no_of_classes = Number(form.noOfClasses);

      if (editId) { await updateEvent(editId, body); setOk('Updated'); }
      else        { await createEvent(body);          setOk('Created'); }

      setTimeout(() => setOk(''), 3000);
      reset();
      load();
    } catch (ex: any) {
      setErr(ex.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete event?')) return;
    try { await deleteEvent(id); load(); } catch { setErr('Delete failed'); }
  };

  const addLecturer = () => s('lecturers', [...(form.lecturers || []), { name: '', affiliation: '' }]);
  const addContact  = () => s('contacts',  [...(form.contacts  || []), { name: '', email: '', phone: '', role: '' }]);

  return (
    <div>
      <div className="adm-sec-head">
        <div className="adm-h">Events</div>
        <button
          className={`adm-btn ${open && !editId ? 'ghost' : ''}`}
          onClick={() => { reset(); setOpen(o => !o); }}
        >
          {open && !editId ? '✕ Cancel' : '+ New Event'}
        </button>
      </div>
      <Msg ok={ok} err={err} />

      {open && (
        <form className="adm-form" onSubmit={submit}>
          <div className="adm-form-title">{editId ? 'Edit Event' : 'New Event'}</div>
          <div className="adm-grid">

            {/* Type selector */}
            <AField label="Event Type *">
              <select className="adm-select" value={form.type} onChange={e => s('type', e.target.value)}>
                <option value="lecture_series">Lecture Series</option>
                <option value="workshop">Workshop</option>
                <option value="conference">Conference</option>
              </select>
            </AField>

            <AField label="Mode *">
              <select className="adm-select" value={form.mode} onChange={e => s('mode', e.target.value)}>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </AField>

            <AField label="Title *" col2>
              <input required className="adm-input" value={form.title} onChange={e => s('title', e.target.value)} />
            </AField>

            <AField label="Start Date">
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="date" className="adm-input" value={form.dateStartDate} onChange={e => s('dateStartDate', e.target.value)} />
                <input type="time" className="adm-input" value={form.dateStartTime} onChange={e => s('dateStartTime', e.target.value)} />
              </div>
            </AField>

            <AField label="End Date">
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="date" className="adm-input" value={form.dateEndDate} onChange={e => s('dateEndDate', e.target.value)} />
                <input type="time" className="adm-input" value={form.dateEndTime} onChange={e => s('dateEndTime', e.target.value)} />
              </div>
            </AField>

            <AField label="Schedule (text)">
              <input className="adm-input" value={form.schedule} onChange={e => s('schedule', e.target.value)} placeholder="Every Saturday 10am" />
            </AField>

            <AField label="Venue">
              <input className="adm-input" value={form.venue} onChange={e => s('venue', e.target.value)} placeholder="Baker Building, Room 301" />
            </AField>

            {/* Lecture-series specific */}
            {form.type === 'lecture_series' && (
              <AField label="No. of Classes">
                <input type="number" min="1" className="adm-input" value={form.noOfClasses} onChange={e => s('noOfClasses', e.target.value)} />
              </AField>
            )}

            {/* Conference specific */}
            {form.type === 'conference' && (
              <>
                <AField label="Duration">
                  <input className="adm-input" value={form.duration} onChange={e => s('duration', e.target.value)} placeholder="2 days" />
                </AField>
                <AField label="Audience">
                  <input className="adm-input" value={form.audience} onChange={e => s('audience', e.target.value)} placeholder="Open to all" />
                </AField>
              </>
            )}

            <AField label="Registration Form Link">
              <input type="url" className="adm-input" value={form.reg_form_link} onChange={e => s('reg_form_link', e.target.value)} placeholder="https://forms.gle/…" />
            </AField>

            <AField label="Tags (comma-separated)">
              <input className="adm-input" value={form.tagsRaw} onChange={e => s('tagsRaw', e.target.value)} placeholder="Physics, Quantum, Workshop" />
            </AField>

            <AField label="Thumbnail / Poster">
              <input type="file" accept="image/*" className="adm-file-input" onChange={e => setThumb(e.target.files?.[0] || null)} />
              {form.existingThumb && <div className="adm-existing-img"><img src={form.existingThumb} alt="" /></div>}
            </AField>

            <AField label="Description" col2>
              <textarea rows={3} className="adm-textarea" value={form.description} onChange={e => s('description', e.target.value)} />
            </AField>
          </div>

          {/* Lecturers / Speakers */}
          <div className="adm-sub">
            <div className="adm-sub-lbl">
              {form.type === 'conference' ? 'Speakers' : form.type === 'workshop' ? 'Facilitators' : 'Lecturers'}
              <button type="button" className="adm-add-btn" onClick={addLecturer}>+ Add</button>
            </div>
            {(form.lecturers || []).map((l: any, i: number) => (
              <div key={i} className="adm-inline">
                <input className="adm-input" value={l.name || ''} placeholder="Name"
                  onChange={e => { const a = [...form.lecturers]; a[i] = { ...a[i], name: e.target.value }; s('lecturers', a); }} />
                <input className="adm-input" value={l.affiliation || ''} placeholder="Affiliation"
                  onChange={e => { const a = [...form.lecturers]; a[i] = { ...a[i], affiliation: e.target.value }; s('lecturers', a); }} />
                <button type="button" className="adm-rm"
                  onClick={() => s('lecturers', form.lecturers.filter((_: any, j: number) => j !== i))}>×</button>
              </div>
            ))}
          </div>

          {/* Contact Persons */}
          <div className="adm-sub">
            <div className="adm-sub-lbl">
              Contact Persons
              <button type="button" className="adm-add-btn" onClick={addContact}>+ Add</button>
            </div>
            {(form.contacts || []).map((c: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 7 }}>
                {(['name', 'email', 'phone', 'role'] as const).map(k => (
                  <input key={k} className="adm-input" value={c[k] || ''} placeholder={k}
                    onChange={e => { const a = [...form.contacts]; a[i] = { ...a[i], [k]: e.target.value }; s('contacts', a); }} />
                ))}
                <button type="button" className="adm-rm"
                  onClick={() => s('contacts', form.contacts.filter((_: any, j: number) => j !== i))}>×</button>
              </div>
            ))}
          </div>

          {/* Photo Gallery */}
          <div className="adm-sub">
            <div className="adm-sub-lbl">Photo Gallery (carousel on event page)</div>
            {existImages.length > 0 && (
              <div className="adm-img-strip">
                {existImages.map((url: string, i: number) => (
                  <div key={i} className="adm-img-thumb">
                    <img src={url} alt="" />
                    <button type="button" className="adm-img-rm"
                      onClick={() => setExistImages(imgs => imgs.filter((_, j) => j !== i))}>×</button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file" accept="image/*" multiple className="adm-file-input"
              onChange={e => setNewImages(Array.from(e.target.files || []))}
            />
            {newImages.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--tx4)', marginTop: 4 }}>
                {newImages.length} new image{newImages.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* File / PDF Uploads */}
          <div className="adm-sub">
            <div className="adm-sub-lbl">Files & Documents (PDFs, slides, etc.)</div>
            {existFiles.length > 0 && (
              <div className="adm-file-list">
                {existFiles.map((f: any, i: number) => (
                  <div key={i} className="adm-file-row">
                    <span className="adm-file-tag">{f.type || f.source || 'file'}</span>
                    <span className="adm-file-name">{f.name || f.url}</span>
                    <button type="button" className="adm-rm"
                      onClick={() => setExistFiles(files => files.filter((_, j) => j !== i))}>×</button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file" multiple className="adm-file-input"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
              onChange={e => setNewFiles(Array.from(e.target.files || []))}
            />
            {newFiles.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--tx4)', marginTop: 4 }}>
                {newFiles.length} file{newFiles.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Google Drive / External Links */}
          <div className="adm-sub">
            <div className="adm-sub-lbl">
              Google Drive / External Links
              <button type="button" className="adm-add-btn"
                onClick={() => setDriveInputs(d => [...d, { url: '', name: '' }])}>+ Add</button>
            </div>
            {driveInputs.map((d, i) => (
              <div key={i} className="adm-inline">
                <input className="adm-input" value={d.url} placeholder="https://drive.google.com/…"
                  onChange={e => { const a = [...driveInputs]; a[i] = { ...a[i], url: e.target.value }; setDriveInputs(a); }} />
                <input className="adm-input" value={d.name} placeholder="Label (optional)"
                  onChange={e => { const a = [...driveInputs]; a[i] = { ...a[i], name: e.target.value }; setDriveInputs(a); }} />
                <button type="button" className="adm-rm"
                  onClick={() => setDriveInputs(di => di.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
            {/* Single drive folder link */}
            <AField label="Drive Folder Link (optional)">
              <input type="url" className="adm-input" value={form.drive_link}
                onChange={e => s('drive_link', e.target.value)} placeholder="https://drive.google.com/drive/folders/…" />
            </AField>
          </div>

          <div className="adm-form-btns">
            <button type="submit" disabled={busy} className="adm-btn">
              {busy ? 'Saving…' : editId ? 'Update' : 'Create'}
            </button>
            <button type="button" className="adm-btn ghost" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="adm-empty">Loading…</div>
      ) : list.length === 0 ? (
        <div className="adm-empty">No events yet</div>
      ) : (
        <div className="adm-list">
          {list.map(ev => (
            <div key={ev.id} className="adm-row">
              {ev.thumbnail && (
                <img src={ev.thumbnail} alt="" className="adm-thumb"
                  onError={e => (e.currentTarget.style.display = 'none')} />
              )}
              <div className="adm-row-info">
                <div className="adm-row-title">{ev.title}</div>
                <div className="adm-row-meta">
                  {TYPE_LABELS[ev.type] || ev.type} · {ev.mode}
                  {ev.dateTime?.schedule ? ` · ${ev.dateTime.schedule}` : ''}
                </div>
              </div>
              <div className="adm-row-actions">
                <button className="adm-action" onClick={() => startEdit(ev)}>Edit</button>
                <button className="adm-action del" onClick={() => del(ev.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

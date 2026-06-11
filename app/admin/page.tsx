'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  getColloquium, createColloquium, updateColloquium, deleteColloquium,
  getTeam, createTeamMember, updateTeamMember, deleteTeamMember, getImageUrl,
  uploadToCloudinary,
} from '../../lib/api';
import EventsPanel from './EventsPanel';

// ── tiny helpers ──────────────────────────────────────────────────────────────

const toDateTimeLocal = (iso?: string): string => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  } catch { return ''; }
};

function Msg({ ok, err }: { ok?: string; err?: string }) {
  if (ok)  return <div className="adm-msg-ok">✓ {ok}</div>;
  if (err) return <div className="adm-msg-err">{err}</div>;
  return null;
}

function AField({ label, children, col2 = false }: { label: string; children: React.ReactNode; col2?: boolean }) {
  return (
    <div className={`adm-field${col2 ? ' adm-col2' : ''}`}>
      <label className="adm-label">{label}</label>
      {children}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

function OverviewPanel({ onTab }: { onTab: (t: string) => void }) {
  const { user } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState('');

  const runMigration = async () => {
    if (!confirm('This will migrate existing LectureSeries and Workshop data into the unified Events collection. Safe to run multiple times (skips duplicates). Continue?')) return;
    setMigrating(true);
    setMigrateMsg('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const res = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMigrateMsg(`✓ Migrated: ${data.migrated}, Skipped (already exist): ${data.skipped}${data.errors?.length ? `, Errors: ${data.errors.join('; ')}` : ''}`);
      } else {
        setMigrateMsg(`Error: ${data.message}`);
      }
    } catch (e: any) {
      setMigrateMsg(`Error: ${e.message}`);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div>
      <div className="adm-sec-head">
        <div className="adm-h">Welcome, {user?.name}</div>
      </div>
      <div style={{ border: '1px solid var(--rule)', background: 'var(--s1)', padding: '22px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 9.5, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--tx4)', marginBottom: 14 }}>Quick Add</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(['events', 'colloquia', 'team'] as const).map(t => (
            <button key={t} className="adm-btn ghost" onClick={() => onTab(t)}>+ {t}</button>
          ))}
        </div>
      </div>

      {/* Migration tool */}
      <div style={{ border: '1px solid var(--rule)', padding: '22px 24px' }}>
        <div style={{ fontSize: 9.5, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--tx4)', marginBottom: 8 }}>
          Data Migration
        </div>
        <p style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 14, lineHeight: 1.7 }}>
          Migrate existing Lecture Series and Workshop records into the unified Events collection.
          Safe to run multiple times — duplicates are skipped.
        </p>
        <button className="adm-btn" onClick={runMigration} disabled={migrating}>
          {migrating ? 'Migrating…' : 'Run Migration'}
        </button>
        {migrateMsg && (
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--tx3)', lineHeight: 1.7 }}>{migrateMsg}</div>
        )}
      </div>
    </div>
  );
}

// ── Colloquia ─────────────────────────────────────────────────────────────────

const CQ_EMPTY: any = {
  title: '', speakerName: '', speakerAff: '', abstract: '', time: '',
  venue: '', ytLink: '', reg_form_link: '', tagsRaw: '', published: true, existingPoster: '',
};

function ColloquiaPanel() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({ ...CQ_EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getColloquium().then(d => setList(d.data || [])).catch(() => setErr('Load failed')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const s = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const reset = () => { setForm({ ...CQ_EMPTY }); setEditId(null); setPoster(null); setOpen(false); setErr(''); };

  const startEdit = (c: any) => {
    setForm({
      title: c.name, speakerName: c.speaker || '', speakerAff: c.department || '',
      abstract: c.abstract || '', time: toDateTimeLocal(c.time),
      venue: c.location || '', ytLink: c.video || '', reg_form_link: c.regFormLink || '',
      tagsRaw: (c.tags || []).join(', '), published: c.published ?? true, existingPoster: c.poster || '',
    });
    setEditId(c.id); setOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      let posterUrl = form.existingPoster || undefined;
      if (poster) posterUrl = await uploadToCloudinary(poster, 'physics-society/colloquia/posters');
      const body: any = {
        title: form.title,
        speaker: { name: form.speakerName, affiliation: form.speakerAff },
        abstract: form.abstract, time: form.time || undefined,
        venue: form.venue || undefined, ytLink: form.ytLink || undefined,
        reg_form_link: form.reg_form_link || undefined, published: form.published,
      };
      if (posterUrl) body.poster = posterUrl;
      if (editId) { await updateColloquium(editId, body); setOk('Updated'); }
      else        { await createColloquium(body);          setOk('Created'); }
      setTimeout(() => setOk(''), 3000); reset(); load();
    } catch (ex: any) { setErr(ex.message || 'Save failed'); }
    finally { setBusy(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete colloquium?')) return;
    try { await deleteColloquium(id); load(); } catch { setErr('Delete failed'); }
  };

  return (
    <div>
      <div className="adm-sec-head">
        <div className="adm-h">Colloquia</div>
        <button className={`adm-btn ${open && !editId ? 'ghost' : ''}`} onClick={() => { reset(); setOpen(o => !o); }}>
          {open && !editId ? '✕ Cancel' : '+ New Colloquium'}
        </button>
      </div>
      <Msg ok={ok} err={err} />

      {open && (
        <form className="adm-form" onSubmit={submit}>
          <div className="adm-form-title">{editId ? 'Edit Colloquium' : 'New Colloquium'}</div>
          <div className="adm-grid">
            <AField label="Title *" col2><input required className="adm-input" value={form.title} onChange={e => s('title', e.target.value)} /></AField>
            <AField label="Speaker Name"><input className="adm-input" value={form.speakerName} onChange={e => s('speakerName', e.target.value)} placeholder="Dr. Name" /></AField>
            <AField label="Speaker Affiliation"><input className="adm-input" value={form.speakerAff} onChange={e => s('speakerAff', e.target.value)} placeholder="TIFR, IISc…" /></AField>
            <AField label="Date & Time"><input type="datetime-local" className="adm-input" value={form.time} onChange={e => s('time', e.target.value)} /></AField>
            <AField label="Venue"><input className="adm-input" value={form.venue} onChange={e => s('venue', e.target.value)} /></AField>
            <AField label="YouTube Link"><input type="url" className="adm-input" value={form.ytLink} onChange={e => s('ytLink', e.target.value)} placeholder="https://youtube.com/…" /></AField>
            <AField label="Registration Form Link"><input type="url" className="adm-input" value={form.reg_form_link} onChange={e => s('reg_form_link', e.target.value)} /></AField>
            <AField label="Tags (comma-separated)"><input className="adm-input" value={form.tagsRaw} onChange={e => s('tagsRaw', e.target.value)} /></AField>
            <AField label="Poster Image"><input type="file" accept="image/*" className="adm-file-input" onChange={e => setPoster(e.target.files?.[0] || null)} /></AField>
            <AField label="Abstract *" col2><textarea required rows={4} className="adm-textarea" value={form.abstract} onChange={e => s('abstract', e.target.value)} /></AField>
          </div>
          <div className="adm-check-row">
            <label className="adm-check"><input type="checkbox" checked={!!form.published} onChange={e => s('published', e.target.checked)} />Published</label>
          </div>
          <div className="adm-form-btns">
            <button type="submit" disabled={busy} className="adm-btn">{busy ? 'Saving…' : editId ? 'Update' : 'Create'}</button>
            <button type="button" className="adm-btn ghost" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="adm-empty">Loading…</div> : list.length === 0 ? <div className="adm-empty">No colloquia yet</div> : (
        <div className="adm-list">
          {list.map(c => (
            <div key={c.id} className="adm-row">
              <div className="adm-row-info">
                <div className="adm-row-title">{c.name}</div>
                <div className="adm-row-meta">{c.date}{c.speaker ? ` · ${c.speaker}` : ''}{!c.published ? ' · Draft' : ''}</div>
              </div>
              <div className="adm-row-actions">
                <button className="adm-action" onClick={() => startEdit(c)}>Edit</button>
                <button className="adm-action del" onClick={() => del(c.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Team ──────────────────────────────────────────────────────────────────────

const TM_EMPTY = { name: '', role: '', email: '', bio: '', linkedin_url: '', department: '', active: true };

function TeamPanel() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({ ...TM_EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getTeam().then(d => setList(d.data || [])).catch(() => setErr('Load failed')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const s = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const reset = () => { setForm({ ...TM_EMPTY }); setEditId(null); setPhoto(null); setOpen(false); setErr(''); };

  const startEdit = (m: any) => {
    setForm({ name: m.name, role: m.role, email: m.email || '', bio: m.bio || '', linkedin_url: m.linkedin_url || '', department: m.department || '', active: m.active ?? true });
    setEditId(m.id); setOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const fd = new FormData();
      (['name', 'role', 'email', 'bio', 'linkedin_url', 'department'] as const).forEach(k => fd.append(k, String((form as any)[k] || '')));
      fd.append('active', String(form.active));
      if (photo) fd.append('photo', photo);
      if (editId) { await updateTeamMember(editId, fd); setOk('Updated'); }
      else        { await createTeamMember(fd);           setOk('Added'); }
      setTimeout(() => setOk(''), 3000); reset(); load();
    } catch (ex: any) { setErr(ex.message || 'Save failed'); }
    finally { setBusy(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Remove member?')) return;
    try { await deleteTeamMember(id); load(); } catch { setErr('Delete failed'); }
  };

  return (
    <div>
      <div className="adm-sec-head">
        <div className="adm-h">Team</div>
        <button className={`adm-btn ${open && !editId ? 'ghost' : ''}`} onClick={() => { reset(); setOpen(o => !o); }}>
          {open && !editId ? '✕ Cancel' : '+ Add Member'}
        </button>
      </div>
      <Msg ok={ok} err={err} />

      {open && (
        <form className="adm-form" onSubmit={submit}>
          <div className="adm-form-title">{editId ? 'Edit Member' : 'New Member'}</div>
          <div className="adm-grid">
            <AField label="Full Name *"><input required className="adm-input" value={form.name} onChange={e => s('name', e.target.value)} /></AField>
            <AField label="Role *"><input required className="adm-input" value={form.role} onChange={e => s('role', e.target.value)} placeholder="President, Secretary…" /></AField>
            <AField label="Email"><input type="email" className="adm-input" value={form.email} onChange={e => s('email', e.target.value)} /></AField>
            <AField label="LinkedIn URL"><input type="url" className="adm-input" value={form.linkedin_url} onChange={e => s('linkedin_url', e.target.value)} /></AField>
            <AField label="Department"><input className="adm-input" value={form.department} onChange={e => s('department', e.target.value)} /></AField>
            <AField label="Photo"><input type="file" accept="image/*" className="adm-file-input" onChange={e => setPhoto(e.target.files?.[0] || null)} /></AField>
            <AField label="Bio" col2><textarea rows={3} className="adm-textarea" value={form.bio} onChange={e => s('bio', e.target.value)} /></AField>
          </div>
          <div className="adm-check-row">
            <label className="adm-check"><input type="checkbox" checked={form.active} onChange={e => s('active', e.target.checked)} />Active member</label>
          </div>
          <div className="adm-form-btns">
            <button type="submit" disabled={busy} className="adm-btn">{busy ? 'Saving…' : editId ? 'Update' : 'Add'}</button>
            <button type="button" className="adm-btn ghost" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="adm-empty">Loading…</div> : list.length === 0 ? <div className="adm-empty">No team members yet</div> : (
        <div className="adm-list">
          {list.map(m => (
            <div key={m.id} className="adm-row">
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--s2)', border: '1px solid var(--rule)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {m.photo ? <img src={getImageUrl(m.photo)} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 11, color: 'var(--tx4)' }}>{m.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</span>}
              </div>
              <div className="adm-row-info">
                <div className="adm-row-title">{m.name}</div>
                <div className="adm-row-meta">{m.role}{m.department ? ` · ${m.department}` : ''}{!m.active ? ' · Inactive' : ''}</div>
              </div>
              <div className="adm-row-actions">
                <button className="adm-action" onClick={() => startEdit(m)}>Edit</button>
                <button className="adm-action del" onClick={() => del(m.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Root admin page ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'events',    label: 'Events' },
  { id: 'colloquia', label: 'Colloquia' },
  { id: 'team',      label: 'Team' },
];

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('overview');

  return (
    <div className="adm-wrap">
      <div className="adm-top-bar">
        <div>
          <div className="adm-brand">Admin — PUPS</div>
          <div className="adm-user-meta">{user?.name} · {user?.role}</div>
        </div>
        <div className="adm-bar-right">
          <a href="/" className="adm-back">← Site</a>
          <button className="adm-signout" onClick={() => { logout(); router.push('/'); }}>Sign out</button>
        </div>
      </div>

      <div className="adm-shell">
        <aside className="adm-sidebar">
          {TABS.map(t => (
            <button key={t.id} className={`adm-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </aside>

        <div className="adm-content">
          {tab === 'overview'  && <OverviewPanel onTab={setTab} />}
          {tab === 'events'    && <EventsPanel />}
          {tab === 'colloquia' && <ColloquiaPanel />}
          {tab === 'team'      && <TeamPanel />}
        </div>
      </div>
    </div>
  );
}

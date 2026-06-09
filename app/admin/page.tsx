'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  getColloquium, createColloquium, updateColloquium, deleteColloquium,
  getLectureSeries, createLectureSeries, updateLectureSeries, deleteLectureSeries,
  getTeam, createTeamMember, updateTeamMember, deleteTeamMember, getImageUrl,
} from '../../lib/api';

// ── tiny helpers ──────────────────────────────────────────────────────────────

const parseArr = (v: any): any[] => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch {} }
  return [];
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

  return (
    <div>
      <div className="adm-sec-head">
        <div className="adm-h">Welcome, {user?.name}</div>
      </div>
      <div style={{ border: '1px solid var(--rule)', background: 'var(--s1)', padding: '22px 24px' }}>
        <div style={{ fontSize: 9.5, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--tx4)', marginBottom: 14 }}>Quick Add</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(['events','colloquia','team'] as const).map(t => (
            <button key={t} className="adm-btn ghost" onClick={() => onTab(t)}>+ {t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Colloquia ─────────────────────────────────────────────────────────────────

const CQ_EMPTY: any = {
  title:'', speakerName:'', speakerAff:'', abstract:'', time:'',
  venue:'', ytLink:'', reg_form_link:'', tagsRaw:'', published:true,
};

function ColloquiaPanel() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({...CQ_EMPTY});
  const [editId, setEditId] = useState<string|null>(null);
  const [poster, setPoster] = useState<File|null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getColloquium().then(d=>setList(d.data||[])).catch(()=>setErr('Load failed')).finally(()=>setLoading(false));
  };
  useEffect(load,[]);

  const s = (k:string,v:any) => setForm((f:any)=>({...f,[k]:v}));
  const reset = () => { setForm({...CQ_EMPTY}); setEditId(null); setPoster(null); setOpen(false); setErr(''); };

  const startEdit = (c:any) => {
    setForm({
      title: c.name,
      speakerName: c.speaker||'',
      speakerAff: c.department||'',
      abstract: c.abstract||'',
      time: c.time||'',
      venue: c.location||'',
      ytLink: c.video||'',
      reg_form_link: c.regFormLink||'',
      tagsRaw: parseArr(c.tags).join(', '),
      published: c.published??true,
    });
    setEditId(c.id); setOpen(true); window.scrollTo({top:0,behavior:'smooth'});
  };

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('speaker', JSON.stringify({name:form.speakerName, affiliation:form.speakerAff}));
      fd.append('abstract', form.abstract);
      fd.append('time', form.time);
      fd.append('venue', form.venue);
      fd.append('ytLink', form.ytLink);
      fd.append('reg_form_link', form.reg_form_link);
      fd.append('tags', JSON.stringify((form.tagsRaw||'').split(',').map((x:string)=>x.trim()).filter(Boolean)));
      fd.append('published', String(form.published));
      if (poster) fd.append('poster', poster);
      if (editId) { await updateColloquium(editId,fd); setOk('Updated'); }
      else        { await createColloquium(fd);         setOk('Created'); }
      setTimeout(()=>setOk(''),3000); reset(); load();
    } catch(ex:any) { setErr(ex.message||'Save failed'); }
    finally { setBusy(false); }
  };

  const del = async (id:string) => {
    if (!confirm('Delete colloquium?')) return;
    try { await deleteColloquium(id); load(); } catch { setErr('Delete failed'); }
  };

  return (
    <div>
      <div className="adm-sec-head">
        <div className="adm-h">Colloquia</div>
        <button className={`adm-btn ${open&&!editId?'ghost':''}`} onClick={()=>{reset();setOpen(o=>!o);}}>
          {open&&!editId?'✕ Cancel':'+ New Colloquium'}
        </button>
      </div>
      <Msg ok={ok} err={err} />

      {open && (
        <form className="adm-form" onSubmit={submit}>
          <div className="adm-form-title">{editId?'Edit Colloquium':'New Colloquium'}</div>
          <div className="adm-grid">
            <AField label="Title *" col2><input required className="adm-input" value={form.title} onChange={e=>s('title',e.target.value)} /></AField>
            <AField label="Speaker Name"><input className="adm-input" value={form.speakerName} onChange={e=>s('speakerName',e.target.value)} placeholder="Dr. Name" /></AField>
            <AField label="Speaker Affiliation"><input className="adm-input" value={form.speakerAff} onChange={e=>s('speakerAff',e.target.value)} placeholder="TIFR, IISc…" /></AField>
            <AField label="Date & Time"><input type="datetime-local" className="adm-input" value={form.time} onChange={e=>s('time',e.target.value)} /></AField>
            <AField label="Venue"><input className="adm-input" value={form.venue} onChange={e=>s('venue',e.target.value)} /></AField>
            <AField label="YouTube Link"><input type="url" className="adm-input" value={form.ytLink} onChange={e=>s('ytLink',e.target.value)} placeholder="https://youtube.com/…" /></AField>
            <AField label="Registration Form Link"><input type="url" className="adm-input" value={form.reg_form_link} onChange={e=>s('reg_form_link',e.target.value)} placeholder="https://forms.gle/…" /></AField>
            <AField label="Tags (comma-separated)"><input className="adm-input" value={form.tagsRaw} onChange={e=>s('tagsRaw',e.target.value)} /></AField>
            <AField label="Poster Image"><input type="file" accept="image/*" className="adm-file-input" onChange={e=>setPoster(e.target.files?.[0]||null)} /></AField>
            <AField label="Abstract *" col2><textarea required rows={4} className="adm-textarea" value={form.abstract} onChange={e=>s('abstract',e.target.value)} /></AField>
          </div>
          <div className="adm-check-row">
            <label className="adm-check"><input type="checkbox" checked={!!form.published} onChange={e=>s('published',e.target.checked)} />Published</label>
          </div>
          <div className="adm-form-btns">
            <button type="submit" disabled={busy} className="adm-btn">{busy?'Saving…':editId?'Update':'Create'}</button>
            <button type="button" className="adm-btn ghost" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="adm-empty">Loading…</div> : list.length===0 ? <div className="adm-empty">No colloquia yet</div> : (
        <div className="adm-list">
          {list.map(c=>(
            <div key={c.id} className="adm-row">
              <div className="adm-row-info">
                <div className="adm-row-title">{c.name}</div>
                <div className="adm-row-meta">{c.date}{c.speaker?` · ${c.speaker}`:''}{!c.published?' · Draft':''}</div>
              </div>
              <div className="adm-row-actions">
                <button className="adm-action" onClick={()=>startEdit(c)}>Edit</button>
                <button className="adm-action del" onClick={()=>del(c.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Lecture Series ────────────────────────────────────────────────────────────

const LS_EMPTY: any = {
  title:'', mode:'offline', description:'', dateStart:'', dateEnd:'', schedule:'',
  noOfClasses:'', reg_form_link:'',
  lecturers:[],
  contacts:[],
};

function LectureSeriesPanel() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({...LS_EMPTY});
  const [editId, setEditId] = useState<string|null>(null);
  const [thumb, setThumb] = useState<File|null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getLectureSeries().then(d=>setList(d.data||[])).catch(()=>setErr('Load failed')).finally(()=>setLoading(false));
  };
  useEffect(load,[]);

  const s = (k:string,v:any) => setForm((f:any)=>({...f,[k]:v}));
  const reset = () => { setForm({...LS_EMPTY}); setEditId(null); setThumb(null); setOpen(false); setErr(''); };

  const startEdit = (ls:any) => {
    setForm({
      title: ls.title,
      mode: ls.mode||'offline',
      description: ls.description||'',
      dateStart: ls.dateTime?.start||'',
      dateEnd:   ls.dateTime?.end||'',
      schedule:  ls.dateTime?.schedule||'',
      noOfClasses: ls.noOfClasses||'',
      reg_form_link: ls.regFormLink||'',
      lecturers: ls.lecturerDetails||[],
      contacts:  ls.toContact||[],
    });
    setEditId(ls.id); setOpen(true); window.scrollTo({top:0,behavior:'smooth'});
  };

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('mode', form.mode);
      fd.append('description', form.description);
      fd.append('reg_form_link', form.reg_form_link);
      if (form.noOfClasses) fd.append('no_of_classes', String(form.noOfClasses));
      fd.append('date_time', JSON.stringify({start:form.dateStart,end:form.dateEnd,schedule:form.schedule}));
      fd.append('lecturer_details', JSON.stringify(form.lecturers||[]));
      fd.append('to_contact', JSON.stringify(form.contacts||[]));
      if (thumb) fd.append('thumbnail', thumb);
      if (editId) { await updateLectureSeries(editId,fd); setOk('Updated'); }
      else        { await createLectureSeries(fd);         setOk('Created'); }
      setTimeout(()=>setOk(''),3000); reset(); load();
    } catch(ex:any) { setErr(ex.message||'Save failed'); }
    finally { setBusy(false); }
  };

  const del = async (id:string) => {
    if (!confirm('Delete lecture series?')) return;
    try { await deleteLectureSeries(id); load(); } catch { setErr('Delete failed'); }
  };

  const addLecturer = () => s('lecturers',[...(form.lecturers||[]),{name:'',affiliation:''}]);
  const addContact  = () => s('contacts', [...(form.contacts||[]), {name:'',email:'',phone:'',role:''}]);

  return (
    <div>
      <div className="adm-sec-head">
        <div className="adm-h">Lecture Series</div>
        <button className={`adm-btn ${open&&!editId?'ghost':''}`} onClick={()=>{reset();setOpen(o=>!o);}}>
          {open&&!editId?'✕ Cancel':'+ New Series'}
        </button>
      </div>
      <Msg ok={ok} err={err} />

      {open && (
        <form className="adm-form" onSubmit={submit}>
          <div className="adm-form-title">{editId?'Edit Series':'New Lecture Series'}</div>
          <div className="adm-grid">
            <AField label="Title *" col2><input required className="adm-input" value={form.title} onChange={e=>s('title',e.target.value)} /></AField>
            <AField label="Mode *">
              <select className="adm-select" value={form.mode} onChange={e=>s('mode',e.target.value)}>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </AField>
            <AField label="No. of Classes"><input type="number" min="1" className="adm-input" value={form.noOfClasses} onChange={e=>s('noOfClasses',e.target.value)} /></AField>
            <AField label="Start Date"><input type="datetime-local" className="adm-input" value={form.dateStart} onChange={e=>s('dateStart',e.target.value)} /></AField>
            <AField label="End Date"><input type="datetime-local" className="adm-input" value={form.dateEnd} onChange={e=>s('dateEnd',e.target.value)} /></AField>
            <AField label="Schedule (text)"><input className="adm-input" value={form.schedule} onChange={e=>s('schedule',e.target.value)} placeholder="Every Saturday 10am" /></AField>
            <AField label="Registration Form Link"><input type="url" className="adm-input" value={form.reg_form_link} onChange={e=>s('reg_form_link',e.target.value)} /></AField>
            <AField label="Thumbnail"><input type="file" accept="image/*" className="adm-file-input" onChange={e=>setThumb(e.target.files?.[0]||null)} /></AField>
            <AField label="Description" col2><textarea rows={3} className="adm-textarea" value={form.description} onChange={e=>s('description',e.target.value)} /></AField>
          </div>

          {/* Lecturers */}
          <div className="adm-sub">
            <div className="adm-sub-lbl">Lecturers<button type="button" className="adm-add-btn" onClick={addLecturer}>+ Add</button></div>
            {(form.lecturers||[]).map((l:any,i:number)=>(
              <div key={i} className="adm-inline">
                <input className="adm-input" value={l.name||''} placeholder="Name" onChange={e=>{const a=[...form.lecturers];a[i]={...a[i],name:e.target.value};s('lecturers',a);}} />
                <input className="adm-input" value={l.affiliation||''} placeholder="Affiliation" onChange={e=>{const a=[...form.lecturers];a[i]={...a[i],affiliation:e.target.value};s('lecturers',a);}} />
                <button type="button" className="adm-rm" onClick={()=>s('lecturers',form.lecturers.filter((_:any,j:number)=>j!==i))}>×</button>
              </div>
            ))}
          </div>

          {/* Contacts */}
          <div className="adm-sub">
            <div className="adm-sub-lbl">Contact Persons<button type="button" className="adm-add-btn" onClick={addContact}>+ Add</button></div>
            {(form.contacts||[]).map((c:any,i:number)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr auto',gap:8,marginBottom:7}}>
                {(['name','email','phone','role'] as const).map(k=>(
                  <input key={k} className="adm-input" value={c[k]||''} placeholder={k} onChange={e=>{const a=[...form.contacts];a[i]={...a[i],[k]:e.target.value};s('contacts',a);}} />
                ))}
                <button type="button" className="adm-rm" onClick={()=>s('contacts',form.contacts.filter((_:any,j:number)=>j!==i))}>×</button>
              </div>
            ))}
          </div>

          <div className="adm-form-btns">
            <button type="submit" disabled={busy} className="adm-btn">{busy?'Saving…':editId?'Update':'Create'}</button>
            <button type="button" className="adm-btn ghost" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="adm-empty">Loading…</div> : list.length===0 ? <div className="adm-empty">No lecture series yet</div> : (
        <div className="adm-list">
          {list.map(ls=>(
            <div key={ls.id} className="adm-row">
              {ls.thumbnail && <img src={ls.thumbnail} onError={e=>(e.currentTarget.style.display='none')} alt="" className="adm-thumb" />}
              <div className="adm-row-info">
                <div className="adm-row-title">{ls.title}</div>
                <div className="adm-row-meta">{ls.mode}{ls.noOfClasses?` · ${ls.noOfClasses} classes`:''}{ls.dateTime?.schedule?` · ${ls.dateTime.schedule}`:''}</div>
              </div>
              <div className="adm-row-actions">
                <button className="adm-action" onClick={()=>startEdit(ls)}>Edit</button>
                <button className="adm-action del" onClick={()=>del(ls.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Team ──────────────────────────────────────────────────────────────────────

const TM_EMPTY = {name:'',role:'',email:'',bio:'',linkedin_url:'',department:'',active:true};

function TeamPanel() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({...TM_EMPTY});
  const [editId, setEditId] = useState<string|null>(null);
  const [photo, setPhoto] = useState<File|null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getTeam().then(d=>setList(d.data||[])).catch(()=>setErr('Load failed')).finally(()=>setLoading(false));
  };
  useEffect(load,[]);

  const s = (k:string,v:any) => setForm((f:any)=>({...f,[k]:v}));
  const reset = () => { setForm({...TM_EMPTY}); setEditId(null); setPhoto(null); setOpen(false); setErr(''); };

  const startEdit = (m:any) => {
    setForm({name:m.name,role:m.role,email:m.email||'',bio:m.bio||'',linkedin_url:m.linkedin_url||'',department:m.department||'',active:m.active??true});
    setEditId(m.id); setOpen(true); window.scrollTo({top:0,behavior:'smooth'});
  };

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const fd = new FormData();
      (['name','role','email','bio','linkedin_url','department'] as const).forEach(k=>fd.append(k,String((form as any)[k]||'')));
      fd.append('active',String(form.active));
      if (photo) fd.append('photo',photo);
      if (editId) { await updateTeamMember(editId,fd); setOk('Updated'); }
      else        { await createTeamMember(fd);         setOk('Added'); }
      setTimeout(()=>setOk(''),3000); reset(); load();
    } catch(ex:any) { setErr(ex.message||'Save failed'); }
    finally { setBusy(false); }
  };

  const del = async (id:string) => {
    if (!confirm('Remove member?')) return;
    try { await deleteTeamMember(id); load(); } catch { setErr('Delete failed'); }
  };

  return (
    <div>
      <div className="adm-sec-head">
        <div className="adm-h">Team</div>
        <button className={`adm-btn ${open&&!editId?'ghost':''}`} onClick={()=>{reset();setOpen(o=>!o);}}>
          {open&&!editId?'✕ Cancel':'+ Add Member'}
        </button>
      </div>
      <Msg ok={ok} err={err} />

      {open && (
        <form className="adm-form" onSubmit={submit}>
          <div className="adm-form-title">{editId?'Edit Member':'New Member'}</div>
          <div className="adm-grid">
            <AField label="Full Name *"><input required className="adm-input" value={form.name} onChange={e=>s('name',e.target.value)} /></AField>
            <AField label="Role *"><input required className="adm-input" value={form.role} onChange={e=>s('role',e.target.value)} placeholder="President, Secretary…" /></AField>
            <AField label="Email"><input type="email" className="adm-input" value={form.email} onChange={e=>s('email',e.target.value)} /></AField>
            <AField label="LinkedIn URL"><input type="url" className="adm-input" value={form.linkedin_url} onChange={e=>s('linkedin_url',e.target.value)} /></AField>
            <AField label="Department"><input className="adm-input" value={form.department} onChange={e=>s('department',e.target.value)} /></AField>
            <AField label="Photo"><input type="file" accept="image/*" className="adm-file-input" onChange={e=>setPhoto(e.target.files?.[0]||null)} /></AField>
            <AField label="Bio" col2><textarea rows={3} className="adm-textarea" value={form.bio} onChange={e=>s('bio',e.target.value)} /></AField>
          </div>
          <div className="adm-check-row">
            <label className="adm-check"><input type="checkbox" checked={form.active} onChange={e=>s('active',e.target.checked)} />Active member</label>
          </div>
          <div className="adm-form-btns">
            <button type="submit" disabled={busy} className="adm-btn">{busy?'Saving…':editId?'Update':'Add'}</button>
            <button type="button" className="adm-btn ghost" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="adm-empty">Loading…</div> : list.length===0 ? <div className="adm-empty">No team members yet</div> : (
        <div className="adm-list">
          {list.map(m=>(
            <div key={m.id} className="adm-row">
              <div style={{width:44,height:44,borderRadius:'50%',background:'var(--s2)',border:'1px solid var(--rule)',overflow:'hidden',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {m.photo ? <img src={getImageUrl(m.photo)} alt={m.name} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:11,color:'var(--tx4)'}}>{m.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</span>}
              </div>
              <div className="adm-row-info">
                <div className="adm-row-title">{m.name}</div>
                <div className="adm-row-meta">{m.role}{m.department?` · ${m.department}`:''}{!m.active?' · Inactive':''}</div>
              </div>
              <div className="adm-row-actions">
                <button className="adm-action" onClick={()=>startEdit(m)}>Edit</button>
                <button className="adm-action del" onClick={()=>del(m.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────────────────────

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
          <button className="adm-signout" onClick={()=>{ logout(); router.push('/'); }}>Sign out</button>
        </div>
      </div>

      <div className="adm-shell">
        <aside className="adm-sidebar">
          {TABS.map(t=>(
            <button key={t.id} className={`adm-tab${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </aside>

        <div className="adm-content">
          {tab==='overview'  && <OverviewPanel onTab={setTab} />}
          {tab==='events'    && <LectureSeriesPanel />}
          {tab==='colloquia' && <ColloquiaPanel />}
          {tab==='team'      && <TeamPanel />}
        </div>
      </div>
    </div>
  );
}

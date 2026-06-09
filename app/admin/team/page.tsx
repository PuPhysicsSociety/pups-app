'use client';
import React, { useEffect, useState } from 'react';
import { getTeam, createTeamMember, updateTeamMember, deleteTeamMember, getImageUrl } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { TeamMember } from '../../../types';

const EMPTY = { name: '', role: '', email: '', bio: '', linkedin_url: '', department: '', active: true };

export default function AdminTeam() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const canManage = user?.role === 'admin' || user?.permissions?.canManageTeam;

  const load = async () => {
    try { setLoading(true); const data = await getTeam(); setMembers(data.data || []); }
    catch { setError('Failed to load team'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ ...EMPTY }); setEditId(null); setPhotoFile(null); setShowForm(false); setError(''); };

  const startEdit = (m: TeamMember) => {
    setForm({ name: m.name, role: m.role, email: m.email || '', bio: m.bio || '', linkedin_url: m.linkedin_url || '', department: m.department || '', active: m.active ?? true });
    setEditId(m.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      (['name','role','email','bio','linkedin_url','department'] as const)
        .forEach(k => fd.append(k, String((form as any)[k] || '')));
      fd.append('active', String(form.active));
      if (photoFile) fd.append('photo', photoFile);

      if (editId) {
        await updateTeamMember(editId, fd);
        setSuccessMsg('Member updated!');
      } else {
        await createTeamMember(fd);
        setSuccessMsg('Member added!');
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
    if (!confirm('Remove this team member?')) return;
    try { await deleteTeamMember(id); load(); }
    catch { setError('Delete failed'); }
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold">Team</h2>
        {canManage && (
          <button onClick={() => { resetForm(); setShowForm(s => !s); }}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity">
            {showForm && !editId ? '✕ Cancel' : '+ Add Member'}
          </button>
        )}
      </div>

      {successMsg && <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-sm">✓ {successMsg}</div>}
      {error && <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#25293c] border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4">{editId ? 'Edit Member' : 'New Member'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name *"><input required value={form.name} onChange={e => set('name', e.target.value)} className={iCls} placeholder="Dr. Jane Doe" /></Field>
            <Field label="Role *"><input required value={form.role} onChange={e => set('role', e.target.value)} className={iCls} placeholder="President, Secretary, etc." /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={iCls} /></Field>
            <Field label="LinkedIn URL"><input type="url" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} className={iCls} placeholder="https://linkedin.com/in/..." /></Field>
            <Field label="Department"><input value={form.department} onChange={e => set('department', e.target.value)} className={iCls} placeholder="Physics" /></Field>
            <Field label="Photo"><input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className={iCls} /></Field>
            <Field label="Bio" className="md:col-span-2"><textarea rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} className={iCls} placeholder="Short bio..." /></Field>
          </div>
          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4" />
              Active member
            </label>
          </div>
          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-sm disabled:opacity-50 hover:opacity-80 transition-opacity">
              {submitting ? 'Saving…' : editId ? 'Update Member' : 'Add Member'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 opacity-60">Loading…</div>
      ) : members.length === 0 ? (
        <div className="text-center py-10 opacity-60 bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-gray-700">No team members yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map(m => (
            <div key={m.id} className="bg-white dark:bg-[#25293c] border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {m.photo
                  ? <img src={getImageUrl(m.photo)} alt={m.name} className="w-full h-full object-cover" />
                  : <span className="text-xl opacity-40">👤</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{m.name}</div>
                <div className="text-xs opacity-60 mt-0.5">{m.role}{m.department ? ` · ${m.department}` : ''} {!m.active && '· Inactive'}</div>
              </div>
              {canManage && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(m)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(m.id)} className="px-3 py-1.5 text-sm rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Remove</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const iCls = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a2e] text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><label className="block text-xs font-medium opacity-70 mb-1">{label}</label>{children}</div>;
}

'use client';
import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { User } from '../../../types';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isAdmin = user?.role === 'admin';

  const load = async () => {
    try { setLoading(true); const data = await getAllUsers(); setUsers(data.data || []); }
    catch { setError('Failed to load users. Admin only.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isAdmin) load(); else { setLoading(false); setError('Only admins can manage users.'); } }, [isAdmin]);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
      setSuccessMsg('Role updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
      load();
    } catch { setError('Failed to update role'); }
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    editor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    viewer: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>

      {successMsg && <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-sm">✓ {successMsg}</div>}
      {error && <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-10 opacity-60">Loading…</div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 opacity-60 bg-white dark:bg-[#25293c] rounded-xl border border-gray-200 dark:border-gray-700">No users found.</div>
      ) : (
        <div className="bg-white dark:bg-[#25293c] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {['Name','Email','Role','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide opacity-60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-gray-100 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 opacity-70">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role] || ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.id !== user?.id ? (
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a2e] text-black dark:text-white focus:outline-none"
                        >
                          <option value="viewer">viewer</option>
                          <option value="editor">editor</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span className="text-xs opacity-40">(you)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 bg-white dark:bg-[#25293c] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h3 className="font-semibold mb-3 text-sm">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs opacity-70">
          {[
            { role: 'admin', desc: 'Full access — create, edit, delete everything, manage users.' },
            { role: 'editor', desc: 'Can create and edit events & colloquium, but cannot delete or manage users.' },
            { role: 'viewer', desc: 'Read-only. Can access analytics but cannot modify content.' },
          ].map(r => (
            <div key={r.role} className="flex gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium h-fit flex-shrink-0 ${roleColors[r.role]}`}>{r.role}</span>
              <span>{r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

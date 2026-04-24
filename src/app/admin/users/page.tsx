'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Users, Search, Shield, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const { data } = useQuery({
    queryKey: ['admin-users-full', search, role],
    queryFn: () => api.get('/admin/users', { params: { search: search || undefined, role: role || undefined, limit: 50 } }).then(r => r.data),
  });
  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users-full'] }); toast.success('Status updated'); },
  });
  const roleMutation = useMutation({
    mutationFn: ({ id, r }: { id: string; r: string }) => api.patch(`/admin/users/${id}/role`, { role: r }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users-full'] }); toast.success('Role updated'); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users-full'] }); toast.success('User deleted'); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users className="w-5 h-5" />Users ({data?.total ?? 0})</h1>
      </div>
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 text-sm" placeholder="Search by name or email..." />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)} className="input text-sm w-auto">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50">
              <tr><th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Phone</th><th className="text-left px-4 py-3">Role</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Joined</th><th className="text-left px-4 py-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(data?.users ?? []).map((u: any) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{u.name[0].toUpperCase()}</div>
                      <div><p className="font-medium text-gray-900 dark:text-white">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.phone}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={e => roleMutation.mutate({ id: u._id, r: e.target.value })} className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-transparent text-gray-700 dark:text-gray-300">
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      <option value="superadmin">superadmin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3"><span className={`badge text-xs ${u.isActive ? 'badge-green' : 'bg-red-100 text-red-600'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <button onClick={() => toggleMutation.mutate(u._id)} className={`text-xs px-2 py-1 rounded-md font-medium transition ${u.isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>{u.isActive ? 'Suspend' : 'Activate'}</button>
                    <button onClick={() => confirm(`Delete ${u.name}?`) && deleteMutation.mutate(u._id)} className="w-7 h-7 rounded bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Heart, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAssociationPage() {
  const qc = useQueryClient();
  const { data: membersData } = useQuery({ queryKey: ['assoc-members-admin'], queryFn: () => api.get('/association/members').then(r => r.data) });
  const { data: fundData } = useQuery({ queryKey: ['funding-admin'], queryFn: () => api.get('/association/funding').then(r => r.data) });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Heart className="w-5 h-5 text-green-600" />Association Management</h1>
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 dark:text-white">Members ({membersData?.members?.length ?? 0})</h2>
          <button className="btn-primary text-xs flex items-center gap-1 px-3 py-1.5"><Plus className="w-3.5 h-3.5" />Add Member</button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {(membersData?.members ?? []).map((m: any) => (
            <div key={m._id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-green-100 dark:bg-green-900/30 shrink-0">{m.photo?.url ? <img src={m.photo.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-green-700 font-bold">{m.name[0]}</div>}</div>
              <div className="flex-1"><p className="font-medium text-sm text-gray-900 dark:text-white">{m.name}</p><p className="text-xs text-gray-400">{m.role} {m.designation && `· ${m.designation}`}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 dark:text-white">Funding Campaigns ({fundData?.funding?.length ?? 0})</h2>
          <button className="btn-primary text-xs flex items-center gap-1 px-3 py-1.5"><Plus className="w-3.5 h-3.5" />Add Campaign</button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {(fundData?.funding ?? []).map((f: any) => (
            <div key={f._id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1"><p className="font-medium text-sm text-gray-900 dark:text-white">{f.title}</p><p className="text-xs text-gray-400">৳{f.raisedAmount?.toLocaleString()} / ৳{f.targetAmount?.toLocaleString()}</p></div>
              <span className={`badge text-xs ${f.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{f.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

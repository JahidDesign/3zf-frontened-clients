'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ShoppingBag, CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminShopMembersPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-shop-members'], queryFn: () => api.get('/shop-membership/all').then(r => r.data) });
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/shop-membership/approve/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-shop-members'] }); toast.success('Updated'); },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-pink-500" />Supershop Members</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50">
              <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Phone</th><th className="text-left px-4 py-3">City</th><th className="text-left px-4 py-3">TrxID</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(data?.members ?? []).map((m: any) => (
                <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-100 dark:bg-pink-900/30 shrink-0 flex items-center justify-center text-pink-700 font-bold text-xs">
                        {m.profilePhoto?.url ? <img src={m.profilePhoto.url} alt="" className="w-full h-full object-cover" /> : m.name?.[0]}
                      </div>
                      <div><p className="font-medium text-gray-900 dark:text-white">{m.name}</p>{m.memberId && <p className="text-xs text-pink-500 font-mono">{m.memberId}</p>}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{m.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{m.city}</td>
                  <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{m.transactionId}</span></td>
                  <td className="px-4 py-3"><span className={`badge text-xs ${m.status === 'approved' ? 'badge-green' : m.status === 'pending' ? 'badge-orange' : 'bg-red-100 text-red-600'}`}>{m.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{format(new Date(m.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">
                    {m.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => mutation.mutate({ id: m._id, status: 'approved' })} className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded font-medium transition"><CheckCircle className="w-3 h-3" />Approve</button>
                        <button onClick={() => mutation.mutate({ id: m._id, status: 'rejected' })} className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded font-medium transition"><XCircle className="w-3 h-3" />Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data?.members?.length ?? 0) === 0 && <div className="p-12 text-center text-gray-400"><ShoppingBag className="w-12 h-12 mx-auto mb-3" /><p>No membership applications</p></div>}
        </div>
      </div>
    </div>
  );
}

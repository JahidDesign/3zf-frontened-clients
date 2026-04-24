'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Phone, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminContactPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState('');
  const { data } = useQuery({ queryKey: ['admin-contacts'], queryFn: () => api.get('/contact').then(r => r.data) });
  const replyMutation = useMutation({
    mutationFn: ({ id, msg }: { id: string; msg: string }) => api.patch(`/contact/${id}/reply`, { replyMessage: msg }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-contacts'] }); setSelected(null); setReply(''); toast.success('Reply sent'); },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Phone className="w-5 h-5" />Contact Messages ({data?.contacts?.length ?? 0})</h1>
      <div className="space-y-3">
        {(data?.contacts ?? []).map((c: any) => (
          <div key={c._id} className={`card p-4 ${c.status === 'new' ? 'border-l-4 border-primary-500' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1"><p className="font-semibold text-gray-900 dark:text-white text-sm">{c.name}</p><span className={`badge text-xs ${c.status === 'new' ? 'badge-blue' : c.status === 'replied' ? 'badge-green' : 'badge-gray'}`}>{c.status}</span></div>
                <p className="text-xs text-gray-400">{c.email} {c.phone && `· ${c.phone}`} · {format(new Date(c.createdAt), 'PPp')}</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm mt-1">{c.subject}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{c.message}</p>
              </div>
              {c.status !== 'replied' && (
                <button onClick={() => { setSelected(c); setReply(''); }} className="btn-primary text-xs px-3 py-1.5 shrink-0">Reply</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Reply to {selected.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{selected.subject}</p>
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4} className="input resize-none w-full text-sm mb-3" placeholder="Write your reply..." />
            <div className="flex gap-2">
              <button onClick={() => replyMutation.mutate({ id: selected._id, msg: reply })} disabled={!reply.trim() || replyMutation.isPending} className="flex-1 btn-primary flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" />Send Reply</button>
              <button onClick={() => setSelected(null)} className="flex-1 btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminEventsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-events'], queryFn: () => api.get('/events').then(r => r.data) });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/events/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Event cancelled'); },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><CalendarDays className="w-5 h-5" />Events ({data?.total ?? 0})</h1>
        <button className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" />Add Event</button>
      </div>
      <div className="space-y-3">
        {(data?.events ?? []).map((e: any) => (
          <div key={e._id} className="card p-4 flex items-center gap-4">
            {e.banner?.url && <img src={e.banner.url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{e.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{format(new Date(e.startDate), 'PPP')} · {e.location}</p>
              <span className={`badge text-xs mt-1 inline-block ${e.status === 'upcoming' ? 'badge-blue' : e.status === 'ongoing' ? 'badge-green' : 'badge-gray'}`}>{e.status}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400">{e.attendees?.length || 0} attending</span>
              <button onClick={() => confirm('Cancel event?') && deleteMutation.mutate(e._id)} className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200 transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

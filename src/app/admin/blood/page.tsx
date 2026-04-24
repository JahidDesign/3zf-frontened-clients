'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Droplets, CheckCircle, XCircle, AlertTriangle, MapPin, Phone, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const BG_COLORS: Record<string, string> = {
  'A+': 'bg-red-500', 'A-': 'bg-red-700', 'B+': 'bg-blue-500', 'B-': 'bg-blue-700',
  'O+': 'bg-green-500', 'O-': 'bg-green-700', 'AB+': 'bg-purple-500', 'AB-': 'bg-purple-700',
};

export default function AdminBloodPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'pending' | 'active' | 'completed'>('pending');
  const [adminNote, setAdminNote] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const { data } = useQuery({
    queryKey: ['admin-blood', tab],
    queryFn: () => {
      const status = tab === 'pending' ? 'pending' : tab === 'active' ? 'active' : 'completed';
      return api.get('/blood/requests', { params: { status, limit: 50 } }).then(r => r.data);
    },
    refetchInterval: 30000,
  });

  const pendingData = useQuery({
    queryKey: ['admin-blood-pending'],
    queryFn: () => api.get('/blood/requests/pending').then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/blood/requests/${id}/approve`, { status, adminNote, isUrgent }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blood'] });
      qc.invalidateQueries({ queryKey: ['admin-blood-pending'] });
      setAdminNote('');
      toast.success('Updated');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const pendingCount = pendingData.data?.requests?.length || 0;

  const displayRequests = tab === 'pending'
    ? pendingData.data?.requests ?? []
    : data?.requests ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Droplets className="w-5 h-5 text-red-500" /> Blood Requests
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800 w-fit">
        {[
          { id: 'pending',   label: `Pending (${pendingCount})` },
          { id: 'active',    label: 'Active' },
          { id: 'completed', label: 'Completed' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id ? 'bg-red-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Requests */}
      <div className="space-y-4">
        {displayRequests.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            <Droplets className="w-12 h-12 mx-auto mb-3" />
            <p>No {tab} requests</p>
          </div>
        )}

        {displayRequests.map((req: any) => (
          <div key={req._id} className="card p-5">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl ${BG_COLORS[req.bloodGroup] || 'bg-red-500'} flex items-center justify-center text-white font-black text-lg shrink-0`}>
                {req.bloodGroup}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">{req.patientName}</h3>
                  <span className={`badge text-xs ${
                    req.urgency === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    req.urgency === 'urgent'   ? 'bg-orange-100 text-orange-600' : 'badge-gray'
                  }`}>
                    {req.urgency === 'critical' ? '🚨 Critical' : req.urgency === 'urgent' ? '⚠️ Urgent' : 'Normal'}
                  </span>
                  <span className={`badge text-xs ${req.status === 'active' ? 'badge-green' : req.status === 'completed' ? 'badge-blue' : 'badge-orange'}`}>
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.hospital}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.location}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{req.contact}</span>
                  <span>{req.requiredUnits} bags needed</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                    {format(new Date(req.createdAt), 'MMM d, yyyy HH:mm')}
                  </span>
                  {req.requester?.name && <span>By: {req.requester.name}</span>}
                </div>

                {req.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{req.description}</p>
                )}

                {/* Donor progress */}
                {req.status !== 'pending' && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Donors</span>
                      <span className="font-bold">{req.acceptedDonors?.filter((d: any) => d.status === 'accepted').length || 0} / {req.requiredUnits}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-48">
                      <div className="h-full bg-red-500 rounded-full"
                        style={{ width: `${Math.min(100, ((req.acceptedDonors?.filter((d: any) => d.status === 'accepted').length || 0) / req.requiredUnits) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Admin actions */}
              {tab === 'pending' && (
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} id={`urg-${req._id}`} />
                    <label htmlFor={`urg-${req._id}`}>Mark Urgent</label>
                  </div>
                  <button
                    onClick={() => approveMutation.mutate({ id: req._id, status: 'active' })}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => approveMutation.mutate({ id: req._id, status: 'rejected' })}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

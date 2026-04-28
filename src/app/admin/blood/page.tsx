'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  Droplets, CheckCircle, XCircle, MapPin,
  Phone, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BloodReq {
  _id:           string;
  patientName:   string;
  bloodGroup:    string;
  urgency:       'normal' | 'urgent' | 'critical';
  status:        'pending' | 'active' | 'completed' | 'rejected';
  hospital:      string;
  location:      string;
  contact:       string;
  requiredUnits: number;
  description?:  string;
  createdAt:     string;
  requester?:    { name: string };
  acceptedDonors?: Array<{ status: string }>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BG_COLORS: Record<string, string> = {
  'A+': 'bg-red-500',    'A-': 'bg-red-700',
  'B+': 'bg-blue-500',   'B-': 'bg-blue-700',
  'O+': 'bg-green-500',  'O-': 'bg-green-700',
  'AB+': 'bg-purple-500','AB-': 'bg-purple-700',
};

// ─── Per-card action state ────────────────────────────────────────────────────
// Keeps adminNote + isUrgent isolated per request so editing one card
// doesn't affect others.

interface CardState { note: string; urgent: boolean; expanded: boolean }
const DEFAULT_CARD: CardState = { note: '', urgent: false, expanded: false };

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminBloodPage() {
  const qc  = useQueryClient();
  const [tab, setTab] = useState<'pending' | 'active' | 'completed'>('pending');

  // Per-card state keyed by request._id
  const [cardState, setCardState] = useState<Record<string, CardState>>({});
  const card = (id: string): CardState => cardState[id] ?? DEFAULT_CARD;
  const setCard = (id: string, patch: Partial<CardState>) =>
    setCardState(prev => ({ ...prev, [id]: { ...card(id), ...patch } }));

  // ── Queries ────────────────────────────────────────────────────────────────

  // Pending — uses the admin-only endpoint that returns full requester details
  const pendingQuery = useQuery<{ requests: BloodReq[] }>({
    queryKey: ['admin-blood-pending'],
    queryFn:  () => api.get('/blood/requests/pending').then(r => r.data),
    refetchInterval: 30_000,
  });

  // Active / completed — uses the public endpoint filtered by status
  const listQuery = useQuery<{ requests: BloodReq[] }>({
    queryKey: ['admin-blood-list', tab],
    queryFn:  () =>
      api.get('/blood/requests', { params: { status: tab, limit: 50 } }).then(r => r.data),
    enabled:  tab !== 'pending',
    refetchInterval: 30_000,
  });

  // ── Mutation ───────────────────────────────────────────────────────────────

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/blood/requests/${id}/approve`, {
        status,
        adminNote: card(id).note,
        isUrgent:  card(id).urgent,
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-blood'] });
      qc.invalidateQueries({ queryKey: ['admin-blood-pending'] });
      qc.invalidateQueries({ queryKey: ['admin-blood-list'] });
      // Clear only this card's state after action
      setCardState(prev => { const n = { ...prev }; delete n[id]; return n; });
      toast.success('Updated successfully');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  // ── Derived ────────────────────────────────────────────────────────────────

  const pendingRequests = pendingQuery.data?.requests ?? [];
  const listRequests    = listQuery.data?.requests    ?? [];
  const displayRequests = tab === 'pending' ? pendingRequests : listRequests;
  const pendingCount    = pendingRequests.length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Droplets className="w-5 h-5 text-red-500" /> Blood Requests
      </h1>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800 w-fit">
        {([
          { id: 'pending',   label: `Pending (${pendingCount})` },
          { id: 'active',    label: 'Active'    },
          { id: 'completed', label: 'Completed' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id
                ? 'bg-red-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Request list ── */}
      <div className="space-y-4">
        {displayRequests.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            <Droplets className="w-12 h-12 mx-auto mb-3" />
            <p>No {tab} requests</p>
          </div>
        )}

        {displayRequests.map((req) => {
          const cs            = card(req._id);
          const isPending     = tab === 'pending';
          const acceptedCount = req.acceptedDonors?.filter(d => d.status === 'accepted').length ?? 0;
          const progress      = Math.min(100, Math.round((acceptedCount / req.requiredUnits) * 100));
          const isActing      = approveMutation.isPending && approveMutation.variables?.id === req._id;

          return (
            <div key={req._id} className="card p-5">
              <div className="flex items-start gap-4">
                {/* Blood group badge */}
                <div className={`w-14 h-14 rounded-xl ${BG_COLORS[req.bloodGroup] ?? 'bg-red-500'} flex items-center justify-center text-white font-black text-lg shrink-0`}>
                  {req.bloodGroup}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{req.patientName}</h3>
                    <span className={`badge text-xs ${
                      req.urgency === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                      req.urgency === 'urgent'   ? 'bg-orange-100 text-orange-600' : 'badge-gray'
                    }`}>
                      {req.urgency === 'critical' ? '🚨 Critical' : req.urgency === 'urgent' ? '⚠️ Urgent' : 'Normal'}
                    </span>
                    <span className={`badge text-xs ${
                      req.status === 'active'    ? 'badge-green'  :
                      req.status === 'completed' ? 'badge-blue'   : 'badge-orange'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.hospital}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.location}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{req.contact}</span>
                    <span>{req.requiredUnits} bags needed</span>
                    <span className="flex items-center gap-1 col-span-2">
                      <Clock className="w-3 h-3" />
                      {format(new Date(req.createdAt), 'MMM d, yyyy HH:mm')}
                      {req.requester?.name && <span className="ml-2">· By: {req.requester.name}</span>}
                    </span>
                  </div>

                  {req.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{req.description}</p>
                  )}

                  {/* Donor progress bar (non-pending) */}
                  {req.status !== 'pending' && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Donors</span>
                        <span className="font-bold text-red-600">{acceptedCount} / {req.requiredUnits}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-48">
                        <div
                          className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Per-card admin note — only when pending and expanded */}
                  {isPending && cs.expanded && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={cs.note}
                        onChange={e => setCard(req._id, { note: e.target.value })}
                        placeholder="Admin note (optional, shown to requester on reject)"
                        rows={2}
                        className="input text-xs resize-none w-full"
                      />
                      <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cs.urgent}
                          onChange={e => setCard(req._id, { urgent: e.target.checked })}
                          className="w-3.5 h-3.5"
                        />
                        Mark as Urgent
                      </label>
                    </div>
                  )}
                </div>

                {/* Admin action buttons */}
                {isPending && (
                  <div className="flex flex-col gap-2 shrink-0">
                    {/* Toggle note/urgent panel */}
                    <button
                      onClick={() => setCard(req._id, { expanded: !cs.expanded })}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition"
                    >
                      Options {cs.expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => approveMutation.mutate({ id: req._id, status: 'active' })}
                      disabled={isActing}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {isActing ? '...' : 'Approve'}
                    </button>

                    <button
                      onClick={() => approveMutation.mutate({ id: req._id, status: 'rejected' })}
                      disabled={isActing}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {isActing ? '...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
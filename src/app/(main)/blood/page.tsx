'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import  useAuthStore  from '@/store/authStore';
import { useT } from '@/lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Droplets, MapPin, Phone, Clock, Search,
  AlertTriangle, Plus, CheckCircle, XCircle,
  Heart, Users, ArrowRight, Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Extend the base User type with blood-donation fields */
interface DonorUser {
  _id: string;
  bloodGroup?: string;
  isAvailableForDonation?: boolean;
}

type UrgencyKey = 'critical' | 'urgent' | 'normal';

interface DonorResponse {
  donor: string | { _id: string };
  status: 'accepted' | 'rejected';
}

interface BloodRequest {
  _id: string;
  patientName: string;
  bloodGroup: string;
  urgency: UrgencyKey;
  hospital: string;
  location: string;
  contact: string;
  requiredUnits: number;
  createdAt: string;
  requester?: string | { _id: string };
  acceptedDonors?: DonorResponse[];
}

interface Donor {
  _id: string;
  name: string;
  avatar?: string;
  bloodGroup: string;
  location?: string;
}

interface RequestsResponse {
  requests: BloodRequest[];
  total: number;
}

interface DonorsResponse {
  donors: Donor[];
}

interface ToggleResponse {
  isAvailable: boolean;
}

interface RespondResponse {
  completed: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

const URGENCY_CONFIG: Record<UrgencyKey, { label: string; color: string; border: string }> = {
  critical: { label: '🚨 Critical', color: 'bg-red-500 text-white',    border: 'border-red-400' },
  urgent:   { label: '⚠️ Urgent',   color: 'bg-orange-500 text-white', border: 'border-orange-400' },
  normal:   { label: 'Normal',      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', border: 'border-gray-200 dark:border-gray-700' },
};

const BG_COLORS: Record<string, string> = {
  'A+':  'bg-red-500',    'A-':  'bg-red-700',
  'B+':  'bg-blue-500',   'B-':  'bg-blue-700',
  'O+':  'bg-green-500',  'O-':  'bg-green-700',
  'AB+': 'bg-purple-500', 'AB-': 'bg-purple-700',
};

const URGENCY_OPTIONS: UrgencyKey[] = ['critical', 'urgent', 'normal'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRequesterId(requester: BloodRequest['requester']): string | undefined {
  if (!requester) return undefined;
  return typeof requester === 'string' ? requester : requester._id;
}

function getDonorId(donor: DonorResponse['donor']): string {
  return typeof donor === 'string' ? donor : donor._id;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BloodPage() {
  // Cast user to DonorUser so blood-donation fields are accessible.
  // These fields are present at runtime but not declared in the base User type.
  const { user: baseUser } = useAuthStore();
  const user = baseUser as (DonorUser & typeof baseUser) | null;

  const t  = useT();
  const qc = useQueryClient();

  const [tab, setTab]             = useState<'requests' | 'donors'>('requests');
  const [bgFilter, setBgFilter]   = useState('');
  const [urgFilter, setUrgFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: requestsData, isLoading } = useQuery<RequestsResponse>({
    queryKey: ['blood-requests', bgFilter, urgFilter, locFilter],
    queryFn: () =>
      api.get('/blood/requests', {
        params: {
          bloodGroup: bgFilter  || undefined,
          urgency:    urgFilter || undefined,
          location:   locFilter || undefined,
        },
      }).then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: donorsData } = useQuery<DonorsResponse>({
    queryKey: ['blood-donors', bgFilter],
    queryFn: () =>
      api.get('/blood/donors', {
        params: { bloodGroup: bgFilter || undefined },
      }).then(r => r.data),
    enabled: tab === 'donors',
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const toggleMutation = useMutation<{ data: ToggleResponse }>({
    mutationFn: () => api.patch('/blood/toggle-availability'),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['blood-donors'] });
      toast.success(
        res.data.isAvailable
          ? '✅ আপনি এখন ডোনার হিসেবে উপলব্ধ'
          : 'ডোনার তালিকা থেকে সরা হয়েছে',
      );
    },
  });

  const respondMutation = useMutation<{ data: RespondResponse }, Error, { id: string; action: string }>({
    mutationFn: ({ id, action }) =>
      api.post(`/blood/requests/${id}/respond`, { action }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['blood-requests'] });
      toast.success(res.data.completed ? '🎉 পর্যাপ্ত ডোনার পাওয়া গেছে!' : 'সাড়া দেওয়া হয়েছে');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  // ── Derived values ─────────────────────────────────────────────────────────

  const requests = requestsData?.requests ?? [];
  const donors   = donorsData?.donors     ?? [];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      {/* ── Hero ── */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 lg:mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Droplets className="w-9 h-9" />
              <div>
                <h1 className="text-2xl font-bold">Blood Donation</h1>
                <p className="text-red-100 text-sm mt-0.5">রক্ত দিন, জীবন বাঁচান — Save a life today</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {user?.bloodGroup && (
                <button
                  onClick={() => toggleMutation.mutate()}
                  disabled={toggleMutation.isPending}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                    user.isAvailableForDonation
                      ? 'bg-white text-red-600 hover:bg-red-50'
                      : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${user.isAvailableForDonation ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  {user.isAvailableForDonation
                    ? `✅ Donor (${user.bloodGroup})`
                    : 'Become Donor'}
                </button>
              )}
              <Link
                href="/blood/request"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-red-600 hover:bg-red-50 text-sm font-bold transition"
              >
                <Plus className="w-4 h-4" /> রক্তের অনুরোধ করুন
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6 max-w-xs">
            {([
              { label: 'Active Requests', value: requestsData?.total ?? 0 },
              { label: 'Donors',          value: donors.length || '—'    },
              { label: 'Blood Groups',    value: 8                        },
            ] as const).map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-red-100 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0">
            {([
              { id: 'requests' as const, label: '🩸 Blood Requests'   },
              { id: 'donors'   as const, label: '👤 Available Donors' },
            ]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                  tab === id
                    ? 'border-white text-white'
                    : 'border-transparent text-red-200 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── Filters ── */}
        <div className="card p-4 mb-5 flex flex-wrap gap-3">
          {/* Blood group */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">রক্তের গ্রুপ:</span>
            <button
              onClick={() => setBgFilter('')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                !bgFilter
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => setBgFilter(bgFilter === bg ? '' : bg)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                  bgFilter === bg
                    ? `${BG_COLORS[bg]} text-white`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>

          {/* Urgency + location (requests tab only) */}
          {tab === 'requests' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Urgency:</span>
                {URGENCY_OPTIONS.map(u => (
                  <button
                    key={u}
                    onClick={() => setUrgFilter(urgFilter === u ? '' : u)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize transition ${
                      urgFilter === u
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 min-w-[140px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={locFilter}
                  onChange={e => setLocFilter(e.target.value)}
                  className="input pl-8 py-1.5 text-xs"
                  placeholder="Filter by location..."
                />
              </div>
            </>
          )}
        </div>

        {/* ── Blood Requests ── */}
        {tab === 'requests' && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="card p-16 text-center">
                <Droplets className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active blood requests</p>
                <Link href="/blood/request" className="btn-primary mt-4 inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Request
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests.map((req) => {
                  const urg = URGENCY_CONFIG[req.urgency] ?? URGENCY_CONFIG.normal;

                  const myResponse = req.acceptedDonors?.find(
                    d => getDonorId(d.donor) === user?._id,
                  );

                  const acceptedCount =
                    req.acceptedDonors?.filter(d => d.status === 'accepted').length ?? 0;

                  const progress = Math.min(
                    100,
                    Math.round((acceptedCount / req.requiredUnits) * 100),
                  );

                  const isOwnRequest = getRequesterId(req.requester) === user?._id;

                  return (
                    <div
                      key={req._id}
                      className={`card overflow-hidden hover:shadow-md transition border-l-4 ${urg.border}`}
                    >
                      {/* Card header */}
                      <div className="p-4 pb-3">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div
                            className={`w-14 h-14 rounded-xl ${BG_COLORS[req.bloodGroup] ?? 'bg-red-500'} flex items-center justify-center text-white font-black text-lg shrink-0`}
                          >
                            {req.bloodGroup}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate">{req.patientName}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${urg.color}`}>
                              {urg.label}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-red-400" />
                            <span className="truncate">{req.hospital}, {req.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 shrink-0 text-green-400" />
                            <a href={`tel:${req.contact}`} className="hover:text-green-600 hover:underline">
                              {req.contact}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="px-4 pb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Donors found</span>
                          <span className="font-bold text-red-600">
                            {acceptedCount} / {req.requiredUnits} units
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-4 pb-4 flex items-center gap-2">
                        <Link
                          href={`/blood/${req._id}`}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                          Details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        {user && !isOwnRequest && !myResponse && (
                          <div className="flex gap-1.5 flex-1">
                            <button
                              onClick={() => respondMutation.mutate({ id: req._id, action: 'accept' })}
                              disabled={respondMutation.isPending}
                              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Accept
                            </button>
                            <button
                              onClick={() => respondMutation.mutate({ id: req._id, action: 'reject' })}
                              disabled={respondMutation.isPending}
                              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {myResponse && (
                          <span
                            className={`flex-1 text-center text-sm font-medium py-2 rounded-xl ${
                              myResponse.status === 'accepted'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                            }`}
                          >
                            {myResponse.status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Donors ── */}
        {tab === 'donors' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {donors.map((donor) => (
              <div key={donor._id} className="card p-4 text-center hover:shadow-md transition">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                  {donor.avatar
                    ? <img src={donor.avatar} alt={donor.name} className="w-full h-full object-cover" />
                    : donor.name?.[0]?.toUpperCase()}
                </div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{donor.name}</p>
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${BG_COLORS[donor.bloodGroup] ?? 'bg-red-500'} text-white font-black text-sm mt-2 mx-auto`}
                >
                  {donor.bloodGroup}
                </div>
                {donor.location && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" />{donor.location}
                  </p>
                )}
              </div>
            ))}

            {donors.length === 0 && (
              <div className="col-span-full card p-12 text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3" />
                <p>No donors available for this blood group</p>
              </div>
            )}
          </div>
        )}
      </div>

      <MainFooter />
    </div>
  );
}
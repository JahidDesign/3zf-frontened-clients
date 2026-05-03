'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import useAuthStore from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Droplets, MapPin, Phone, Clock, Search,
  Plus, CheckCircle, XCircle,
  Heart, Users, ArrowRight, Loader2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

const URGENCY_CONFIG: Record<UrgencyKey, { label: string; color: string; border: string; headerBg: string }> = {
  critical: {
    label: ' Critical',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    border: 'border-l-red-500',
    headerBg: 'bg-red-600',
  },
  urgent: {
    label: ' Urgent',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    border: 'border-l-orange-500',
    headerBg: 'bg-orange-500',
  },
  normal: {
    label: 'Normal',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    border: 'border-l-blue-400',
    headerBg: 'bg-red-500',
  },
};

const BG_COLORS: Record<string, string> = {
  'A+': 'bg-red-500', 'A-': 'bg-red-700',
  'B+': 'bg-blue-500', 'B-': 'bg-blue-700',
  'O+': 'bg-green-500', 'O-': 'bg-green-700',
  'AB+': 'bg-purple-500', 'AB-': 'bg-purple-700',
};

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
  const { user: baseUser } = useAuthStore();
  const user = baseUser as (DonorUser & typeof baseUser) | null;
  const qc = useQueryClient();

  const [tab, setTab] = useState<'requests' | 'donors'>('requests');
  const [bgFilter, setBgFilter] = useState('');
  const [urgFilter, setUrgFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: requestsData, isLoading } = useQuery<RequestsResponse>({
    queryKey: ['blood-requests', bgFilter, urgFilter, locFilter],
    queryFn: () =>
      api
        .get('/blood/requests', {
          params: {
            bloodGroup: bgFilter || undefined,
            urgency: urgFilter || undefined,
            location: locFilter || undefined,
          },
        })
        .then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: donorsData } = useQuery<DonorsResponse>({
    queryKey: ['blood-donors', bgFilter],
    queryFn: () =>
      api
        .get('/blood/donors', {
          params: { bloodGroup: bgFilter || undefined },
        })
        .then((r) => r.data),
    enabled: tab === 'donors',
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  // FIX: correct generic — api.patch returns AxiosResponse<T>, so .data is T
  const toggleMutation = useMutation({
    mutationFn: () =>
      api.patch<{ isAvailable: boolean }>('/blood/toggle-availability'),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['blood-donors'] });
      // FIX: res is AxiosResponse, so use res.data
      toast.success(
        res.data.isAvailable
          ? '✅ আপনি এখন ডোনার হিসেবে উপলব্ধ'
          : 'ডোনার তালিকা থেকে সরা হয়েছে',
      );
      // Refresh auth store user to reflect new availability
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || 'Failed to toggle'),
  });

  // FIX: correct generic and error handling
  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.post<{ completed: boolean; message?: string }>(
        `/blood/requests/${id}/respond`,
        { action },
      ),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['blood-requests'] });
      // FIX: res is AxiosResponse, so use res.data.completed
      toast.success(
        res.data.completed ? '🎉 পর্যাপ্ত ডোনার পাওয়া গেছে!' : 'সাড়া দেওয়া হয়েছে',
      );
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || 'Already responded'),
  });

  // ── Derived values ─────────────────────────────────────────────────────────

  const requests = requestsData?.requests ?? [];
  const donors = donorsData?.donors ?? [];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-red-600 via-red-600 to-red-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 lg:mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">Blood Donation</h1>
                <p className="text-red-100 text-sm mt-0.5">
                  রক্ত দিন, জীবন বাঁচান — Save a life today
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {user?.bloodGroup && (
                <button
                  onClick={() => toggleMutation.mutate()}
                  disabled={toggleMutation.isPending}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    user.isAvailableForDonation
                      ? 'bg-white text-red-600 hover:bg-red-50'
                      : 'bg-white/15 hover:bg-white/25 text-white border border-white/30'
                  }`}
                >
                  {toggleMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart
                      className={`w-4 h-4 ${user.isAvailableForDonation ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  )}
                  {user.isAvailableForDonation
                    ? `✅ Donor (${user.bloodGroup})`
                    : 'Become Donor'}
                </button>
              )}
              <Link
                href="/blood/request"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-red-600 hover:bg-red-50 text-sm font-semibold transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                রক্তের অনুরোধ করুন
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6 max-w-sm">
            {[
              { label: 'Active Requests', value: requestsData?.total ?? 0 },
              { label: 'Donors', value: donors.length || '—' },
              { label: 'Blood Groups', value: 8 },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center"
              >
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-red-100 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0">
            {[
              { id: 'requests' as const, label: '🩸 Blood Requests' },
              { id: 'donors' as const, label: '👤 Available Donors' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-5 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Blood group filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
                গ্রুপ:
              </span>
              <button
                onClick={() => setBgFilter('')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  !bgFilter
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setBgFilter(bgFilter === bg ? '' : bg)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
                    Urgency:
                  </span>
                  {(['critical', 'urgent', 'normal'] as UrgencyKey[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUrgFilter(urgFilter === u ? '' : u)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                        urgFilter === u
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 min-w-[140px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input
                    value={locFilter}
                    onChange={(e) => setLocFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="Filter by location..."
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Blood Requests Tab ── */}
        {tab === 'requests' && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-8 h-8 text-red-300" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No active blood requests
                </p>
                <Link
                  href="/blood/request"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all"
                >
                  <Plus className="w-4 h-4" /> Create Request
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests.map((req) => {
                  const urg = URGENCY_CONFIG[req.urgency] ?? URGENCY_CONFIG.normal;

                  const myResponse = req.acceptedDonors?.find(
                    (d) => getDonorId(d.donor) === user?._id,
                  );

                  const acceptedCount =
                    req.acceptedDonors?.filter((d) => d.status === 'accepted')
                      .length ?? 0;

                  const progress = Math.min(
                    100,
                    Math.round((acceptedCount / req.requiredUnits) * 100),
                  );

                  const isOwnRequest = getRequesterId(req.requester) === user?._id;

                  return (
                    <div
                      key={req._id}
                      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-l-4 ${urg.border}`}
                    >
                      {/* Card header */}
                      <div className="p-4 pb-3">
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`w-14 h-14 rounded-2xl ${BG_COLORS[req.bloodGroup] ?? 'bg-red-500'} flex items-center justify-center text-white font-black text-lg shrink-0 shadow-sm`}
                          >
                            {req.bloodGroup}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate leading-tight">
                              {req.patientName}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${urg.color}`}
                            >
                              {urg.label}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-red-400" />
                            <span className="truncate">
                              {req.hospital}, {req.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 shrink-0 text-green-400" />
                            <a
                              href={`tel:${req.contact}`}
                              className="hover:text-green-600 hover:underline transition-colors"
                            >
                              {req.contact}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {formatDistanceToNow(new Date(req.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="px-4 pb-3">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                          <span>Donors found</span>
                          <span className="font-bold text-red-600 dark:text-red-400">
                            {acceptedCount} / {req.requiredUnits} bags
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progress >= 100 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-4 pb-4 flex items-center gap-2">
                        <Link
                          href={`/blood/${req._id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                          Details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        {user && !isOwnRequest && !myResponse && (
                          <div className="flex gap-1.5 flex-1">
                            <button
                              onClick={() =>
                                respondMutation.mutate({ id: req._id, action: 'accept' })
                              }
                              disabled={respondMutation.isPending}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 text-white text-sm font-semibold transition-all disabled:opacity-60"
                            >
                              {respondMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                respondMutation.mutate({ id: req._id, action: 'reject' })
                              }
                              disabled={respondMutation.isPending}
                              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-all disabled:opacity-60"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {myResponse && (
                          <span
                            className={`flex-1 text-center text-xs font-semibold py-2 rounded-xl ${
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

        {/* ── Donors Tab ── */}
        {tab === 'donors' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {donors.map((donor) => (
              <div
                key={donor._id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 shadow-sm">
                  {donor.avatar ? (
                    <img
                      src={donor.avatar}
                      alt={donor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    donor.name?.[0]?.toUpperCase()
                  )}
                </div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate leading-tight">
                  {donor.name}
                </p>
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${BG_COLORS[donor.bloodGroup] ?? 'bg-red-500'} text-white font-black text-sm mt-2 shadow-sm`}
                >
                  {donor.bloodGroup}
                </div>
                {donor.location && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{donor.location}</span>
                  </p>
                )}
              </div>
            ))}

            {donors.length === 0 && (
              <div className="col-span-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  No donors available for this blood group
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <MainFooter />
    </div>
  );
}
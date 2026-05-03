'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import useAuthStore from '@/store/authStore';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Droplets, MapPin, Phone, Clock, CheckCircle,
  XCircle, ArrowLeft, Loader2,
} from 'lucide-react';
import Link from 'next/link';

const BG_COLORS: Record<string, string> = {
  'A+': 'bg-red-500', 'A-': 'bg-red-700',
  'B+': 'bg-blue-500', 'B-': 'bg-blue-700',
  'O+': 'bg-green-500', 'O-': 'bg-green-700',
  'AB+': 'bg-purple-500', 'AB-': 'bg-purple-700',
};

const URGENCY_LABEL: Record<string, string> = {
  normal: 'Normal',
  urgent: '⚠️ Urgent',
  critical: '🚨 Critical',
};

const URGENCY_HEADER: Record<string, string> = {
  normal: 'bg-red-500',
  urgent: 'bg-orange-500',
  critical: 'bg-red-600',
};

export default function BloodRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['blood-request', id],
    queryFn: () =>
      api.get(`/blood/requests/${id}`).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 15_000,
  });

  // FIX: correct generic — api.post returns AxiosResponse<T>
  const respondMutation = useMutation({
    mutationFn: (action: string) =>
      api.post<{ completed: boolean; message?: string }>(
        `/blood/requests/${id}/respond`,
        { action },
      ),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['blood-request', id] });
      // FIX: res is AxiosResponse — use res.data
      toast.success(
        res.data.completed ? '🎉 পর্যাপ্ত ডোনার পাওয়া গেছে!' : 'সাড়া দেওয়া হয়েছে',
      );
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || 'Already responded'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <MainNavbar />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        </div>
      </div>
    );
  }

  const req = data?.request;
  if (!req) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <MainNavbar />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-gray-500 dark:text-gray-400">Request not found.</p>
          <Link
            href="/blood"
            className="inline-flex items-center gap-2 text-sm text-red-500 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  const acceptedDonors =
    req.acceptedDonors?.filter((d: any) => d.status === 'accepted') ?? [];

  const myResponse = req.acceptedDonors?.find(
    (d: any) => (d.donor?._id || d.donor) === user?._id,
  );

  const progress = Math.min(
    100,
    Math.round((acceptedDonors.length / req.requiredUnits) * 100),
  );

  const isOwner = (req.requester?._id || req.requester) === user?._id;

  const headerBg = URGENCY_HEADER[req.urgency] ?? 'bg-red-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      <div className="max-w-3xl mx-auto px-4 py-8 lg:mt-8">

        {/* Back */}
        <Link
          href="/blood"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Requests
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">

          {/* ── Header ── */}
          <div className={`p-5 text-white ${headerBg}`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl ${BG_COLORS[req.bloodGroup] || 'bg-red-700'} flex items-center justify-center text-white font-black text-2xl border-2 border-white/30 shadow`}
                >
                  {req.bloodGroup}
                </div>
                <div>
                  <h1 className="text-xl font-bold leading-tight">{req.patientName}</h1>
                  <span className="text-white/80 text-sm">{URGENCY_LABEL[req.urgency]}</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  req.status === 'completed'
                    ? 'bg-green-500'
                    : req.status === 'active'
                    ? 'bg-white/20 border border-white/30'
                    : 'bg-black/20'
                }`}
              >
                {req.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-5">

            {/* ── Info Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: MapPin, label: 'Hospital', value: req.hospital },
                { icon: MapPin, label: 'Location', value: req.location },
                {
                  icon: Phone,
                  label: 'Contact',
                  value: req.contact,
                  link: `tel:${req.contact}`,
                },
                {
                  icon: Droplets,
                  label: 'Required',
                  value: `${req.requiredUnits} bag${req.requiredUnits > 1 ? 's' : ''}`,
                },
                {
                  icon: Clock,
                  label: 'Posted',
                  value: formatDistanceToNow(new Date(req.createdAt), {
                    addSuffix: true,
                  }),
                },
                ...(req.requiredBy
                  ? [
                      {
                        icon: Clock,
                        label: 'Needed By',
                        value: format(new Date(req.requiredBy), 'PPP'),
                      },
                    ]
                  : []),
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{item.label}</p>
                    {item.link ? (
                      <a
                        href={item.link}
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {req.description && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {req.description}
                </p>
              </div>
            )}

            {/* ── Progress ── */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Donor Progress
                </span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {acceptedDonors.length} / {req.requiredUnits} donors
                </span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress >= 100 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {req.status === 'completed' && (
                <div className="flex items-center gap-2 mt-2.5 text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="font-medium">Enough donors found! Request completed.</span>
                </div>
              )}
            </div>

            {/* ── Accepted Donors List ── */}
            {acceptedDonors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Donors ({acceptedDonors.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {acceptedDonors.map((d: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-1.5"
                    >
                      <div className="w-6 h-6 rounded-full bg-red-500 overflow-hidden flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {d.donor?.avatar ? (
                          <img
                            src={d.donor.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          d.donor?.name?.[0]?.toUpperCase() ?? '?'
                        )}
                      </div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">
                        {d.donor?.name || 'Donor'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Action Buttons ── */}
            {user && !isOwner && req.status === 'active' && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                {myResponse ? (
                  <div
                    className={`flex items-center gap-2.5 p-4 rounded-xl text-sm font-medium ${
                      myResponse.status === 'accepted'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {myResponse.status === 'accepted' ? (
                      <>
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        You have accepted to donate. Please contact the requester.
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 shrink-0" />
                        You rejected this request.
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      আপনার ব্লাড গ্রুপ ম্যাচ করলে রক্ত দিতে রাজি হোন:
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => respondMutation.mutate('accept')}
                        disabled={respondMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold transition-all disabled:opacity-60"
                      >
                        {respondMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        রক্ত দিতে রাজি আছি
                      </button>
                      <button
                        onClick={() => respondMutation.mutate('reject')}
                        disabled={respondMutation.isPending}
                        className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-60"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Emergency Contact ── */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-red-500 font-semibold uppercase tracking-wide">
                  Emergency Contact
                </p>
                <a
                  href={`tel:${req.contact}`}
                  className="text-lg font-bold text-red-700 dark:text-red-400 hover:underline"
                >
                  {req.contact}
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
      <MainFooter />
    </div>
  );
}
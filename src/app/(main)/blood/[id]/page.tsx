'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import  MainNavbar  from '@/components/layout/Navbar';
import  MainFooter  from '@/components/layout/Footer';
import  useAuthStore  from '@/store/authStore';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import { Droplets, MapPin, Phone, Clock, CheckCircle, XCircle, AlertTriangle, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

const BG_COLORS: Record<string, string> = {
  'A+': 'bg-red-500', 'A-': 'bg-red-700', 'B+': 'bg-blue-500', 'B-': 'bg-blue-700',
  'O+': 'bg-green-500', 'O-': 'bg-green-700', 'AB+': 'bg-purple-500', 'AB-': 'bg-purple-700',
};

const URGENCY_LABEL: Record<string, string> = {
  normal: 'Normal', urgent: '⚠️ Urgent', critical: '🚨 Critical',
};

export default function BloodRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['blood-request', id],
    queryFn: () => api.get(`/blood/requests/${id}`).then(r => r.data),
    enabled: !!id,
    refetchInterval: 15000,
  });

  const respondMutation = useMutation({
    mutationFn: (action: string) => api.post(`/blood/requests/${id}/respond`, { action }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['blood-request', id] });
      toast.success(res.data.completed ? '🎉 পর্যাপ্ত ডোনার পাওয়া গেছে!' : 'সাড়া দেওয়া হয়েছে');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Already responded'),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  const req = data?.request;
  if (!req) return null;

  const acceptedDonors = req.acceptedDonors?.filter((d: any) => d.status === 'accepted') || [];
  const myResponse = req.acceptedDonors?.find((d: any) =>
    (d.donor?._id || d.donor) === user?._id
  );
  const progress = Math.min(100, Math.round((acceptedDonors.length / req.requiredUnits) * 100));
  const isOwner = (req.requester?._id || req.requester) === user?._id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      <div className="max-w-3xl mx-auto px-4 py-8 lg:mt-8">
        {/* Back */}
        <Link href="/blood" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Requests
        </Link>

        <div className="card overflow-hidden">
          {/* Header */}
          <div className={`p-5 text-white ${req.urgency === 'critical' ? 'bg-red-600' : req.urgency === 'urgent' ? 'bg-orange-500' : 'bg-red-500'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl ${BG_COLORS[req.bloodGroup] || 'bg-red-700'} flex items-center justify-center text-white font-black text-2xl border-2 border-white/30`}>
                  {req.bloodGroup}
                </div>
                <div>
                  <h1 className="text-xl font-bold">{req.patientName}</h1>
                  <span className="text-red-100 text-sm">{URGENCY_LABEL[req.urgency]}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                req.status === 'completed' ? 'bg-green-500' :
                req.status === 'active'    ? 'bg-white/20 border border-white/30' :
                'bg-black/20'
              }`}>
                {req.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: MapPin, label: 'Hospital', value: req.hospital },
                { icon: MapPin, label: 'Location', value: req.location },
                { icon: Phone,  label: 'Contact',  value: req.contact, link: `tel:${req.contact}` },
                { icon: Droplets, label: 'Required', value: `${req.requiredUnits} bags` },
                { icon: Clock, label: 'Posted', value: formatDistanceToNow(new Date(req.createdAt), { addSuffix: true }) },
                ...(req.requiredBy ? [{ icon: Clock, label: 'Needed By', value: format(new Date(req.requiredBy), 'PPP') }] : []),
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2">
                  <item.icon className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    {item.link
                      ? <a href={item.link} className="text-sm font-medium text-blue-600 hover:underline">{item.value}</a>
                      : <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>

            {req.description && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{req.description}</p>
              </div>
            )}

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Donor Progress</span>
                <span className="font-bold text-red-600">{acceptedDonors.length} / {req.requiredUnits} donors</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {req.status === 'completed' && (
                <div className="flex items-center gap-2 mt-2 text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Enough donors found! Request completed.</span>
                </div>
              )}
            </div>

            {/* Accepted donors list */}
            {acceptedDonors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Donors ({acceptedDonors.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {acceptedDonors.map((d: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-red-500 overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                        {d.donor?.avatar
                          ? <img src={d.donor.avatar} alt="" className="w-full h-full object-cover" />
                          : d.donor?.name?.[0]?.toUpperCase()
                        }
                      </div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">{d.donor?.name || 'Donor'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {user && !isOwner && req.status === 'active' && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                {myResponse ? (
                  <div className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium ${
                    myResponse.status === 'accepted'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                  }`}>
                    {myResponse.status === 'accepted'
                      ? <><CheckCircle className="w-5 h-5" /> You have accepted to donate blood. Please contact the requester.</>
                      : <><XCircle className="w-5 h-5" /> You rejected this request.</>
                    }
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
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition"
                      >
                        <CheckCircle className="w-5 h-5" /> রক্ত দিতে রাজি আছি
                      </button>
                      <button
                        onClick={() => respondMutation.mutate('reject')}
                        disabled={respondMutation.isPending}
                        className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Emergency contact highlight */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
              <Phone className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-xs text-red-500 font-medium">Emergency Contact</p>
                <a href={`tel:${req.contact}`} className="text-lg font-bold text-red-700 dark:text-red-400 hover:underline">
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

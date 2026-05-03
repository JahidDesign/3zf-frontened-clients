'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { formatDistanceToNow, format, parseISO, addMonths, isAfter } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Droplets, MapPin, Search, Heart, Users, Loader2, Phone,
  Calendar, ChevronDown, CheckCircle2, UserCircle2, Plus,
  Pencil, Trash2, X, AlertCircle, Clock, Mail,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Donor {
  _id: string;
  name: string;
  age: number;
  address: string;
  phone: string;
  email: string;
  bloodGroup: string;
  isAvailableForDonation: boolean;
  lastDonatedDate?: string | null;
  nextEligibleDate?: string | null;
  totalDonations?: number;
  createdAt: string;
}

interface DonorsResponse {
  donors: Donor[];
  total: number;
}

type DonorFormData = Omit<Donor, '_id' | 'createdAt' | 'nextEligibleDate'>;

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
type BloodGroup = typeof BLOOD_GROUPS[number];

const BG_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  'A+':  { bg: 'bg-red-500',     text: 'text-white', ring: 'ring-red-400'     },
  'A-':  { bg: 'bg-red-700',     text: 'text-white', ring: 'ring-red-600'     },
  'B+':  { bg: 'bg-blue-500',    text: 'text-white', ring: 'ring-blue-400'    },
  'B-':  { bg: 'bg-blue-700',    text: 'text-white', ring: 'ring-blue-600'    },
  'O+':  { bg: 'bg-emerald-500', text: 'text-white', ring: 'ring-emerald-400' },
  'O-':  { bg: 'bg-emerald-700', text: 'text-white', ring: 'ring-emerald-600' },
  'AB+': { bg: 'bg-purple-500',  text: 'text-white', ring: 'ring-purple-400'  },
  'AB-': { bg: 'bg-purple-700',  text: 'text-white', ring: 'ring-purple-600'  },
};

const DONATION_GAP_MONTHS = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 ' +
  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all';

const inputErrCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-red-400 ' +
  'bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-white text-sm ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all';

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function BloodBadge({ group }: { group: string }) {
  const c = BG_COLORS[group] ?? BG_COLORS['A+'];
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${c.bg} text-white text-xs font-black shadow-sm`}>
      {group}
    </span>
  );
}

function Avatar({ donor }: { donor: Donor }) {
  const c = BG_COLORS[donor.bloodGroup] ?? BG_COLORS['A+'];
  return (
    <div className={`w-9 h-9 rounded-full ${c.bg} flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-white dark:ring-gray-900`}>
      {donor.name?.[0]?.toUpperCase()}
    </div>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({ donor, onConfirm, onClose, isPending }: {
  donor: Donor; onConfirm: () => void; onClose: () => void; isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">ডোনার মুছে ফেলুন</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-5 flex items-center gap-3">
          <Avatar donor={donor} />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{donor.name}</p>
            <p className="text-xs text-gray-400">{donor.bloodGroup} · {donor.phone}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            বাতিল
          </button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            মুছে ফেলুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Donor Form Modal (Add / Edit) ────────────────────────────────────────────

function DonorFormModal({ donor, onClose }: { donor?: Donor; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!donor;

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<DonorFormData>({
    defaultValues: donor
      ? {
          name:                   donor.name,
          age:                    donor.age,
          address:                donor.address,
          phone:                  donor.phone,
          email:                  donor.email,
          bloodGroup:             donor.bloodGroup,
          isAvailableForDonation: donor.isAvailableForDonation,
          lastDonatedDate:        donor.lastDonatedDate
            ? format(parseISO(donor.lastDonatedDate), 'yyyy-MM-dd')
            : '',
          totalDonations: donor.totalDonations ?? 0,
        }
      : {
          name: '', age: '' as any, address: '', phone: '', email: '',
          bloodGroup: '', isAvailableForDonation: true,
          lastDonatedDate: '', totalDonations: 0,
        },
  });

  const watchedBg   = watch('bloodGroup');
  const watchedDate = watch('lastDonatedDate');

  const nextEligible = watchedDate
    ? addMonths(parseISO(watchedDate), DONATION_GAP_MONTHS)
    : null;
  const isEligible = nextEligible ? !isAfter(nextEligible, new Date()) : true;

  const mutation = useMutation({
    mutationFn: (data: DonorFormData) => {
      const payload = {
        ...data,
        age: Number(data.age),
        lastDonatedDate:  data.lastDonatedDate || null,
        nextEligibleDate: data.lastDonatedDate
          ? addMonths(parseISO(data.lastDonatedDate), DONATION_GAP_MONTHS).toISOString()
          : null,
      };
      return isEdit
        ? api.patch(`/blood/donors/${donor!._id}`, payload)
        : api.post('/blood/donors', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blood-donors-page'] });
      toast.success(isEdit ? 'ডোনার তথ্য আপডেট হয়েছে।' : 'নতুন ডোনার যোগ করা হয়েছে।');
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed. Please try again.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-xl my-4">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              {isEdit ? <Pencil className="w-4 h-4 text-red-500" /> : <Plus className="w-4 h-4 text-red-500" />}
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              {isEdit ? 'ডোনার তথ্য সম্পাদনা' : 'নতুন ডোনার যোগ করুন'}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="p-5 space-y-4">

          {/* Name + Age */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="পূর্ণ নাম" required error={errors.name?.message}>
              <input {...register('name', { required: 'নাম আবশ্যক', minLength: { value: 2, message: 'কমপক্ষে ২ অক্ষর' } })}
                placeholder="মোহাম্মদ রফিকুল..."
                className={errors.name ? inputErrCls : inputCls} />
            </Field>
            <Field label="বয়স" required error={errors.age?.message}>
              <input {...register('age', {
                required: 'বয়স আবশ্যক',
                min: { value: 18, message: 'কমপক্ষে ১৮' },
                max: { value: 65, message: 'সর্বোচ্চ ৬৫' },
                valueAsNumber: true,
              })}
                type="number" min={18} max={65} placeholder="25"
                className={errors.age ? inputErrCls : inputCls} />
            </Field>
          </div>

          {/* Address */}
          <Field label="ঠিকানা" required error={errors.address?.message}>
            <textarea {...register('address', { required: 'ঠিকানা আবশ্যক', minLength: { value: 5, message: 'সম্পূর্ণ ঠিকানা' } })}
              rows={2} placeholder="গ্রাম/এলাকা, উপজেলা, জেলা"
              className={`${errors.address ? inputErrCls : inputCls} resize-none`} />
          </Field>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="মোবাইল নম্বর" required error={errors.phone?.message}>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input {...register('phone', {
                  required: 'মোবাইল আবশ্যক',
                  pattern: { value: /^(?:\+?88)?01[3-9]\d{8}$/, message: 'সঠিক নম্বর দিন' },
                })}
                  type="tel" placeholder="01XXXXXXXXX"
                  className={`${errors.phone ? inputErrCls : inputCls} pl-9`} />
              </div>
            </Field>
            <Field label="ইমেইল" required error={errors.email?.message}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input {...register('email', {
                  required: 'ইমেইল আবশ্যক',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'সঠিক ইমেইল' },
                })}
                  type="email" placeholder="example@mail.com"
                  className={`${errors.email ? inputErrCls : inputCls} pl-9`} />
              </div>
            </Field>
          </div>

          {/* Blood group */}
          <Field label="রক্তের গ্রুপ" required error={errors.bloodGroup?.message}>
            <div className="grid grid-cols-8 gap-1.5">
              {BLOOD_GROUPS.map((bg) => {
                const c = BG_COLORS[bg];
                return (
                  <label key={bg} className="cursor-pointer">
                    <input type="radio" {...register('bloodGroup', { required: 'রক্তের গ্রুপ নির্বাচন করুন' })}
                      value={bg} className="sr-only" />
                    <div className={`py-2.5 rounded-xl text-xs font-black text-center transition-all border-2 ${
                      watchedBg === bg
                        ? `${c.bg} text-white border-transparent shadow-md scale-105`
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                      {bg}
                    </div>
                  </label>
                );
              })}
            </div>
          </Field>

          {/* Last donated + total donations */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="সর্বশেষ রক্তদান" error={errors.lastDonatedDate?.message}>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input {...register('lastDonatedDate', {
                  validate: (v) => {
                    if (!v) return true;
                    if (isAfter(parseISO(v), new Date())) return 'ভবিষ্যৎ তারিখ নয়';
                    return true;
                  },
                })}
                  type="date" max={format(new Date(), 'yyyy-MM-dd')}
                  className={`${errors.lastDonatedDate ? inputErrCls : inputCls} pl-9`} />
              </div>
            </Field>
            <Field label="মোট দান সংখ্যা">
              <input {...register('totalDonations', { min: 0, valueAsNumber: true })}
                type="number" min={0} placeholder="0"
                className={inputCls} />
            </Field>
          </div>

          {/* Eligibility hint */}
          {watchedDate && (
            <div className={`flex items-center gap-2.5 p-3 rounded-xl text-xs border ${
              isEligible
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
            }`}>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {isEligible
                ? '✅ এখন রক্ত দিতে যোগ্য'
                : `⏳ পরবর্তী যোগ্য: ${nextEligible ? format(nextEligible, 'dd MMM yyyy') : '—'}`
              }
            </div>
          )}

          {/* Availability */}
          <Field label="উপলব্ধতা">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'true',  label: '✅ এখন উপলব্ধ' },
                { value: 'false', label: '⏸ অনুপলব্ধ' },
              ].map(({ value, label }) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio"
                    {...register('isAvailableForDonation')}
                    value={value}
                    defaultChecked={value === 'true'}
                    className="sr-only" />
                  <div className={`p-3 rounded-xl border-2 text-sm font-semibold text-center transition-all ${
                    String(watch('isAvailableForDonation')) === value
                      ? value === 'true'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'border-gray-400 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                  }`}>
                    {label}
                  </div>
                </label>
              ))}
            </div>
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              বাতিল
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {mutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> সংরক্ষণ হচ্ছে...</>
                : <><Heart className="w-4 h-4" /> {isEdit ? 'আপডেট করুন' : 'যোগ করুন'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DonorsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const isAdmin = user && ['admin', 'superadmin'].includes((user as any).role);

  const [bgFilter, setBgFilter]       = useState('');
  const [search,   setSearch]         = useState('');
  const [sortBy,   setSortBy]         = useState<'name' | 'bloodGroup' | 'age' | 'address'>('name');
  const [showForm, setShowForm]       = useState(false);
  const [editDonor, setEditDonor]     = useState<Donor | null>(null);
  const [deleteDonor, setDeleteDonor] = useState<Donor | null>(null);

  // ── Query ──────────────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery<DonorsResponse>({
    queryKey: ['blood-donors-page', bgFilter],
    queryFn: () =>
      api.get('/blood/donors', {
        params: { bloodGroup: bgFilter || undefined },
      }).then((r) => r.data),
  });

  // ── Toggle availability (own user) ────────────────────────────────────────

  const toggleMutation = useMutation({
    mutationFn: () => api.patch<{ isAvailable: boolean }>('/blood/toggle-availability'),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['blood-donors-page'] });
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success(res.data.isAvailable ? '✅ আপনি এখন ডোনার হিসেবে উপলব্ধ' : 'ডোনার তালিকা থেকে সরা হয়েছে');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  // ── Delete mutation ────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/blood/donors/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blood-donors-page'] });
      toast.success('ডোনার মুছে ফেলা হয়েছে।');
      setDeleteDonor(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  // ── Derived data ───────────────────────────────────────────────────────────

  const donors = (data?.donors ?? [])
    .filter((d) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.bloodGroup.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.email.toLowerCase().includes(q) ||
        String(d.age).includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'bloodGroup') return a.bloodGroup.localeCompare(b.bloodGroup);
      if (sortBy === 'address')    return a.address.localeCompare(b.address);
      if (sortBy === 'age')        return a.age - b.age;
      return a.name.localeCompare(b.name);
    });

  const stats = BLOOD_GROUPS.map((bg) => ({
    group: bg,
    count: (data?.donors ?? []).filter((d) => d.bloodGroup === bg).length,
  })).filter((s) => s.count > 0);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Blood Donors</h1>
                <p className="text-red-100 text-sm mt-0.5">
                  {data?.donors?.length ?? 0} জন ডোনার নিবন্ধিত
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Own availability toggle */}
              {(user as any)?.bloodGroup && (
                <button
                  onClick={() => toggleMutation.mutate()}
                  disabled={toggleMutation.isPending}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    (user as any).isAvailableForDonation
                      ? 'bg-white text-red-600 hover:bg-red-50'
                      : 'bg-white/15 hover:bg-white/25 text-white border border-white/30'
                  }`}
                >
                  {toggleMutation.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Heart className={`w-4 h-4 ${(user as any).isAvailableForDonation ? 'fill-red-500 text-red-500' : ''}`} />
                  }
                  {(user as any).isAvailableForDonation
                    ? `✅ Available (${(user as any).bloodGroup})`
                    : 'Become a Donor'}
                </button>
              )}

              {/* Add donor (admin only) */}
              {isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-red-600 hover:bg-red-50 text-sm font-bold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  ডোনার যোগ করুন
                </button>
              )}
            </div>
          </div>

          {/* Blood group stats chips */}
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {stats.map(({ group, count }) => {
                const c = BG_COLORS[group] ?? BG_COLORS['A+'];
                return (
                  <button key={group}
                    onClick={() => setBgFilter(bgFilter === group ? '' : group)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 ${
                      bgFilter === group
                        ? 'bg-white text-gray-900 border-white'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded ${c.bg} flex items-center justify-center text-white text-[9px] font-black`}>
                      {group.replace(/[+-]/, '')}
                    </span>
                    {group}
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${bgFilter === group ? 'bg-gray-100 text-gray-600' : 'bg-white/20 text-white'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Filters ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম, ফোন, ইমেইল, ঠিকানা, বয়স..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={() => setBgFilter('')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  !bgFilter ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}>
                সব
              </button>
              {BLOOD_GROUPS.map((bg) => (
                <button key={bg} onClick={() => setBgFilter(bgFilter === bg ? '' : bg)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    bgFilter === bg
                      ? `${BG_COLORS[bg].bg} text-white`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}>
                  {bg}
                </button>
              ))}
            </div>
            <div className="relative">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all cursor-pointer">
                <option value="name">নাম অনুযায়ী</option>
                <option value="bloodGroup">রক্তের গ্রুপ</option>
                <option value="age">বয়স অনুযায়ী</option>
                <option value="address">ঠিকানা অনুযায়ী</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        )}

        {/* ── Empty ── */}
        {!isLoading && donors.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-300" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {search || bgFilter ? 'কোনো ডোনার পাওয়া যায়নি।' : 'এখনো কোনো ডোনার নিবন্ধিত নেই।'}
            </p>
            {(search || bgFilter) && (
              <button onClick={() => { setSearch(''); setBgFilter(''); }}
                className="mt-3 text-sm text-red-500 hover:underline">
                ফিল্টার মুছুন
              </button>
            )}
          </div>
        )}

        {!isLoading && donors.length > 0 && (
          <>
            {/* ══ DESKTOP TABLE ══ */}
            <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">

              {/* Header */}
              <div className={`grid gap-3 px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${isAdmin ? 'grid-cols-[2fr_0.7fr_0.5fr_1.5fr_1.5fr_1.2fr_0.8fr_0.8fr_auto]' : 'grid-cols-[2fr_0.7fr_0.5fr_1.5fr_1.5fr_1.2fr_0.8fr_0.8fr]'}`}>
                <span>ডোনার</span>
                <span>গ্রুপ</span>
                <span>বয়স</span>
                <span>ঠিকানা</span>
                <span>যোগাযোগ</span>
                <span>শেষ দান</span>
                <span>পরবর্তী যোগ্য</span>
                <span>অবস্থা</span>
                {isAdmin && <span>কাজ</span>}
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {donors.map((donor) => {
                  const nextElig = donor.nextEligibleDate ? parseISO(donor.nextEligibleDate) : null;
                  const eligible = nextElig ? !isAfter(nextElig, new Date()) : true;

                  return (
                    <div key={donor._id}
                      className={`grid gap-3 px-5 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${isAdmin ? 'grid-cols-[2fr_0.7fr_0.5fr_1.5fr_1.5fr_1.2fr_0.8fr_0.8fr_auto]' : 'grid-cols-[2fr_0.7fr_0.5fr_1.5fr_1.5fr_1.2fr_0.8fr_0.8fr]'}`}>

                      {/* Donor name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar donor={donor} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{donor.name}</p>
                          <p className="text-xs text-gray-400 truncate">{donor.email}</p>
                        </div>
                      </div>

                      {/* Blood group */}
                      <div><BloodBadge group={donor.bloodGroup} /></div>

                      {/* Age */}
                      <div className="flex items-center gap-1">
                        <UserCircle2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{donor.age}</span>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{donor.address}</span>
                      </div>

                      {/* Phone */}
                      <div>
                        <a href={`tel:${donor.phone}`}
                          className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{donor.phone}</span>
                        </a>
                      </div>

                      {/* Last donated */}
                      <div>
                        {donor.lastDonatedDate ? (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(donor.lastDonatedDate), 'dd MMM yyyy')}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-gray-600">প্রথমবার</span>
                        )}
                      </div>

                      {/* Next eligible */}
                      <div>
                        {nextElig ? (
                          <span className={`text-xs flex items-center gap-1 font-medium ${eligible ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            <Clock className="w-3 h-3 shrink-0" />
                            {eligible ? 'যোগ্য' : format(nextElig, 'dd MMM')}
                          </span>
                        ) : (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">✅ যোগ্য</span>
                        )}
                      </div>

                      {/* Availability */}
                      <div>
                        {donor.isAvailableForDonation ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3" />উপলব্ধ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800">
                            অনুপলব্ধ
                          </span>
                        )}
                      </div>

                      {/* Actions (admin) */}
                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditDonor(donor)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteDonor(donor)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400">
                  {donors.length} জন ডোনার দেখানো হচ্ছে
                  {bgFilter ? ` · গ্রুপ: ${bgFilter}` : ''}
                  {search ? ` · খোঁজা: "${search}"` : ''}
                </p>
              </div>
            </div>

            {/* ══ MOBILE CARDS ══ */}
            <div className="md:hidden space-y-3">
              {donors.map((donor) => {
                const nextElig = donor.nextEligibleDate ? parseISO(donor.nextEligibleDate) : null;
                const eligible = nextElig ? !isAfter(nextElig, new Date()) : true;
                const c = BG_COLORS[donor.bloodGroup] ?? BG_COLORS['A+'];

                return (
                  <div key={donor._id}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className={`h-1.5 w-full ${c.bg}`} />
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar donor={donor} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{donor.name}</p>
                          <p className="text-xs text-gray-400 truncate">{donor.email}</p>
                        </div>
                        <BloodBadge group={donor.bloodGroup} />
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 shrink-0" />
                          <a href={`tel:${donor.phone}`} className="text-blue-500 hover:underline">{donor.phone}</a>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserCircle2 className="w-3 h-3 shrink-0" />
                          {donor.age} বছর
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{donor.address}</span>
                        </div>
                        {donor.lastDonatedDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 shrink-0" />
                            {format(parseISO(donor.lastDonatedDate), 'dd MMM yyyy')}
                          </div>
                        )}
                        {nextElig && (
                          <div className={`flex items-center gap-1.5 font-medium ${eligible ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            <Clock className="w-3 h-3 shrink-0" />
                            {eligible ? '✅ যোগ্য' : format(nextElig, 'dd MMM yyyy')}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        {donor.isAvailableForDonation ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3" />উপলব্ধ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800">
                            অনুপলব্ধ
                          </span>
                        )}

                        {isAdmin && (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setEditDonor(donor)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition-all">
                              <Pencil className="w-3 h-3" />সম্পাদনা
                            </button>
                            <button onClick={() => setDeleteDonor(donor)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-all">
                              <Trash2 className="w-3 h-3" />মুছুন
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <p className="text-center text-xs text-gray-400 pt-2">{donors.length} জন ডোনার</p>
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {(showForm || editDonor) && (
        <DonorFormModal
          donor={editDonor ?? undefined}
          onClose={() => { setShowForm(false); setEditDonor(null); }}
        />
      )}

      {deleteDonor && (
        <DeleteModal
          donor={deleteDonor}
          onClose={() => setDeleteDonor(null)}
          onConfirm={() => deleteMutation.mutate(deleteDonor._id)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
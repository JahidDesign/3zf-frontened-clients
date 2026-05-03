'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import toast from 'react-hot-toast';
import { addMonths, format, isAfter, parseISO } from 'date-fns';
import {
  Droplets, User, MapPin, Phone, Mail,
  Calendar, CheckCircle, ArrowRight, Heart,
  AlertCircle, Loader2, Clock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DonorFormData {
  /** Full legal name */
  name: string;
  /** Age in years (18–65) */
  age: number | '';
  /** Street / village / area + city/district */
  address: string;
  /** Mobile / phone number */
  phone: string;
  /** Email address */
  email: string;
  /** ABO+Rh blood group */
  bloodGroup: string;
  /** Is the donor currently willing to donate? */
  isAvailableForDonation: boolean;
  /** Date of most recent blood donation (ISO string, optional) */
  lastDonatedDate?: string;
}

export interface DonorRecord extends DonorFormData {
  _id: string;
  age: number;
  nextEligibleDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
type BloodGroup = typeof BLOOD_GROUPS[number];

const BG_STYLES: Record<BloodGroup, string> = {
  'A+':  'bg-red-500 hover:bg-red-600',
  'A-':  'bg-red-700 hover:bg-red-800',
  'B+':  'bg-blue-500 hover:bg-blue-600',
  'B-':  'bg-blue-700 hover:bg-blue-800',
  'O+':  'bg-emerald-500 hover:bg-emerald-600',
  'O-':  'bg-emerald-700 hover:bg-emerald-800',
  'AB+': 'bg-purple-500 hover:bg-purple-600',
  'AB-': 'bg-purple-700 hover:bg-purple-800',
};

const DONATION_GAP_MONTHS = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeEligibility(lastDonatedDate?: string) {
  if (!lastDonatedDate) return { nextDate: null, isEligible: true, daysLeft: 0 };
  const last = parseISO(lastDonatedDate);
  const next = addMonths(last, DONATION_GAP_MONTHS);
  const today = new Date();
  const isEligible = !isAfter(next, today);
  const daysLeft = isEligible
    ? 0
    : Math.ceil((next.getTime() - today.getTime()) / 86_400_000);
  return { nextDate: next, isEligible, daysLeft };
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label, required, error, children, hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Input style ──────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 ' +
  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm ' +
  'placeholder:text-gray-400 dark:placeholder:text-gray-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent ' +
  'transition-all duration-150';

const inputErrCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-red-400 ' +
  'bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-white text-sm ' +
  'placeholder:text-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-red-400 ' +
  'transition-all duration-150';

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  donor,
  onReset,
}: {
  donor: DonorRecord;
  onReset: () => void;
}) {
  const { nextDate, isEligible } = computeEligibility(donor.lastDonatedDate);
  const bg = BG_STYLES[donor.bloodGroup as BloodGroup] ?? 'bg-red-500';

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {/* Animated checkmark */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <span className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-900 flex items-center justify-center">
          <div className={`w-7 h-7 rounded-full ${bg.split(' ')[0]} flex items-center justify-center text-white text-xs font-black`}>
            {donor.bloodGroup}
          </div>
        </span>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        ডোনার নিবন্ধন সম্পন্ন!
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        {donor.name}-এর তথ্য সফলভাবে সংরক্ষিত হয়েছে।
      </p>

      {/* Summary card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 text-left space-y-3 mb-6 shadow-sm">
        {[
          { label: 'নাম',          value: donor.name },
          { label: 'বয়স',          value: `${donor.age} বছর` },
          { label: 'রক্তের গ্রুপ', value: donor.bloodGroup },
          { label: 'ঠিকানা',       value: donor.address },
          { label: 'ফোন',          value: donor.phone },
          { label: 'ইমেইল',        value: donor.email },
          {
            label: 'সর্বশেষ রক্তদান',
            value: donor.lastDonatedDate
              ? format(parseISO(donor.lastDonatedDate), 'dd MMM yyyy')
              : 'প্রথমবার দেবেন',
          },
          ...(nextDate
            ? [{
                label: 'পরবর্তী যোগ্য তারিখ',
                value: `${format(nextDate, 'dd MMM yyyy')} ${isEligible ? '✅ এখন যোগ্য' : '⏳ ' + computeEligibility(donor.lastDonatedDate).daysLeft + ' দিন বাকি'}`,
              }]
            : []),
          {
            label: 'অবস্থা',
            value: donor.isAvailableForDonation ? '✅ উপলব্ধ' : '⏸ অনুপলব্ধ',
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-4 text-sm">
            <span className="text-gray-400 dark:text-gray-500 shrink-0">{label}</span>
            <span className="font-semibold text-gray-900 dark:text-white text-right">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onReset}
          className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          নতুন ডোনার যোগ করুন
        </button>
      </div>
    </div>
  );
}

// ─── Main form component ──────────────────────────────────────────────────────

export default function DonorRegistrationPage() {
  const [savedDonor, setSavedDonor] = useState<DonorRecord | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DonorFormData>({
    defaultValues: {
      name:                   '',
      age:                    '',
      address:                '',
      phone:                  '',
      email:                  '',
      bloodGroup:             '',
      isAvailableForDonation: true,
      lastDonatedDate:        '',
    },
  });

  const watchedBloodGroup  = watch('bloodGroup');
  const watchedLastDonated = watch('lastDonatedDate');
  const watchedAvailable   = watch('isAvailableForDonation');
  const watchedAge         = watch('age');

  const eligibility = useMemo(
    () => computeEligibility(watchedLastDonated),
    [watchedLastDonated],
  );

  // ── Mutation ───────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (data: DonorFormData) =>
      api.post<DonorRecord>('/donors', {
        ...data,
        age: Number(data.age),
        nextEligibleDate: data.lastDonatedDate
          ? addMonths(parseISO(data.lastDonatedDate), DONATION_GAP_MONTHS).toISOString()
          : null,
      }),
    onSuccess: (res) => setSavedDonor(res.data),
    onError: (e: any) =>
      toast.error(e.response?.data?.message || 'Registration failed. Please try again.'),
  });

  const onSubmit = (data: DonorFormData) => mutation.mutate(data);

  const handleReset = () => {
    reset();
    setSavedDonor(null);
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (savedDonor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <MainNavbar />
        <SuccessScreen donor={savedDonor} onReset={handleReset} />
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />

      {/* Hero strip */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-8 lg:mt-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">ডোনার নিবন্ধন</h1>
              <p className="text-red-100 text-sm mt-0.5">
                Donor Registration — রক্ত দিন, জীবন বাঁচান
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT: Main fields (2 cols wide on lg) ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Personal info card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-1">
                  <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-red-500" />
                  </div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                    ব্যক্তিগত তথ্য
                  </h2>
                </div>

                {/* Full name */}
                <Field label="পূর্ণ নাম" required error={errors.name?.message}>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      {...register('name', {
                        required: 'নাম আবশ্যক',
                        minLength: { value: 2, message: 'নাম কমপক্ষে ২ অক্ষর হতে হবে' },
                        maxLength: { value: 80, message: 'নাম ৮০ অক্ষরের বেশি হবে না' },
                      })}
                      placeholder="যেমন: মোহাম্মদ রফিকুল ইসলাম"
                      className={`${errors.name ? inputErrCls : inputCls} pl-9`}
                    />
                  </div>
                </Field>

                {/* Age */}
                <Field
                  label="বয়স"
                  required
                  error={errors.age?.message}
                  hint="রক্তদাতার বয়স ১৮ থেকে ৬৫ বছরের মধ্যে হতে হবে"
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      {...register('age', {
                        required: 'বয়স আবশ্যক',
                        min:      { value: 18, message: 'রক্তদাতার বয়স কমপক্ষে ১৮ হতে হবে' },
                        max:      { value: 65, message: 'বয়স ৬৫-এর বেশি হওয়া উচিত নয়' },
                        valueAsNumber: true,
                        validate: (v) =>
                          v === '' || (!isNaN(Number(v)) && Number(v) >= 18 && Number(v) <= 65)
                            ? true
                            : 'সঠিক বয়স দিন (১৮–৬৫)',
                      })}
                      type="number"
                      min={18}
                      max={65}
                      placeholder="যেমন: 25"
                      className={`${errors.age ? inputErrCls : inputCls} pl-9`}
                    />
                  </div>
                </Field>

                {/* Address */}
                <Field label="ঠিকানা" required error={errors.address?.message}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    <textarea
                      {...register('address', {
                        required: 'ঠিকানা আবশ্যক',
                        minLength: { value: 5, message: 'সম্পূর্ণ ঠিকানা লিখুন' },
                      })}
                      rows={2}
                      placeholder="গ্রাম/এলাকা, উপজেলা, জেলা"
                      className={`${errors.address ? inputErrCls : inputCls} pl-9 resize-none`}
                    />
                  </div>
                </Field>

                {/* Phone + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="মোবাইল নম্বর" required error={errors.phone?.message}>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        {...register('phone', {
                          required: 'মোবাইল নম্বর আবশ্যক',
                          pattern: {
                            value: /^(?:\+?88)?01[3-9]\d{8}$/,
                            message: 'সঠিক বাংলাদেশি নম্বর দিন',
                          },
                        })}
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        className={`${errors.phone ? inputErrCls : inputCls} pl-9`}
                      />
                    </div>
                  </Field>

                  <Field label="ইমেইল" required error={errors.email?.message}>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        {...register('email', {
                          required: 'ইমেইল আবশ্যক',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'সঠিক ইমেইল দিন',
                          },
                        })}
                        type="email"
                        placeholder="example@mail.com"
                        className={`${errors.email ? inputErrCls : inputCls} pl-9`}
                      />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Blood info card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-1">
                  <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-red-500" />
                  </div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                    রক্তদান তথ্য
                  </h2>
                </div>

                {/* Blood group picker */}
                <Field label="রক্তের গ্রুপ" required error={errors.bloodGroup?.message}>
                  <Controller
                    name="bloodGroup"
                    control={control}
                    rules={{ required: 'রক্তের গ্রুপ নির্বাচন করুন' }}
                    render={({ field }) => (
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {BLOOD_GROUPS.map((bg) => {
                          const active = field.value === bg;
                          const baseStyle = BG_STYLES[bg];
                          return (
                            <button
                              type="button"
                              key={bg}
                              onClick={() => field.onChange(bg)}
                              className={`py-2.5 rounded-xl text-sm font-black transition-all duration-150 border-2 ${
                                active
                                  ? `${baseStyle} text-white border-transparent shadow-md scale-105`
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              {bg}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                </Field>

                {/* Last donation date */}
                <Field
                  label="সর্বশেষ রক্তদানের তারিখ"
                  error={errors.lastDonatedDate?.message}
                  hint="প্রথমবার রক্ত দিলে খালি রাখুন"
                >
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      {...register('lastDonatedDate', {
                        validate: (val) => {
                          if (!val) return true;
                          const d = parseISO(val);
                          if (isAfter(d, new Date())) return 'ভবিষ্যৎ তারিখ দেওয়া যাবে না';
                          return true;
                        },
                      })}
                      type="date"
                      max={format(new Date(), 'yyyy-MM-dd')}
                      className={`${errors.lastDonatedDate ? inputErrCls : inputCls} pl-9`}
                    />
                  </div>
                </Field>

                {/* Eligibility preview */}
                {watchedLastDonated && (
                  <div
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${
                      eligibility.isEligible
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      {eligibility.isEligible ? (
                        <p className="font-semibold">✅ এখন রক্ত দিতে যোগ্য</p>
                      ) : (
                        <>
                          <p className="font-semibold">
                            ⏳ {eligibility.daysLeft} দিন পর যোগ্য হবেন
                          </p>
                          <p className="text-xs mt-0.5 opacity-80">
                            পরবর্তী যোগ্য তারিখ:{' '}
                            {eligibility.nextDate
                              ? format(eligibility.nextDate, 'dd MMM yyyy')
                              : '—'}
                          </p>
                        </>
                      )}
                      <p className="text-xs mt-1 opacity-70">
                        রক্তদানের মধ্যে কমপক্ষে {DONATION_GAP_MONTHS} মাসের বিরতি আবশ্যক।
                      </p>
                    </div>
                  </div>
                )}

                {/* Availability toggle */}
                <Field label="রক্তদানে উপলব্ধতা">
                  <Controller
                    name="isAvailableForDonation"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: true,  label: '✅ এখন উপলব্ধ',   desc: 'রক্তের অনুরোধ আসলে নোটিফিকেশন পাবেন' },
                          { value: false, label: '⏸ এখন অনুপলব্ধ', desc: 'পরে সক্রিয় করতে পারবেন' },
                        ].map(({ value, label, desc }) => (
                          <button
                            type="button"
                            key={String(value)}
                            onClick={() => field.onChange(value)}
                            className={`p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                              field.value === value
                                ? value
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-gray-400 bg-gray-50 dark:bg-gray-800'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <p className={`text-sm font-semibold ${
                              field.value === value
                                ? value ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {label}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </Field>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-[0.99] text-white text-base font-bold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    ডোনার হিসেবে নিবন্ধন করুন
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </>
                )}
              </button>
            </div>

            {/* ── RIGHT: Live preview card ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">

                {/* Preview card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  {/* Color strip */}
                  <div
                    className={`h-2 w-full transition-all duration-300 ${
                      watchedBloodGroup
                        ? BG_STYLES[watchedBloodGroup as BloodGroup]?.split(' ')[0] ?? 'bg-gray-200'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />

                  <div className="p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      ডোনার প্রিভিউ
                    </p>

                    {/* Avatar placeholder */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0 transition-all duration-300 ${
                          watchedBloodGroup
                            ? BG_STYLES[watchedBloodGroup as BloodGroup]?.split(' ')[0]
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        {watchedBloodGroup || <User className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {watch('name') || <span className="text-gray-300 dark:text-gray-600 font-normal">নাম...</span>}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {watch('address') || <span className="text-gray-300 dark:text-gray-600">ঠিকানা...</span>}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {[
                        {
                          icon: User,
                          label: 'বয়স',
                          value: watchedAge ? `${watchedAge} বছর` : '—',
                          color: 'text-gray-400',
                        },
                        {
                          icon: Phone,
                          label: 'ফোন',
                          value: watch('phone') || '—',
                          color: 'text-gray-400',
                        },
                        {
                          icon: Mail,
                          label: 'ইমেইল',
                          value: watch('email') || '—',
                          color: 'text-gray-400',
                        },
                        {
                          icon: Calendar,
                          label: 'শেষ দান',
                          value: watchedLastDonated
                            ? format(parseISO(watchedLastDonated), 'dd MMM yyyy')
                            : 'প্রথমবার',
                          color: 'text-gray-400',
                        },
                        ...(eligibility.nextDate
                          ? [{
                              icon: Clock,
                              label: 'পরবর্তী যোগ্য',
                              value: format(eligibility.nextDate, 'dd MMM yyyy'),
                              color: eligibility.isEligible ? 'text-green-500' : 'text-amber-500',
                            }]
                          : []),
                      ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
                          <span className="text-gray-400 w-20 shrink-0">{label}</span>
                          <span className="text-gray-700 dark:text-gray-300 truncate font-medium">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          watchedAvailable
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {watchedAvailable ? '✅ উপলব্ধ' : '⏸ অনুপলব্ধ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DB fields info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
                    📦 Database Fields
                  </p>
                  <div className="space-y-1">
                    {[
                      'name', 'age', 'address', 'phone', 'email',
                      'bloodGroup', 'isAvailableForDonation',
                      'lastDonatedDate', 'nextEligibleDate',
                      'createdAt', 'updatedAt',
                    ].map((f) => (
                      <p key={f} className="text-xs font-mono text-blue-600 dark:text-blue-300">
                        {f}
                      </p>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import toast from 'react-hot-toast';
import { Droplets, CheckCircle, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

interface FormData {
  patientName: string;
  bloodGroup: string;
  hospital: string;
  location: string;
  contact: string;
  requiredUnits: number;
  urgency: string;
  description?: string;
  requiredBy?: string;
}

export default function CreateBloodRequestPage() {
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { requiredUnits: 1, urgency: 'normal' },
  });

  // FIX: correct generic for mutation — api.post returns AxiosResponse
  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      api.post<{ request: any; message?: string }>('/blood/requests', data),
    onSuccess: () => setDone(true),
    onError: (e: any) =>
      toast.error(e.response?.data?.message || 'Failed to submit request'),
  });

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <MainNavbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            অনুরোধ জমা হয়েছে!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            অ্যাডমিন অনুমোদনের পর ম্যাচিং ডোনারদের নোটিফিকেশন পাঠানো হবে।
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/blood"
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              View Requests
            </Link>
            <button
              onClick={() => {
                setDone(false);
                reset();
              }}
              className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all"
            >
              New Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      <div className="max-w-2xl mx-auto px-4 py-8 lg:mt-8">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/blood"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              রক্তের অনুরোধ করুন
            </h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">

          {/* Notice */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
              অনুরোধ অ্যাডমিন পর্যালোচনা করবেন। অনুমোদনের পর ম্যাচিং ডোনারদের নোটিফিকেশন
              পাঠানো হবে।
            </p>
          </div>

          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="space-y-5"
          >

            {/* Blood group + urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  রক্তের গ্রুপ <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('bloodGroup', { required: 'Blood group is required' })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <p className="text-red-500 text-xs mt-1">{errors.bloodGroup.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  জরুরিত্ব <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('urgency')}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">⚠️ Urgent</option>
                  <option value="critical">🚨 Critical</option>
                </select>
              </div>
            </div>

            {/* Patient name + required units */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  রোগীর নাম <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('patientName', { required: 'Patient name is required' })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                  placeholder="Patient name"
                />
                {errors.patientName && (
                  <p className="text-red-500 text-xs mt-1">{errors.patientName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  প্রয়োজনীয় ব্যাগ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('requiredUnits', {
                    required: 'Required',
                    min: { value: 1, message: 'Minimum 1 bag' },
                    max: { value: 10, message: 'Maximum 10 bags' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  min={1}
                  max={10}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                />
                {errors.requiredUnits && (
                  <p className="text-red-500 text-xs mt-1">{errors.requiredUnits.message}</p>
                )}
              </div>
            </div>

            {/* Hospital */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                হাসপাতাল <span className="text-red-500">*</span>
              </label>
              <input
                {...register('hospital', { required: 'Hospital name is required' })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                placeholder="Hospital name"
              />
              {errors.hospital && (
                <p className="text-red-500 text-xs mt-1">{errors.hospital.message}</p>
              )}
            </div>

            {/* Location + contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  অবস্থান / জেলা <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('location', { required: 'Location is required' })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                  placeholder="City / District"
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  যোগাযোগ নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('contact', {
                    required: 'Contact number is required',
                    pattern: {
                      value: /^[0-9+\-\s()]{7,15}$/,
                      message: 'Enter a valid phone number',
                    },
                  })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                  placeholder="01XXXXXXXXX"
                  type="tel"
                />
                {errors.contact && (
                  <p className="text-red-500 text-xs mt-1">{errors.contact.message}</p>
                )}
              </div>
            </div>

            {/* Date needed by */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  প্রয়োজনের তারিখ (optional)
                </label>
                <input
                  {...register('requiredBy')}
                  type="date"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                বিস্তারিত (optional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none transition-all"
                placeholder="Additional information..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 active:scale-[0.99] text-white text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  জমা হচ্ছে...
                </>
              ) : (
                <>
                  <Droplets className="w-5 h-5" />
                  অনুরোধ পাঠান
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
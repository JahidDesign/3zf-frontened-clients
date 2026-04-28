'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import { useT } from '@/lib/i18n';
import toast from 'react-hot-toast';
import { Droplets, CheckCircle, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

interface FormData {
  patientName:   string;
  bloodGroup:    string;
  hospital:      string;
  location:      string;
  contact:       string;
  requiredUnits: number;
  urgency:       string;
  description?:  string;
  requiredBy?:   string;
}

export default function CreateBloodRequestPage() {
  const router = useRouter();
  const t = useT();
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { requiredUnits: 1, urgency: 'normal' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/blood/requests', data),
    onSuccess: () => setDone(true),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to submit'),
  });

  if (done) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      <div className="max-w-md mx-auto px-4 py-24 text-center ">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">অনুরোধ জমা হয়েছে!</h2>
        <p className="text-gray-500 mb-6">অ্যাডমিন অনুমোদনের পর ম্যাচিং ডোনারদের নোটিফিকেশন পাঠানো হবে।</p>
        <div className="flex gap-3 justify-center">
          <Link href="/blood" className="btn-secondary px-6">View Requests</Link>
          <button onClick={() => setDone(false)} className="btn-primary px-6">New Request</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      <div className="max-w-2xl mx-auto px-4 py-8 lg:mt-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/blood" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">রক্তের অনুরোধ করুন</h1>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">
              অনুরোধ অ্যাডমিন পর্যালোচনা করবেন। অনুমোদনের পর ম্যাচিং ডোনারদের নোটিফিকেশন পাঠানো হবে।
            </p>
          </div>

          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            {/* Blood group + urgency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">রক্তের গ্রুপ *</label>
                <select {...register('bloodGroup', { required: true })} className="input">
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
                {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">জরুরিত্ব *</label>
                <select {...register('urgency')} className="input">
                  <option value="normal">Normal</option>
                  <option value="urgent">⚠️ Urgent</option>
                  <option value="critical">🚨 Critical</option>
                </select>
              </div>
            </div>

            {/* Patient + units */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">রোগীর নাম *</label>
                <input {...register('patientName', { required: true })} className="input" placeholder="Patient name" />
                {errors.patientName && <p className="text-red-500 text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রয়োজনীয় ব্যাগ *</label>
                <input {...register('requiredUnits', { required: true, min: 1, max: 10 })} type="number" min="1" max="10" className="input" />
                {errors.requiredUnits && <p className="text-red-500 text-xs mt-1">1-10 bags</p>}
              </div>
            </div>

            {/* Hospital + location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">হাসপাতাল *</label>
              <input {...register('hospital', { required: true })} className="input" placeholder="Hospital name" />
              {errors.hospital && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">অবস্থান/জেলা *</label>
                <input {...register('location', { required: true })} className="input" placeholder="City / District" />
                {errors.location && <p className="text-red-500 text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">যোগাযোগ নম্বর *</label>
                <input {...register('contact', { required: true })} className="input" placeholder="01XXXXXXXXX" />
                {errors.contact && <p className="text-red-500 text-xs mt-1">Required</p>}
              </div>
            </div>

            {/* Date + description */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রয়োজনের তারিখ</label>
                <input {...register('requiredBy')} type="date" className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বিস্তারিত (ঐচ্ছিক)</label>
              <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Additional information..." />
            </div>

            <button type="submit" disabled={mutation.isPending}
              className="w-full btn-danger py-3 flex items-center justify-center gap-2 text-base font-bold">
              {mutation.isPending
                ? <><Loader2 className="w-5 h-5 animate-spin" />জমা হচ্ছে...</>
                : <><Droplets className="w-5 h-5" />অনুরোধ পাঠান</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}



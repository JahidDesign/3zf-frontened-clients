'use client';

import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Upload, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface FormValues {
  name: string;
  area: string;
  city: string;
  description: string;
  membershipFee: number;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateShopModal({ onClose, onSuccess }: Props) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { membershipFee: 200 } });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
      if (coverFile) fd.append('coverPhoto', coverFile);
      return api.post('/community-shop/create', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => setDone(true),
    onError: (e: any) => toast.error(e.response?.data?.message || 'ব্যর্থ হয়েছে'),
  });

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setCoverFile(f);
      setCoverPreview(URL.createObjectURL(f));
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'var(--color-bg)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-black text-base">নতুন শপ তৈরি</h2>
                <p className="text-violet-200 text-xs">আপনার এলাকায় কমিউনিটি শপ তৈরি করুন</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto max-h-[70vh]">
            {done ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-black mb-2" style={{ color: 'var(--color-text)' }}>
                  আবেদন সফল! 🎉
                </h3>
                <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                  অ্যাডমিন যাচাই করার পর শপটি তালিকায় যুক্ত হবে।
                </p>
                <button
                  onClick={onSuccess}
                  className="bg-violet-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-violet-700 transition"
                >
                  ঠিক আছে
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                {/* Cover photo */}
                <label className="block cursor-pointer">
                  <div
                    className="h-32 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition hover:border-violet-400"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-hover)' }}
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 mx-auto mb-1" style={{ color: 'var(--color-text-muted)' }} />
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>কভার ছবি আপলোড করুন (ঐচ্ছিক)</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleCover} />
                </label>

                {/* Fields */}
                {([
                  { name: 'name' as const,        label: 'শপের নাম *',   placeholder: 'যেমন: পূর্বপাড়া কমিউনিটি শপ', required: true },
                  { name: 'area' as const,        label: 'এলাকা *',       placeholder: 'মহল্লা / ওয়ার্ড',               required: true },
                  { name: 'city' as const,        label: 'শহর *',         placeholder: 'শহর / উপজেলা',                  required: true },
                ] as const).map(({ name, label, placeholder, required }) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}>
                      {label}
                    </label>
                    <input
                      {...register(name, { required })}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm transition focus:border-violet-400"
                      style={{
                        borderColor: errors[name] ? '#f43f5e' : 'var(--color-border)',
                        background: 'var(--color-bg)',
                        color: 'var(--color-text)',
                      }}
                    />
                    {errors[name] && <p className="text-red-500 text-xs mt-0.5">প্রয়োজন</p>}
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold mb-1"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    বিবরণ
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="শপ সম্পর্কে সংক্ষিপ্ত বিবরণ..."
                    className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm resize-none transition focus:border-violet-400"
                    style={{
                      borderColor: 'var(--color-border)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    সদস্যতা ফি (৳)
                  </label>
                  <input
                    {...register('membershipFee', { valueAsNumber: true, min: 0 })}
                    type="number"
                    className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm transition focus:border-violet-400"
                    style={{
                      borderColor: 'var(--color-border)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div className="pt-1 p-3 rounded-xl text-xs"
                  style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' }}>
                  ⚠️ আবেদনটি পেন্ডিং থাকবে। অ্যাডমিন যাচাই করার পর শপ তালিকায় যুক্ত হবে।
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                >
                  {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  আবেদন করুন
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
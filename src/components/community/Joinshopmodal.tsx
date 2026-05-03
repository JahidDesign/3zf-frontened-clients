'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Users, Phone, Upload, Loader2, CheckCircle, Clock,
  ChevronRight, Copy, Check,
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface Shop {
  _id: string;
  name: string;
  area: string;
  city: string;
  membershipFee: number;
  memberCount: number;
  coverPhoto?: { url: string };
}

interface FormValues {
  paymentMethod: 'bkash' | 'nagad' | 'rocket';
  paymentNumber: string;
  transactionId: string;
}

interface ConfigData {
  paymentNumbers?: { bkash: string; nagad: string; rocket: string };
  membershipFee?: number;
}

const PAYMENT_METHODS = [
  { id: 'bkash'  as const, label: 'bKash',  emoji: '💳' },
  { id: 'nagad'  as const, label: 'Nagad',  emoji: '💰' },
  { id: 'rocket' as const, label: 'Rocket', emoji: '🚀' },
] as const;

export default function JoinShopModal({
  shop,
  onClose,
  onSuccess,
}: {
  shop: Shop;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep]               = useState(0);
  const [photoFile, setPhotoFile]     = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [copied, setCopied]           = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  // FIX: fetch real payment numbers from config instead of hardcoded placeholders
  const { data: configData } = useQuery<ConfigData>({
    queryKey: ['community-shop-config'],
    queryFn:  () => api.get('/community-shop-config').then((r) => r.data),
  });

  // Check existing membership
  const { data: myMembershipData } = useQuery<{ membership?: { status: string; memberId?: string; transactionId?: string } }>({
    queryKey: ['my-community-membership', shop._id],
    queryFn:  () => api.get(`/community-shop/${shop._id}/my-membership`).then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { paymentMethod: 'bkash' } });

  const payMethod = watch('paymentMethod');

  // FIX: use real number from config; fall back to 01734166488
  const merchantNumber =
    configData?.paymentNumbers?.[payMethod] ?? '01734166488';

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const fd = new FormData();
      (Object.keys(data) as Array<keyof FormValues>).forEach((k) =>
        fd.append(k, data[k])
      );
      if (photoFile) fd.append('profilePhoto', photoFile);
      return api.post(`/community-shop/${shop._id}/join`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => setStep(2),
    onError:   (e: any) => toast.error(e.response?.data?.message ?? 'ব্যর্থ হয়েছে'),
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(merchantNumber);
    setCopied(true);
    toast.success('কপি হয়েছে!');
    setTimeout(() => setCopied(false), 2000);
  };

  const existing = myMembershipData?.membership;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 290, damping: 27 }}
          className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'var(--color-bg)' }}
        >
          {/* Cover header */}
          <div className="relative h-36 bg-gradient-to-br from-purple-500 to-fuchsia-600 overflow-hidden">
            {shop.coverPhoto?.url && (
              <img src={shop.coverPhoto.url} alt="" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-black text-lg">{shop.name}</p>
              <p className="text-white/80 text-xs flex items-center gap-1">
                <Users className="w-3 h-3" /> {shop.memberCount} সদস্য · {shop.area}, {shop.city}
              </p>
            </div>
          </div>

          <div className="p-5 overflow-y-auto max-h-[65vh]">

            {/* Already applied */}
            {existing ? (
              <div className="text-center py-6">
                {existing.status === 'approved' ? (
                  <>
                    <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                    <p className="font-black text-base" style={{ color: 'var(--color-text)' }}>
                      আপনি ইতোমধ্যে সদস্য!
                    </p>
                    <p className="text-sm mt-1 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      Member ID: {existing.memberId}
                    </p>
                    <button
                      onClick={onSuccess}
                      className="bg-purple-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-purple-700 transition"
                    >
                      শপে প্রবেশ করুন →
                    </button>
                  </>
                ) : (
                  <>
                    <Clock className="w-14 h-14 text-yellow-500 mx-auto mb-3" />
                    <p className="font-bold" style={{ color: 'var(--color-text)' }}>আবেদন প্রক্রিয়াধীন</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      TrxID: {existing.transactionId}
                    </p>
                    <button onClick={onClose} className="mt-4 text-sm text-purple-600 font-semibold">
                      বন্ধ করুন
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Step progress */}
                <div className="flex gap-2 mb-5">
                  {['তথ্য', 'পেমেন্ট', 'সম্পন্ন'].map((s, i) => (
                    <div key={i} className="flex-1">
                      <div
                        className={`h-1 rounded-full transition-all ${
                          i <= step ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                      <p
                        className={`text-[10px] mt-1 text-center font-medium ${i <= step ? 'text-purple-600' : ''}`}
                        style={{ color: i <= step ? undefined : 'var(--color-text-muted)' }}
                      >
                        {s}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Step 0 — Info */}
                {step === 0 && (
                  <div className="space-y-4">
                    {/* Profile photo */}
                    <div className="flex justify-center">
                      <label className="cursor-pointer">
                        <div
                          className="w-20 h-20 rounded-full border-2 border-dashed border-purple-300 hover:border-purple-500 flex items-center justify-center overflow-hidden transition"
                          style={{ background: 'var(--color-bg-hover)' }}
                        >
                          {photoPreview ? (
                            <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <Upload className="w-5 h-5 text-purple-400 mx-auto" />
                              <p className="text-[9px] text-purple-400 mt-0.5">ছবি</p>
                            </div>
                          )}
                        </div>
                        <input ref={photoRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
                      </label>
                    </div>

                    {/* Fee info */}
                    <div className="rounded-2xl p-4 text-center border-2 border-dashed border-purple-200 dark:border-purple-800">
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>সদস্যতা ফি</p>
                      <p className="text-4xl font-black text-purple-600">৳{shop.membershipFee}</p>
                      <p className="text-xs text-gray-400 mt-0.5">একবারের পেমেন্ট</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                    >
                      পরবর্তী <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Step 1 — Payment */}
                {step === 1 && (
                  <div className="space-y-4">
                    {/* Payment method selector */}
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_METHODS.map(({ id, label, emoji }) => (
                        <label
                          key={id}
                          className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition ${
                            payMethod === id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-[var(--color-border)]'
                          }`}
                        >
                          <input {...register('paymentMethod')} type="radio" value={id} hidden />
                          <span className="text-xl">{emoji}</span>
                          <span className="text-xs font-bold mt-1" style={{ color: 'var(--color-text)' }}>
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Merchant number */}
                    <div
                      className="rounded-xl p-3 flex items-center justify-between gap-2"
                      style={{ background: 'var(--color-bg-hover)' }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
                        <span className="font-mono font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                          {merchantNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={copyNumber}
                        className="flex items-center gap-1 flex-shrink-0 text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 transition"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'কপি!' : 'কপি'}
                      </button>
                    </div>

                    {/* Transaction fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                          পেমেন্ট নম্বর *
                        </label>
                        <input
                          {...register('paymentNumber', { required: true })}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                          style={{
                            borderColor: errors.paymentNumber ? '#f43f5e' : 'var(--color-border)',
                            background:  'var(--color-bg)',
                            color:       'var(--color-text)',
                          }}
                        />
                        {errors.paymentNumber && <p className="text-red-500 text-xs mt-0.5">প্রয়োজন</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                          Transaction ID *
                        </label>
                        <input
                          {...register('transactionId', { required: true })}
                          placeholder="TrxID"
                          className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm font-mono"
                          style={{
                            borderColor: errors.transactionId ? '#f43f5e' : 'var(--color-border)',
                            background:  'var(--color-bg)',
                            color:       'var(--color-text)',
                          }}
                        />
                        {errors.transactionId && <p className="text-red-500 text-xs mt-0.5">প্রয়োজন</p>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="flex-1 py-2.5 rounded-xl border font-semibold text-sm transition"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      >
                        ← পূর্ববর্তী
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit((d) => mutation.mutate(d))}
                        disabled={mutation.isPending}
                        className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                      >
                        {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        জমা দিন
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 — Done */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-black mb-2" style={{ color: 'var(--color-text)' }}>
                      আবেদন সফল! 🎉
                    </h3>
                    <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                      অ্যাডমিন যাচাই করার পর সদস্য হবেন এবং শপে প্রবেশ করতে পারবেন।
                    </p>
                    <button
                      onClick={onClose}
                      className="bg-purple-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-purple-700 transition"
                    >
                      ঠিক আছে
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
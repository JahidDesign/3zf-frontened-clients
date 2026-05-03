'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  X, Copy, Check, ShoppingBag, Star, Truck, Shield, Gift,
  Headphones, Zap, ChevronRight, Crown, Upload, Loader2,
  CheckCircle2, Clock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopConfig {
  membershipFee: number;
  paymentNumbers: { bkash: string; nagad: string; rocket: string };
  benefits: string[];
}

interface MembershipStatus {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  memberId?: string;
  paymentMethod: string;
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  name:          z.string().min(2, 'নাম কমপক্ষে ২ অক্ষর হতে হবে'),
  phone:         z.string().min(11, 'সঠিক মোবাইল নম্বর দিন').max(14),
  email:         z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  city:          z.string().min(2, 'শহর/জেলা লিখুন'),
  address:       z.string().min(5, 'ঠিকানা লিখুন').optional().or(z.literal('')),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket'], { required_error: 'পেমেন্ট পদ্ধতি বেছে নিন' }),
  paymentPhone:  z.string().min(11, 'পেমেন্ট নম্বর দিন').max(14),
  transactionId: z.string().min(4, 'Transaction ID দিন'),
  paymentAmount: z.string().refine(v => Number(v) >= 200, { message: 'পরিমাণ কমপক্ষে ২০০ টাকা' }),
});

type FormData = z.infer<typeof schema>;

// ─── Payment method config ────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { id: 'bkash',  label: 'bKash',  color: '#E2136E', bg: '#fce8f3' },
  { id: 'nagad',  label: 'Nagad',  color: '#F05829', bg: '#fef0ec' },
  { id: 'rocket', label: 'Rocket', color: '#8B3D8B', bg: '#f3eaf3' },
] as const;

const BENEFIT_ICONS = [Star, Truck, Shield, Gift, Headphones, Zap];

// ─── Component ────────────────────────────────────────────────────────────────

export function ShopMembershipModal({ isOpen, onClose }: Props) {
  const qc                          = useQueryClient();
  const [step, setStep]             = useState<'info' | 'form' | 'done'>('info');
  const [copied, setCopied]         = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef                     = useRef<HTMLInputElement>(null);
  const overlayRef                  = useRef<HTMLDivElement>(null);

  // ── Fetch shop config ──
  const { data: configData } = useQuery<{ success: boolean; membershipFee: number; paymentNumbers: ShopConfig['paymentNumbers']; benefits: string[] }>({
    queryKey: ['shop-membership-config'],
    queryFn:  () => api.get('/shop-membership/config').then(r => r.data),
    enabled:  isOpen,
  });

  // ── Fetch existing membership ──
  const { data: membershipData } = useQuery<{ success: boolean; member: MembershipStatus | null }>({
    queryKey: ['my-shop-membership'],
    queryFn:  () => api.get('/shop-membership/my').then(r => r.data),
    enabled:  isOpen,
  });

  const config     = configData;
  const membership = membershipData?.member ?? null;
  const fee        = config?.membershipFee ?? 200;
  const numbers    = config?.paymentNumbers ?? { bkash: '01734166488', nagad: '01734166488', rocket: '01734166488' };
  const benefits   = config?.benefits ?? [
    'বিশেষ সদস্য ছাড় সব পণ্যে',
    'প্রিমিয়াম সাপোর্ট',
    'আর্লি অ্যাক্সেস নতুন পণ্যে',
    'বিনামূল্যে ডেলিভারি',
    'মাসিক নিউজলেটার',
  ];

  // ── Form ──
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentAmount: String(fee) },
  });

  const selectedMethod = watch('paymentMethod');

  useEffect(() => {
    setValue('paymentAmount', String(fee));
  }, [fee, setValue]);

  // ── Submit mutation ──
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v && fd.append(k, String(v)));
      if (fileRef.current?.files?.[0]) fd.append('profilePhoto', fileRef.current.files[0]);
      return api.post('/shop-membership/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-shop-membership'] });
      setStep('done');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'আবেদন ব্যর্থ হয়েছে'),
  });

  // ── Helpers ──
  const copyNumber = (num: string, key: string) => {
    navigator.clipboard.writeText(num);
    setCopied(key);
    toast.success('নম্বর কপি হয়েছে!');
    setTimeout(() => setCopied(null), 2500);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // ── Keyboard close ──
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ── Body scroll lock ──
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  // ── If already a member ──
  if (membership?.status === 'approved') {
    return (
      <div ref={overlayRef} onClick={handleOverlayClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-200 dark:shadow-green-900/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">আপনি ইতিমধ্যে সদস্য!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">আপনার সদস্যতা সক্রিয় আছে।</p>
          {membership.memberId && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-5">
              <p className="text-xs text-gray-400 mb-1">সদস্য আইডি</p>
              <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">{membership.memberId}</p>
            </div>
          )}
          <button onClick={onClose} className="btn-primary w-full py-3">ঠিক আছে</button>
        </div>
      </div>
    );
  }

  // ── If pending ──
  if (membership?.status === 'pending') {
    return (
      <div ref={overlayRef} onClick={handleOverlayClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-yellow-200 dark:shadow-yellow-900/30">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">আবেদন প্রক্রিয়াধীন</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">আপনার আবেদন যাচাই করা হচ্ছে। সাধারণত ২৪ ঘণ্টার মধ্যে অনুমোদন পাবেন।</p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-5">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              📱 অনুমোদন হলে আপনাকে নোটিফিকেশন দেওয়া হবে।
            </p>
          </div>
          <button onClick={onClose} className="btn-secondary w-full py-3">বন্ধ করুন</button>
        </div>
      </div>
    );
  }

  // ── STEP: Info ──────────────────────────────────────────────────────────────
  if (step === 'info') {
    return (
      <div ref={overlayRef} onClick={handleOverlayClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative max-h-[90vh] flex flex-col">

          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition">
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Hero */}
          <div className="relative bg-gradient-to-br from-pink-600 via-purple-600 to-violet-700 p-7 pb-8 shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-8 w-24 h-24 rounded-full bg-white/5 translate-y-6" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-widest">Supershop</p>
                  <h2 className="text-white font-black text-xl leading-tight">প্রিমিয়াম সদস্যতা</h2>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">৳{fee}</span>
                <span className="text-white/60 text-sm">/বছর</span>
              </div>
              <p className="text-white/70 text-xs mt-1">একবার পেমেন্ট, ১ বছর মেয়াদ</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">সদস্যদের সুবিধা</p>
            <div className="space-y-3 mb-6">
              {benefits.map((b, i) => {
                const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{b}</p>
                  </div>
                );
              })}
            </div>

            {/* Payment preview */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-4 mb-6">
              <p className="text-xs font-semibold text-pink-700 dark:text-pink-300 mb-3">গ্রহণযোগ্য পেমেন্ট</p>
              <div className="flex gap-2 flex-wrap">
                {PAYMENT_METHODS.map(m => (
                  <span key={m.id} className="text-xs px-3 py-1.5 rounded-full font-semibold border"
                    style={{ color: m.color, borderColor: m.color + '44', background: m.bg }}>
                    {m.label}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={() => setStep('form')}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 rounded-2xl">
              সদস্য হতে আবেদন করুন <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP: Done ──────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div ref={overlayRef} onClick={handleOverlayClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200 dark:shadow-green-900/40">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">আবেদন সফল!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            আপনার আবেদন জমা হয়েছে। অ্যাডমিন যাচাই করে ২৪ ঘণ্টার মধ্যে অনুমোদন দেবেন।
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <Clock className="w-4 h-4 shrink-0" />
              <span>অনুমোদন পেন্ডিং</span>
            </div>
            <p className="text-yellow-600 dark:text-yellow-400 text-xs pl-6">
              অনুমোদনের পর নোটিফিকেশন পাবেন এবং সদস্য আইডি প্রদান করা হবে।
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-secondary py-3 rounded-2xl">বন্ধ করুন</button>
            <button onClick={() => { setStep('info'); onClose(); }} className="flex-1 btn-primary py-3 rounded-2xl">ঠিক আছে</button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP: Form ──────────────────────────────────────────────────────────────
  const activeNumber = selectedMethod ? numbers[selectedMethod] : '01734166488';

  return (
    <div ref={overlayRef} onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg overflow-hidden flex flex-col max-h-[96vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-700 px-6 py-5 shrink-0 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs mb-0.5">Supershop · সদস্যতা আবেদন</p>
            <h2 className="text-white font-black text-lg leading-tight">আবেদন ফর্ম পূরণ করুন</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Payment instruction box */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-4">
            <p className="text-xs font-semibold text-pink-700 dark:text-pink-300 mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">১</span>
              আগে পেমেন্ট করুন
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              নিচের যেকোনো নম্বরে <strong className="text-gray-800 dark:text-gray-200">৳{fee}</strong> পাঠান, তারপর ফর্ম পূরণ করুন।
            </p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => {
                const num = numbers[m.id as keyof typeof numbers];
                const key = m.id;
                return (
                  <div key={m.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-4 py-2.5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ color: m.color, background: m.bg }}>{m.label}</span>
                      <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200 tracking-wider">{num}</span>
                    </div>
                    <button onClick={() => copyNumber(num, key)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 dark:text-gray-400">
                      {copied === key ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === key ? 'কপি!' : 'কপি'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2 label */}
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">২</span>
            তথ্য পূরণ করুন
          </p>

          <form id="membership-form" onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">

            {/* Photo upload */}
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-purple-400 transition overflow-hidden shrink-0"
              >
                {photoPreview
                  ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  : <Upload className="w-5 h-5 text-gray-400" />
                }
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">প্রোফাইল ছবি</p>
                <p className="text-xs text-gray-400 mt-0.5">ঐচ্ছিক · ক্লিক করে আপলোড করুন</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">পূর্ণ নাম *</label>
                <input {...register('name')} className="input" placeholder="আপনার নাম" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">মোবাইল নম্বর *</label>
                <input {...register('phone')} className="input" placeholder="01XXXXXXXXX" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Email + City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">ইমেইল</label>
                <input {...register('email')} className="input" placeholder="email@example.com" type="email" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">শহর / জেলা *</label>
                <input {...register('city')} className="input" placeholder="ঢাকা, চট্টগ্রাম..." />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">ঠিকানা</label>
              <textarea {...register('address')} rows={2} className="input resize-none" placeholder="বাড়ি, রাস্তা, এলাকা..." />
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">পেমেন্ট পদ্ধতি *</label>
              <div className="flex gap-2">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 cursor-pointer transition-all"
                    style={{
                      borderColor: selectedMethod === m.id ? m.color : 'transparent',
                      background: selectedMethod === m.id ? m.bg : 'var(--bg-muted, #f9fafb)',
                    }}
                  >
                    <input type="radio" {...register('paymentMethod')} value={m.id} className="sr-only" />
                    <span className="text-sm font-bold" style={{ color: m.color }}>{m.label}</span>
                    {selectedMethod === m.id && (
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{numbers[m.id as keyof typeof numbers]}</span>
                    )}
                  </label>
                ))}
              </div>
              {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod.message}</p>}
            </div>

            {/* Payment phone + TrxID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  পেমেন্ট নম্বর *
                  <span className="font-normal text-gray-400 ml-1">(যে নম্বর থেকে পাঠিয়েছেন)</span>
                </label>
                <input {...register('paymentPhone')} className="input" placeholder="01XXXXXXXXX" />
                {errors.paymentPhone && <p className="text-red-500 text-xs mt-1">{errors.paymentPhone.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Transaction ID *
                </label>
                <input {...register('transactionId')} className="input font-mono" placeholder="8GHK12MNOP" />
                {errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId.message}</p>}
              </div>
            </div>

            {/* Payment amount (read-only) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">পরিমাণ</label>
              <div className="input flex items-center gap-2 pointer-events-none select-none bg-gray-50 dark:bg-gray-800">
                <span className="font-bold text-gray-900 dark:text-white text-base">৳{fee}</span>
                <span className="text-xs text-green-600 dark:text-green-400 ml-auto bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">নির্ধারিত</span>
              </div>
              <input type="hidden" {...register('paymentAmount')} value={String(fee)} />
            </div>

          </form>
        </div>

        {/* Sticky footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <button
            type="submit"
            form="membership-form"
            disabled={mutation.isPending}
            className="btn-primary w-full py-4 text-base rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {mutation.isPending
              ? <><Loader2 className="w-5 h-5 animate-spin" /> আবেদন জমা হচ্ছে...</>
              : <><ShoppingBag className="w-5 h-5" /> আবেদন জমা দিন</>
            }
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            আবেদনের পর ২৪ ঘণ্টার মধ্যে অনুমোদন পাবেন
          </p>
        </div>

      </div>
    </div>
  );
}

export default ShopMembershipModal;
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
  CheckCircle2, Clock, AlertCircle, Phone, CreditCard,
  MapPin, User, Mail, FileText, BadgeCheck, Calendar,
  Users, CreditCard as IdCard, Globe,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentNumbers {
  bkash:  string;
  nagad:  string;
  rocket: string;
}

interface ShopConfig {
  membershipFee:   number;
  receiverNumber:  string;
  paymentNumbers:  PaymentNumbers;
  benefits:        string[];
}

interface Membership {
  _id:           string;
  status:        'pending' | 'approved' | 'rejected';
  memberId?:     string;
  paymentMethod: string;
  adminNote?:    string;
  joinedAt?:     string;
  expiresAt?:    string;
  createdAt:     string;
}

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const RECEIVER = '01734166488';

const PAYMENT_METHODS = [
  { id: 'bkash',  label: 'bKash',  color: '#E2136E', bg: '#fce8f3' },
  { id: 'nagad',  label: 'Nagad',  color: '#F05829', bg: '#fef0ec' },
  { id: 'rocket', label: 'Rocket', color: '#8B3D8B', bg: '#f3eaf3' },
] as const;

type MethodId = (typeof PAYMENT_METHODS)[number]['id'];

const GENDER_OPTIONS = [
  { value: 'male',   label: 'পুরুষ' },
  { value: 'female', label: 'মহিলা' },
  { value: 'other',  label: 'অন্যান্য' },
] as const;

const DEFAULT_BENEFITS = [
  'বিশেষ সদস্য ছাড় সব পণ্যে',
  'প্রিমিয়াম সাপোর্ট',
  'আর্লি অ্যাক্সেস নতুন পণ্যে',
  'বিনামূল্যে ডেলিভারি',
  'মাসিক এক্সক্লুসিভ অফার',
];

const BENEFIT_ICONS = [Star, Truck, Shield, Gift, Headphones, Zap];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
      {children}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />{msg}
    </p>
  );
}

function SectionHeading({ step, label }: { step: string; label: string }) {
  return (
    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pt-1">
      <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">
        {step}
      </span>
      {label}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod schema
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  // Personal
  name:          z.string().min(2, 'নাম কমপক্ষে ২ অক্ষর হতে হবে'),
  dob:           z.string().min(1, 'জন্মতারিখ দিন'),
  age:           z.string().min(1, 'বয়স দিন'),
  gender:        z.enum(['male', 'female', 'other'], { required_error: 'লিঙ্গ বেছে নিন' }),
  fatherName:    z.string().min(2, 'পিতার নাম দিন'),
  motherName:    z.string().min(2, 'মাতার নাম দিন'),

  // Contact & Location
  phone:         z.string().min(11, 'সঠিক ১১ সংখ্যার নম্বর দিন').max(14),
  email:         z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  address:       z.string().min(5, 'পূর্ণ ঠিকানা দিন'),
  region:        z.string().min(2, 'জেলা / অঞ্চল লিখুন'),

  // Identity
  nidPassport:   z.string().min(5, 'NID / পাসপোর্ট নম্বর দিন'),

  // Payment
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket'], { required_error: 'পেমেন্ট পদ্ধতি বেছে নিন' }),
  paymentPhone:  z.string().min(11, 'পেমেন্ট নম্বর দিন').max(14),
  transactionId: z.string().min(4, 'Transaction ID দিন'),
  paymentAmount: z.string(),
});

type FormData = z.infer<typeof schema>;

// ─────────────────────────────────────────────────────────────────────────────
// Component — named export
// ─────────────────────────────────────────────────────────────────────────────

export function ShopMembershipModal({ isOpen, onClose }: Props) {
  const qc = useQueryClient();

  const [view,         setView]         = useState<'info' | 'form' | 'done'>('info');
  const [copied,       setCopied]       = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fileRef    = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ── Config ──────────────────────────────────────────────────────────────────
  const { data: configData } = useQuery<ShopConfig>({
    queryKey: ['supershop-membership-config'],
    queryFn:  () => api.get('/supershop/membership/config').then(r => r.data),
    enabled:  isOpen,
    staleTime: 5 * 60 * 1000,
  });

  // ── My membership ───────────────────────────────────────────────────────────
  const { data: membershipData } = useQuery<{ success: boolean; member: Membership | null }>({
    queryKey: ['my-shop-membership'],
    queryFn:  () => api.get('/supershop/membership/my').then(r => r.data),
    enabled:  isOpen,
  });

  const fee        = configData?.membershipFee  ?? 200;
  const numbers    = configData?.paymentNumbers ?? { bkash: RECEIVER, nagad: RECEIVER, rocket: RECEIVER };
  const benefits   = configData?.benefits       ?? DEFAULT_BENEFITS;
  const membership = membershipData?.member     ?? null;

  // ── Form ─────────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentAmount: String(fee) },
  });

  const selectedMethod = watch('paymentMethod') as MethodId | undefined;
  const activeMethod   = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  // Auto-calculate age from DOB
  const dobValue = watch('dob');
  useEffect(() => {
    if (!dobValue) return;
    const birth = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age > 0 && age < 120) setValue('age', String(age));
  }, [dobValue, setValue]);

  useEffect(() => { setValue('paymentAmount', String(fee)); }, [fee, setValue]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, String(v)); });
      if (fileRef.current?.files?.[0]) fd.append('profilePhoto', fileRef.current.files[0]);
      return api.post('/supershop/membership/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-shop-membership'] });
      setView('done');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'আবেদন ব্যর্থ হয়েছে'),
  });

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const copyNum = (num: string, key: string) => {
    navigator.clipboard.writeText(num);
    setCopied(key);
    toast.success('নম্বর কপি হয়েছে!');
    setTimeout(() => setCopied(null), 2500);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('ছবির সাইজ ৫ MB এর বেশি হবে না'); return; }
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setView('info'); reset(); setPhotoPreview(null); }, 300);
  };

  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose();
  };

  // ── Side effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────────────────────
  // APPROVED
  // ─────────────────────────────────────────────────────────────────────────────
  if (membership?.status === 'approved') {
    return (
      <div ref={overlayRef} onClick={handleOverlay}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative">
          <button onClick={handleClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-200 dark:shadow-green-900/30">
            <BadgeCheck className="w-12 h-12 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" /> সক্রিয় সদস্যতা
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">আপনি প্রিমিয়াম সদস্য!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">সব প্রিমিয়াম সুবিধা উপভোগ করুন।</p>
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-4 mb-5 text-left text-white">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-1">সদস্য কার্ড</p>
            {membership.memberId && (
              <p className="font-mono font-black text-xl tracking-wider mb-2">{membership.memberId}</p>
            )}
            <div className="space-y-1">
              {membership.joinedAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">যোগদান</span>
                  <span className="text-white/90 font-semibold">{new Date(membership.joinedAt).toLocaleDateString('bn-BD')}</span>
                </div>
              )}
              {membership.expiresAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">মেয়াদ শেষ</span>
                  <span className="text-white/90 font-semibold">{new Date(membership.expiresAt).toLocaleDateString('bn-BD')}</span>
                </div>
              )}
            </div>
          </div>
          <button onClick={handleClose} className="btn-primary w-full py-3 rounded-2xl">বন্ধ করুন</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PENDING
  // ─────────────────────────────────────────────────────────────────────────────
  if (membership?.status === 'pending') {
    return (
      <div ref={overlayRef} onClick={handleOverlay}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative">
          <button onClick={handleClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-yellow-200 dark:shadow-yellow-900/30">
            <Clock className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">আবেদন প্রক্রিয়াধীন</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            আপনার সদস্যতা আবেদন যাচাই হচ্ছে। সাধারণত <strong className="text-gray-700 dark:text-gray-300">২৪ ঘণ্টার</strong> মধ্যে অনুমোদন পাবেন।
          </p>
          <div className="flex items-center justify-center gap-1 mb-5">
            {['আবেদন জমা', 'যাচাই', 'অনুমোদন'].map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                    i === 0 ? 'bg-green-500 text-white' :
                    i === 1 ? 'bg-yellow-400 text-yellow-900 animate-pulse' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}>{i === 0 ? '✓' : i === 1 ? '⋯' : i + 1}</div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{s}</span>
                </div>
                {i < 2 && <div className="w-6 h-0.5 bg-gray-200 dark:bg-gray-700 mb-4 mx-0.5" />}
              </div>
            ))}
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-3 mb-5 text-xs text-yellow-700 dark:text-yellow-300">
            📱 অনুমোদনের পর নোটিফিকেশন পাবেন এবং সদস্য আইডি দেওয়া হবে।
          </div>
          <button onClick={handleClose} className="btn-secondary w-full py-3 rounded-2xl">বন্ধ করুন</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REJECTED
  // ─────────────────────────────────────────────────────────────────────────────
  if (membership?.status === 'rejected' && view === 'info') {
    return (
      <div ref={overlayRef} onClick={handleOverlay}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative">
          <button onClick={handleClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
          <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">আবেদন প্রত্যাখ্যাত</h2>
          {membership.adminNote && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-3 text-sm text-red-600 dark:text-red-400 text-left">
              <strong>কারণ:</strong> {membership.adminNote}
            </div>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">সঠিক তথ্য দিয়ে আবার আবেদন করতে পারবেন।</p>
          <div className="flex gap-3">
            <button onClick={handleClose} className="flex-1 btn-secondary py-3 rounded-2xl text-sm">বাতিল</button>
            <button onClick={() => setView('form')} className="flex-1 btn-primary py-3 rounded-2xl text-sm">আবার আবেদন করুন</button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DONE (just submitted)
  // ─────────────────────────────────────────────────────────────────────────────
  if (view === 'done') {
    return (
      <div ref={overlayRef} onClick={handleOverlay}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-200 dark:shadow-green-900/30">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">আবেদন সফল!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
            আপনার সদস্যতা আবেদন জমা হয়েছে। অ্যাডমিন যাচাই করে ২৪ ঘণ্টার মধ্যে অনুমোদন দেবেন।
          </p>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-5 text-left">
            <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300 flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5" /> পরবর্তী ধাপ
            </p>
            <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
              <li>✦ অ্যাডমিন আপনার TrxID যাচাই করবেন</li>
              <li>✦ অনুমোদনের পর নোটিফিকেশন পাবেন</li>
              <li>✦ একটি সদস্য আইডি প্রদান করা হবে</li>
            </ul>
          </div>
          <button onClick={handleClose} className="btn-primary w-full py-3.5 rounded-2xl font-bold">ঠিক আছে</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INFO screen
  // ─────────────────────────────────────────────────────────────────────────────
  if (view === 'info') {
    return (
      <div ref={overlayRef} onClick={handleOverlay}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md flex flex-col max-h-[92vh]">
          <div className="relative bg-gradient-to-br from-pink-600 via-purple-600 to-violet-700 px-7 pt-7 pb-9 rounded-t-3xl overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-6 w-28 h-28 rounded-full bg-white/5 translate-y-8" />
            <button onClick={handleClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-widest">Supershop</p>
                  <h2 className="text-white font-black text-xl">প্রিমিয়াম সদস্যতা</h2>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">৳{fee}</span>
                <div>
                  <p className="text-white/70 text-sm">/বছর</p>
                  <p className="text-white/50 text-xs">একবার পেমেন্ট · ১ বছর মেয়াদ</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">সদস্যদের সুবিধা</p>
            <div className="space-y-3">
              {benefits.map((b, i) => {
                const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{b}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-4">
              <p className="text-xs font-semibold text-pink-700 dark:text-pink-300 mb-2">গ্রহণযোগ্য পেমেন্ট</p>
              <div className="flex gap-2 flex-wrap">
                {PAYMENT_METHODS.map(m => (
                  <span key={m.id} className="text-xs px-3 py-1.5 rounded-full font-bold border"
                    style={{ color: m.color, borderColor: m.color + '50', background: m.bg }}>
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">পেমেন্ট পাঠান এই নম্বরে</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white tracking-wider">{RECEIVER}</p>
                  <p className="text-xs text-gray-400 mt-0.5">bKash / Nagad / Rocket · ৳{fee}</p>
                </div>
                <button onClick={() => copyNum(RECEIVER, 'main')}
                  className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-purple-400 transition text-gray-600 dark:text-gray-300">
                  {copied === 'main' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied === 'main' ? 'কপি!' : 'কপি'}
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 shrink-0">
            <button onClick={() => setView('form')}
              className="btn-primary w-full py-4 text-base rounded-2xl flex items-center justify-center gap-2 font-bold">
              সদস্য হতে আবেদন করুন <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FORM screen
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div ref={overlayRef} onClick={handleOverlay}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[96vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-700 px-6 py-5 rounded-t-3xl shrink-0 flex items-center justify-between">
          <div>
            <button onClick={() => setView('info')}
              className="text-white/60 text-xs hover:text-white/90 transition mb-0.5 flex items-center gap-1">
              ← সুবিধা দেখুন
            </button>
            <h2 className="text-white font-black text-lg">আবেদন ফর্ম</h2>
          </div>
          <button onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* ── Step 1: Payment instruction ── */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-4">
            <p className="text-xs font-bold text-pink-700 dark:text-pink-300 mb-3 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-black">১</span>
              আগে পেমেন্ট করুন — ৳{fee}
            </p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => {
                const num = numbers[m.id as keyof PaymentNumbers] || RECEIVER;
                return (
                  <div key={m.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-3 py-2.5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ color: m.color, background: m.bg }}>
                        {m.label}
                      </span>
                      <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200 tracking-wider">{num}</span>
                    </div>
                    <button onClick={() => copyNum(num, m.id)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-400">
                      {copied === m.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === m.id ? 'কপি!' : 'কপি'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <SectionHeading step="২" label="ব্যক্তিগত তথ্য" />

          <form id="membership-form" onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">

            {/* Photo upload */}
            <div className="flex items-center gap-4">
              <div onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-purple-400 transition overflow-hidden shrink-0">
                {photoPreview
                  ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  : <Upload className="w-5 h-5 text-gray-400" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">প্রোফাইল ছবি</p>
                <p className="text-xs text-gray-400 mt-0.5">ঐচ্ছিক · ক্লিক করে আপলোড করুন · সর্বোচ্চ ৫ MB</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label><User className="w-3 h-3 inline mr-1" />পূর্ণ নাম *</Label>
                <input {...register('name')} className="input w-full" placeholder="আপনার নাম" />
                <FieldError msg={errors.name?.message} />
              </div>
              <div>
                <Label><Phone className="w-3 h-3 inline mr-1" />মোবাইল নম্বর *</Label>
                <input {...register('phone')} className="input w-full" placeholder="01XXXXXXXXX" />
                <FieldError msg={errors.phone?.message} />
              </div>
            </div>

            {/* DOB + Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label><Calendar className="w-3 h-3 inline mr-1" />জন্মতারিখ *</Label>
                <input
                  {...register('dob')}
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  className="input w-full"
                />
                <FieldError msg={errors.dob?.message} />
              </div>
              <div>
                <Label>বয়স *</Label>
                <input
                  {...register('age')}
                  type="number"
                  min={1}
                  max={120}
                  className="input w-full"
                  placeholder="স্বয়ংক্রিয়"
                />
                <FieldError msg={errors.age?.message} />
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label><Users className="w-3 h-3 inline mr-1" />লিঙ্গ *</Label>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map(g => {
                  const selected = watch('gender') === g.value;
                  return (
                    <label key={g.value}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold"
                      style={{
                        borderColor: selected ? '#9333ea' : 'var(--color-border, #e5e7eb)',
                        background:  selected ? '#f3e8ff' : 'transparent',
                        color:       selected ? '#9333ea' : undefined,
                      }}
                    >
                      <input type="radio" {...register('gender')} value={g.value} className="sr-only" />
                      {g.label}
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </label>
                  );
                })}
              </div>
              <FieldError msg={errors.gender?.message} />
            </div>

            {/* Father + Mother */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>পিতার নাম *</Label>
                <input {...register('fatherName')} className="input w-full" placeholder="পিতার পূর্ণ নাম" />
                <FieldError msg={errors.fatherName?.message} />
              </div>
              <div>
                <Label>মাতার নাম *</Label>
                <input {...register('motherName')} className="input w-full" placeholder="মাতার পূর্ণ নাম" />
                <FieldError msg={errors.motherName?.message} />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label><Mail className="w-3 h-3 inline mr-1" />ইমেইল</Label>
              <input {...register('email')} type="email" className="input w-full" placeholder="email@example.com" />
              <FieldError msg={errors.email?.message} />
            </div>

            {/* Address + Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label><MapPin className="w-3 h-3 inline mr-1" />জেলা / অঞ্চল *</Label>
                <input {...register('region')} className="input w-full" placeholder="ঢাকা, চট্টগ্রাম..." />
                <FieldError msg={errors.region?.message} />
              </div>
              <div>
                <Label><Globe className="w-3 h-3 inline mr-1" />NID / পাসপোর্ট নম্বর *</Label>
                <input {...register('nidPassport')} className="input w-full font-mono" placeholder="1234XXXXXXXXX" />
                <FieldError msg={errors.nidPassport?.message} />
              </div>
            </div>

            <div>
              <Label><FileText className="w-3 h-3 inline mr-1" />পূর্ণ ঠিকানা *</Label>
              <textarea {...register('address')} rows={2} className="input w-full resize-none" placeholder="বাড়ি নং, রাস্তা, এলাকা, উপজেলা..." />
              <FieldError msg={errors.address?.message} />
            </div>

            {/* ── Step 3: Payment details ── */}
            <div className="pt-1">
              <SectionHeading step="৩" label="পেমেন্ট তথ্য" />
            </div>

            {/* Payment method selector */}
            <div>
              <Label><CreditCard className="w-3 h-3 inline mr-1" />পেমেন্ট পদ্ধতি *</Label>
              <div className="flex gap-2">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id}
                    className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 cursor-pointer transition-all"
                    style={{
                      borderColor: selectedMethod === m.id ? m.color : 'var(--color-border, #e5e7eb)',
                      background:  selectedMethod === m.id ? m.bg : 'transparent',
                    }}
                  >
                    <input type="radio" {...register('paymentMethod')} value={m.id} className="sr-only" />
                    <span className="text-sm font-black" style={{ color: m.color }}>{m.label}</span>
                    <span className="text-xs text-gray-400 font-mono">
                      {numbers[m.id as keyof PaymentNumbers] || RECEIVER}
                    </span>
                    {selectedMethod === m.id && (
                      <span className="text-xs font-semibold" style={{ color: m.color }}>✓ বেছে নেওয়া</span>
                    )}
                  </label>
                ))}
              </div>
              <FieldError msg={errors.paymentMethod?.message} />
              {activeMethod && (
                <div className="mt-2 flex items-center justify-between rounded-xl px-3 py-2.5 border"
                  style={{ background: activeMethod.bg, borderColor: activeMethod.color + '44' }}>
                  <p className="text-xs" style={{ color: activeMethod.color }}>
                    <strong>{activeMethod.label}</strong>: {numbers[activeMethod.id as keyof PaymentNumbers] || RECEIVER} → <strong>৳{fee}</strong>
                  </p>
                  <button type="button"
                    onClick={() => copyNum(numbers[activeMethod.id as keyof PaymentNumbers] || RECEIVER, 'active')}
                    className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ color: activeMethod.color }}>
                    {copied === 'active' ? '✓' : 'কপি'}
                  </button>
                </div>
              )}
            </div>

            {/* Payment phone + TrxID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>
                  পেমেন্ট নম্বর *&nbsp;
                  <span className="font-normal text-gray-400">(যে নম্বর থেকে পাঠিয়েছেন)</span>
                </Label>
                <input {...register('paymentPhone')} className="input w-full" placeholder="01XXXXXXXXX" />
                <FieldError msg={errors.paymentPhone?.message} />
              </div>
              <div>
                <Label>Transaction ID (TrxID) *</Label>
                <input {...register('transactionId')} className="input w-full font-mono tracking-wider" placeholder="8GHK12MNOP" />
                <FieldError msg={errors.transactionId?.message} />
                <p className="text-xs text-gray-400 mt-1">পেমেন্ট কনফার্মেশন SMS থেকে নিন</p>
              </div>
            </div>

            {/* Payment amount (read-only) */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">পেমেন্টের পরিমাণ</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-gray-900 dark:text-white">৳{fee}</span>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">নির্ধারিত</span>
              </div>
              <input type="hidden" {...register('paymentAmount')} />
            </div>
          </form>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <button
            type="submit"
            form="membership-form"
            disabled={mutation.isPending}
            className="btn-primary w-full py-4 text-base rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 font-bold"
          >
            {mutation.isPending
              ? <><Loader2 className="w-5 h-5 animate-spin" /> জমা হচ্ছে...</>
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
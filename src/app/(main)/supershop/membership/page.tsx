'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import useAuthStore from '@/store/authStore';
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle,
  Upload, Camera, User, MapPin, CreditCard, ChevronRight,
  ChevronLeft, BadgeCheck, FileText, Loader2, Eye, Copy, Check,
  Banknote, Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'date-fns';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const BD_DIVISIONS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা',
  'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ',
];

const ID_TYPES = [
  { value: 'nid',               label: 'জাতীয় পরিচয়পত্র (NID)' },
  { value: 'passport',          label: 'পাসপোর্ট' },
  { value: 'birth_certificate', label: 'জন্ম নিবন্ধন' },
];

const GENDER_OPTIONS = [
  { v: 'male',   label: 'পুরুষ',    emoji: '👨' },
  { v: 'female', label: 'মহিলা',    emoji: '👩' },
  { v: 'other',  label: 'অন্যান্য', emoji: '🧑' },
] as const;

const PAYMENT_METHODS = [
  { id: 'bkash',  label: 'বিকাশ',            textColor: 'text-pink-600 dark:text-pink-400',     border: 'border-pink-500',   bg: 'bg-pink-50 dark:bg-pink-900/20'     },
  { id: 'nagad',  label: 'নগদ',              textColor: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 'rocket', label: 'রকেট',             textColor: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'bank',   label: 'ব্যাংক ট্রান্সফার', textColor: 'text-blue-600 dark:text-blue-400',    border: 'border-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20'     },
] as const;

const PAYMENT_NUMBER = '01734166488';
const MEMBERSHIP_FEE = 200;

// ─────────────────────────────────────────────────────────────
// Zod Schema
// ─────────────────────────────────────────────────────────────

const kycSchema = z.object({
  // Step 1
  name:        z.string().min(2,  'নাম কমপক্ষে ২ অক্ষর হতে হবে'),
  dob:         z.string().min(1,  'জন্ম তারিখ দিন'),
  age:         z.string().min(1,  'বয়স দিন'),
  gender:      z.enum(['male', 'female', 'other'], { required_error: 'লিঙ্গ বেছে নিন' }),
  fatherName:  z.string().min(2,  'পিতার নাম দিন'),
  motherName:  z.string().min(2,  'মাতার নাম দিন'),
  // Step 2
  phone:       z.string().min(11, 'সঠিক ১১ সংখ্যার নম্বর দিন').max(14),
  email:       z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  address:     z.string().min(5,  'পূর্ণ ঠিকানা লিখুন'),
  region:      z.string().min(1,  'বিভাগ বেছে নিন'),
  // Step 3
  idType:      z.enum(['nid', 'passport', 'birth_certificate']),
  nidPassport: z.string().min(5,  'পরিচয়পত্র নম্বর দিন'),
  // Step 5 — Payment
  paymentMethod: z.string().min(1, 'পেমেন্ট পদ্ধতি বেছে নিন'),
  senderNumber:  z.string().min(11, 'পেমেন্ট নম্বর দিন').max(14),
  transactionId: z.string().min(4,  'Transaction ID দিন'),
  paidAmount:    z.string().min(1,  'পরিমাণ দিন'),
});

type KYCForm = z.infer<typeof kycSchema>;

// ─────────────────────────────────────────────────────────────
// Steps — 5 total
// ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'ব্যক্তিগত',  icon: User       },
  { id: 2, label: 'যোগাযোগ',    icon: MapPin     },
  { id: 3, label: 'পরিচয়পত্র', icon: CreditCard },
  { id: 4, label: 'ছবি',        icon: Camera     },
  { id: 5, label: 'পেমেন্ট',   icon: Banknote   },
] as const;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />{msg}
    </p>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {children}
    </label>
  );
}

function PhotoBox({ label, sublabel, preview, onClick }: {
  label: string; sublabel?: string; preview: string | null; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600
        hover:border-blue-400 dark:hover:border-blue-500 transition-all overflow-hidden relative group
        bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center gap-2"
    >
      {preview ? (
        <>
          <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Upload className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
            {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
          </div>
        </>
      )}
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600
        text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition shrink-0"
    >
      {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /> কপি হয়েছে</> : <><Copy className="w-3.5 h-3.5" /> কপি করুন</>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// KYCStatusView
// ─────────────────────────────────────────────────────────────

function KYCStatusView({ kyc, onReapply }: { kyc: any; onReapply?: () => void }) {
  const cfg = {
    pending:  { icon: Clock,        color: 'text-amber-500', ring: 'ring-amber-200 dark:ring-amber-800', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'যাচাই অপেক্ষায়' },
    approved: { icon: CheckCircle2, color: 'text-green-500', ring: 'ring-green-200 dark:ring-green-800', bg: 'bg-green-50 dark:bg-green-900/20', label: 'যাচাইকৃত ✓'      },
    rejected: { icon: XCircle,      color: 'text-red-500',   ring: 'ring-red-200 dark:ring-red-800',     bg: 'bg-red-50 dark:bg-red-900/20',     label: 'প্রত্যাখ্যাত'   },
  };
  const s    = cfg[kyc.status as keyof typeof cfg] ?? cfg.pending;
  const Icon = s.icon;
  const genderLabel = kyc.gender === 'male' ? 'পুরুষ' : kyc.gender === 'female' ? 'মহিলা' : 'অন্যান্য';
  const idTypeLabel = ID_TYPES.find(i => i.value === kyc.idType)?.label ?? kyc.idType;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Status banner */}
      <div className={`${s.bg} rounded-3xl p-6 ring-1 ${s.ring}`}>
        <div className="flex items-start gap-4">
          {kyc.photo?.url
            ? <img src={kyc.photo.url} alt="KYC Photo" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white dark:ring-gray-700 shrink-0" />
            : <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 ring-2 ring-white dark:ring-gray-700 shrink-0 flex items-center justify-center"><User className="w-8 h-8 text-gray-300" /></div>
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-5 h-5 ${s.color} shrink-0`} />
              <span className={`font-bold text-sm ${s.color}`}>{s.label}</span>
            </div>
            <p className="font-black text-gray-900 dark:text-white text-xl leading-tight">{kyc.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{genderLabel} · বয়স {kyc.age} · {kyc.region}</p>
            <p className="text-xs text-gray-400 mt-1">
              জমা: {format(new Date(kyc.submittedAt), 'dd MMM yyyy')}
              {kyc.reviewedAt && ` · পর্যালোচনা: ${format(new Date(kyc.reviewedAt), 'dd MMM yyyy')}`}
            </p>
          </div>
        </div>

        {kyc.status === 'rejected' && kyc.adminNote && (
          <div className="mt-4 bg-red-100 dark:bg-red-900/30 rounded-2xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300"><strong>প্রত্যাখ্যানের কারণ:</strong> {kyc.adminNote}</p>
          </div>
        )}

        {kyc.status === 'approved' && (
          <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {['পরিচয় যাচাইকৃত', 'বিশ্বস্ত ব্যবহারকারী', 'সকল সেবা সক্রিয়'].map(b => (
              <div key={b} className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-medium">
                <BadgeCheck className="w-3.5 h-3.5 shrink-0" /> {b}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" /> জমা দেওয়া তথ্য
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { label: 'পিতার নাম',   value: kyc.fatherName },
            { label: 'মাতার নাম',   value: kyc.motherName },
            { label: 'জন্ম তারিখ', value: kyc.dob ? format(new Date(kyc.dob), 'dd MMM yyyy') : '—' },
            { label: 'ফোন',         value: kyc.phone },
            { label: 'পরিচয়পত্র', value: idTypeLabel },
            { label: 'ID নম্বর',   value: kyc.nidPassport },
            { label: 'ঠিকানা',     value: kyc.address, full: true },
          ].map(item => (
            <div key={item.label} className={(item as any).full ? 'sm:col-span-2' : ''}>
              <p className="text-xs text-gray-400 font-medium">{item.label}</p>
              <p className="text-gray-800 dark:text-gray-200 font-semibold mt-0.5">{item.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment info */}
      {kyc.paymentMethod && (
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-blue-500" /> পেমেন্ট তথ্য
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'পদ্ধতি',         value: PAYMENT_METHODS.find(m => m.id === kyc.paymentMethod)?.label ?? kyc.paymentMethod },
              { label: 'পেমেন্ট নম্বর', value: kyc.senderNumber },
              { label: 'Transaction ID', value: kyc.transactionId },
              { label: 'পরিমাণ',         value: `৳${kyc.paidAmount}` },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                <p className="text-gray-800 dark:text-gray-200 font-semibold mt-0.5 font-mono">{item.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NID images */}
      {(kyc.nidFront?.url || kyc.nidBack?.url) && (
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-500" /> পরিচয়পত্রের ছবি
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {kyc.nidFront?.url && (
              <a href={kyc.nidFront.url} target="_blank" rel="noreferrer">
                <img src={kyc.nidFront.url} alt="NID Front" className="rounded-xl w-full object-cover aspect-video hover:opacity-80 transition" />
                <p className="text-xs text-gray-400 mt-1 text-center">সামনের দিক</p>
              </a>
            )}
            {kyc.nidBack?.url && (
              <a href={kyc.nidBack.url} target="_blank" rel="noreferrer">
                <img src={kyc.nidBack.url} alt="NID Back" className="rounded-xl w-full object-cover aspect-video hover:opacity-80 transition" />
                <p className="text-xs text-gray-400 mt-1 text-center">পেছনের দিক</p>
              </a>
            )}
          </div>
        </div>
      )}

      {kyc.status === 'rejected' && onReapply && (
        <button onClick={onReapply} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5" /> পুনরায় আবেদন করুন
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function KYCPage() {
  const { user } = useAuthStore();
  const router   = useRouter();
  const qc       = useQueryClient();

  const [step,     setStep]     = useState(1);
  const [showForm, setShowForm] = useState(false);

  const [photoPreview,    setPhotoPreview]    = useState<string | null>(null);
  const [nidFrontPreview, setNidFrontPreview] = useState<string | null>(null);
  const [nidBackPreview,  setNidBackPreview]  = useState<string | null>(null);
  const photoRef    = useRef<HTMLInputElement>(null);
  const nidFrontRef = useRef<HTMLInputElement>(null);
  const nidBackRef  = useRef<HTMLInputElement>(null);
  const photoFile    = useRef<File | null>(null);
  const nidFrontFile = useRef<File | null>(null);
  const nidBackFile  = useRef<File | null>(null);

  const { data: myData, isLoading } = useQuery({
    queryKey: ['my-kyc'],
    queryFn:  () => api.get('/kyc/my').then(r => r.data),
    enabled:  !!user,
  });
  const myKYC = myData?.kyc ?? null;

  const {
    register, handleSubmit, watch, setValue, trigger,
    formState: { errors }, reset,
  } = useForm<KYCForm>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      name: user?.name ?? '', email: user?.email ?? '',
      gender: 'male', idType: 'nid', region: '',
      paymentMethod: 'bkash', paidAmount: String(MEMBERSHIP_FEE),
    },
  });

  const genderValue        = watch('gender');
  const idTypeValue        = watch('idType');
  const paymentMethodValue = watch('paymentMethod');
  const selectedMethod     = PAYMENT_METHODS.find(m => m.id === paymentMethodValue) ?? PAYMENT_METHODS[0];

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    register('dob').onChange(e);
    const dob = e.target.value;
    if (!dob) return;
    const today = new Date(), birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age > 0 && age < 120) setValue('age', String(age));
  };

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileRef: React.MutableRefObject<File | null>,
    setPreview: (s: string | null) => void,
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('ছবির সাইজ ৫ MB এর বেশি হবে না'); return; }
    fileRef.current = f;
    setPreview(URL.createObjectURL(f));
  };

  const mutation = useMutation({
    mutationFn: async (data: KYCForm) => {
      if (!photoFile.current) throw new Error('প্রোফাইল ছবি আবশ্যক');
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v as string); });
      fd.append('photo', photoFile.current);
      if (nidFrontFile.current) fd.append('nidFront', nidFrontFile.current);
      if (nidBackFile.current)  fd.append('nidBack',  nidBackFile.current);
      return api.post('/kyc/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      toast.success('KYC আবেদন সফলভাবে জমা হয়েছে!');
      qc.invalidateQueries({ queryKey: ['my-kyc'] });
      setShowForm(false); reset(); setStep(1);
      photoFile.current = nidFrontFile.current = nidBackFile.current = null;
      setPhotoPreview(null); setNidFrontPreview(null); setNidBackPreview(null);
      router.push('/supershop');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'আবেদন ব্যর্থ হয়েছে'),
  });

  const STEP_FIELDS: Record<number, (keyof KYCForm)[]> = {
    1: ['name', 'dob', 'age', 'gender', 'fatherName', 'motherName'],
    2: ['phone', 'address', 'region'],
    3: ['idType', 'nidPassport'],
    4: [],
    5: ['paymentMethod', 'senderNumber', 'transactionId', 'paidAmount'],
  };

  const nextStep = async () => {
    if (step === 4) {
      if (!photoFile.current) { toast.error('প্রোফাইল ছবি আবশ্যক'); return; }
      setStep(5); return;
    }
    if (step < 5) {
      const fields = STEP_FIELDS[step];
      const ok = fields?.length ? await trigger(fields) : true;
      if (ok) setStep(s => s + 1);
    }
  };

  const prevStep = () => { if (step > 1) setStep(s => s - 1); };
  const onSubmit = (data: KYCForm) => {
    if (!photoFile.current) { toast.error('প্রোফাইল ছবি আবশ্যক'); return; }
    mutation.mutate(data);
  };

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-10">{children}</div>
      <MainFooter />
    </div>
  );

  const PageHeader = () => (
    <div className="mb-6">
      <Link href="/supershop"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition mb-4">
        <ChevronLeft className="w-4 h-4" /> সুপারশপে ফিরুন
      </Link>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="font-black text-xl text-gray-900 dark:text-white">KYC যাচাই</h1>
          <p className="text-xs text-gray-400">পরিচয় যাচাইকরণ — Know Your Customer</p>
        </div>
      </div>
    </div>
  );

  if (user && !isLoading && myKYC && !showForm) {
    return (
      <PageWrapper>
        <PageHeader />
        <KYCStatusView kyc={myKYC} onReapply={myKYC.status === 'rejected' ? () => setShowForm(true) : undefined} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader />

      {/* Not logged in */}
      {!user && (
        <div className="card p-8 text-center">
          <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-900 dark:text-white mb-1">KYC জমা দিতে লগইন করুন</p>
          <p className="text-sm text-gray-400 mb-4">আপনার পরিচয় যাচাই করুন এবং সকল সেবা ব্যবহার করুন।</p>
          <Link href="/login?redirect=/kyc" className="btn-primary px-6 py-2.5 inline-flex items-center gap-2">
            লগইন করুন <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Loading */}
      {user && isLoading && (
        <div className="card p-8 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-gray-500 text-sm">লোড হচ্ছে...</span>
        </div>
      )}

      {/* Form */}
      {user && !isLoading && (!myKYC || showForm) && (
        <>
          {step === 1 && !myKYC && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 mb-6 text-white">
              <p className="font-black text-lg mb-1">পরিচয় যাচাই করুন</p>
              <p className="text-white/75 text-sm mb-3">আপনার অ্যাকাউন্টকে বিশ্বস্ত ও নিরাপদ করুন।</p>
              <div className="grid grid-cols-3 gap-2">
                {['✅ বিশ্বস্ত ব্যাজ', '🔒 নিরাপদ', '⚡ সকল সেবা'].map(b => (
                  <div key={b} className="bg-white/15 rounded-xl px-2 py-1.5 text-xs font-semibold text-center">{b}</div>
                ))}
              </div>
            </div>
          )}

          {/* Step indicators */}
          <div className="flex items-center gap-0.5 mb-6 px-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id, isDone = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-0.5 flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isDone ? 'bg-green-500 text-white' :
                      isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-[9px] font-semibold whitespace-nowrap ${
                      isActive ? 'text-blue-600 dark:text-blue-400' :
                      isDone ? 'text-green-500' : 'text-gray-400'
                    }`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 mx-0.5 rounded transition-all ${step > s.id ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="card p-6">
            <form onSubmit={handleSubmit(onSubmit)}>

              {/* ══ STEP 1 ══ */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                    <User className="w-4 h-4 text-blue-500" /> ব্যক্তিগত তথ্য
                  </h2>
                  <div>
                    <Label>পূর্ণ নাম *</Label>
                    <input {...register('name')} className="input w-full" placeholder="আপনার পূর্ণ নাম" />
                    <FieldError msg={errors.name?.message} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>জন্ম তারিখ *</Label>
                      <input {...register('dob')} type="date" className="input w-full"
                        max={new Date().toISOString().split('T')[0]} onChange={handleDobChange} />
                      <FieldError msg={errors.dob?.message} />
                    </div>
                    <div>
                      <Label>বয়স *</Label>
                      <input {...register('age')} type="number" min={1} max={120} className="input w-full" placeholder="স্বয়ংক্রিয়" />
                      <FieldError msg={errors.age?.message} />
                    </div>
                  </div>
                  <div>
                    <Label>লিঙ্গ *</Label>
                    <div className="flex gap-2">
                      {GENDER_OPTIONS.map(g => (
                        <label key={g.v} className="flex-1 cursor-pointer">
                          <input type="radio" {...register('gender')} value={g.v} className="sr-only" />
                          <div className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${
                            genderValue === g.v
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-200 dark:border-gray-700 text-gray-500'
                          }`}>
                            <span className="text-xl">{g.emoji}</span>
                            <span className="text-xs font-bold">{g.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    <FieldError msg={errors.gender?.message} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
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
                </div>
              )}

              {/* ══ STEP 2 ══ */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                    <MapPin className="w-4 h-4 text-blue-500" /> যোগাযোগ ও ঠিকানা
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>মোবাইল নম্বর *</Label>
                      <input {...register('phone')} className="input w-full" placeholder="01XXXXXXXXX" />
                      <FieldError msg={errors.phone?.message} />
                    </div>
                    <div>
                      <Label>ইমেইল</Label>
                      <input {...register('email')} type="email" className="input w-full" placeholder="email@example.com" />
                      <FieldError msg={errors.email?.message} />
                    </div>
                  </div>
                  <div>
                    <Label>বিস্তারিত ঠিকানা *</Label>
                    <textarea {...register('address')} rows={3} className="input w-full resize-none"
                      placeholder="বাড়ি নং, গ্রাম/মহল্লা, থানা, জেলা" />
                    <FieldError msg={errors.address?.message} />
                  </div>
                  <div>
                    <Label>বিভাগ *</Label>
                    <select {...register('region')} className="input w-full">
                      <option value="">— বিভাগ বেছে নিন —</option>
                      {BD_DIVISIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <FieldError msg={errors.region?.message} />
                  </div>
                </div>
              )}

              {/* ══ STEP 3 ══ */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                    <CreditCard className="w-4 h-4 text-blue-500" /> পরিচয়পত্রের তথ্য
                  </h2>
                  <div>
                    <Label>পরিচয়পত্রের ধরন *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {ID_TYPES.map(t => (
                        <label key={t.value} className="cursor-pointer">
                          <input type="radio" {...register('idType')} value={t.value} className="sr-only" />
                          <div className={`text-center py-3 px-2 rounded-2xl border-2 transition text-xs font-semibold ${
                            idTypeValue === t.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                          }`}>{t.label}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>পরিচয়পত্র নম্বর *</Label>
                    <input {...register('nidPassport')} className="input w-full font-mono tracking-wider"
                      placeholder={idTypeValue === 'passport' ? 'AB1234567' : idTypeValue === 'birth_certificate' ? '20001234567890' : '1234567890123'} />
                    <FieldError msg={errors.nidPassport?.message} />
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-3">
                    <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      পরবর্তী ধাপে পরিচয়পত্রের ছবি আপলোড করতে হবে।
                    </p>
                  </div>
                </div>
              )}

              {/* ══ STEP 4 ══ */}
              {step === 4 && (
                <div className="space-y-5">
                  <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                    <Camera className="w-4 h-4 text-blue-500" /> ছবি আপলোড
                  </h2>
                  <div>
                    <Label>প্রোফাইল ছবি *</Label>
                    <div className="w-36 mx-auto">
                      <div onClick={() => photoRef.current?.click()}
                        className={`w-36 h-36 rounded-3xl border-2 border-dashed transition cursor-pointer overflow-hidden
                          flex items-center justify-center relative group
                          ${photoPreview ? 'border-green-400 dark:border-green-600'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 bg-gray-50 dark:bg-gray-800/50'}`}
                      >
                        {photoPreview ? (
                          <>
                            <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <Camera className="w-7 h-7 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-400">
                            <Camera className="w-8 h-8" />
                            <span className="text-xs font-semibold">ছবি তুলুন</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center text-gray-400 mt-2">স্পষ্ট মুখের ছবি দিন</p>
                    </div>
                    <input ref={photoRef} type="file" accept="image/*" className="hidden"
                      onChange={e => handleFile(e, photoFile, setPhotoPreview)} />
                  </div>
                  <div>
                    <Label>
                      {ID_TYPES.find(i => i.value === idTypeValue)?.label ?? 'পরিচয়পত্র'} ছবি
                      <span className="font-normal text-gray-400 ml-1">(ঐচ্ছিক কিন্তু প্রস্তাবিত)</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <PhotoBox label="সামনের দিক" sublabel="Front side" preview={nidFrontPreview}
                          onClick={() => nidFrontRef.current?.click()} />
                        <input ref={nidFrontRef} type="file" accept="image/*" className="hidden"
                          onChange={e => handleFile(e, nidFrontFile, setNidFrontPreview)} />
                      </div>
                      <div>
                        <PhotoBox label="পেছনের দিক" sublabel="Back side" preview={nidBackPreview}
                          onClick={() => nidBackRef.current?.click()} />
                        <input ref={nidBackRef} type="file" accept="image/*" className="hidden"
                          onChange={e => handleFile(e, nidBackFile, setNidBackPreview)} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-3 space-y-1">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300">ছবির নির্দেশনা</p>
                    {['ছবি স্পষ্ট ও ঝাপসামুক্ত হতে হবে', 'সর্বোচ্চ ফাইল সাইজ: ৫ MB', 'JPG, PNG, WEBP ফরম্যাট গ্রহণযোগ্য'].map(t => (
                      <p key={t} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />{t}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* ══ STEP 5: PAYMENT ══ */}
              {step === 5 && (
                <div className="space-y-5">
                  <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                    <Banknote className="w-4 h-4 text-blue-500" /> সদস্যপদ ফি পেমেন্ট
                  </h2>

                  {/* Fee banner */}
                  <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl p-5 text-white text-center">
                    <p className="text-sm font-semibold text-white/70 mb-1">একবারের সদস্যপদ ফি</p>
                    <p className="text-5xl font-black tracking-tight">৳{MEMBERSHIP_FEE}</p>
                    <p className="text-xs text-white/60 mt-1">অ-ফেরতযোগ্য · এককালীন</p>
                  </div>

                  {/* Method selector */}
                  <div>
                    <Label>পেমেন্ট পদ্ধতি *</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {PAYMENT_METHODS.map(m => (
                        <label key={m.id} className="cursor-pointer">
                          <input type="radio" {...register('paymentMethod')} value={m.id} className="sr-only" />
                          <div className={`text-center py-2.5 px-1 rounded-2xl border-2 transition text-xs font-bold ${
                            paymentMethodValue === m.id
                              ? `${m.border} ${m.bg} ${m.textColor}`
                              : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                          }`}>{m.label}</div>
                        </label>
                      ))}
                    </div>
                    <FieldError msg={errors.paymentMethod?.message} />
                  </div>

                  {/* Receiver number */}
                  <div className={`rounded-2xl border ${selectedMethod.border} ${selectedMethod.bg} p-4`}>
                    <p className={`text-xs font-semibold mb-2 ${selectedMethod.textColor}`}>
                      এই নম্বরে পাঠান — {selectedMethod.label}
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-2xl font-black tracking-widest ${selectedMethod.textColor}`}>
                        {PAYMENT_NUMBER}
                      </p>
                      <CopyButton text={PAYMENT_NUMBER} />
                    </div>
                  </div>

                  {/* Sender number */}
                  <div>
                    <Label>আপনার পেমেন্ট নম্বর (যেটি থেকে পাঠিয়েছেন) *</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input {...register('senderNumber')} className="input w-full pl-9" placeholder="01XXXXXXXXX" />
                    </div>
                    <FieldError msg={errors.senderNumber?.message} />
                  </div>

                  {/* TrxID + amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>TRANSACTION ID *</Label>
                      <input {...register('transactionId')} className="input w-full font-mono tracking-wider uppercase" placeholder="TrxID" />
                      <FieldError msg={errors.transactionId?.message} />
                    </div>
                    <div>
                      <Label>পাঠানো পরিমাণ (৳) *</Label>
                      <input {...register('paidAmount')} type="number" className="input w-full" placeholder="200" />
                      <FieldError msg={errors.paidAmount?.message} />
                    </div>
                  </div>

                  {/* Note */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                      উপরের নম্বরে ৳{MEMBERSHIP_FEE} পাঠান, তারপর আপনার নম্বর ও Transaction ID দিন।
                      Admin যাচাই করার পর সদস্যপদ সক্রিয় হবে।
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button type="button" onClick={prevStep}
                    className="flex items-center gap-1.5 px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700
                      text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী
                  </button>
                )}
                {step < 5 ? (
                  <button type="button" onClick={nextStep}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 rounded-2xl">
                    পরবর্তী <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={mutation.isPending}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 rounded-2xl disabled:opacity-60">
                    {mutation.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> জমা হচ্ছে...</>
                      : <><ShieldCheck className="w-4 h-4" /> KYC ও পেমেন্ট জমা দিন</>
                    }
                  </button>
                )}
              </div>
            </form>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle, DollarSign, ShoppingBag,
  GraduationCap, Handshake, TrendingUp, ChevronRight,
  Calendar, MapPin, Clock, Upload, ArrowRight,
  BookOpen, Video, FileText, Scale, BarChart2,
  Star, Quote, AlertCircle, X, Loader2,
  CreditCard, Banknote, UserCheck, BadgeCheck,
  User, Phone, Mail, Building2, IdCard,
  Baby, Home, Flag, Map,
} from 'lucide-react';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';

// ─── Types ──────────────────────────────────────────────────────────────────
type Tab = 'home' | 'register' | 'howit' | 'stories' | 'resources' | 'events' | 'funding';

interface RegistrationForm {
  // ── Personal ──────────────────────────────────────────────────────────────
  fullName:      string;
  dateOfBirth:   string;
  gender:        string;
  address:       string;
  district:      string;
  division:      string;
  region:        string;
  phone:         string;
  nidOrPassport: string;
  fatherName:    string;
  motherName:    string;
  email:         string;
  // ── Media ─────────────────────────────────────────────────────────────────
  photoFile:     File | null;   // portrait
  mediaFile:     File | null;   // product photo / video
  mediaLink:     string;
  // ── Business ──────────────────────────────────────────────────────────────
  businessName:  string;
  category:      string;
  description:   string;
  problems:      string;
  // ── Membership payment ────────────────────────────────────────────────────
  payMethod:     string;
  senderNumber:  string;
  transactionId: string;
}

interface FundingForm {
  name:          string;
  regId:         string;
  amount:        string;
  purpose:       string;
  repayPlan:     string;
  pitchVideo:    string;
  payMethod:     string;
  senderNumber:  string;
  transactionId: string;
}

interface AssocMember {
  _id:      string;
  name:     string;
  role:     string;
  business: string;
  location: string;
  joinedAt: string;
  photo?:   { url: string };
  isActive: boolean;
}

interface FundingOpportunity {
  _id:         string;
  title:       string;
  description: string;
  maxAmount:   number;
  deadline:    string;
  status:      string;
  image?:      { url: string };
}

// ─── API Base ─────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? 'Request failed');
  }
  return res.json();
}

// ─── Payment & form constants ─────────────────────────────────────────────────
const RECEIVE_NUMBER = '01734166488';
const MEMBERSHIP_FEE = 200;

const PAY_METHODS = [
  { id: 'bkash',  label: 'bKash',  color: '#E2136E', bg: '#FDE8F2' },
  { id: 'nagad',  label: 'Nagad',  color: '#EF5F20', bg: '#FEF0EA' },
  { id: 'rocket', label: 'Rocket', color: '#8F16B2', bg: '#F5E8FB' },
];

const GENDERS = [
  { id: 'male',   label: 'পুরুষ' },
  { id: 'female', label: 'মহিলা' },
  { id: 'other',  label: 'অন্যান্য' },
];

// Bangladesh divisions
const DIVISIONS = [
  'ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী',
  'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ',
];

const CATEGORIES = [
  'খাদ্য ও পানীয়', 'হস্তশিল্প ও কারুকাজ', 'পোশাক ও ফ্যাশন',
  'প্রযুক্তি ও সফটওয়্যার', 'কৃষি ও মৎস্য', 'শিক্ষা ও প্রশিক্ষণ',
  'স্বাস্থ্যসেবা', 'অন্যান্য',
];

const STATS = [
  { icon: Users,       value: '৩৪০+',  label: 'সক্রিয় উদ্যোক্তা'  },
  { icon: CheckCircle, value: '৮৫+',   label: 'অনুমোদিত প্রকল্প'   },
  { icon: DollarSign,  value: '৳৩৫L+', label: 'বিতরণ করা ফান্ড'    },
  { icon: ShoppingBag, value: '১২০+',  label: 'Harmony Shop পণ্য' },
];

const FUND_BREAKDOWN = [
  { label: 'শিক্ষা ও মেন্টরশিপ', pct: 30 },
  { label: 'ব্যবসায়িক ফান্ডিং',  pct: 35 },
  { label: 'মার্কেটপ্লেস সেটআপ', pct: 20 },
  { label: 'অপারেশন',             pct: 15 },
];

const HOW_STEPS = [
  { num: '১', icon: FileText,      title: 'আবেদন ফর্ম পূরণ করুন',         desc: 'আপনার ব্যক্তিগত তথ্য, ব্যবসার বিবরণ এবং পণ্যের ছবি সহ নিবন্ধন ফর্ম জমা দিন।' },
  { num: '২', icon: CheckCircle,   title: 'অ্যাডমিন রিভিউ',               desc: 'আমাদের টিম ৩–৫ কার্যদিবসের মধ্যে আবেদন যাচাই-বাছাই করবে।' },
  { num: '৩', icon: Handshake,     title: 'অনুমোদন ও যোগাযোগ',            desc: 'অনুমোদিত হলে আমাদের মেন্টর টিম সরাসরি আপনার সাথে যোগাযোগ করবে।' },
  { num: '৪', icon: GraduationCap, title: 'মেন্টরশিপ ও ট্রেনিং',          desc: 'ব্যবসা পরিচালনা, মার্কেটিং ও আর্থিক পরিকল্পনায় বিশেষজ্ঞ সহায়তা পাবেন।' },
  { num: '৫', icon: ShoppingBag,   title: 'Harmony Shop ও ফান্ডিং সুযোগ', desc: 'পণ্যের মান ভালো হলে Harmony Shop-এ বিক্রির সুযোগ এবং যোগ্যদের ফান্ডিং দেওয়া হবে।' },
];

const SUCCESS_STORIES = [
  { name: 'রহিমা বেগম',    business: 'রহিমার রান্নাঘর', location: 'সিলেট',       emoji: '🍜', quote: 'মাত্র ৮,০০০ টাকা নিয়ে শুরু করেছিলাম। Harmony-র মেন্টরশিপ ও Harmony Shop-এর সুবাদে এখন মাসে ৪০,০০০+ টাকা আয় করছি।', income: '৳৪০,০০০/মাস' },
  { name: 'করিম ভাই',     business: 'কারুকাজ বুটিক',  location: 'মৌলভীবাজার', emoji: '🧵', quote: 'মার্কেটিং জানতাম না, পণ্য বিক্রি হচ্ছিল না। ট্রেনিং নেওয়ার পর অনলাইন বিক্রি শুরু করলাম। এখন ঢাকা-চট্টগ্রামে পণ্য যাচ্ছে।', income: '৳২৫,০০০/মাস' },
  { name: 'নাসরিন আক্তার', business: 'সবুজ কৃষি',   location: 'সুনামগঞ্জ',   emoji: '🌱', quote: 'জৈব সবজি চাষ করতাম কিন্তু বাজার পেতাম না। Harmony-র নেটওয়ার্কে যুক্ত হয়ে এখন রেস্তোরাঁ ও হোটেলে সরাসরি সাপ্লাই করছি।', income: '৳৩২,০০০/মাস' },
];

const RESOURCES = [
  { icon: FileText,   title: 'ব্যবসার পরিকল্পনা গাইড',           tag: 'Business Plan • বাংলা গাইড'          },
  { icon: Video,      title: 'সোশ্যাল মিডিয়া মার্কেটিং',        tag: 'Marketing • ভিডিও + আর্টিকেল'        },
  { icon: BarChart2,  title: 'আর্থিক হিসাব ও অ্যাকাউন্টিং',    tag: 'Finance • সহজ বাংলায়'               },
  { icon: Scale,      title: 'ব্যবসা নিবন্ধন ও আইনি গাইড',      tag: 'Legal • বাংলাদেশ সরকার নির্দেশিকা' },
  { icon: BookOpen,   title: 'পণ্যের মূল্য নির্ধারণ পদ্ধতি',    tag: 'Pricing Strategy • টেমপ্লেট সহ'     },
  { icon: TrendingUp, title: 'বিক্রয় ও গ্রাহক ধরে রাখার কৌশল', tag: 'Sales • প্র্যাকটিক্যাল গাইড'        },
];

const EVENTS = [
  { day: '১৫', month: 'মে',  title: 'উদ্যোক্তা মেলা ২০২৫ — সিলেট',  location: 'সিলেট রিক্রিয়েশন ক্লাব', time: 'সকাল ৯টা–সন্ধ্যা ৬টা', badge: 'নিবন্ধন খোলা', badgeColor: 'green' },
  { day: '২২', month: 'মে',  title: 'ডিজিটাল মার্কেটিং ওয়ার্কশপ',   location: 'অনলাইন (Zoom)',            time: 'বিকাল ৩টা–৬টা',        badge: 'বিনামূল্যে',    badgeColor: 'teal'  },
  { day: '০৫', month: 'জুন', title: 'মেন্টর–মেন্টি নেটওয়ার্কিং',    location: 'Harmony অফিস, সিলেট',    time: 'সন্ধ্যা ৫টা–৮টা',      badge: 'আমন্ত্রণ',      badgeColor: 'amber' },
  { day: '১৮', month: 'জুন', title: 'ফান্ডিং পিচ ডে',               location: 'সিলেট চেম্বার অব কমার্স', time: 'সকাল ১০টা',            badge: 'আবেদন করুন',  badgeColor: 'brand' },
];

const REPAY_OPTIONS = ['৩ মাসের মধ্যে', '৬ মাসের মধ্যে', '১২ মাসের মধ্যে', 'অনুদান হিসেবে আবেদন'];

const BADGE_COLORS: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  teal:  'bg-teal-50 text-teal-700 border-teal-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  brand: 'bg-[#E1F5EE] text-[#0F4C35] border-[#5DCAA5]',
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D9E75] mb-1">{title}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{sub}</p>}
    </div>
  );
}

function SuccessBanner({ message, sub, onClose }: { message: string; sub: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      className="relative mb-5 rounded-xl border border-[#5DCAA5] bg-[#E1F5EE] px-5 py-4">
      <button onClick={onClose} className="absolute right-3 top-3 text-[#0F6E56] hover:text-[#0F4C35]">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1D9E75]" />
        <div>
          <p className="font-semibold text-[#0F4C35]">{message}</p>
          <p className="mt-0.5 text-sm text-[#0F6E56]">{sub}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ErrorBanner({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      className="relative mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
      <button onClick={onClose} className="absolute right-3 top-3 text-red-400 hover:text-red-600">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        <p className="font-semibold text-red-700">{message}</p>
      </div>
    </motion.div>
  );
}

function FormField({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function InputBase({ hasError = false, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30 transition-colors ${hasError ? 'border-red-400' : ''} ${props.className ?? ''}`}
      style={{ borderColor: hasError ? undefined : 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', ...props.style }}
    />
  );
}

function SelectBase({ hasError = false, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30 transition-colors ${hasError ? 'border-red-400' : ''} ${props.className ?? ''}`}
      style={{ borderColor: hasError ? undefined : 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)', ...props.style }}
    />
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-7 w-7 animate-spin text-[#1D9E75]" />
    </div>
  );
}

// ─── FileUpload helper ───────────────────────────────────────────────────────
function FileUploadBox({
  label, accept, file, onChange, hint,
}: { label: string; accept: string; file: File | null; onChange: (f: File | null) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 transition-colors hover:border-[#1D9E75] hover:bg-[#E1F5EE]/40"
      style={{ borderColor: 'var(--color-border)' }}>
      <Upload className="h-5 w-5" style={{ color: 'var(--color-text-secondary)' }} />
      <span className="text-sm font-medium text-center" style={{ color: 'var(--color-text-secondary)' }}>
        {file ? file.name : label}
      </span>
      {hint && <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{hint}</span>}
      <input type="file" className="hidden" accept={accept}
        onChange={e => onChange(e.target.files?.[0] ?? null)} />
    </label>
  );
}

// ─── Payment Proof Block (reused in both Register & Funding) ─────────────────
function PaymentProofBlock({
  payMethod, senderNumber, transactionId, errors, setField, receiveNumber, fee,
}: {
  payMethod: string; senderNumber: string; transactionId: string;
  errors: Record<string, string>;
  setField: (k: string, v: string) => void;
  receiveNumber: string; fee: number;
}) {
  const [copied, setCopied] = useState(false);
  const selectedMethod = PAY_METHODS.find(m => m.id === payMethod);

  const copyNumber = () => {
    navigator.clipboard.writeText(receiveNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-[#1D9E75]/40 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold" style={{ background: '#0F4C35' }}>৳</div>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>পেমেন্ট তথ্য</p>
        <span className="ml-auto text-[10px] rounded-full px-2 py-0.5 font-semibold" style={{ background: '#E1F5EE', color: '#0F4C35' }}>
          আবশ্যক — ৳{fee}
        </span>
      </div>

      {/* Receiver card */}
      <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-[#1D9E75] bg-white px-4 py-3">
        <div>
          <p className="text-xl font-bold tracking-widest text-[#0F4C35]">{receiveNumber}</p>
          <p className="text-xs text-[#0F6E56] mt-0.5">Personal / Send Money নম্বর</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-[#1D9E75]">৳{fee}</p>
          <p className="text-xs text-[#0F6E56]">পাঠাতে হবে</p>
        </div>
        <button type="button" onClick={copyNumber}
          className="shrink-0 rounded-lg border border-[#1D9E75] px-3 py-1.5 text-xs font-semibold text-[#0F4C35] transition-colors hover:bg-[#1D9E75] hover:text-white">
          {copied ? '✅ কপি' : 'কপি করুন'}
        </button>
      </div>

      {/* Method selector */}
      <FormField label="পেমেন্ট পদ্ধতি" required error={errors.payMethod}>
        <div className="grid grid-cols-3 gap-2">
          {PAY_METHODS.map(m => (
            <button key={m.id} type="button"
              onClick={() => setField('payMethod', m.id)}
              className={`rounded-lg border-2 py-2.5 text-xs font-bold transition-all ${payMethod === m.id ? 'scale-105 shadow-sm' : 'border-transparent'}`}
              style={{
                background:  payMethod === m.id ? m.bg : 'var(--color-bg-secondary)',
                borderColor: payMethod === m.id ? m.color : 'var(--color-border)',
                color:       payMethod === m.id ? m.color : 'var(--color-text-secondary)',
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </FormField>

      {/* Selected method reminder */}
      {payMethod && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-lg px-4 py-3"
          style={{ background: selectedMethod?.bg, border: `1.5px solid ${selectedMethod?.color}30` }}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: selectedMethod?.color }}>
              {selectedMethod?.label} — Send Money নম্বর
            </p>
            <p className="text-lg font-bold tracking-widest mt-0.5" style={{ color: selectedMethod?.color }}>{receiveNumber}</p>
            <p className="text-xs mt-0.5" style={{ color: selectedMethod?.color }}>পাঠাতে হবে: ৳{fee}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: selectedMethod?.color, color: '#fff' }}>
            Send Money
          </span>
        </motion.div>
      )}

      {/* Sender number & TrxID */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="যে নম্বর থেকে পাঠিয়েছেন" required error={errors.senderNumber}>
          <InputBase value={senderNumber} onChange={e => setField('senderNumber', e.target.value)}
            hasError={!!errors.senderNumber} placeholder="01XXXXXXXXX" type="tel" />
        </FormField>
        <FormField label="Transaction ID / TrxID" required error={errors.transactionId}>
          <InputBase value={transactionId} onChange={e => setField('transactionId', e.target.value)}
            hasError={!!errors.transactionId} placeholder="8FG3H2K9..." className="font-mono" />
        </FormField>
      </div>

      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        একটি Transaction ID একাধিকবার ব্যবহার করা যাবে না। ডুপ্লিকেট হলে আবেদন প্রত্যাখ্যাত হবে।
      </p>
    </div>
  );
}

// ─── Section: Home ───────────────────────────────────────────────────────────
function HomeSection({ onNav }: { onNav: (t: Tab) => void }) {
  const [members, setMembers]   = useState<AssocMember[]>([]);
  const [funding, setFunding]   = useState<FundingOpportunity[]>([]);
  const [loadingM, setLoadingM] = useState(true);
  const [loadingF, setLoadingF] = useState(true);

  useEffect(() => {
    apiFetch<{ members: AssocMember[] }>('/association/members')
      .then(d => setMembers(d.members.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoadingM(false));

    apiFetch<{ funding: FundingOpportunity[] }>('/association/funding')
      .then(d => setFunding(d.funding.slice(0, 2)))
      .catch(() => {})
      .finally(() => setLoadingF(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="card border-l-4 border-l-[#1D9E75]">
        <h2 className="font-heading text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Harmony Entrepreneur Association কী?
        </h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          আমরা একটি সামাজিক উদ্যোগ যেখানে তরুণ ও অভিজ্ঞ উদ্যোক্তারা একসাথে কাজ করে। আবেদন করুন, আমাদের টিম যাচাই করবে। অনুমোদনের পর পাবেন মেন্টরশিপ, Harmony Shop-এ বিক্রির সুযোগ এবং প্রয়োজনে ফান্ডিং।
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onNav('register')} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
            এখনই যোগ দিন <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => onNav('howit')}
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#E1F5EE]"
            style={{ borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }}>
            কীভাবে কাজ করে?
          </button>
        </div>
      </div>

      {/* 3 pillars */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: GraduationCap, title: 'মেন্টরশিপ',     desc: 'অভিজ্ঞ উদ্যোক্তাদের কাছ থেকে শিখুন',     nav: 'howit'    },
          { icon: ShoppingBag,   title: 'Harmony Shop', desc: 'আপনার পণ্য হাজারো ক্রেতার কাছে পৌঁছান', nav: 'register' },
          { icon: DollarSign,    title: 'ফান্ডিং',        desc: 'যোগ্য উদ্যোক্তাদের আর্থিক সহায়তা',       nav: 'funding'  },
        ].map((p, i) => (
          <motion.button key={p.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} onClick={() => onNav(p.nav as Tab)}
            className="card text-center py-5 cursor-pointer hover:border-[#1D9E75] transition-colors">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl gradient-brand">
              <p.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{p.title}</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{p.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Active members */}
      {(loadingM || members.length > 0) && (
        <div className="card">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            সক্রিয় সদস্যবৃন্দ
          </h3>
          {loadingM ? <LoadingSpinner /> : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {members.map(m => (
                <div key={m._id} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl"
                  style={{ background: 'var(--color-bg-secondary)' }}>
                  {m.photo?.url
                    ? <img src={m.photo.url} alt={m.name} className="h-12 w-12 rounded-full object-cover" />
                    : <div className="h-12 w-12 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#0F4C35] font-bold text-sm">
                        {m.name.charAt(0)}
                      </div>
                  }
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{m.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{m.business}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Funding rounds */}
      {(loadingF || funding.length > 0) && (
        <div className="card">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            সক্রিয় ফান্ডিং রাউন্ড
          </h3>
          {loadingF ? <LoadingSpinner /> : (
            <div className="space-y-3">
              {funding.map(f => (
                <div key={f._id} className="flex items-start gap-3 p-3 rounded-xl border"
                  style={{ borderColor: 'var(--color-border)' }}>
                  {f.image?.url && <img src={f.image.url} alt={f.title} className="h-12 w-12 rounded-lg object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{f.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{f.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-semibold text-[#1D9E75]">সর্বোচ্চ ৳{f.maxAmount?.toLocaleString('bn-BD')}</span>
                      {f.deadline && <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                        শেষ: {new Date(f.deadline).toLocaleDateString('bn-BD')}
                      </span>}
                    </div>
                  </div>
                  <button onClick={() => onNav('funding')} className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: '#E1F5EE', color: '#0F4C35' }}>
                    আবেদন
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fund breakdown */}
      <div className="card">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          ফান্ড বিতরণের চিত্র
        </h3>
        <div className="space-y-3">
          {FUND_BREAKDOWN.map((f, i) => (
            <div key={f.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span style={{ color: 'var(--color-text)' }}>{f.label}</span>
                <span className="font-semibold" style={{ color: 'var(--color-brand)' }}>{f.pct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${f.pct}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full gradient-brand" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-6 text-center" style={{ background: '#0F4C35' }}>
        <p className="text-white font-heading text-lg font-bold mb-1">প্রস্তুত আছেন?</p>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
          আজই আবেদন করুন এবং আমাদের উদ্যোক্তা পরিবারের অংশ হন
        </p>
        <button onClick={() => onNav('register')}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-[#0F4C35] hover:bg-[#E1F5EE] transition-colors">
          নিবন্ধন করুন <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Section: Registration ───────────────────────────────────────────────────
function RegisterSection() {
  const EMPTY: RegistrationForm = {
    fullName: '', dateOfBirth: '', gender: '', address: '', district: '',
    division: '', region: '', phone: '', nidOrPassport: '', fatherName: '',
    motherName: '', email: '', photoFile: null, mediaFile: null, mediaLink: '',
    businessName: '', category: '', description: '', problems: '',
    payMethod: '', senderNumber: '', transactionId: '',
  };

  const [form, setForm]           = useState<RegistrationForm>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [apiError, setApiError]   = useState('');
  const [errors, setErrors]       = useState<Partial<Record<keyof RegistrationForm, string>>>({});

  const set = (k: keyof RegistrationForm, v: string | File | null) =>
    setForm(prev => ({ ...prev, [k]: v }));

  // Generic setter for PaymentProofBlock (receives string keys)
  const setStr = (k: string, v: string) => set(k as keyof RegistrationForm, v);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.fullName.trim())      e.fullName      = 'পূর্ণ নাম দিন';
    if (!form.dateOfBirth)          e.dateOfBirth   = 'জন্ম তারিখ দিন';
    if (!form.gender)               e.gender        = 'লিঙ্গ বেছে নিন';
    if (!form.address.trim())       e.address       = 'ঠিকানা দিন';
    if (!form.district.trim())      e.district      = 'জেলা দিন';
    if (!form.division)             e.division      = 'বিভাগ বেছে নিন';
    if (!form.phone.trim())         e.phone         = 'ফোন নম্বর দিন';
    if (!form.nidOrPassport.trim()) e.nidOrPassport = 'NID বা পাসপোর্ট নম্বর দিন';
    if (!form.fatherName.trim())    e.fatherName    = 'পিতার নাম দিন';
    if (!form.motherName.trim())    e.motherName    = 'মাতার নাম দিন';
    if (!form.businessName.trim())  e.businessName  = 'ব্যবসার নাম দিন';
    if (!form.category)             e.category      = 'ক্যাটাগরি বেছে নিন';
    if (!form.description.trim())   e.description   = 'বিবরণ দিন';
    if (!form.payMethod)            e.payMethod     = 'পেমেন্ট পদ্ধতি বেছে নিন';
    if (!form.senderNumber.trim())  e.senderNumber  = 'প্রেরক নম্বর দিন';
    if (!form.transactionId.trim()) e.transactionId = 'Transaction ID দিন';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const fd = new FormData();
      // Personal
      fd.append('fullName',      form.fullName.trim());
      fd.append('dateOfBirth',   form.dateOfBirth);
      fd.append('gender',        form.gender);
      fd.append('address',       form.address.trim());
      fd.append('district',      form.district.trim());
      fd.append('division',      form.division);
      if (form.region)        fd.append('region',        form.region.trim());
      fd.append('phone',         form.phone.trim());
      fd.append('nidOrPassport', form.nidOrPassport.trim());
      fd.append('fatherName',    form.fatherName.trim());
      fd.append('motherName',    form.motherName.trim());
      if (form.email)         fd.append('email',         form.email.trim());
      // Files
      if (form.photoFile)     fd.append('photo', form.photoFile);
      if (form.mediaFile)     fd.append('media', form.mediaFile);
      if (form.mediaLink)     fd.append('mediaLink', form.mediaLink.trim());
      // Business
      fd.append('businessName',  form.businessName.trim());
      fd.append('category',      form.category);
      fd.append('description',   form.description.trim());
      if (form.problems)      fd.append('problems', form.problems.trim());
      // Payment
      fd.append('payMethod',     form.payMethod);
      fd.append('senderNumber',  form.senderNumber.trim());
      fd.append('transactionId', form.transactionId.trim());
      fd.append('membershipFee', String(MEMBERSHIP_FEE));

      const res = await fetch(`${API_BASE}/association/register`, {
        method: 'POST',
        body: fd,
        // No Content-Type header — browser sets multipart boundary automatically
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'আবেদন জমা দিতে সমস্যা হয়েছে।');

      setSubmitted(true);
      setForm(EMPTY);
      setErrors({});
    } catch (e: any) {
      setApiError(e.message ?? 'আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {submitted && (
          <SuccessBanner
            message="✅ আবেদন সফলভাবে জমা হয়েছে!"
            sub="আমাদের অ্যাডমিন টিম ৩–৫ কার্যদিবসের মধ্যে আপনার মোবাইলে যোগাযোগ করবে।"
            onClose={() => setSubmitted(false)}
          />
        )}
        {apiError && <ErrorBanner message={apiError} onClose={() => setApiError('')} />}
      </AnimatePresence>

      {/* Payment instruction banner */}
      <div className="rounded-2xl overflow-hidden border-2 border-[#1D9E75]">
        <div className="px-5 py-4 text-white" style={{ background: '#0F4C35' }}>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-5 w-5 text-[#9FE1CB]" />
            <h3 className="font-semibold text-base">সদস্যপদ নিবন্ধন ফি — ৳{MEMBERSHIP_FEE}</h3>
          </div>
          <p className="text-sm text-white/70">
            আবেদন জমা দেওয়ার আগে ৳{MEMBERSHIP_FEE} নিবন্ধন ফি পাঠাতে হবে। bKash / Nagad / Rocket-এ Send Money করুন।
          </p>
        </div>
        <div className="px-5 py-3" style={{ background: '#E1F5EE' }}>
          <div className="flex flex-wrap gap-2">
            {PAY_METHODS.map(m => (
              <div key={m.id} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
                style={{ borderColor: m.color, background: m.bg, color: m.color }}>
                {m.label}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>পাঠানোর পর নিচের ফর্মে <strong>Transaction ID</strong> ও <strong>প্রেরক নম্বর</strong> অবশ্যই দিন।</span>
          </div>
        </div>
      </div>

      {/* ── Main form card ─────────────────────────────────────────────────── */}
      <div className="card">
        <h2 className="font-heading text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>উদ্যোক্তা নিবন্ধন ফর্ম</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          নিচের সব তথ্য সঠিকভাবে পূরণ করুন। তারকা (*) চিহ্নিত ঘর আবশ্যক।
        </p>

        <div className="space-y-7">

          {/* ════ BLOCK 1: Personal Information ════════════════════════════ */}
          <div className="space-y-4">
            <SectionHeader title="ব্যক্তিগত তথ্য" sub="আবেদনকারীর মূল পরিচয় তথ্য" />

            {/* Full name + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="পূর্ণ নাম" required error={errors.fullName}>
                <InputBase value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  hasError={!!errors.fullName} placeholder="যেমন: মো. রহিম উদ্দিন" />
              </FormField>
              <FormField label="মোবাইল নম্বর" required error={errors.phone}>
                <InputBase value={form.phone} onChange={e => set('phone', e.target.value)}
                  hasError={!!errors.phone} placeholder="০১XXXXXXXXX" type="tel" />
              </FormField>
            </div>

            {/* DOB + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="জন্ম তারিখ" required error={errors.dateOfBirth}>
                <InputBase value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
                  hasError={!!errors.dateOfBirth} type="date" max={new Date().toISOString().split('T')[0]} />
              </FormField>
              <FormField label="লিঙ্গ" required error={errors.gender}>
                <SelectBase value={form.gender} onChange={e => set('gender', e.target.value)} hasError={!!errors.gender}>
                  <option value="">— লিঙ্গ বেছে নিন —</option>
                  {GENDERS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </SelectBase>
              </FormField>
            </div>

            {/* Father + Mother */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="পিতার নাম" required error={errors.fatherName}>
                <InputBase value={form.fatherName} onChange={e => set('fatherName', e.target.value)}
                  hasError={!!errors.fatherName} placeholder="পিতার পূর্ণ নাম" />
              </FormField>
              <FormField label="মাতার নাম" required error={errors.motherName}>
                <InputBase value={form.motherName} onChange={e => set('motherName', e.target.value)}
                  hasError={!!errors.motherName} placeholder="মাতার পূর্ণ নাম" />
              </FormField>
            </div>

            {/* NID/Passport + Email */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="NID / পাসপোর্ট নম্বর" required error={errors.nidOrPassport}>
                <InputBase value={form.nidOrPassport} onChange={e => set('nidOrPassport', e.target.value)}
                  hasError={!!errors.nidOrPassport} placeholder="১৭ ডিজিটের NID বা পাসপোর্ট নম্বর" className="font-mono" />
              </FormField>
              <FormField label="ইমেইল (ঐচ্ছিক)">
                <InputBase value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="example@mail.com" type="email" />
              </FormField>
            </div>
          </div>

          {/* ════ BLOCK 2: Address ════════════════════════════════════════ */}
          <div className="space-y-4">
            <SectionHeader title="ঠিকানা" sub="বর্তমান বসবাসের ঠিকানা" />

            {/* Division + District */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="বিভাগ" required error={errors.division}>
                <SelectBase value={form.division} onChange={e => set('division', e.target.value)} hasError={!!errors.division}>
                  <option value="">— বিভাগ বেছে নিন —</option>
                  {DIVISIONS.map(d => <option key={d}>{d}</option>)}
                </SelectBase>
              </FormField>
              <FormField label="জেলা" required error={errors.district}>
                <InputBase value={form.district} onChange={e => set('district', e.target.value)}
                  hasError={!!errors.district} placeholder="যেমন: সিলেট, হবিগঞ্জ..." />
              </FormField>
            </div>

            {/* Region + Address */}
            <FormField label="উপজেলা / এলাকা (ঐচ্ছিক)">
              <InputBase value={form.region} onChange={e => set('region', e.target.value)}
                placeholder="যেমন: জৈন্তাপুর, গোলাপগঞ্জ..." />
            </FormField>

            <FormField label="বিস্তারিত ঠিকানা" required error={errors.address}>
              <InputBase value={form.address} onChange={e => set('address', e.target.value)}
                hasError={!!errors.address} placeholder="বাড়ি নম্বর, গ্রাম/মহল্লা, রাস্তার নাম..." />
            </FormField>
          </div>

          {/* ════ BLOCK 3: Photo ════════════════════════════════════════ */}
          <div className="space-y-4">
            <SectionHeader title="আবেদনকারীর ছবি" sub="পরিষ্কার পাসপোর্ট সাইজের ছবি আপলোড করুন" />
            <FileUploadBox
              label="ছবি আপলোড করুন"
              accept="image/*"
              file={form.photoFile}
              onChange={f => set('photoFile', f)}
              hint="JPG বা PNG (সর্বোচ্চ ৫ MB)"
            />
          </div>

          {/* ════ BLOCK 4: Business Information ═══════════════════════════ */}
          <div className="space-y-4">
            <SectionHeader title="ব্যবসার তথ্য" sub="আপনার উদ্যোগ সম্পর্কে বিবরণ" />

            <div className="grid grid-cols-2 gap-4">
              <FormField label="ব্যবসা / পণ্যের নাম" required error={errors.businessName}>
                <InputBase value={form.businessName} onChange={e => set('businessName', e.target.value)}
                  hasError={!!errors.businessName} placeholder="যেমন: রহিমা'স হ্যান্ডক্র্যাফট" />
              </FormField>
              <FormField label="ক্যাটাগরি" required error={errors.category}>
                <SelectBase value={form.category} onChange={e => set('category', e.target.value)} hasError={!!errors.category}>
                  <option value="">— ক্যাটাগরি বেছে নিন —</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </SelectBase>
              </FormField>
            </div>

            <FormField label="ব্যবসার সংক্ষিপ্ত বিবরণ" required error={errors.description}>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30 resize-y ${errors.description ? 'border-red-400' : ''}`}
                style={{ borderColor: errors.description ? undefined : 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                placeholder="আপনার ব্যবসা কী, কী পণ্য বা সেবা দেন, কতদিন ধরে করছেন..." />
            </FormField>

            <FormField label="বর্তমান প্রধান সমস্যাগুলো (ঐচ্ছিক)">
              <textarea value={form.problems} onChange={e => set('problems', e.target.value)} rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30 resize-y"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                placeholder="যেমন: পুঁজির অভাব, বাজার খুঁজে পাচ্ছি না, দক্ষতার ঘাটতি..." />
            </FormField>
          </div>

          {/* ════ BLOCK 5: Product Media ════════════════════════════════ */}
          <div className="space-y-4">
            <SectionHeader title="পণ্যের ছবি / ভিডিও" sub="পণ্য বা সেবার ছবি/ভিডিও দিন (ঐচ্ছিক)" />
            <FileUploadBox
              label="পণ্যের ছবি বা ভিডিও আপলোড করুন"
              accept="image/*,video/*"
              file={form.mediaFile}
              onChange={f => set('mediaFile', f)}
              hint="JPG, PNG, MP4 (সর্বোচ্চ ২০ MB)"
            />
            <FormField label="অথবা Google Drive / YouTube লিংক">
              <InputBase value={form.mediaLink} onChange={e => set('mediaLink', e.target.value)}
                placeholder="https://drive.google.com/..." />
            </FormField>
          </div>

          {/* ════ BLOCK 6: Payment Proof ════════════════════════════════ */}
          <div className="space-y-2">
            <SectionHeader title="সদস্যপদ ফি পেমেন্ট" sub={`নিবন্ধন ফি ৳${MEMBERSHIP_FEE} পাঠানোর তথ্য দিন`} />
            <PaymentProofBlock
              payMethod={form.payMethod}
              senderNumber={form.senderNumber}
              transactionId={form.transactionId}
              errors={{ payMethod: errors.payMethod ?? '', senderNumber: errors.senderNumber ?? '', transactionId: errors.transactionId ?? '' }}
              setField={setStr}
              receiveNumber={RECEIVE_NUMBER}
              fee={MEMBERSHIP_FEE}
            />
          </div>

          {/* Notice */}
          <div className="flex gap-2 rounded-lg p-3 text-sm" style={{ background: 'var(--color-bg-secondary)', border: '0.5px solid var(--color-border)' }}>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#1D9E75]" />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              আবেদন জমা দেওয়ার পর আমাদের অ্যাডমিন টিম ৩–৫ কার্যদিবসের মধ্যে আপনার মোবাইলে যোগাযোগ করবে।
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={() => { setForm(EMPTY); setErrors({}); }}
              className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#E1F5EE]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              মুছুন
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? 'জমা হচ্ছে...' : 'আবেদন ও পেমেন্ট জমা দিন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: How It Works ────────────────────────────────────────────────────
function HowItWorksSection({ onNav }: { onNav: (t: Tab) => void }) {
  return (
    <div className="card">
      <h2 className="font-heading text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>কীভাবে কাজ করে?</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>সহজ ৫টি ধাপে আপনি আমাদের সিস্টেমের অংশ হয়ে যাবেন।</p>
      <div className="relative space-y-0">
        {HOW_STEPS.map((step, i) => (
          <motion.div key={step.num} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }} className="flex gap-4 pb-6 last:pb-0">
            <div className="relative flex flex-col items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: '#0F4C35' }}>
                {step.num}
              </div>
              {i < HOW_STEPS.length - 1 && <div className="mt-1 flex-1 w-px" style={{ background: 'var(--color-border)', minHeight: 32 }} />}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2 mb-1">
                <step.icon className="h-4 w-4 text-[#1D9E75]" />
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{step.title}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <button onClick={() => onNav('register')} className="btn-primary mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm">
        এখনই আবেদন করুন <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Section: Success Stories ─────────────────────────────────────────────────
function StoriesSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>সাফল্যের গল্প</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>আমাদের উদ্যোক্তারা কীভাবে এগিয়ে গেছেন।</p>
      </div>
      {SUCCESS_STORIES.map((s, i) => (
        <motion.div key={s.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }} className="card border-l-4 border-l-[#1D9E75]">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: '#E1F5EE' }}>{s.emoji}</div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{s.name}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#0F6E56]">{s.business}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#0F6E56]">
              <MapPin className="h-3 w-3" />{s.location}
            </div>
          </div>
          <Quote className="mb-1 h-4 w-4 text-[#1D9E75]" />
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>{s.quote}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: '#E1F5EE', color: '#0F4C35' }}>
              আয়: {s.income}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Section: Resources ───────────────────────────────────────────────────────
function ResourcesSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>রিসোর্স ও গাইড</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>ব্যবসা শুরু ও পরিচালনার জন্য প্রয়োজনীয় উপকরণ।</p>
      </div>
      <div className="space-y-2">
        {RESOURCES.map((r, i) => (
          <motion.div key={r.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:border-[#1D9E75] hover:bg-[#E1F5EE]/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: '#E1F5EE' }}>
              <r.icon className="h-5 w-5 text-[#0F4C35]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{r.title}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{r.tag}</p>
            </div>
            <ChevronRight className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Events ──────────────────────────────────────────────────────────
function EventsSection({ onNav }: { onNav: (t: Tab) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>আসন্ন ইভেন্ট</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>উদ্যোক্তা মেলা, ট্রেনিং প্রোগ্রাম ও নেটওয়ার্কিং সেশন।</p>
      </div>
      <div className="card divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
        {EVENTS.map((ev, i) => (
          <motion.div key={ev.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-white" style={{ background: '#0F4C35' }}>
              <span className="text-lg font-bold leading-none">{ev.day}</span>
              <span className="text-[10px] opacity-80">{ev.month}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text)' }}>{ev.title}</p>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.time}</span>
              </div>
            </div>
            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${BADGE_COLORS[ev.badgeColor]}`}>
              {ev.badge}
            </span>
          </motion.div>
        ))}
      </div>
      <button onClick={() => onNav('register')}
        className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#E1F5EE]"
        style={{ borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }}>
        ইভেন্টে নিবন্ধন করুন <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Section: Funding ─────────────────────────────────────────────────────────
function FundingSection() {
  const EMPTY: FundingForm = {
    name: '', regId: '', amount: '', purpose: '', repayPlan: '', pitchVideo: '',
    payMethod: '', senderNumber: '', transactionId: '',
  };
  const [form, setForm]           = useState<FundingForm>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [apiError, setApiError]   = useState('');
  const [errors, setErrors]       = useState<Partial<Record<keyof FundingForm, string>>>({});
  const [funding, setFunding]     = useState<FundingOpportunity[]>([]);
  const [loadingF, setLoadingF]   = useState(true);

  useEffect(() => {
    apiFetch<{ funding: FundingOpportunity[] }>('/association/funding')
      .then(d => setFunding(d.funding))
      .catch(() => {})
      .finally(() => setLoadingF(false));
  }, []);

  const set = (k: keyof FundingForm, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const setStr = (k: string, v: string) => set(k as keyof FundingForm, v);

  const meterPct = () => {
    const n = parseInt(form.amount.replace(/[^0-9]/g, '')) || 0;
    return Math.min(100, Math.round((n / 50000) * 100));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim())          e.name          = 'নাম দিন';
    if (!form.regId.trim())         e.regId         = 'আইডি দিন';
    if (!form.amount.trim())        e.amount        = 'পরিমাণ দিন';
    if (!form.purpose.trim())       e.purpose       = 'উদ্দেশ্য লিখুন';
    if (!form.payMethod)            e.payMethod     = 'পেমেন্ট পদ্ধতি বেছে নিন';
    if (!form.senderNumber.trim())  e.senderNumber  = 'প্রেরক নম্বর দিন';
    if (!form.transactionId.trim()) e.transactionId = 'Transaction ID দিন';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const payload = {
        name:          form.name.trim(),
        regId:         form.regId.trim(),
        amount:        parseInt(form.amount.replace(/[^0-9]/g, '')) || 0,
        purpose:       form.purpose.trim(),
        repayPlan:     form.repayPlan || undefined,
        pitchVideo:    form.pitchVideo.trim() || undefined,
        payMethod:     form.payMethod,
        senderNumber:  form.senderNumber.trim(),
        transactionId: form.transactionId.trim(),
      };

      await apiFetch<{ success: boolean; message: string; applicationId: string }>(
        '/association/funding-apply',
        { method: 'POST', body: JSON.stringify(payload) },
      );

      setSubmitted(true);
      setForm(EMPTY);
      setErrors({});
    } catch (e: any) {
      setApiError(e.message ?? 'আবেদন জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {submitted && (
          <SuccessBanner
            message="✅ ফান্ডিং আবেদন ও পেমেন্ট তথ্য জমা হয়েছে!"
            sub="আমাদের ফান্ডিং কমিটি ৭–১০ কার্যদিবসের মধ্যে Transaction যাচাই করে সিদ্ধান্ত জানাবে।"
            onClose={() => setSubmitted(false)}
          />
        )}
        {apiError && <ErrorBanner message={apiError} onClose={() => setApiError('')} />}
      </AnimatePresence>

      {/* Active funding rounds */}
      {!loadingF && funding.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            সক্রিয় ফান্ডিং রাউন্ড
          </h3>
          {funding.map(f => (
            <div key={f._id} className="flex items-center justify-between p-3 rounded-xl border mb-2"
              style={{ borderColor: '#5DCAA5', background: '#E1F5EE' }}>
              <div>
                <p className="text-sm font-semibold text-[#0F4C35]">{f.title}</p>
                <p className="text-xs text-[#0F6E56]">সর্বোচ্চ ৳{f.maxAmount?.toLocaleString()}</p>
              </div>
              <BadgeCheck className="h-5 w-5 text-[#1D9E75]" />
            </div>
          ))}
        </div>
      )}

      {/* Main form */}
      <div className="card">
        <h2 className="font-heading text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>ফান্ডিং আবেদন ফর্ম</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          শুধুমাত্র নিবন্ধিত ও অনুমোদিত উদ্যোক্তারা ফান্ডিংয়ের জন্য আবেদন করতে পারবেন।
        </p>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="উদ্যোক্তার নাম" required error={errors.name}>
              <InputBase value={form.name} onChange={e => set('name', e.target.value)}
                hasError={!!errors.name} placeholder="নিবন্ধিত নাম" />
            </FormField>
            <FormField label="নিবন্ধন আইডি" required error={errors.regId}>
              <InputBase value={form.regId} onChange={e => set('regId', e.target.value)}
                hasError={!!errors.regId} placeholder="যেমন: HEA-2024-001" className="font-mono" />
            </FormField>
          </div>

          <FormField label="প্রয়োজনীয় অর্থের পরিমাণ (টাকায়)" required error={errors.amount}>
            <InputBase value={form.amount} onChange={e => set('amount', e.target.value)}
              hasError={!!errors.amount} placeholder="যেমন: ৫০০০০" type="number" min="0" />
            <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
              <motion.div animate={{ width: `${meterPct()}%` }} transition={{ duration: 0.5 }}
                className="h-full rounded-full" style={{ background: '#1D9E75' }} />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              সর্বোচ্চ প্রথম দফায়: ৳৫০,০০০ — {meterPct()}% পূরণ হয়েছে
            </p>
          </FormField>

          <FormField label="কী কাজে ব্যবহার করবেন" required error={errors.purpose}>
            <textarea value={form.purpose} onChange={e => set('purpose', e.target.value)} rows={4}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30 resize-y ${errors.purpose ? 'border-red-400' : ''}`}
              style={{ borderColor: errors.purpose ? undefined : 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
              placeholder="যন্ত্রপাতি কেনা, কাঁচামাল, দোকান ভাড়া, অনলাইন সেটআপ..." />
          </FormField>

          <FormField label="পরিশোধ পরিকল্পনা">
            <SelectBase value={form.repayPlan} onChange={e => set('repayPlan', e.target.value)}>
              <option value="">— পরিশোধ পরিকল্পনা বেছে নিন —</option>
              {REPAY_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </SelectBase>
          </FormField>

          <FormField label="পিচ ভিডিও লিংক (ঐচ্ছিক)">
            <InputBase value={form.pitchVideo} onChange={e => set('pitchVideo', e.target.value)}
              placeholder="YouTube / Drive লিংক" />
          </FormField>

          {/* Payment proof */}
          <div className="space-y-2">
            <SectionHeader title="আবেদন ফি পেমেন্ট" sub="ফান্ডিং আবেদনের সাথে ৳২০০ ফি পাঠান" />
            <PaymentProofBlock
              payMethod={form.payMethod}
              senderNumber={form.senderNumber}
              transactionId={form.transactionId}
              errors={{ payMethod: errors.payMethod ?? '', senderNumber: errors.senderNumber ?? '', transactionId: errors.transactionId ?? '' }}
              setField={setStr}
              receiveNumber={RECEIVE_NUMBER}
              fee={200}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setForm(EMPTY); setErrors({}); }}
              className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#E1F5EE]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              মুছুন
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? 'জমা হচ্ছে...' : 'আবেদন ও পেমেন্ট জমা দিন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NAV TABS ─────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string }[] = [
  { id: 'home',      label: 'হোম'             },
  { id: 'register',  label: 'নিবন্ধন'         },
  { id: 'howit',     label: 'কীভাবে কাজ করে' },
  { id: 'stories',   label: 'সাফল্যের গল্প'   },
  { id: 'resources', label: 'রিসোর্স'          },
  { id: 'events',    label: 'ইভেন্ট'          },
  { id: 'funding',   label: 'ফান্ডিং আবেদন'   },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EntrepreneurPage() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">

        {/* Hero */}
        <div className="relative overflow-hidden py-14 px-4 text-center text-white" style={{ background: '#0F4C35' }}>
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/[0.04]" />
          <div className="pointer-events-none absolute -bottom-16 -left-6 h-56 w-56 rounded-full bg-white/[0.03]" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="mb-3 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#9FE1CB]">
              Harmony Entrepreneur Association
            </span>
            <h1 className="font-heading text-3xl font-bold md:text-4xl">
              আপনার স্বপ্নের ব্যবসা শুরু করুন<br />
              <span style={{ color: '#9FE1CB' }}>আমাদের সাথে</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              ছোট ও মাঝারি উদ্যোক্তাদের মেন্টরশিপ, ফান্ডিং ও মার্কেটপ্লেস অ্যাক্সেস দিয়ে সফলতার পথে এগিয়ে নিচ্ছি।
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors backdrop-blur-sm
                    ${activeTab === t.id ? 'border-white/50 bg-white/25 text-white' : 'border-white/20 bg-white/10 text-white/80 hover:bg-white/20'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="relative z-10 mx-auto max-w-3xl px-4 -mt-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="card py-5 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl gradient-brand">
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <p className="font-heading text-xl font-bold" style={{ color: 'var(--color-brand)' }}>{s.value}</p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="mx-auto max-w-3xl px-4">
          <div className="mt-6 flex overflow-x-auto border-b" style={{ borderColor: 'var(--color-border)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors
                  ${activeTab === t.id ? 'border-[#0F4C35] text-[#0F4C35]' : 'border-transparent'}`}
                style={{ color: activeTab === t.id ? undefined : 'var(--color-text-secondary)' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="mx-auto max-w-3xl px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeTab === 'home'      && <HomeSection       onNav={setActiveTab} />}
              {activeTab === 'register'  && <RegisterSection   />}
              {activeTab === 'howit'     && <HowItWorksSection onNav={setActiveTab} />}
              {activeTab === 'stories'   && <StoriesSection    />}
              {activeTab === 'resources' && <ResourcesSection  />}
              {activeTab === 'events'    && <EventsSection     onNav={setActiveTab} />}
              {activeTab === 'funding'   && <FundingSection    />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
      <MainFooter />
    </div>
  );
}
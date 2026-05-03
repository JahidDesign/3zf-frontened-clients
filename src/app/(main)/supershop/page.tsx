'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import useAuthStore from '@/store/authStore';
import {
  ShieldCheck, Clock, CheckCircle2, XCircle,
  ChevronRight, BadgeCheck, User, CreditCard,
  Camera, MapPin, ArrowRight, Lock, Star,
  FileText, AlertCircle, Loader2, Users,
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Status badge ───────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = {
    pending:  { icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',  label: 'অপেক্ষায়' },
    approved: { icon: CheckCircle2, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',  label: 'যাচাইকৃত' },
    rejected: { icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',           label: 'প্রত্যাখ্যাত' },
  };
  const s = cfg[status as keyof typeof cfg] ?? cfg.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${s.bg} ${s.color}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  );
}

// ─── Mask helper — hide middle chars ───────────────────────────
function maskText(val: string, keepStart = 2, keepEnd = 2): string {
  if (!val || val.length <= keepStart + keepEnd) return val;
  return val.slice(0, keepStart) + '••••••' + val.slice(-keepEnd);
}

// ─── My KYC mini card ──────────────────────────────────────────
function MyKYCMiniCard({ kyc }: { kyc: any }) {
  const isApproved = kyc.status === 'approved';
  return (
    <div className={`card p-5 mb-6 ${
      isApproved ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : ''
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {kyc.photo?.url ? (
            <img src={kyc.photo.url} alt="" className="w-12 h-12 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-white truncate">{kyc.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              জমা: {format(new Date(kyc.submittedAt), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
        <StatusBadge status={kyc.status} />
      </div>

      {kyc.status === 'rejected' && kyc.adminNote && (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-600 dark:text-red-400
          bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 border border-red-100 dark:border-red-800">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span><strong>কারণ:</strong> {kyc.adminNote}</span>
        </div>
      )}

      {isApproved && (
        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800 flex flex-wrap gap-2">
          {['পরিচয় যাচাইকৃত', 'বিশ্বস্ত ব্যবহারকারী', 'সকল সেবা সক্রিয়'].map(b => (
            <span key={b} className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400 font-semibold">
              <BadgeCheck className="w-3.5 h-3.5 shrink-0" /> {b}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Link
          href="/kyc/verify"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          বিস্তারিত দেখুন <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── KYC Members Table ─────────────────────────────────────────
function KYCMembersTable({ members }: { members: any[] }) {
  if (!members || members.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
        কোনো সদস্য পাওয়া যায়নি
      </div>
    );
  }

  const genderLabel = (g: string) =>
    g === 'male' ? 'পুরুষ' : g === 'female' ? 'মহিলা' : 'অন্যান্য';

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">#</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">সদস্য</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">লিঙ্গ</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">বিভাগ</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">পরিচয়পত্র</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">জমার তারিখ</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">অবস্থা</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {members.map((m, i) => (
            <tr key={m._id ?? i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
              {/* Serial */}
              <td className="px-4 py-3 text-gray-400 text-xs font-mono">{i + 1}</td>

              {/* Name + photo */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {m.photo?.url ? (
                    <img src={m.photo.url} alt="" className="w-8 h-8 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white leading-tight">{m.name}</p>
                    <p className="text-xs text-gray-400">বয়স {m.age}</p>
                  </div>
                </div>
              </td>

              {/* Gender */}
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs font-medium">
                {genderLabel(m.gender)}
              </td>

              {/* Region */}
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">
                {m.region || '—'}
              </td>

              {/* ID number — masked, no email/phone shown */}
              <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                {m.nidPassport ? maskText(m.nidPassport, 3, 3) : '—'}
              </td>

              {/* Submitted date */}
              <td className="px-4 py-3 text-xs text-gray-400">
                {m.submittedAt ? format(new Date(m.submittedAt), 'dd MMM yyyy') : '—'}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <StatusBadge status={m.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Steps ─────────────────────────────────────────────────────
const KYC_STEPS = [
  { icon: User,       label: 'ব্যক্তিগত তথ্য',  desc: 'নাম, জন্ম তারিখ, লিঙ্গ, পিতা-মাতার নাম' },
  { icon: MapPin,     label: 'যোগাযোগ ও ঠিকানা', desc: 'মোবাইল, ইমেইল, বিভাগ, বিস্তারিত ঠিকানা' },
  { icon: CreditCard, label: 'পরিচয়পত্র',        desc: 'NID / পাসপোর্ট / জন্ম নিবন্ধন নম্বর' },
  { icon: Camera,     label: 'ছবি আপলোড',         desc: 'প্রোফাইল ছবি এবং পরিচয়পত্রের ছবি' },
];

const BENEFITS = [
  { icon: ShieldCheck, title: 'বিশ্বস্ত ব্যাজ',        desc: 'যাচাইকৃত অ্যাকাউন্টে বিশ্বস্ততার প্রতীক পাবেন' },
  { icon: Lock,        title: 'নিরাপদ অ্যাকাউন্ট',    desc: 'আপনার অ্যাকাউন্ট সুরক্ষিত ও নিরাপদ থাকবে' },
  { icon: Star,        title: 'সকল সেবায় অ্যাক্সেস', desc: 'প্ল্যাটফর্মের সমস্ত সেবা সম্পূর্ণরূপে ব্যবহার করুন' },
  { icon: FileText,    title: 'দ্রুত যাচাই প্রক্রিয়া',desc: '২৪-৪৮ ঘন্টার মধ্যে আপনার আবেদন পর্যালোচনা হবে' },
];

// ─── Main Page ─────────────────────────────────────────────────
export default function KYCMainPage() {
  const { user } = useAuthStore();

  // My own KYC
  const { data: myData, isLoading: myLoading } = useQuery({
    queryKey: ['my-kyc'],
    queryFn:  () => api.get('/kyc/my').then(r => r.data),
    enabled:  !!user,
    staleTime: 30_000,
  });

  // All approved members list (public — no sensitive data)
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['kyc-members'],
    queryFn:  () => api.get('/kyc/members').then(r => r.data),
    staleTime: 60_000,
  });

  const myKYC      = myData?.kyc ?? null;
  const members    = membersData?.members ?? [];

  // Block CTA if already submitted (pending / approved / rejected-but-not-reapply)
  // Only rejected users may re-apply; everyone else: no form access
  const canApply =
    !myKYC ||                         // never submitted
    myKYC.status === 'rejected';      // was rejected → allowed to re-apply

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full border-2 border-white" />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full border border-white" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-white" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
              <ShieldCheck className="w-8 h-8 text-white drop-shadow" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
              KYC পরিচয় যাচাই
            </h1>
            <p className="text-white/75 text-sm max-w-sm mx-auto leading-relaxed">
              আপনার পরিচয় যাচাই করুন, বিশ্বস্ততার ব্যাজ পান এবং সকল প্রিমিয়াম সেবা উপভোগ করুন।
            </p>
            {!user && (
              <div className="mt-5">
                <Link
                  href="/login?redirect=/kyc"
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-2xl hover:bg-blue-50 transition text-sm shadow-lg"
                >
                  শুরু করুন <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── My KYC status ────────────────────────────────── */}
        {user && myLoading && (
          <div className="card p-6 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-400">লোড হচ্ছে...</span>
          </div>
        )}

        {user && !myLoading && myKYC && (
          <MyKYCMiniCard kyc={myKYC} />
        )}

        {/* ── Benefits ─────────────────────────────────────── */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-500" /> KYC-র সুবিধাসমূহ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BENEFITS.map(b => (
              <div
                key={b.title}
                className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl px-4 py-3"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <b.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{b.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── How it works ─────────────────────────────────── */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-indigo-500" /> কীভাবে আবেদন করবেন
          </h2>
          <div className="space-y-3">
            {KYC_STEPS.map((s, i) => (
              <div key={s.label} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  {i < KYC_STEPS.length - 1 && (
                    <div className="w-0.5 h-4 bg-gray-200 dark:bg-gray-700 mt-1" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded-md">
                      ধাপ {['১', '২', '৩', '৪'][i]}
                    </span>
                    {s.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Info notice ───────────────────────────────────── */}
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3.5">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            <strong>গুরুত্বপূর্ণ:</strong> সঠিক ও নির্ভুল তথ্য প্রদান করুন। ভুল তথ্য দিলে আবেদন বাতিল হতে পারে।
            যাচাই সম্পন্ন হতে সাধারণত ২৪-৪৮ ঘন্টা সময় লাগে।
          </div>
        </div>

        {/* ── CTA — single-submit guard ─────────────────────── */}
        {user && !myLoading && (
          <div>
            {/* Never submitted */}
            {!myKYC && (
              <Link
                href="/kyc/verify"
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base font-bold rounded-2xl"
              >
                <ShieldCheck className="w-5 h-5" />
                KYC আবেদন শুরু করুন
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {/* Rejected — allow re-apply */}
            {myKYC?.status === 'rejected' && (
              <Link
                href="/kyc/verify"
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base font-bold rounded-2xl"
              >
                <ShieldCheck className="w-5 h-5" />
                পুনরায় আবেদন করুন
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {/* Pending — no navigation, just status */}
            {myKYC?.status === 'pending' && (
              <div className="w-full py-4 flex items-center justify-center gap-2 text-sm font-bold rounded-2xl
                bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800
                text-amber-700 dark:text-amber-300 cursor-not-allowed select-none">
                <Clock className="w-4 h-4" />
                আবেদন যাচাই চলছে — পুনরায় আবেদন করা যাবে না
              </div>
            )}

            {/* Approved — no navigation, locked */}
            {myKYC?.status === 'approved' && (
              <div className="w-full py-4 flex items-center justify-center gap-2 text-sm font-bold rounded-2xl
                bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800
                text-green-700 dark:text-green-400 cursor-not-allowed select-none">
                <BadgeCheck className="w-5 h-5" />
                আপনার পরিচয় সফলভাবে যাচাইকৃত — আবেদন সম্পন্ন
              </div>
            )}
          </div>
        )}

        {!user && (
          <Link
            href="/login?redirect=/kyc"
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base font-bold rounded-2xl"
          >
            লগইন করুন এবং শুরু করুন <ChevronRight className="w-5 h-5" />
          </Link>
        )}

        {/* ── KYC Members Table ─────────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-violet-500" /> যাচাইকৃত সদস্যগণ
            </h2>
            {membersLoading && (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            )}
            {!membersLoading && members.length > 0 && (
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20
                border border-violet-200 dark:border-violet-800 px-2.5 py-1 rounded-full">
                মোট {members.length} জন
              </span>
            )}
          </div>

          {membersLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" /> লোড হচ্ছে...
            </div>
          ) : (
            <KYCMembersTable members={members} />
          )}

          {/* Privacy note */}
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
            <Lock className="w-3 h-3 shrink-0" />
            ইমেইল ও মোবাইল নম্বর গোপন রাখা হয়েছে — শুধুমাত্র সাধারণ তথ্য প্রদর্শিত হচ্ছে।
          </p>
        </div>

      </div>

      <MainFooter />
    </div>
  );
}
'use client';

import { Store, Users, BadgeCheck, TrendingUp, Bell, CalendarDays, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

interface Props { onGoShops: () => void; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveCount(data: any): number | null {
  if (data === null || data === undefined) return null;
  if (typeof data.total   === 'number') return data.total;
  if (typeof data.count   === 'number') return data.count;
  if (Array.isArray(data))              return data.length;
  if (Array.isArray(data.data))         return data.data.length;
  if (Array.isArray(data.shops))        return data.shops.length;
  if (Array.isArray(data.kycs))         return data.kycs.length;
  if (Array.isArray(data.results))      return data.results.length;
  return null;
}

function Spinner() {
  return <Loader2 className="w-4 h-4 animate-spin opacity-40" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommunityHome({ onGoShops }: Props) {

  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['shop-count'],
    queryFn:  () => api.get('/community-shop/shops').then(r => r.data),
    staleTime: 60_000,
  });

  const { data: kycData, isLoading: kycLoading } = useQuery({
    queryKey: ['kyc-count'],
    queryFn:  () => api.get('/admin/kyc').then(r => r.data),
    staleTime: 60_000,
  });

  const shopCount   = resolveCount(shopData);
  const memberCount = resolveCount(kycData);

  const statCards = [
    {
      label: 'সক্রিয় শপ',
      value: shopLoading   ? null : shopCount,
      loading: shopLoading,
      icon:  <Store     className="w-5 h-5 text-teal-600"   />,
      bg:    'bg-teal-50   dark:bg-teal-900/20',
    },
    {
      label: 'মোট সদস্য',
      value: kycLoading    ? null : memberCount,
      loading: kycLoading,
      icon:  <Users     className="w-5 h-5 text-purple-600" />,
      bg:    'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'সদস্যতা ফি',
      value: '৳২০০',
      loading: false,
      icon:  <BadgeCheck className="w-5 h-5 text-amber-600"  />,
      bg:    'bg-amber-50  dark:bg-amber-900/20',
    },
    {
      label: 'নতুন এই মাসে',
      value: '+৩৮',
      loading: false,
      icon:  <TrendingUp className="w-5 h-5 text-blue-600"   />,
      bg:    'bg-blue-50   dark:bg-blue-900/20',
    },
  ];

  const updates = [
    { color: 'bg-teal-500',   icon: <Bell         className="w-3.5 h-3.5 text-white" />, title: 'মিরপুর শপে নতুন পণ্য যোগ হয়েছে',   meta: '২ ঘণ্টা আগে · মিরপুর কমিউনিটি শপ'    },
    { color: 'bg-purple-500', icon: <CalendarDays  className="w-3.5 h-3.5 text-white" />, title: 'মাসিক মিটিং — ১৮ মে, রাত ৮টা',      meta: '৫ ঘণ্টা আগে · ধানমন্ডি কমিউনিটি শপ' },
    { color: 'bg-amber-500',  icon: <BadgeCheck    className="w-3.5 h-3.5 text-white" />, title: 'নতুন শপ অনুমোদন — উত্তরা',          meta: 'গতকাল · অ্যাডমিন অনুমোদিত'           },
    { color: 'bg-blue-500',   icon: <Users         className="w-3.5 h-3.5 text-white" />, title: '১৫ জন নতুন সদস্য যোগ দিয়েছেন',    meta: '২ দিন আগে · সারা বাংলাদেশ'            },
  ];

  const benefits = [
    '🎁 বিশেষ সদস্য ছাড় সব পণ্যে',
    '💬 কমিউনিটি গ্রুপ চ্যাটে অ্যাক্সেস',
    '🔔 মিটিং ও আপডেট নোটিফিকেশন',
    '🚚 বিনামূল্যে ডেলিভারি',
    '⚡ আর্লি অ্যাক্সেস নতুন পণ্যে',
    '🛡️ প্রিমিয়াম সাপোর্ট',
  ];

  return (
    <div className="space-y-6">

      {/* ── Stats ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">ওভারভিউ</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-4`}>
              <div className="mb-2">{s.icon}</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white min-h-[28px] flex items-center">
                {s.loading ? (
                  <Spinner />
                ) : s.value === null ? (
                  <span className="opacity-40">—</span>
                ) : (
                  s.value
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Benefits ── */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
        <h3 className="font-bold text-base mb-3">সদস্যতার সুবিধা</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {benefits.map((b, i) => (
            <div key={i} className="text-sm text-teal-50 flex items-center gap-2">
              <span>{b}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onGoShops}
          className="mt-4 w-full bg-white text-teal-700 font-bold py-2.5 rounded-xl text-sm hover:bg-teal-50 transition"
        >
          শপ খুঁজুন ও যোগ দিন →
        </button>
      </div>

      {/* ── Recent updates ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">সাম্প্রতিক আপডেট</p>
        <div className="space-y-2">
          {updates.map((u, i) => (
            <div key={i} className="flex items-start gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-3.5">
              <div className={`w-6 h-6 rounded-full ${u.color} flex items-center justify-center shrink-0 mt-0.5`}>
                {u.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{u.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{u.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
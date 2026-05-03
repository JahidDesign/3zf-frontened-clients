'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import useAuthStore from '@/store/authStore';
import {
  Search, Users, MapPin, Crown, Lock, ChevronRight,
  Plus, Check, Clock, Sparkles, Store, X, Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────
interface Shop {
  _id: string;
  name: string;
  description?: string;
  area: string;
  city: string;
  memberCount: number;
  coverPhoto?: { url: string };
  logo?: { url: string };
  isPrivate?: boolean;
  inviteCode?: string;
  myMembership?: { status: 'pending' | 'approved' | 'rejected' } | null;
}

// ─── Shop Card ────────────────────────────────────────────────
function ShopCard({ shop, onJoin }: { shop: Shop; onJoin: (shopId: string) => void }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const status     = shop.myMembership?.status;
  const isApproved = status === 'approved';
  const isPending  = status === 'pending';

  const handleAction = () => {
    if (!user) { router.push('/login?redirect=/community'); return; }
    if (isApproved) { router.push(`/community/shop/${shop._id}`); return; }
    if (!isPending) { onJoin(shop._id); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Cover */}
      <div className="relative h-28 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 overflow-hidden">
        {shop.coverPhoto?.url && (
          <img src={shop.coverPhoto.url} alt={shop.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {shop.isPrivate && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Lock className="w-2.5 h-2.5" /> প্রাইভেট
          </div>
        )}
        {isApproved && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Check className="w-2.5 h-2.5" /> সদস্য
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Logo + name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0 -mt-7 border-2 border-white dark:border-gray-900 shadow-lg overflow-hidden">
            {shop.logo?.url
              ? <img src={shop.logo.url} alt="" className="w-full h-full object-cover" />
              : <Crown className="w-5 h-5 text-white" />
            }
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{shop.name}</h3>
            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" /> {shop.area}, {shop.city}
            </p>
          </div>
        </div>

        {shop.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{shop.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5" />
            <span>{shop.memberCount} সদস্য</span>
          </div>

          {isApproved ? (
            <Link href={`/community/shop/${shop._id}`}
              className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              প্রবেশ করুন <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : isPending ? (
            <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <Clock className="w-3 h-3" /> অপেক্ষায়
            </span>
          ) : (
            <button onClick={handleAction}
              className="flex items-center gap-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition">
              <Plus className="w-3.5 h-3.5" /> যোগ দিন
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────
function InviteModal({ code, onClose }: { code: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [inputCode, setInputCode] = useState(code);

  const joinMutation = useMutation({
    mutationFn: (inviteCode: string) => api.post('/community-shop/join-by-invite', { inviteCode }),
    onSuccess: () => {
      toast.success('যোগ দেওয়ার আবেদন পাঠানো হয়েছে!');
      qc.invalidateQueries({ queryKey: ['community-shops'] });
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'ব্যর্থ হয়েছে'),
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">ইনভাইট কোড দিয়ে যোগ দিন</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <input
          value={inputCode}
          onChange={e => setInputCode(e.target.value)}
          placeholder="ইনভাইট কোড"
          className="input w-full mb-3 font-mono tracking-wider"
        />
        <button
          onClick={() => joinMutation.mutate(inputCode.trim())}
          disabled={!inputCode.trim() || joinMutation.isPending}
          className="btn-primary w-full py-2.5"
        >
          {joinMutation.isPending ? 'যোগ হচ্ছে...' : 'যোগ দিন'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Content ─────────────────────────────────────────────
export default function CommunityContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [search,      setSearch]      = useState('');
  const [cityFilter,  setCityFilter]  = useState('');
  const [showInvite,  setShowInvite]  = useState(false);
  const [inviteCode,  setInviteCode]  = useState('');

  // Auto-open invite modal if ?invite= in URL
  useEffect(() => {
    const invite = searchParams.get('invite');
    if (invite) { setInviteCode(invite); setShowInvite(true); }
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['community-shops', search, cityFilter],
    queryFn: () =>
      api.get('/community-shop', {
        params: { search: search || undefined, city: cityFilter || undefined },
      }).then(r => r.data),
    staleTime: 30_000,
  });

  const joinMutation = useMutation({
    mutationFn: (shopId: string) => api.post(`/community-shop/${shopId}/join`),
    onSuccess: () => {
      toast.success('যোগ দেওয়ার আবেদন পাঠানো হয়েছে!');
      qc.invalidateQueries({ queryKey: ['community-shops'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'ব্যর্থ হয়েছে'),
  });

  const shops: Shop[] = data?.shops ?? [];
  const cities: string[] = [...new Set(shops.map((s: Shop) => s.city))].sort();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> কমিউনিটি
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">কমিউনিটি শপ তালিকা</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
            আপনার এলাকার কমিউনিটি শপে যোগ দিন, চ্যাট করুন, এবং একসাথে বেড়ে উঠুন।
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="শপের নাম খুঁজুন..."
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 transition"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl pl-9 pr-4 py-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-purple-500/60 transition appearance-none cursor-pointer"
              >
                <option value="">সব শহর</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> ইনভাইট
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {!isLoading && shops.length > 0 && (
          <div className="flex items-center gap-4 mb-5 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5" /> {shops.length}টি শপ</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {shops.reduce((s: number, sh: Shop) => s + (sh.memberCount || 0), 0)} মোট সদস্য
            </span>
            {cityFilter && (
              <>
                <span>•</span>
                <button onClick={() => setCityFilter('')} className="flex items-center gap-1 text-purple-500 hover:underline">
                  <X className="w-3 h-3" /> {cityFilter}
                </button>
              </>
            )}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
                <div className="h-28 bg-gray-100 dark:bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-14 h-14 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">কোনো শপ পাওয়া যায়নি</p>
            <p className="text-sm text-gray-400 dark:text-gray-600">ভিন্ন কীওয়ার্ড চেষ্টা করুন</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {shops.map((shop: Shop) => (
              <ShopCard key={shop._id} shop={shop} onJoin={(id) => joinMutation.mutate(id)} />
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <InviteModal
            code={inviteCode}
            onClose={() => { setShowInvite(false); setInviteCode(''); }}
          />
        )}
      </AnimatePresence>

      <MainFooter />
    </div>
  );
}
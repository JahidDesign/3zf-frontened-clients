'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, LayoutGrid, Users, CalendarDays,
  MapPin, ArrowLeft, Crown, Settings, Share2,
  Check, Lock,
} from 'lucide-react';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import MainNavbar from '@/components/layout/Navbar';
import GroupChat from '@/components/community/GroupChat';
import CommunityFeed from '@/components/community/CommunityFeed';
import MembersList from '@/components/community/MembersList';
import MeetingsTab from '@/components/community/MeetingsTab';
import toast from 'react-hot-toast';
import Link from 'next/link';

type Tab = 'chat' | 'feed' | 'members' | 'meetings';

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'chat',     label: 'চ্যাট',  Icon: MessageCircle },
  { id: 'feed',     label: 'ফিড',    Icon: LayoutGrid    },
  { id: 'members',  label: 'সদস্য', Icon: Users         },
  { id: 'meetings', label: 'মিটিং', Icon: CalendarDays  },
];

export default function ShopInnerPage() {
  const params  = useParams();
  // FIX: coerce to string safely (useParams may return string | string[])
  const shopId  = Array.isArray(params.shopId) ? params.shopId[0] : (params.shopId ?? '');
  const router  = useRouter();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [copied, setCopied]       = useState(false);

  // Shop details
  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['community-shop', shopId],
    queryFn:  () => api.get(`/community-shop/${shopId}`).then((r) => r.data),
    enabled:  !!shopId,
  });

  // My membership — only when user is logged in
  const { data: membershipData, isLoading: memLoading } = useQuery({
    queryKey: ['my-community-membership', shopId],
    queryFn:  () => api.get(`/community-shop/${shopId}/my-membership`).then((r) => r.data),
    enabled:  !!shopId && !!user,
  });

  const shop       = shopData?.shop;
  const membership = membershipData?.membership ?? null;
  const isApproved = membership?.status === 'approved';
  const isPending  = membership?.status === 'pending';
  // FIX: only check admin role when membership exists
  const isAdmin    = isApproved && (membership?.role === 'admin' || membership?.role === 'moderator');

  const shareInvite = () => {
    if (!shop?.inviteCode) return;
    const url = `${window.location.origin}/community?invite=${shop.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('ইনভাইট লিঙ্ক কপি হয়েছে!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Loading skeleton
  if (shopLoading || (user && memLoading)) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <MainNavbar />
        <div className="pt-[var(--navbar-height)] animate-pulse">
          <div className="h-48 bg-gray-200 dark:bg-gray-800" />
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>শপ পাওয়া যায়নি</p>
          <Link href="/community" className="text-purple-600 text-sm font-semibold">← ফিরে যান</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <MainNavbar />

      {/* Cover */}
      <div className="relative pt-[var(--navbar-height)]">
        <div className="h-44 sm:h-56 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 relative overflow-hidden">
          {shop.coverPhoto?.url && (
            <img src={shop.coverPhoto.url} alt={shop.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Back */}
          <button
            onClick={() => router.push('/community')}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={shareInvite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-semibold hover:bg-black/50 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'কপি!' : 'শেয়ার'}
            </button>
            {isAdmin && (
              <Link
                href={`/community/shop/${shopId}/admin`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-semibold hover:bg-black/50 transition"
              >
                <Settings className="w-3.5 h-3.5" /> অ্যাডমিন
              </Link>
            )}
          </div>

          {/* Shop info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 text-yellow-300" />
              </div>
              {isApproved && (
                <span className="text-xs bg-green-500/80 text-white px-2 py-0.5 rounded-full font-semibold">
                  সদস্য ✓
                </span>
              )}
              {isPending && (
                <span className="text-xs bg-yellow-500/80 text-white px-2 py-0.5 rounded-full font-semibold">
                  অনুমোদন পেন্ডিং
                </span>
              )}
            </div>
            <h1 className="text-white font-black text-xl sm:text-2xl leading-tight">
              {shop.name}
            </h1>
            <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {shop.area}, {shop.city} · {shop.memberCount} সদস্য
            </p>
          </div>
        </div>
      </div>

      {/* Not logged in */}
      {!user && (
        <div className="max-w-4xl mx-auto w-full px-4 py-8 text-center">
          <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-bold mb-2" style={{ color: 'var(--color-text)' }}>লগইন করুন</p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            শপের কন্টেন্ট দেখতে লগইন করতে হবে।
          </p>
          <Link
            href="/login"
            className="bg-purple-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-purple-700 transition"
          >
            লগইন করুন
          </Link>
        </div>
      )}

      {/* Pending state */}
      {user && isPending && (
        <div className="max-w-4xl mx-auto w-full px-4 py-8 text-center">
          <div className="card p-8">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="font-black text-lg mb-2" style={{ color: 'var(--color-text)' }}>
              আবেদন প্রক্রিয়াধীন
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              অ্যাডমিন আপনার সদস্যতা অনুমোদন করলে এই শপে প্রবেশ করতে পারবেন।
            </p>
          </div>
        </div>
      )}

      {/* Not a member yet (logged in but no membership) */}
      {user && !membership && (
        <div className="max-w-4xl mx-auto w-full px-4 py-8 text-center">
          <div className="card p-8">
            <Crown className="w-12 h-12 mx-auto mb-3 text-purple-400" />
            <p className="font-black text-lg mb-2" style={{ color: 'var(--color-text)' }}>
              সদস্যতা নেই
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              এই শপের কন্টেন্ট দেখতে সদস্যতা গ্রহণ করুন।
            </p>
            <button
              onClick={() => router.push('/community')}
              className="bg-purple-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-purple-700 transition"
            >
              শপ তালিকায় ফিরুন
            </button>
          </div>
        </div>
      )}

      {/* Approved — full content */}
      {isApproved && (
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* Tabs */}
          <div
            className="sticky top-[var(--navbar-height)] z-20 border-b"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex overflow-x-auto no-scrollbar px-4">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition flex-shrink-0 ${
                    activeTab === id ? 'border-purple-500 text-purple-600' : 'border-transparent'
                  }`}
                  style={{ color: activeTab === id ? undefined : 'var(--color-text-secondary)' }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab panels */}
          <div className="flex-1 px-0 sm:px-4 py-0 sm:py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {activeTab === 'chat'     && <GroupChat     shopId={shopId} membership={membership} />}
                {activeTab === 'feed'     && <CommunityFeed shopId={shopId} membership={membership} />}
                {activeTab === 'members'  && <MembersList   shopId={shopId} />}
                {activeTab === 'meetings' && <MeetingsTab   shopId={shopId} membership={membership} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, List, Plus, Users,
  UserPlus, BadgeCheck, AlertCircle,
  ChevronRight, Shield, Globe, TrendingUp,
  ShoppingBag, Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import CommunityHome from './CommunityHome';
import ShopList from './ShopList';
import CreateShopForm from './CreateShopForm';
import CommunityInside from './CommunityInside';
import KYCUserTable from './MembersTable';
import HeroSection from './HeroSection';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'home' | 'shops' | 'create' | 'community' | 'members';

interface TabConfig {
  key:         Tab;
  label:       string;
  icon:        React.ReactNode;
  description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: TabConfig[] = [
  { key: 'home',      label: 'হোম',       icon: <Home       className="w-4 h-4" />, description: 'কমিউনিটির সংক্ষিপ্ত পরিচয়' },
  { key: 'shops',     label: 'শপ তালিকা', icon: <List       className="w-4 h-4" />, description: 'সকল অনুমোদিত শপ'            },
  { key: 'create',    label: 'শপ তৈরি',   icon: <Plus       className="w-4 h-4" />, description: 'নতুন শপ খুলুন'              },
  { key: 'community', label: 'কমিউনিটি',  icon: <Users      className="w-4 h-4" />, description: 'কমিউনিটি ফিড'               },
  { key: 'members',   label: 'সদস্যরা',   icon: <BadgeCheck className="w-4 h-4" />, description: 'সকল যাচাইকৃত সদস্য'         },
];

const PANEL_ANIMATION = {
  initial:    { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate:    { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:       { opacity: 0, y: -8, filter: 'blur(2px)' },
  transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] },
};

// ─── Animated Count ───────────────────────────────────────────────────────────

function AnimatedCount({ value, loading }: { value: number | null; loading: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === null || loading) return;
    let start = 0;
    const end = value;
    if (end === 0) { setDisplay(0); return; }
    const duration = 900;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, loading]);

  if (loading) return <Loader2 className="w-3.5 h-3.5 animate-spin opacity-50" />;
  if (value === null) return <span className="opacity-40">—</span>;
  return <span>{display.toLocaleString('bn-BD')}</span>;
}

// ─── Stats Strip (home only) — fetches real counts ────────────────────────────

function PageStatsStrip() {
  // Total KYC approved members
  const { data: kycData, isLoading: kycLoading } = useQuery({
    queryKey: ['kyc-count'],
    queryFn:  () => api.get('/admin/kyc').then(r => r.data),
    staleTime: 60_000,
  });

  // Total shops
  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['shop-count'],
    queryFn:  () => api.get('/community-shop/shops').then(r => r.data),
    staleTime: 60_000,
  });

  // Flexible: support { total }, { count }, array length, or { data: [] }
  const resolveCount = (data: any): number | null => {
    if (data === undefined || data === null) return null;
    if (typeof data.total   === 'number') return data.total;
    if (typeof data.count   === 'number') return data.count;
    if (Array.isArray(data))              return data.length;
    if (Array.isArray(data.data))         return data.data.length;
    if (Array.isArray(data.kycs))         return data.kycs.length;
    if (Array.isArray(data.shops))        return data.shops.length;
    if (Array.isArray(data.results))      return data.results.length;
    return null;
  };

  const kycCount  = resolveCount(kycData);
  const shopCount = resolveCount(shopData);

  const stats = [
    {
      icon:    Globe,
      value:   kycCount,
      loading: kycLoading,
      label:   'মোট সদস্য',
      sub:     'KYC যাচাইকৃত',
      cls:     'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20 border-blue-200/60 dark:border-blue-800/40',
      iconCls: 'bg-blue-100 dark:bg-blue-900/40',
    },
    {
      icon:    ShoppingBag,
      value:   shopCount,
      loading: shopLoading,
      label:   'মোট শপ',
      sub:     'সক্রিয় কমিউনিটি শপ',
      cls:     'text-teal-600 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-900/20 border-teal-200/60 dark:border-teal-800/40',
      iconCls: 'bg-teal-100 dark:bg-teal-900/40',
    },
    {
      icon:    TrendingUp,
      value:   null,
      loading: false,
      label:   'বাড়ছে',
      sub:     'প্রতিদিন নতুন শপ',
      cls:     'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-800/40',
      iconCls: 'bg-emerald-100 dark:bg-emerald-900/40',
      static:  true,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
      {stats.map(({ icon: Icon, value, loading, label, sub, cls, iconCls, static: isStatic }, idx) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.07, duration: 0.35 }}
          className={`${cls} border rounded-2xl p-2.5 sm:p-3.5 flex items-center gap-2 sm:gap-3 min-w-0`}
        >
          <div className={`${iconCls} w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-none flex items-center gap-1 truncate">
              {isStatic ? (
                <span>📈</span>
              ) : (
                <AnimatedCount value={value} loading={loading} />
              )}
            </p>
            <p className="text-[10px] sm:text-[11px] font-semibold mt-0.5 leading-tight truncate">{label}</p>
            <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 leading-tight truncate hidden sm:block">{sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Join Member Button ───────────────────────────────────────────────────────

function JoinMemberButton() {
  const { user } = useAuthStore();
  const [joined,   setJoined]   = useState(false);
  const [showWarn, setShowWarn] = useState(false);

  const { data: kycData } = useQuery({
    queryKey: ['my-kyc'],
    queryFn:  () => api.get('/kyc/my').then(r => r.data),
    enabled:  !!user,
  });

  const kycApproved = kycData?.kyc?.status === 'approved';

  useEffect(() => {
    if (user && localStorage.getItem(`member_joined_${user._id}`)) setJoined(true);
  }, [user]);

  if (!user) return null;

  const handleJoin = async () => {
    if (!kycApproved) {
      setShowWarn(true);
      setTimeout(() => setShowWarn(false), 4000);
      return;
    }
    try {
      await api.post('/community/join');
      localStorage.setItem(`member_joined_${user._id}`, '1');
      setJoined(true);
    } catch {
      setJoined(true);
    }
  };

  if (joined && kycApproved) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20
          border border-emerald-200 dark:border-emerald-800
          text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-semibold
          px-3 sm:px-4 py-2 rounded-xl"
      >
        <BadgeCheck className="w-4 h-4" />
        <span className="hidden xs:inline">সদস্য</span>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleJoin}
        className="group relative flex items-center gap-2 overflow-hidden
          bg-gradient-to-r from-teal-600 to-emerald-600
          hover:from-teal-500 hover:to-emerald-500
          text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl
          shadow-lg shadow-teal-500/25 transition-all duration-300"
      >
        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%]
          bg-gradient-to-r from-transparent via-white/20 to-transparent
          transition-transform duration-700" />
        <UserPlus     className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" />
        <span         className="relative z-10">সদস্য হন</span>
        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 relative z-10 opacity-70" />
      </motion.button>

      <AnimatePresence>
        {showWarn && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20
              border border-amber-200 dark:border-amber-700
              text-amber-700 dark:text-amber-300 text-xs px-3 py-2 rounded-xl max-w-[200px] sm:max-w-xs shadow-sm"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            সদস্য হতে{' '}
            <Link href="/supershop/membership" className="underline font-bold mx-0.5">
              KYC যাচাই
            </Link>{' '}
            করুন।
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({ activeTab, onSelect }: { activeTab: Tab; onSelect: (t: Tab) => void }) {
  return (
    <nav aria-label="Community navigation" className="mb-6 sm:mb-8">
      <div
        className="flex gap-1 sm:gap-1.5 bg-gray-100/80 dark:bg-gray-800/60
          backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/50
          rounded-2xl p-1 sm:p-1.5 overflow-x-auto scrollbar-none"
      >
        {TABS.map(({ key, label, icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5
                rounded-xl text-xs sm:text-sm font-semibold
                whitespace-nowrap transition-all duration-200 flex-shrink-0
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              {isActive && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl
                    shadow-sm border border-gray-200/80 dark:border-gray-600/50"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 transition-colors duration-200 ${
                isActive ? 'text-teal-700 dark:text-teal-300' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {icon}
              </span>
              {/* Hide label text on very small screens, show icon only */}
              <span className={`relative z-10 transition-colors duration-200 hidden xs:inline ${
                isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Compact Header (non-home) ────────────────────────────────────────────────

function CompactHeader({ tab }: { tab: Tab }) {
  const cfg = TABS.find(t => t.key === tab);
  if (!cfg) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{ opacity: 0, y: -4    }}
      transition={{ duration: 0.2  }}
      className="flex items-center justify-between gap-3 mb-5 sm:mb-6
        bg-gradient-to-r from-teal-50 to-emerald-50/60
        dark:from-teal-950/40 dark:to-emerald-950/30
        border border-teal-100 dark:border-teal-800/50
        rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-9 h-9 sm:w-11 sm:h-11 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-600
            rounded-xl shadow-lg shadow-teal-500/30" />
          <div className="absolute inset-0 flex items-center justify-center text-white text-lg sm:text-xl">
            🏪
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xs sm:text-sm font-black text-teal-900 dark:text-teal-100 leading-none truncate">
            Harmony Community Shop
          </h2>
          <p className="text-[10px] sm:text-xs text-teal-600/70 dark:text-teal-400/60 mt-0.5 truncate">
            {cfg.description}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <JoinMemberButton />
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommunityShopPage() {
  const [tab,        setTab]        = useState<Tab>('home');
  const [activeShop, setActiveShop] = useState<string | null>(null);

  const openCommunity = (shopId: string) => {
    setActiveShop(shopId);
    setTab('community');
  };

  const isHome = tab === 'home';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />

      <main className="flex-1 w-full mx-auto px-0 sm:px-4 md:px-6 lg:px-8 pt-16 pb-16">

        {/* Page ambient background */}
        <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full
            bg-teal-100/40 dark:bg-teal-900/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full
            bg-blue-100/30 dark:bg-blue-900/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.018] dark:opacity-[0.025]"
            style={{
              backgroundImage: 'radial-gradient(circle,#000 1px,transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="pt-4 sm:pt-6">

          {/* ── Hero (home only) ── */}
          <AnimatePresence>
            {isHome && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0   }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                
              >
                <HeroSection
                  onShopNow={() => setTab('shops')}
                  onCreate={() => setTab('create')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Stats strip + join button (home only) ── */}
          <AnimatePresence>
            {isHome && (
              <motion.div
                key="home-extras"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 mt-2 sm:px-0"
              >
                <PageStatsStrip />
                <div className="flex justify-end mb-4">
                  <JoinMemberButton />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Compact header (non-home) ── */}
          <AnimatePresence mode="wait">
            {!isHome && (
              <div className="px-3 sm:px-0">
                <CompactHeader key={tab} tab={tab} />
              </div>
            )}
          </AnimatePresence>

          {/* ── Tab bar ── */}
          <div className="px-2 sm:px-0">
            <TabBar activeTab={tab} onSelect={setTab} />
          </div>

          {/* ── Tab panels ── */}
          <div className="px-3 mt-2 sm:px-0">
            <AnimatePresence mode="wait">
              <motion.div key={tab} {...PANEL_ANIMATION}>
                {tab === 'home'      && <CommunityHome   onGoShops={() => setTab('shops')} />}
                {tab === 'shops'     && <ShopList        onGoCreate={() => setTab('create')} onEnterShop={openCommunity} />}
                {tab === 'create'    && <CreateShopForm  onSuccess={() => setTab('shops')} />}
                {tab === 'community' && <CommunityInside shopId={activeShop} onBack={() => setTab('shops')} />}
                {tab === 'members'   && <KYCUserTable />}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </main>

      <MainFooter />
    </div>
  );
}
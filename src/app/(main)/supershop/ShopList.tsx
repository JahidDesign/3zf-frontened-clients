'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, MapPin, Share2, LogIn, Plus, CheckCircle, Clock } from 'lucide-react';
import { useShops, useMyMemberships, useInviteLink, Shop } from '@/hooks/Usecommunityshop';
import KYCPage from './MembershipFormModal';

interface Props {
  onGoCreate:  () => void;
  onEnterShop: (shopId: string) => void;
}

// ✅ useInviteLink is called here at the top level of ShopCard — never in a loop
function ShopCard({
  shop,
  myStatus,
  onJoin,
  onEnter,
}: {
  shop:     Shop;
  myStatus: 'approved' | 'pending' | null;
  onJoin:   () => void;
  onEnter:  () => void;
}) {
  const { copyLink } = useInviteLink(shop._id); // ✅ top-level hook call

  const statusBadge = myStatus === 'approved'
    ? (
      <span className="flex items-center gap-1 text-[10px] bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full font-semibold dark:bg-teal-900/30 dark:text-teal-300">
        <CheckCircle className="w-3 h-3" />সদস্য
      </span>
    ) : myStatus === 'pending'
    ? (
      <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-semibold dark:bg-amber-900/30 dark:text-amber-300">
        <Clock className="w-3 h-3" />অপেক্ষায়
      </span>
    ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 border rounded-2xl p-4 flex items-center gap-4 transition ${
        myStatus === 'approved'
          ? 'border-teal-300 dark:border-teal-700'
          : 'border-gray-100 dark:border-gray-700'
      }`}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
        {shop.coverPhoto?.url
          ? <img src={shop.coverPhoto.url} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
          : null}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{shop.name}</h3>
          {statusBadge}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{shop.area}</span>
          <span className="flex items-center gap-1"><Users  className="w-3 h-3" />{shop.memberCount} সদস্য</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{shop.description}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 shrink-0">
        {myStatus === 'approved' ? (
          <button
            onClick={onEnter}
            className="flex items-center gap-1 text-xs font-semibold text-teal-600 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 px-3 py-1.5 rounded-xl hover:bg-teal-100 transition"
          >
            <LogIn className="w-3.5 h-3.5" /> প্রবেশ
          </button>
        ) : myStatus === 'pending' ? (
          <span className="text-xs text-amber-600 font-semibold px-3 py-1.5">যাচাই হচ্ছে</span>
        ) : (
          <button
            onClick={onJoin}
            className="flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 px-3 py-1.5 rounded-xl hover:bg-teal-700 transition"
          >
            <Plus className="w-3.5 h-3.5" /> যোগ দিন
          </button>
        )}
        <button
          onClick={copyLink}
          className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-200 transition"
        >
          <Share2 className="w-3.5 h-3.5" /> আমন্ত্রণ
        </button>
      </div>
    </motion.div>
  );
}

export default function ShopList({ onGoCreate, onEnterShop }: Props) {
  const [search, setSearch]         = useState('');
  const [region, setRegion]         = useState('');
  const [joinTarget, setJoinTarget] = useState<Shop | null>(null);

  const { shops, loading } = useShops({ search: search || undefined, region: region || undefined });
  const { memberships }    = useMyMemberships();

  const regions = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];

  const getMyStatus = (shopId: string) => {
    const m = memberships.find(mb => mb.shop._id === shopId);
    return m ? (m.status as 'approved' | 'pending' | 'rejected') : null;
  };

  return (
    <div className="space-y-4">

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="শপ বা এলাকা খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-teal-400"
          />
        </div>
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:border-teal-400"
        >
          <option value="">সব অঞ্চল</option>
          {regions.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Shop cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-1">কোনো শপ পাওয়া যায়নি</p>
          <p className="text-sm">অনুসন্ধান পরিবর্তন করুন বা নতুন শপ তৈরি করুন</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* ✅ Each ShopCard is its own component — hook runs at its top level, never in a loop */}
          {shops.map(shop => (
            <ShopCard
              key={shop._id}
              shop={shop}
              myStatus={getMyStatus(shop._id) as 'approved' | 'pending' | null}
              onJoin={() => setJoinTarget(shop)}
              onEnter={() => onEnterShop(shop._id)}
            />
          ))}
        </div>
      )}

      {/* Create Shop CTA */}
      <button
        onClick={onGoCreate}
        className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl py-5 flex flex-col items-center gap-1.5 text-gray-400 hover:border-teal-400 hover:text-teal-600 transition"
      >
        <Plus className="w-6 h-6" />
        <span className="text-sm font-semibold">আপনার এলাকায় শপ নেই?</span>
        <span className="text-xs">নতুন শপ তৈরির আবেদন করুন</span>
      </button>

      {/* Membership Modal */}
      {joinTarget && (
        <KYCPage
          shop={joinTarget}
          onClose={() => setJoinTarget(null)}
        />
      )}

    </div>
  );
}
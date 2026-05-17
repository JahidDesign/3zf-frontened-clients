'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Store, Users, CheckCircle, XCircle, Search,
  Eye, X, MapPin, Hash,
  ShieldCheck, ShieldX, AlertTriangle, RefreshCw,
  BadgeCheck,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Shop {
  _id: string;
  name: string;
  area: string;
  region: string;
  description: string;
  memberCount: number;
  inviteCode: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  coverPhoto?: { url: string };
  createdBy?: { name: string; email: string };
  createdAt: string;
}

interface ShopMember {
  _id: string;
  shop: { _id: string; name: string; area: string };
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentStatus: 'verifying' | 'paid' | 'failed';
  memberId?: string;
  joinedAt?: string;
  expiresAt?: string;
  paymentMethod: string;
  transactionId: string;
  paymentAmount: number;
  adminNote?: string;
  profilePhoto?: { url: string };
  user?: { name: string; email: string };
  createdAt: string;
}

type Tab = 'shops' | 'members';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusBadge: Record<string, string> = {
  pending:   'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  approved:  'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  rejected:  'bg-red-100    text-red-600    dark:bg-red-900/30    dark:text-red-400',
  verifying: 'bg-blue-100   text-blue-600   dark:bg-blue-900/30   dark:text-blue-400',
  paid:      'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  failed:    'bg-red-100    text-red-600    dark:bg-red-900/30    dark:text-red-400',
};

const statusLabel: Record<string, string> = {
  pending:   'পেন্ডিং',
  approved:  'অনুমোদিত',
  rejected:  'প্রত্যাখ্যাত',
  verifying: 'যাচাই হচ্ছে',
  paid:      'পরিশোধিত',
  failed:    'ব্যর্থ',
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {statusLabel[status] ?? status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ─── Shop Detail Modal ────────────────────────────────────────────────────────

function ShopDetailModal({ shop, onClose, onUpdate }: { shop: Shop; onClose: () => void; onUpdate: () => void }) {
  const [note, setNote] = useState('');

  // ✅ FIXED: /community-shop/shops/approve/:id  +  body: { status, adminNote }
  const mutation = useMutation({
    mutationFn: (status: 'approved' | 'rejected') =>
      api.patch(`/community-shop/shops/approve/${shop._id}`, { status, adminNote: note }),
    onSuccess: (_, status) => {
      toast.success(status === 'approved' ? 'শপ অনুমোদন হয়েছে' : 'শপ প্রত্যাখ্যাত হয়েছে');
      onUpdate();
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'ব্যর্থ হয়েছে'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
              {shop.coverPhoto?.url
                ? <img src={shop.coverPhoto.url} alt="" className="w-full h-full object-cover" />
                : <Store className="w-5 h-5 text-primary-600" />}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">{shop.name}</h2>
              <p className="text-xs text-gray-400">{shop.area}, {shop.region}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {shop.coverPhoto?.url && (
            <div className="w-full h-40 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={shop.coverPhoto.url} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: 'এলাকা', value: shop.area },
              { icon: MapPin, label: 'অঞ্চল', value: shop.region },
              { icon: Users,  label: 'সদস্য', value: `${shop.memberCount} জন` },
              { icon: Hash,   label: 'কোড',   value: shop.inviteCode },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-start gap-2">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">বিবরণ</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{shop.description || '—'}</p>
          </div>

          {shop.createdBy && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">তৈরিকারী</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{shop.createdBy.name}</p>
              <p className="text-xs text-gray-500">{shop.createdBy.email}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">বর্তমান স্ট্যাটাস</span>
            <Badge status={shop.status} />
          </div>

          {shop.status === 'pending' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">অ্যাডমিন নোট (ঐচ্ছিক)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                className="input w-full text-sm resize-none"
                placeholder="প্রত্যাখ্যানের কারণ বা মন্তব্য..."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          {shop.status === 'pending' ? (
            <div className="flex gap-3">
              <button
                onClick={() => mutation.mutate('rejected')}
                disabled={mutation.isPending}
                className="flex-1 py-3 rounded-2xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2 disabled:opacity-60">
                <ShieldX className="w-4 h-4" /> প্রত্যাখ্যান
              </button>
              <button
                onClick={() => mutation.mutate('approved')}
                disabled={mutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60">
                <ShieldCheck className="w-4 h-4" /> অনুমোদন
              </button>
            </div>
          ) : (
            <button onClick={onClose} className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm">
              বন্ধ করুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Member Detail Modal ──────────────────────────────────────────────────────

function MemberDetailModal({ member, onClose, onUpdate }: { member: ShopMember; onClose: () => void; onUpdate: () => void }) {
  const [note, setNote] = useState(member.adminNote ?? '');

  // ✅ FIXED: /community-shop/membership/approve/:id
  const mutation = useMutation({
    mutationFn: (status: 'approved' | 'rejected') =>
      api.patch(`/community-shop/membership/approve/${member._id}`, { status, adminNote: note }),
    onSuccess: (_, status) => {
      toast.success(status === 'approved' ? 'সদস্যতা অনুমোদন হয়েছে' : 'সদস্যতা প্রত্যাখ্যাত হয়েছে');
      onUpdate();
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'ব্যর্থ হয়েছে'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 font-bold shrink-0">
              {member.profilePhoto?.url
                ? <img src={member.profilePhoto.url} alt="" className="w-full h-full object-cover" />
                : <span>{member.name?.[0]}</span>}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">{member.name}</h2>
              {member.memberId && <p className="text-xs text-pink-500 font-mono">{member.memberId}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-primary-600 shrink-0" />
            <div>
              <p className="text-xs text-primary-500">শপ</p>
              <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                {member.shop?.name} · {member.shop?.area}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">পেমেন্ট তথ্য</p>
            {[
              { label: 'পরিমাণ',    value: `৳${member.paymentAmount}` },
              { label: 'পদ্ধতি',    value: member.paymentMethod },
              { label: 'TrxID',     value: member.transactionId },
              { label: 'স্ট্যাটাস', value: <Badge status={member.paymentStatus} /> },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>

          {(member.joinedAt || member.expiresAt) && (
            <div className="grid grid-cols-2 gap-3">
              {member.joinedAt && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">যোগদান</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {format(new Date(member.joinedAt), 'dd MMM yyyy')}
                  </p>
                </div>
              )}
              {member.expiresAt && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">মেয়াদ শেষ</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {format(new Date(member.expiresAt), 'dd MMM yyyy')}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">বর্তমান স্ট্যাটাস</span>
            <Badge status={member.status} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">অ্যাডমিন নোট</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="input w-full text-sm resize-none"
              placeholder="কারণ বা মন্তব্য..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          {member.status === 'pending' ? (
            <div className="flex gap-3">
              <button
                onClick={() => mutation.mutate('rejected')}
                disabled={mutation.isPending}
                className="flex-1 py-3 rounded-2xl border border-red-200 dark:border-red-800 text-red-600 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2 disabled:opacity-60">
                <XCircle className="w-4 h-4" /> প্রত্যাখ্যান
              </button>
              <button
                onClick={() => mutation.mutate('approved')}
                disabled={mutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60">
                <CheckCircle className="w-4 h-4" /> অনুমোদন
              </button>
            </div>
          ) : (
            <button onClick={onClose} className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm">
              বন্ধ করুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCommunityShopPage() {
  const qc = useQueryClient();

  const [activeTab,    setActiveTab]    = useState<Tab>('shops');
  const [shopSearch,   setShopSearch]   = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [shopFilter,   setShopFilter]   = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [memberFilter, setMemberFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedShop,   setSelectedShop]   = useState<Shop | null>(null);
  const [selectedMember, setSelectedMember] = useState<ShopMember | null>(null);

  // ✅ FIXED: /community-shop/shops/all  (was: /community-shop/admin/shops)
  const { data: shopsData, refetch: refetchShops, isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-community-shops'],
    queryFn:  () => api.get('/community-shop/shops/all').then(r => r.data),
  });

  // ✅ FIXED: /community-shop/membership/all  (was: /community-shop/admin/memberships)
  const { data: membersData, refetch: refetchMembers, isLoading: membersLoading } = useQuery({
    queryKey: ['admin-community-members'],
    queryFn:  () => api.get('/community-shop/membership/all').then(r => r.data),
    enabled:  activeTab === 'members',
  });

  const allShops:   Shop[]       = shopsData?.shops      ?? [];
  const allMembers: ShopMember[] = membersData?.members   ?? [];

  // ── Filter & search ───────────────────────────────────────────────────────────

  const shops = allShops.filter(s => {
    const matchStatus = shopFilter === 'all' || s.status === shopFilter;
    const matchSearch = !shopSearch ||
      s.name.toLowerCase().includes(shopSearch.toLowerCase()) ||
      s.area.toLowerCase().includes(shopSearch.toLowerCase()) ||
      s.inviteCode.toLowerCase().includes(shopSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const members = allMembers.filter(m => {
    const matchStatus = memberFilter === 'all' || m.status === memberFilter;
    const matchSearch = !memberSearch ||
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.transactionId.includes(memberSearch) ||
      m.shop?.name?.toLowerCase().includes(memberSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────────

  const pendingShops   = allShops.filter(s => s.status === 'pending').length;
  const approvedShops  = allShops.filter(s => s.status === 'approved').length;
  const pendingMembers = allMembers.filter(m => m.status === 'pending').length;

  // ✅ FIXED quick actions
  const quickUpdateShop = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/community-shop/shops/approve/${id}`, { status }),
    onSuccess: () => { toast.success('আপডেট হয়েছে'); refetchShops(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'ব্যর্থ হয়েছে'),
  });

  const quickUpdateMember = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/community-shop/membership/approve/${id}`, { status }),
    onSuccess: () => { toast.success('আপডেট হয়েছে'); refetchMembers(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'ব্যর্থ হয়েছে'),
  });

  const TABS = [
    { id: 'shops'   as Tab, label: 'শপ',    icon: Store, badge: pendingShops },
    { id: 'members' as Tab, label: 'সদস্য', icon: Users, badge: pendingMembers },
  ];

  const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'] as const;
  const filterLabel = { all: 'সব', pending: 'পেন্ডিং', approved: 'অনুমোদিত', rejected: 'প্রত্যাখ্যাত' };

  return (
    <div className="space-y-6">

      {/* Page title */}
      <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
        <Store className="w-5 h-5 text-primary-500" /> কমিউনিটি শপ ম্যানেজমেন্ট
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="মোট শপ"           value={allShops.length} icon={Store}         color="bg-blue-500" />
        <StatCard label="অনুমোদিত শপ"      value={approvedShops}   icon={BadgeCheck}    color="bg-green-500" />
        <StatCard label="পেন্ডিং শপ"       value={pendingShops}    icon={AlertTriangle} color="bg-orange-500" />
        <StatCard label="মোট সদস্য আবেদন"  value={allMembers.length} icon={Users}       color="bg-purple-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════ SHOPS TAB ══════════ */}
      {activeTab === 'shops' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={shopSearch}
                onChange={e => setShopSearch(e.target.value)}
                placeholder="নাম, এলাকা বা কোড..."
                className="input pl-9 w-full text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {STATUS_FILTERS.map(f => (
                <button key={f} onClick={() => setShopFilter(f)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition ${
                    shopFilter === f
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                  }`}>
                  {filterLabel[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3.5">শপ</th>
                    <th className="text-left px-5 py-3.5">এলাকা / অঞ্চল</th>
                    <th className="text-left px-5 py-3.5">সদস্য</th>
                    <th className="text-left px-5 py-3.5">কোড</th>
                    <th className="text-left px-5 py-3.5">স্ট্যাটাস</th>
                    <th className="text-left px-5 py-3.5">তারিখ</th>
                    <th className="text-left px-5 py-3.5">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {shopsLoading ? (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> লোড হচ্ছে...
                    </td></tr>
                  ) : shops.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-14 text-center">
                      <Store className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">কোনো শপ পাওয়া যায়নি</p>
                    </td></tr>
                  ) : shops.map(shop => (
                    <tr key={shop._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-50 dark:bg-primary-900/30 shrink-0 flex items-center justify-center">
                            {shop.coverPhoto?.url
                              ? <img src={shop.coverPhoto.url} alt="" className="w-full h-full object-cover" />
                              : <Store className="w-5 h-5 text-primary-400" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">{shop.name}</p>
                            {shop.createdBy && <p className="text-xs text-gray-400 truncate max-w-[140px]">{shop.createdBy.name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-gray-700 dark:text-gray-300 text-xs font-medium">{shop.area}</p>
                        <p className="text-gray-400 text-xs">{shop.region}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Users className="w-3.5 h-3.5" />
                          <span className="text-sm font-semibold">{shop.memberCount}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400">
                          {shop.inviteCode}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><Badge status={shop.status} /></td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {format(new Date(shop.createdAt), 'dd MMM yy')}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedShop(shop)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {shop.status === 'pending' && (
                            <>
                              <button
                                onClick={() => quickUpdateShop.mutate({ id: shop._id, status: 'approved' })}
                                disabled={quickUpdateShop.isPending}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition disabled:opacity-50">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => quickUpdateShop.mutate({ id: shop._id, status: 'rejected' })}
                                disabled={quickUpdateShop.isPending}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition disabled:opacity-50">
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!shopsLoading && shops.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                মোট {shops.length}টি শপ
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ MEMBERS TAB ══════════ */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                placeholder="নাম, TrxID বা শপ..."
                className="input pl-9 w-full text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {STATUS_FILTERS.map(f => (
                <button key={f} onClick={() => setMemberFilter(f)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition ${
                    memberFilter === f
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                  }`}>
                  {filterLabel[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3.5">সদস্য</th>
                    <th className="text-left px-5 py-3.5">শপ</th>
                    <th className="text-left px-5 py-3.5">পেমেন্ট</th>
                    <th className="text-left px-5 py-3.5">TrxID</th>
                    <th className="text-left px-5 py-3.5">সদস্যতা</th>
                    <th className="text-left px-5 py-3.5">পেমেন্ট</th>
                    <th className="text-left px-5 py-3.5">তারিখ</th>
                    <th className="text-left px-5 py-3.5">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {membersLoading ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> লোড হচ্ছে...
                    </td></tr>
                  ) : members.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-14 text-center">
                      <Users className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">কোনো সদস্য পাওয়া যায়নি</p>
                    </td></tr>
                  ) : members.map(member => (
                    <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-pink-100 dark:bg-pink-900/30 shrink-0 flex items-center justify-center text-pink-600 font-bold text-xs">
                            {member.profilePhoto?.url
                              ? <img src={member.profilePhoto.url} alt="" className="w-full h-full object-cover" />
                              : member.name?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                            {member.memberId && <p className="text-xs text-pink-500 font-mono">{member.memberId}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{member.shop?.name}</p>
                        <p className="text-xs text-gray-400">{member.shop?.area}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">৳{member.paymentAmount}</p>
                        <p className="text-xs text-gray-400 capitalize">{member.paymentMethod}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300">
                          {member.transactionId}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><Badge status={member.status} /></td>
                      <td className="px-5 py-3.5"><Badge status={member.paymentStatus} /></td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {format(new Date(member.createdAt), 'dd MMM yy')}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedMember(member)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {member.status === 'pending' && (
                            <>
                              <button
                                onClick={() => quickUpdateMember.mutate({ id: member._id, status: 'approved' })}
                                disabled={quickUpdateMember.isPending}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition disabled:opacity-50">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => quickUpdateMember.mutate({ id: member._id, status: 'rejected' })}
                                disabled={quickUpdateMember.isPending}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition disabled:opacity-50">
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!membersLoading && members.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                মোট {members.length}জন সদস্য
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedShop && (
        <ShopDetailModal shop={selectedShop} onClose={() => setSelectedShop(null)} onUpdate={refetchShops} />
      )}
      {selectedMember && (
        <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} onUpdate={refetchMembers} />
      )}
    </div>
  );
}
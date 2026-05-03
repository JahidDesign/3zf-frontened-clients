'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import useAuthStore from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Droplets, MapPin, Search, Heart,
  Users, Loader2, Phone, Calendar,
  ChevronDown, CheckCircle2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Donor {
  _id: string;
  name: string;
  avatar?: string;
  bloodGroup: string;
  location?: string;
  phone?: string;
  lastDonated?: string;
  isAvailableForDonation?: boolean;
  totalDonations?: number;
}

interface DonorsResponse {
  donors: Donor[];
  total?: number;
}

interface DonorUser {
  _id: string;
  bloodGroup?: string;
  isAvailableForDonation?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

const BG_COLORS: Record<string, { bg: string; text: string }> = {
  'A+':  { bg: 'bg-red-500',    text: 'text-white' },
  'A-':  { bg: 'bg-red-700',    text: 'text-white' },
  'B+':  { bg: 'bg-blue-500',   text: 'text-white' },
  'B-':  { bg: 'bg-blue-700',   text: 'text-white' },
  'O+':  { bg: 'bg-emerald-500',text: 'text-white' },
  'O-':  { bg: 'bg-emerald-700',text: 'text-white' },
  'AB+': { bg: 'bg-purple-500', text: 'text-white' },
  'AB-': { bg: 'bg-purple-700', text: 'text-white' },
};

const BG_GRADIENT: Record<string, string> = {
  'A+':  'from-red-400 to-red-600',
  'A-':  'from-red-600 to-red-800',
  'B+':  'from-blue-400 to-blue-600',
  'B-':  'from-blue-600 to-blue-800',
  'O+':  'from-emerald-400 to-emerald-600',
  'O-':  'from-emerald-600 to-emerald-800',
  'AB+': 'from-purple-400 to-purple-600',
  'AB-': 'from-purple-600 to-purple-800',
};

// ─── Avatar Component ─────────────────────────────────────────────────────────

function DonorAvatar({ donor, size = 'md' }: { donor: Donor; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  const gradient = BG_GRADIENT[donor.bloodGroup] ?? 'from-red-400 to-red-600';
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-white dark:ring-gray-800`}>
      {donor.avatar
        ? <img src={donor.avatar} alt={donor.name} className="w-full h-full object-cover" />
        : donor.name?.[0]?.toUpperCase()
      }
    </div>
  );
}

// ─── Blood Group Badge ────────────────────────────────────────────────────────

function BloodBadge({ group, size = 'md' }: { group: string; size?: 'sm' | 'md' }) {
  const c = BG_COLORS[group] ?? { bg: 'bg-red-500', text: 'text-white' };
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sizeClass} rounded-xl ${c.bg} ${c.text} flex items-center justify-center font-black shrink-0 shadow-sm`}>
      {group}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DonorsPage() {
  const { user: baseUser } = useAuthStore();
  const user = baseUser as (DonorUser & typeof baseUser) | null;
  const qc = useQueryClient();

  const [bgFilter, setBgFilter]     = useState('');
  const [search, setSearch]         = useState('');
  const [sortBy, setSortBy]         = useState<'name' | 'bloodGroup' | 'location'>('name');

  // ── Query ──────────────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery<DonorsResponse>({
    queryKey: ['blood-donors-page', bgFilter],
    queryFn: () =>
      api.get('/blood/donors', {
        params: { bloodGroup: bgFilter || undefined },
      }).then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: () => api.patch<{ isAvailable: boolean }>('/blood/toggle-availability'),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['blood-donors-page'] });
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success(
        res.data.isAvailable
          ? '✅ আপনি এখন ডোনার হিসেবে উপলব্ধ'
          : 'ডোনার তালিকা থেকে সরা হয়েছে',
      );
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  // ── Derived ────────────────────────────────────────────────────────────────

  const donors = (data?.donors ?? [])
    .filter((d) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.bloodGroup.toLowerCase().includes(q) ||
        (d.location ?? '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'bloodGroup') return a.bloodGroup.localeCompare(b.bloodGroup);
      if (sortBy === 'location') return (a.location ?? '').localeCompare(b.location ?? '');
      return a.name.localeCompare(b.name);
    });

  const stats = BLOOD_GROUPS.map((bg) => ({
    group: bg,
    count: (data?.donors ?? []).filter((d) => d.bloodGroup === bg).length,
  })).filter((s) => s.count > 0);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-red-600 via-red-600 to-red-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 lg:mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">Blood Donors</h1>
                <p className="text-red-100 text-sm mt-0.5">
                  {data?.donors?.length ?? 0} জন ডোনার নিবন্ধিত আছেন
                </p>
              </div>
            </div>
            {user?.bloodGroup && (
              <button
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  user.isAvailableForDonation
                    ? 'bg-white text-red-600 hover:bg-red-50'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/30'
                }`}
              >
                {toggleMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Heart className={`w-4 h-4 ${user.isAvailableForDonation ? 'fill-red-500 text-red-500' : ''}`} />
                }
                {user.isAvailableForDonation ? `✅ Available (${user.bloodGroup})` : 'Become a Donor'}
              </button>
            )}
          </div>

          {/* Blood group stats */}
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {stats.map(({ group, count }) => {
                const c = BG_COLORS[group] ?? { bg: 'bg-red-500', text: 'text-white' };
                return (
                  <button
                    key={group}
                    onClick={() => setBgFilter(bgFilter === group ? '' : group)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 ${
                      bgFilter === group
                        ? 'bg-white text-gray-900 border-white'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md ${c.bg} flex items-center justify-center text-white text-[10px] font-black`}>
                      {group.replace(/[+-]/, '')}
                    </span>
                    {group}
                    <span className={`${bgFilter === group ? 'bg-gray-100 text-gray-600' : 'bg-white/20 text-white'} px-1.5 py-0.5 rounded-full text-[10px]`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── Filters bar ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                placeholder="Search by name, blood group, location..."
              />
            </div>

            {/* Blood group filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setBgFilter('')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  !bgFilter
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setBgFilter(bgFilter === bg ? '' : bg)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    bgFilter === bg
                      ? `${BG_COLORS[bg].bg} text-white`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all cursor-pointer"
              >
                <option value="name">Sort: Name</option>
                <option value="bloodGroup">Sort: Blood Group</option>
                <option value="location">Sort: Location</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        )}

        {/* ── Empty ── */}
        {!isLoading && donors.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-300" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {search || bgFilter ? 'No donors match your filters.' : 'No donors registered yet.'}
            </p>
            {(search || bgFilter) && (
              <button
                onClick={() => { setSearch(''); setBgFilter(''); }}
                className="mt-3 text-sm text-red-500 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {!isLoading && donors.length > 0 && (
          <>
            {/* ════════════════════════════════════════
                DESKTOP — Table (md and up)
            ════════════════════════════════════════ */}
            <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">

              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                {['Donor', 'Blood Group', 'Location', 'Contact', 'Last Donated', 'Status'].map((h) => (
                  <span key={h} className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {h}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {donors.map((donor, i) => (
                  <div
                    key={donor._id}
                    className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {/* Donor */}
                    <div className="flex items-center gap-3 min-w-0">
                      <DonorAvatar donor={donor} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {donor.name}
                        </p>
                        {donor.totalDonations != null && donor.totalDonations > 0 && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-red-400" />
                            {donor.totalDonations} donation{donor.totalDonations !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Blood Group */}
                    <div>
                      <BloodBadge group={donor.bloodGroup} />
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {donor.location ? (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {donor.location}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </div>

                    {/* Contact */}
                    <div>
                      {donor.phone ? (
                        <a
                          href={`tel:${donor.phone}`}
                          className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{donor.phone}</span>
                        </a>
                      ) : (
                        <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </div>

                    {/* Last Donated */}
                    <div>
                      {donor.lastDonated ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(donor.lastDonated), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      {donor.isAvailableForDonation ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table footer */}
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Showing {donors.length} donor{donors.length !== 1 ? 's' : ''}
                  {bgFilter ? ` with blood group ${bgFilter}` : ''}
                  {search ? ` matching "${search}"` : ''}
                </p>
              </div>
            </div>

            {/* ════════════════════════════════════════
                MOBILE — Cards (below md)
            ════════════════════════════════════════ */}
            <div className="md:hidden space-y-3">
              {donors.map((donor) => (
                <div
                  key={donor._id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
                >
                  {/* Card top strip — blood group color */}
                  <div className={`h-1.5 w-full ${BG_COLORS[donor.bloodGroup]?.bg ?? 'bg-red-500'}`} />

                  <div className="p-4">
                    {/* Header row */}
                    <div className="flex items-center gap-3">
                      <DonorAvatar donor={donor} size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate">
                          {donor.name}
                        </p>
                        {donor.location && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {donor.location}
                          </p>
                        )}
                      </div>
                      <BloodBadge group={donor.bloodGroup} size="sm" />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 dark:border-gray-800 my-3" />

                    {/* Info row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {donor.phone ? (
                        <a
                          href={`tel:${donor.phone}`}
                          className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {donor.phone}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600">No contact</span>
                      )}

                      {donor.isAvailableForDonation ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Unavailable
                        </span>
                      )}
                    </div>

                    {/* Last donated + total donations */}
                    {(donor.lastDonated || (donor.totalDonations != null && donor.totalDonations > 0)) && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        {donor.lastDonated && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            Last: {formatDistanceToNow(new Date(donor.lastDonated), { addSuffix: true })}
                          </div>
                        )}
                        {donor.totalDonations != null && donor.totalDonations > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Droplets className="w-3 h-3 text-red-400" />
                            {donor.totalDonations} donation{donor.totalDonations !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Mobile footer count */}
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2">
                {donors.length} donor{donors.length !== 1 ? 's' : ''} shown
              </p>
            </div>
          </>
        )}
      </div>

      <MainFooter />
    </div>
  );
}
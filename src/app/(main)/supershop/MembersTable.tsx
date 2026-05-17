'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ShieldCheck, Search, ChevronLeft, ChevronRight,
  Loader2, MapPin,
} from 'lucide-react';
import api from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────

type KYCStatus = 'pending' | 'approved' | 'rejected';

interface KYCRecord {
  _id:         string;
  name:        string;
  address:     string;
  region:      string;
  status:      KYCStatus;
  submittedAt: string;
  photo?:      { url: string; publicId: string };
}

interface KYCListResponse {
  success:    boolean;
  kycs:       KYCRecord[];
  totalPages: number;
  totalCount: number;
  page:       number;
}

// ─── Constants ────────────────────────────────────────────────

const PER_PAGE = 10;

const STATUS_CONFIG = {
  pending:  { label: 'অপেক্ষমান',    dot: 'bg-amber-400',  text: 'text-amber-700 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20'  },
  approved: { label: 'অনুমোদিত',    dot: 'bg-green-500',  text: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20'  },
  rejected: { label: 'প্রত্যাখ্যাত', dot: 'bg-red-500',    text: 'text-red-700 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20'      },
} as const;

// ─── Helpers ──────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

// ─── Status Badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: KYCStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function KYCUserTable() {
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading, isFetching } = useQuery<KYCListResponse>({
    queryKey: ['kyc-user-table', { search, page }],
    queryFn:  () => api.get('/admin/kyc', {
      params: {
        search: search || undefined,
        page,
        limit: PER_PAGE,
      },
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const kycs       = data?.kycs       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="font-black text-xl text-gray-900 dark:text-white">KYC আবেদন তালিকা</h1>
            <p className="text-xs text-gray-400">ব্যবহারকারীদের পরিচয় যাচাইয়ের তথ্য</p>
          </div>
        </div>

        {/* Search */}
        <div className="card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="নাম দিয়ে খুঁজুন..."
              className="input w-full pl-9 py-2 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-16">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-sm text-gray-500">লোড হচ্ছে...</span>
            </div>
          ) : kycs.length === 0 ? (
            <div className="py-16 text-center">
              <ShieldCheck className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="font-bold text-gray-400 dark:text-gray-500">কোনো আবেদন পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      আবেদনকারী
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      ঠিকানা
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      বিভাগ
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      অবস্থা
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-100 dark:divide-gray-800 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                  {kycs.map(kyc => (
                    <tr key={kyc._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">

                      {/* Photo + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {kyc.photo?.url ? (
                            <img
                              src={kyc.photo.url}
                              alt={kyc.name}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(kyc.name)}`}>
                              {initials(kyc.name)}
                            </div>
                          )}
                          <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {kyc.name}
                          </p>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[180px]">
                        <p className="truncate">{kyc.address || '—'}</p>
                      </td>

                      {/* Division / Region */}
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg font-medium whitespace-nowrap">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {kyc.region || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <StatusBadge status={kyc.status} />
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              মোট <strong className="text-gray-700 dark:text-gray-300">{totalCount}</strong> জন ·{' '}
              পৃষ্ঠা <strong className="text-gray-700 dark:text-gray-300">{page}</strong> / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                  flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700
                  disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                        page === p
                          ? 'bg-blue-600 text-white border border-blue-600'
                          : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                  flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700
                  disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
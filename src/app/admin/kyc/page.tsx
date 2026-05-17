'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ShieldCheck, Search, Filter, CheckCircle2, XCircle, Clock,
  ChevronLeft, ChevronRight, Eye, AlertCircle, BadgeCheck,
  Loader2, RefreshCw, User, CreditCard, Phone, MapPin,
  Calendar, FileText, ChevronUp, ChevronDown, X,
  Download, SlidersHorizontal, Trash2, Banknote,
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type KYCStatus = 'pending' | 'approved' | 'rejected';
type SortKey   = 'name' | 'submittedAt' | 'status' | 'region';
type SortDir   = 'asc' | 'desc';

interface KYCRecord {
  _id:           string;
  userId:        { _id: string; name: string; email: string };
  name:          string;
  dob:           string;
  age:           string;
  gender:        'male' | 'female' | 'other';
  fatherName:    string;
  motherName:    string;
  phone:         string;
  email?:        string;
  address:       string;
  region:        string;
  idType:        'nid' | 'passport' | 'birth_certificate';
  nidPassport:   string;
  status:        KYCStatus;
  adminNote?:    string;
  submittedAt:   string;
  reviewedAt?:   string;
  reviewedBy?:   { _id: string; name: string };
  photo?:        { url: string; publicId: string };
  nidFront?:     { url: string; publicId: string };
  nidBack?:      { url: string; publicId: string };
  // ── Payment fields ──────────────────────────────────────
  paymentMethod?: string;
  senderNumber?:  string;
  transactionId?: string;
  paidAmount?:    string;
}

interface KYCListResponse {
  success:    boolean;
  kycs:       KYCRecord[];
  totalPages: number;
  totalCount: number;
  page:       number;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const PAYMENT_METHODS = [
  { id: 'bkash',  label: 'বিকাশ'            },
  { id: 'nagad',  label: 'নগদ'              },
  { id: 'rocket', label: 'রকেট'             },
  { id: 'bank',   label: 'ব্যাংক ট্রান্সফার' },
] as const;

const STATUS_CONFIG = {
  pending:  { label: 'অপেক্ষমান',    color: 'text-amber-700 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20',  dot: 'bg-amber-400',  icon: Clock        },
  approved: { label: 'অনুমোদিত',    color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20',  dot: 'bg-green-500',  icon: CheckCircle2 },
  rejected: { label: 'প্রত্যাখ্যাত', color: 'text-red-700 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20',      dot: 'bg-red-500',    icon: XCircle      },
} as const;

const ID_TYPE_LABELS = {
  nid:               'NID',
  passport:          'পাসপোর্ট',
  birth_certificate: 'জন্ম নিবন্ধন',
} as const;

const GENDER_LABELS = {
  male:   'পুরুষ',
  female: 'মহিলা',
  other:  'অন্যান্য',
} as const;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

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

function paymentLabel(id?: string) {
  return PAYMENT_METHODS.find(m => m.id === id)?.label ?? id ?? '—';
}

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: KYCStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Sort Header
// ─────────────────────────────────────────────────────────────

function SortTh({ label, sortK, current, dir, onClick, className = '' }: {
  label: string; sortK: SortKey; current: SortKey; dir: SortDir;
  onClick: (k: SortKey) => void; className?: string;
}) {
  const active = current === sortK;
  return (
    <th
      onClick={() => onClick(sortK)}
      className={`px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400
        cursor-pointer select-none hover:text-gray-800 dark:hover:text-gray-200 whitespace-nowrap
        transition-colors ${className}`}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="opacity-60">
          {active
            ? dir === 'asc'
              ? <ChevronUp className="w-3 h-3" />
              : <ChevronDown className="w-3 h-3" />
            : <ChevronUp className="w-3 h-3 opacity-30" />
          }
        </span>
      </div>
    </th>
  );
}

// ─────────────────────────────────────────────────────────────
// Detail Modal
// ─────────────────────────────────────────────────────────────

function DetailModal({ kyc, onClose, onApprove, onReject, onDelete, isPending }: {
  kyc:       KYCRecord;
  onClose:   () => void;
  onApprove: (id: string) => void;
  onReject:  (id: string, note: string) => void;
  onDelete:  (id: string) => void;
  isPending: boolean;
}) {
  const [note, setNote] = useState(kyc.adminNote ?? '');

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" /> KYC বিস্তারিত
          </h2>
          <div className="flex items-center gap-2">
            {/* Delete from modal */}
            <button
              onClick={() => {
                if (confirm('এই KYC স্থায়ীভাবে মুছে ফেলবেন?')) onDelete(kyc._id);
              }}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20
                text-red-500 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40
                transition disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> মুছুন
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center
                text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Profile row */}
          <div className="flex items-start gap-4">
            {kyc.photo?.url ? (
              <img
                src={kyc.photo.url}
                alt={kyc.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-gray-700 shrink-0"
              />
            ) : (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${avatarColor(kyc.name)}`}>
                {initials(kyc.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-black text-gray-900 dark:text-white text-lg">{kyc.name}</h3>
                <StatusBadge status={kyc.status} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {GENDER_LABELS[kyc.gender]} · বয়স {kyc.age} · {kyc.region}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                জমা: {format(new Date(kyc.submittedAt), 'dd MMM yyyy, HH:mm')}
                {kyc.reviewedAt && ` · পর্যালোচনা: ${format(new Date(kyc.reviewedAt), 'dd MMM yyyy')}`}
              </p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: Phone,      label: 'ফোন',        value: kyc.phone          },
              { icon: User,       label: 'পিতার নাম',  value: kyc.fatherName     },
              { icon: User,       label: 'মাতার নাম',  value: kyc.motherName     },
              { icon: Calendar,   label: 'জন্ম তারিখ', value: kyc.dob ? format(new Date(kyc.dob), 'dd MMM yyyy') : '—' },
              { icon: CreditCard, label: 'ID ধরন',     value: ID_TYPE_LABELS[kyc.idType] },
              { icon: CreditCard, label: 'ID নম্বর',   value: kyc.nidPassport    },
              { icon: MapPin,     label: 'ঠিকানা',     value: kyc.address, full: true },
            ].map(item => (
              <div key={item.label} className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 ${(item as any).full ? 'col-span-2' : ''}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <item.icon className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{item.value || '—'}</p>
              </div>
            ))}
          </div>

          {/* ── Payment info ── */}
          {(kyc.paymentMethod || kyc.senderNumber || kyc.transactionId) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5" /> পেমেন্ট তথ্য
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'পদ্ধতি',         value: paymentLabel(kyc.paymentMethod) },
                  { label: 'পেমেন্ট নম্বর', value: kyc.senderNumber  ?? '—' },
                  { label: 'Transaction ID', value: kyc.transactionId ?? '—' },
                  { label: 'পরিমাণ',         value: kyc.paidAmount ? `৳${kyc.paidAmount}` : '—' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium mb-0.5">{item.label}</p>
                    <p className="text-gray-800 dark:text-gray-200 font-semibold text-sm font-mono">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NID images */}
          {(kyc.nidFront?.url || kyc.nidBack?.url) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> পরিচয়পত্রের ছবি
              </p>
              <div className="grid grid-cols-2 gap-3">
                {kyc.nidFront?.url && (
                  <a href={kyc.nidFront.url} target="_blank" rel="noreferrer" className="group">
                    <img src={kyc.nidFront.url} alt="NID Front"
                      className="rounded-xl w-full aspect-video object-cover group-hover:opacity-80 transition ring-1 ring-gray-200 dark:ring-gray-700" />
                    <p className="text-xs text-gray-400 text-center mt-1">সামনের দিক</p>
                  </a>
                )}
                {kyc.nidBack?.url && (
                  <a href={kyc.nidBack.url} target="_blank" rel="noreferrer" className="group">
                    <img src={kyc.nidBack.url} alt="NID Back"
                      className="rounded-xl w-full aspect-video object-cover group-hover:opacity-80 transition ring-1 ring-gray-200 dark:ring-gray-700" />
                    <p className="text-xs text-gray-400 text-center mt-1">পেছনের দিক</p>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Admin note (if rejected) */}
          {kyc.status === 'rejected' && kyc.adminNote && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-3">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">প্রত্যাখ্যানের কারণ</p>
              <p className="text-sm text-red-600 dark:text-red-300">{kyc.adminNote}</p>
            </div>
          )}

          {kyc.reviewedBy && (
            <p className="text-xs text-gray-400">
              পর্যালোচক: <span className="font-semibold text-gray-600 dark:text-gray-300">{kyc.reviewedBy.name}</span>
            </p>
          )}

          {/* Action area for pending */}
          {kyc.status === 'pending' && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  প্রত্যাখ্যানের কারণ (প্রয়োজনে)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="যেমন: NID নম্বর মেলেনি, ছবি অস্পষ্ট..."
                  className="input w-full resize-none text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(kyc._id)}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold
                    flex items-center justify-center gap-1.5 transition disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  অনুমোদন করুন
                </button>
                <button
                  onClick={() => onReject(kyc._id, note)}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold
                    flex items-center justify-center gap-1.5 transition disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  প্রত্যাখ্যান করুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Admin Table Page
// ─────────────────────────────────────────────────────────────

export default function KYCAdminPage() {
  const qc = useQueryClient();

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<KYCStatus | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState('');
  const [idTypeFilter, setIdTypeFilter] = useState('');
  const [sortKey,      setSortKey]      = useState<SortKey>('submittedAt');
  const [sortDir,      setSortDir]      = useState<SortDir>('desc');
  const [page,         setPage]         = useState(1);
  const [selected,     setSelected]     = useState<KYCRecord | null>(null);
  const [showFilters,  setShowFilters]  = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery<KYCListResponse>({
    queryKey: ['admin-kyc-list', { search, statusFilter, regionFilter, idTypeFilter, sortKey, sortDir, page }],
    queryFn:  () => api.get('/admin/kyc', {
      params: {
        search:  search || undefined,
        status:  statusFilter !== 'all' ? statusFilter : undefined,
        region:  regionFilter || undefined,
        idType:  idTypeFilter || undefined,
        sortBy:  sortKey,
        sortDir,
        page,
        limit:   PER_PAGE,
      },
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const { data: statsData } = useQuery<{ pending: number; approved: number; rejected: number; total: number }>({
    queryKey: ['admin-kyc-stats'],
    queryFn:  () => api.get('/admin/kyc/stats').then(r => r.data),
  });

  const handleSort = useCallback((k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
    setPage(1);
  }, [sortKey]);

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/kyc/${id}/approve`),
    onSuccess: () => {
      toast.success('KYC অনুমোদন হয়েছে');
      qc.invalidateQueries({ queryKey: ['admin-kyc-list'] });
      qc.invalidateQueries({ queryKey: ['admin-kyc-stats'] });
      setSelected(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'অনুমোদন ব্যর্থ'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      api.patch(`/admin/kyc/${id}/reject`, { adminNote: note }),
    onSuccess: () => {
      toast.success('KYC প্রত্যাখ্যাত হয়েছে');
      qc.invalidateQueries({ queryKey: ['admin-kyc-list'] });
      qc.invalidateQueries({ queryKey: ['admin-kyc-stats'] });
      setSelected(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'প্রত্যাখ্যান ব্যর্থ'),
  });

  // ── NEW: Delete mutation ───────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/kyc/${id}`),
    onSuccess: () => {
      toast.success('KYC মুছে ফেলা হয়েছে');
      qc.invalidateQueries({ queryKey: ['admin-kyc-list'] });
      qc.invalidateQueries({ queryKey: ['admin-kyc-stats'] });
      setSelected(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'মুছতে ব্যর্থ'),
  });

  const isMutating = approveMutation.isPending || rejectMutation.isPending || deleteMutation.isPending;

  const kycs       = data?.kycs       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  const exportCSV = () => {
    if (!kycs.length) return;
    const headers = ['নাম', 'ফোন', 'বিভাগ', 'ID ধরন', 'ID নম্বর', 'পেমেন্ট পদ্ধতি', 'পেমেন্ট নম্বর', 'Trx ID', 'অবস্থা', 'জমার তারিখ'];
    const rows = kycs.map(r => [
      r.name, r.phone, r.region, ID_TYPE_LABELS[r.idType], r.nidPassport,
      paymentLabel(r.paymentMethod), r.senderNumber ?? '', r.transactionId ?? '',
      STATUS_CONFIG[r.status].label,
      format(new Date(r.submittedAt), 'dd/MM/yyyy'),
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `kyc-list-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleQuickApprove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('এই KYC অনুমোদন করবেন?')) approveMutation.mutate(id);
  };

  const handleQuickReject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const note = prompt('প্রত্যাখ্যানের কারণ লিখুন:') ?? '';
    rejectMutation.mutate({ id, note });
  };

  // ── NEW: Quick delete handler ──────────────────────────────
  const handleQuickDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('এই KYC স্থায়ীভাবে মুছে ফেলবেন?')) deleteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="font-black text-xl text-gray-900 dark:text-white">KYC ম্যানেজমেন্ট</h1>
              <p className="text-xs text-gray-400">সকল আবেদন পর্যালোচনা ও অনুমোদন করুন</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-500"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition
                text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              <Download className="w-4 h-4" /> CSV এক্সপোর্ট
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="মোট আবেদন"    value={statsData?.total    ?? 0} icon={ShieldCheck} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"    />
          <StatCard label="অপেক্ষমান"    value={statsData?.pending  ?? 0} icon={Clock}       color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
          <StatCard label="অনুমোদিত"     value={statsData?.approved ?? 0} icon={BadgeCheck}  color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"  />
          <StatCard label="প্রত্যাখ্যাত" value={statsData?.rejected ?? 0} icon={XCircle}     color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"          />
        </div>

        {/* Filters bar */}
        <div className="card p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="নাম, ফোন বা ID দিয়ে খুঁজুন..."
                className="input w-full pl-9 py-2 text-sm"
              />
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    statusFilter === s
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {s === 'all' ? 'সব' : STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                showFilters
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> ফিল্টার
            </button>
          </div>

          {showFilters && (
            <div className="flex gap-3 flex-wrap border-t border-gray-100 dark:border-gray-800 pt-3">
              <select
                value={regionFilter}
                onChange={e => { setRegionFilter(e.target.value); setPage(1); }}
                className="input py-2 text-sm flex-1 min-w-[150px]"
              >
                <option value="">— সব বিভাগ —</option>
                {['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                value={idTypeFilter}
                onChange={e => { setIdTypeFilter(e.target.value); setPage(1); }}
                className="input py-2 text-sm flex-1 min-w-[150px]"
              >
                <option value="">— সব ID ধরন —</option>
                <option value="nid">জাতীয় পরিচয়পত্র (NID)</option>
                <option value="passport">পাসপোর্ট</option>
                <option value="birth_certificate">জন্ম নিবন্ধন</option>
              </select>
              {(regionFilter || idTypeFilter) && (
                <button
                  onClick={() => { setRegionFilter(''); setIdTypeFilter(''); setPage(1); }}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> ক্লিয়ার
                </button>
              )}
            </div>
          )}
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
              <p className="text-sm text-gray-400 mt-1">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                    <SortTh label="আবেদনকারী"  sortK="name"       current={sortKey} dir={sortDir} onClick={handleSort} className="pl-4 w-[18%]" />
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[9%]">ফোন</th>
                    <SortTh label="বিভাগ"       sortK="region"      current={sortKey} dir={sortDir} onClick={handleSort} className="w-[8%]" />
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[8%]">ID ধরন</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[10%]">ID নম্বর</th>
                    <SortTh label="অবস্থা"      sortK="status"      current={sortKey} dir={sortDir} onClick={handleSort} className="w-[9%]" />
                    <SortTh label="তারিখ"        sortK="submittedAt" current={sortKey} dir={sortDir} onClick={handleSort} className="w-[9%]" />
                    {/* ── NEW payment columns ── */}
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[9%]">পেমেন্ট</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[9%]">পেমেন্ট নম্বর</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[10%]">Trx ID</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[11%]">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-100 dark:divide-gray-800 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                  {kycs.map(kyc => (
                    <tr
                      key={kyc._id}
                      onClick={() => setSelected(kyc)}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 cursor-pointer transition-colors"
                    >
                      {/* Name + avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {kyc.photo?.url ? (
                            <img
                              src={kyc.photo.url} alt={kyc.name}
                              className="w-8 h-8 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(kyc.name)}`}>
                              {initials(kyc.name)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{kyc.name}</p>
                            <p className="text-xs text-gray-400 truncate">{kyc.userId?.email ?? '—'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{kyc.phone}</td>
                      <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{kyc.region}</td>

                      <td className="px-3 py-3">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg font-medium">
                          {ID_TYPE_LABELS[kyc.idType]}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60
                          border border-gray-200 dark:border-gray-700 rounded-md px-2 py-0.5">
                          {kyc.nidPassport.length > 12 ? kyc.nidPassport.slice(0, 12) + '…' : kyc.nidPassport}
                        </span>
                      </td>

                      <td className="px-3 py-3"><StatusBadge status={kyc.status} /></td>

                      <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {format(new Date(kyc.submittedAt), 'dd MMM yyyy')}
                        <br />
                        <span className="text-gray-400">{format(new Date(kyc.submittedAt), 'HH:mm')}</span>
                      </td>

                      {/* ── NEW: Payment method cell ── */}
                      <td className="px-3 py-3">
                        {kyc.paymentMethod ? (
                          <span className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300
                            px-2 py-1 rounded-lg font-medium">
                            {paymentLabel(kyc.paymentMethod)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* ── NEW: Sender number cell ── */}
                      <td className="px-3 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                        {kyc.senderNumber ?? <span className="text-gray-400">—</span>}
                      </td>

                      {/* ── NEW: Transaction ID cell ── */}
                      <td className="px-3 py-3">
                        {kyc.transactionId ? (
                          <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60
                            border border-gray-200 dark:border-gray-700 rounded-md px-2 py-0.5 uppercase">
                            {kyc.transactionId.length > 10 ? kyc.transactionId.slice(0, 10) + '…' : kyc.transactionId}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          {kyc.status === 'pending' && (
                            <>
                              <button
                                onClick={e => handleQuickApprove(e, kyc._id)}
                                disabled={isMutating}
                                title="অনুমোদন"
                                className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400
                                  hover:bg-green-100 dark:hover:bg-green-900/40 flex items-center justify-center transition disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={e => handleQuickReject(e, kyc._id)}
                                disabled={isMutating}
                                title="প্রত্যাখ্যান"
                                className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400
                                  hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center transition disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); setSelected(kyc); }}
                            title="বিস্তারিত"
                            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400
                              hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* ── NEW: Delete button ── */}
                          <button
                            onClick={e => handleQuickDelete(e, kyc._id)}
                            disabled={isMutating}
                            title="মুছুন"
                            className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-500
                              hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center transition disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination — unchanged */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              মোট <strong className="text-gray-700 dark:text-gray-300">{totalCount}</strong> টি আবেদনের মধ্যে{' '}
              <strong className="text-gray-700 dark:text-gray-300">{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalCount)}</strong> দেখাচ্ছে
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
                )
              }
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

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          kyc={selected}
          onClose={() => setSelected(null)}
          onApprove={id => approveMutation.mutate(id)}
          onReject={(id, note) => rejectMutation.mutate({ id, note })}
          onDelete={id => deleteMutation.mutate(id)}
          isPending={isMutating}
        />
      )}
    </div>
  );
}
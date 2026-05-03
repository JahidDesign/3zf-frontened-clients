'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, LayoutGrid, HandCoins, CheckCircle2, XCircle,
  Clock, ChevronDown, ChevronUp, Search, RefreshCw,
  ShieldCheck, Ban, Eye, ThumbsUp, ThumbsDown, Zap,
  Receipt, BadgeCheck, AlertTriangle, MoreHorizontal,
  TrendingUp, UserCheck, Banknote, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'members' | 'programs' | 'donations';

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  division: string;
  nidNumber: string;
  paymentMethod: string;
  paymentAmount: number;
  senderNumber?: string;
  transactionId: string;
  paymentStatus: 'pending' | 'paid';
  status: 'pending' | 'approved' | 'rejected';
  membershipId?: string;
  adminNote?: string;
  createdAt: string;
  profilePhoto?: { url: string };
  occupation?: string;
  religion?: string;
  birthPlace?: string;
  motherName?: string;
  fatherName?: string;
  address?: string;
  presentAddress?: string;
  dob?: string;
}

interface Program {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending_review' | 'pending_vote' | 'active' | 'completed' | 'cancelled';
  requestedAmount: number;
  approvedAmount?: number;
  requiredAmount: number;
  raisedAmount: number;
  votes: { yes: number; no: number; totalProposedAmount: number };
  author: { name: string; avatar?: string };
  location?: { district?: string; division?: string };
  adminNote?: string;
  createdAt: string;
}

interface Donation {
  _id: string;
  donorName: string;
  amount: number;
  method: string;
  transactionId: string;
  status: 'verifying' | 'completed' | 'rejected';
  adminNote?: string;
  createdAt: string;
  program: { title: string; category: string };
  donor: { name: string; email: string; phone?: string };
  screenshot?: { url: string };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => `৳${n.toLocaleString('bn-BD')}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('bn-BD', { day: '2-digit', month: 'short', year: 'numeric' });

const CATEGORY_LABELS: Record<string, string> = {
  medical: 'চিকিৎসা', food: 'খাদ্য', education: 'শিক্ষা',
  clothes: 'পোশাক', shelter: 'আশ্রয়', disaster: 'দুর্যোগ', other: 'অন্যান্য',
};

const PAYMENT_LABELS: Record<string, string> = {
  bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', bank: 'ব্যাংক',
};

// ─── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
    pending:        { label: 'অপেক্ষায়',    bg: 'rgba(234,179,8,0.12)',   color: '#b45309', icon: <Clock className="w-3 h-3" /> },
    approved:       { label: 'অনুমোদিত',    bg: 'rgba(34,197,94,0.12)',   color: '#15803d', icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected:       { label: 'প্রত্যাখ্যাত', bg: 'rgba(239,68,68,0.12)',   color: '#b91c1c', icon: <XCircle className="w-3 h-3" /> },
    verifying:      { label: 'যাচাই চলছে',   bg: 'rgba(59,130,246,0.12)',  color: '#1d4ed8', icon: <Clock className="w-3 h-3" /> },
    completed:      { label: 'সম্পন্ন',      bg: 'rgba(34,197,94,0.12)',   color: '#15803d', icon: <CheckCircle2 className="w-3 h-3" /> },
    cancelled:      { label: 'বাতিল',       bg: 'rgba(239,68,68,0.12)',   color: '#b91c1c', icon: <Ban className="w-3 h-3" /> },
    pending_review: { label: 'রিভিউ বাকি',   bg: 'rgba(234,179,8,0.12)',   color: '#b45309', icon: <Eye className="w-3 h-3" /> },
    pending_vote:   { label: 'ভোটিং চলছে',  bg: 'rgba(139,92,246,0.12)',  color: '#7c3aed', icon: <ThumbsUp className="w-3 h-3" /> },
    active:         { label: 'সক্রিয়',      bg: 'rgba(34,197,94,0.12)',   color: '#15803d', icon: <Zap className="w-3 h-3" /> },
    paid:           { label: 'পেইড',         bg: 'rgba(34,197,94,0.12)',   color: '#15803d', icon: <BadgeCheck className="w-3 h-3" /> },
  };
  const c = cfg[status] ?? { label: status, bg: 'rgba(0,0,0,0.06)', color: 'var(--color-text-muted)', icon: null };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: c.bg, color: c.color }}>
      {c.icon}{c.label}
    </span>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent: string }) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-4"
      style={{ background: 'var(--color-bg-card, var(--color-bg))', border: '1.5px solid var(--color-border)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18`, color: accent }}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
        <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Expandable Row Detail ──────────────────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value?: string | number }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2 text-xs">
      <span className="w-28 flex-shrink-0 font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--color-text)' }}>{value}</span>
    </div>
  );
}

// ─── Confirm Modal ──────────────────────────────────────────────────────────────
function ConfirmModal({
  open, title, children, onConfirm, onCancel, loading, confirmLabel, confirmColor,
}: {
  open: boolean; title: string; children: React.ReactNode;
  onConfirm: () => void; onCancel: () => void;
  loading?: boolean; confirmLabel?: string; confirmColor?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: 'var(--color-bg-card, var(--color-bg))', border: '1.5px solid var(--color-border)' }}>
        <h3 className="font-bold text-base mb-3" style={{ color: 'var(--color-text)' }}>{title}</h3>
        <div className="space-y-3 mb-5">{children}</div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ border: '1.5px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
            বাতিল
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: confirmColor || 'var(--color-brand)' }}>
            {loading ? 'হচ্ছে...' : confirmLabel || 'নিশ্চিত করুন'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── MEMBERS TABLE ──────────────────────────────────────────────────────────────
function MembersTable() {
  const [members, setMembers]     = useState<Member[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [filter, setFilter]       = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState<{ id: string; action: 'approved' | 'rejected' } | null>(null);
  const [note, setNote]           = useState('');
  const [acting, setActing]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'pending' || filter === 'all'
        ? '/org/members/pending'
        : '/org/members/pending'; // adjust if you have a separate all-members admin endpoint
      const { data } = await api.get(endpoint);
      let list: Member[] = data.members ?? [];
      if (filter !== 'all' && filter !== 'pending') {
        list = list.filter((m) => m.status === filter);
      }
      setMembers(list);
    } catch {
      toast.error('লোড হয়নি');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const filtered = members.filter((m) =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search) || m.nidNumber.includes(search) ||
    (m.membershipId ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const act = async () => {
    if (!modal) return;
    setActing(true);
    try {
      await api.patch(`/org/members/${modal.id}/approve`, { status: modal.action, adminNote: note });
      toast.success(modal.action === 'approved' ? 'অনুমোদিত হয়েছে!' : 'প্রত্যাখ্যাত হয়েছে');
      setModal(null); setNote(''); load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে');
    } finally {
      setActing(false);
    }
  };

  const stats = {
    total:    members.length,
    approved: members.filter((m) => m.status === 'approved').length,
    pending:  members.filter((m) => m.status === 'pending').length,
    revenue:  members.filter((m) => m.paymentStatus === 'paid').reduce((s, m) => s + m.paymentAmount, 0),
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="মোট আবেদন"   value={stats.total}    icon={<Users className="w-5 h-5" />}       accent="#6366f1" />
        <StatCard label="অনুমোদিত"    value={stats.approved} icon={<UserCheck className="w-5 h-5" />}   accent="#22c55e" />
        <StatCard label="অপেক্ষায়"   value={stats.pending}  icon={<Clock className="w-5 h-5" />}       accent="#f59e0b" />
        <StatCard label="মোট ফি আয়"  value={fmt(stats.revenue)} icon={<Banknote className="w-5 h-5" />} accent="#14b8a6" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }}>
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === f ? 'var(--color-brand)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--color-text-secondary)',
              }}>
              {{ pending: 'অপেক্ষায়', approved: 'অনুমোদিত', rejected: 'প্রত্যাখ্যাত', all: 'সব' }[f]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ border: '1.5px solid var(--color-border)', background: 'var(--color-bg)' }}>
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <input placeholder="নাম / ফোন / NID খুঁজুন…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent text-xs w-40"
              style={{ color: 'var(--color-text)' }} />
          </div>
          <button onClick={load} className="p-2 rounded-xl transition-all hover:bg-[var(--color-bg-hover)]"
            style={{ border: '1.5px solid var(--color-border)' }}>
            <RefreshCw className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid var(--color-border)' }}>
        {/* Header */}
        <div className="grid text-[11px] font-bold uppercase tracking-wider px-4 py-3"
          style={{
            gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 1fr auto',
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-muted)',
            borderBottom: '1px solid var(--color-border)',
          }}>
          <span>সদস্য</span>
          <span>ফোন / NID</span>
          <span>জেলা</span>
          <span>পেমেন্ট</span>
          <span>স্ট্যাটাস</span>
          <span>তারিখ</span>
          <span />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            লোড হচ্ছে…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            কোনো রেকর্ড নেই
          </div>
        ) : (
          filtered.map((m, i) => (
            <div key={m._id}>
              {/* Main row */}
              <div
                className="grid items-center px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--color-bg-hover)]"
                style={{
                  gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 1fr auto',
                  borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                }}
                onClick={() => setExpanded(expanded === m._id ? null : m._id)}
              >
                {/* Name + photo */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-brand)' }}>
                    {m.profilePhoto?.url
                      ? <img src={m.profilePhoto.url} className="w-full h-full object-cover" alt="" />
                      : m.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{m.name}</p>
                    {m.membershipId && (
                      <p className="text-[11px] font-mono" style={{ color: 'var(--color-brand)' }}>{m.membershipId}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text)' }}>{m.phone}</p>
                  <p className="text-[11px] font-mono" style={{ color: 'var(--color-text-muted)' }}>{m.nidNumber}</p>
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{m.district}</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{fmt(m.paymentAmount)}</p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{PAYMENT_LABELS[m.paymentMethod] ?? m.paymentMethod}</p>
                </div>
                <Badge status={m.status} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(m.createdAt)}</span>

                {/* Actions */}
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {m.status === 'pending' && (
                    <>
                      <button
                        onClick={() => { setModal({ id: m._id, action: 'approved' }); setNote(''); }}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                        title="অনুমোদন">
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setModal({ id: m._id, action: 'rejected' }); setNote(''); }}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}
                        title="প্রত্যাখ্যান">
                        <Ban className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button className="p-1.5 rounded-lg transition-all hover:bg-[var(--color-bg-hover)]"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {expanded === m._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {expanded === m._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2"
                      style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
                      <DetailRow label="ইমেইল"        value={m.email} />
                      <DetailRow label="পেশা"          value={m.occupation} />
                      <DetailRow label="ধর্ম"          value={m.religion} />
                      <DetailRow label="জন্মস্থান"     value={m.birthPlace} />
                      <DetailRow label="পিতার নাম"    value={m.fatherName} />
                      <DetailRow label="মাতার নাম"    value={m.motherName} />
                      <DetailRow label="স্থায়ী ঠিকানা" value={m.address} />
                      <DetailRow label="বর্তমান ঠিকানা" value={m.presentAddress} />
                      <DetailRow label="বিভাগ"         value={m.division} />
                      <DetailRow label="Sender নম্বর"  value={m.senderNumber} />
                      <DetailRow label="TrxID"         value={m.transactionId} />
                      <DetailRow label="Payment Status" value={m.paymentStatus} />
                      {m.adminNote && <DetailRow label="Admin নোট" value={m.adminNote} />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Approve/Reject modal */}
      <ConfirmModal
        open={!!modal}
        title={modal?.action === 'approved' ? 'সদস্যপদ অনুমোদন' : 'আবেদন প্রত্যাখ্যান'}
        onConfirm={act}
        onCancel={() => setModal(null)}
        loading={acting}
        confirmLabel={modal?.action === 'approved' ? 'অনুমোদন করুন' : 'প্রত্যাখ্যান করুন'}
        confirmColor={modal?.action === 'approved' ? '#16a34a' : '#dc2626'}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {modal?.action === 'approved'
            ? 'এই সদস্যকে অনুমোদন দিলে তারা ভোট দিতে ও দান করতে পারবেন।'
            : 'এই আবেদন প্রত্যাখ্যাত হবে। কারণ লিখলে সদস্যকে জানানো হবে।'}
        </p>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Admin নোট {modal?.action === 'rejected' && '(প্রয়োজনীয়)'}
          </label>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="কারণ / মন্তব্য লিখুন…"
            style={{
              width: '100%', padding: '8px 10px', borderRadius: 10, resize: 'none',
              border: '1.5px solid var(--color-border)', background: 'var(--color-bg)',
              color: 'var(--color-text)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
            }} />
        </div>
      </ConfirmModal>
    </div>
  );
}

// ─── PROGRAMS TABLE ─────────────────────────────────────────────────────────────
function ProgramsTable() {
  const [programs, setPrograms]   = useState<Program[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [filter, setFilter]       = useState<string>('all');
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState<{ id: string; type: 'review' | 'activate' } | null>(null);
  const [note, setNote]           = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [activateAmount, setActivateAmount] = useState('');
  const [acting, setActing]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await api.get(`/org/programs${params}`);
      setPrograms(data.data ?? []);
    } catch {
      toast.error('লোড হয়নি');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const filtered = programs.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.name.toLowerCase().includes(search.toLowerCase())
  );

  const doReview = async () => {
    if (!modal) return;
    setActing(true);
    try {
      await api.patch(`/org/programs/${modal.id}/review`, { action: reviewAction, adminNote: note });
      toast.success(reviewAction === 'approve' ? 'ভোটিং শুরু হয়েছে!' : 'বাতিল করা হয়েছে');
      setModal(null); setNote(''); load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে');
    } finally {
      setActing(false);
    }
  };

  const doActivate = async () => {
    if (!modal) return;
    setActing(true);
    try {
      await api.patch(`/org/programs/${modal.id}/activate`, { requiredAmount: activateAmount, adminNote: note });
      toast.success('প্রোগ্রাম সক্রিয় হয়েছে!');
      setModal(null); setNote(''); setActivateAmount(''); load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে');
    } finally {
      setActing(false);
    }
  };

  const STATUSES = ['all', 'pending_review', 'pending_vote', 'active', 'completed', 'cancelled'];
  const STATUS_LABELS: Record<string, string> = {
    all: 'সব', pending_review: 'রিভিউ', pending_vote: 'ভোটিং',
    active: 'সক্রিয়', completed: 'সম্পন্ন', cancelled: 'বাতিল',
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 flex-wrap p-1 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }}>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === s ? 'var(--color-brand)' : 'transparent',
                color: filter === s ? '#fff' : 'var(--color-text-secondary)',
              }}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ border: '1.5px solid var(--color-border)', background: 'var(--color-bg)' }}>
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <input placeholder="শিরোনাম / লেখক খুঁজুন…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent text-xs w-36"
              style={{ color: 'var(--color-text)' }} />
          </div>
          <button onClick={load} className="p-2 rounded-xl transition-all hover:bg-[var(--color-bg-hover)]"
            style={{ border: '1.5px solid var(--color-border)' }}>
            <RefreshCw className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid var(--color-border)' }}>
        <div className="grid text-[11px] font-bold uppercase tracking-wider px-4 py-3"
          style={{
            gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr 1fr 1fr auto',
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-muted)',
            borderBottom: '1px solid var(--color-border)',
          }}>
          <span>প্রোগ্রাম</span>
          <span>ক্যাটাগরি</span>
          <span>চাহিদা</span>
          <span>ভোট (হ্যাঁ/না)</span>
          <span>স্ট্যাটাস</span>
          <span>তারিখ</span>
          <span />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>লোড হচ্ছে…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>কোনো রেকর্ড নেই</div>
        ) : (
          filtered.map((p, i) => (
            <div key={p._id}>
              <div
                className="grid items-center px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--color-bg-hover)]"
                style={{
                  gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr 1fr 1fr auto',
                  borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                }}
                onClick={() => setExpanded(expanded === p._id ? null : p._id)}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{p.title}</p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>by {p.author.name}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                  {CATEGORY_LABELS[p.category] ?? p.category}
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                  {fmt(p.requestedAmount)}
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="flex items-center gap-1" style={{ color: '#16a34a' }}>
                    <ThumbsUp className="w-3 h-3" />{p.votes.yes}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>/</span>
                  <span className="flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <ThumbsDown className="w-3 h-3" />{p.votes.no}
                  </span>
                </div>
                <Badge status={p.status} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(p.createdAt)}</span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {p.status === 'pending_review' && (
                    <button
                      onClick={() => { setModal({ id: p._id, type: 'review' }); setNote(''); setReviewAction('approve'); }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                      রিভিউ
                    </button>
                  )}
                  {p.status === 'pending_vote' && (
                    <button
                      onClick={() => { setModal({ id: p._id, type: 'activate' }); setNote(''); setActivateAmount(String(p.votes.totalProposedAmount ? Math.round(p.votes.totalProposedAmount / Math.max(p.votes.yes, 1)) : p.requestedAmount)); }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                      সক্রিয় করুন
                    </button>
                  )}
                  <button className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {expanded === p._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expanded === p._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2"
                      style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
                      <DetailRow label="বিবরণ"          value={p.description} />
                      <DetailRow label="জেলা"           value={p.location?.district} />
                      <DetailRow label="বিভাগ"          value={p.location?.division} />
                      <DetailRow label="অনুমোদিত পরিমাণ" value={p.approvedAmount ? fmt(p.approvedAmount) : '—'} />
                      <DetailRow label="সংগৃহীত"        value={fmt(p.raisedAmount)} />
                      <DetailRow label="প্রস্তাবিত গড়"  value={p.votes.yes ? fmt(Math.round(p.votes.totalProposedAmount / p.votes.yes)) : '—'} />
                      {p.adminNote && <DetailRow label="Admin নোট" value={p.adminNote} />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Review modal */}
      <ConfirmModal
        open={modal?.type === 'review'}
        title="প্রোগ্রাম রিভিউ"
        onConfirm={doReview}
        onCancel={() => setModal(null)}
        loading={acting}
        confirmLabel={reviewAction === 'approve' ? 'ভোটিং শুরু করুন' : 'বাতিল করুন'}
        confirmColor={reviewAction === 'approve' ? '#7c3aed' : '#dc2626'}
      >
        <div className="flex gap-2">
          {(['approve', 'reject'] as const).map((a) => (
            <button key={a} onClick={() => setReviewAction(a)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                border: `1.5px solid ${reviewAction === a ? (a === 'approve' ? '#7c3aed' : '#dc2626') : 'var(--color-border)'}`,
                background: reviewAction === a ? (a === 'approve' ? 'rgba(124,58,237,0.1)' : 'rgba(220,38,38,0.1)') : 'transparent',
                color: reviewAction === a ? (a === 'approve' ? '#7c3aed' : '#dc2626') : 'var(--color-text-secondary)',
              }}>
              {a === 'approve' ? '✓ অনুমোদন দিন' : '✕ বাতিল করুন'}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Admin নোট</label>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="মন্তব্য…"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 10, resize: 'none', border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        </div>
      </ConfirmModal>

      {/* Activate modal */}
      <ConfirmModal
        open={modal?.type === 'activate'}
        title="প্রোগ্রাম সক্রিয় করুন"
        onConfirm={doActivate}
        onCancel={() => setModal(null)}
        loading={acting}
        confirmLabel="সক্রিয় করুন"
        confirmColor="#16a34a"
      >
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          ভোটের ভিত্তিতে গড় প্রস্তাব দেখানো হয়েছে। পরিবর্তন করতে পারেন।
        </p>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>লক্ষ্যমাত্রা (৳)</label>
          <input type="number" value={activateAmount} onChange={(e) => setActivateAmount(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, outline: 'none' }} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Admin নোট</label>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="মন্তব্য…"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 10, resize: 'none', border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        </div>
      </ConfirmModal>
    </div>
  );
}

// ─── DONATIONS TABLE ────────────────────────────────────────────────────────────
function DonationsTable() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [filter, setFilter]       = useState<string>('verifying');
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState<{ id: string; action: 'completed' | 'rejected' } | null>(null);
  const [note, setNote]           = useState('');
  const [acting, setActing]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await api.get(`/org/donations${params}`);
      setDonations(data.donations ?? []);
    } catch {
      toast.error('লোড হয়নি');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const filtered = donations.filter((d) =>
    !search || d.donorName.toLowerCase().includes(search.toLowerCase()) ||
    d.transactionId.toLowerCase().includes(search.toLowerCase()) ||
    d.program.title.toLowerCase().includes(search.toLowerCase())
  );

  const act = async () => {
    if (!modal) return;
    setActing(true);
    try {
      await api.patch(`/org/donations/${modal.id}/verify`, { status: modal.action, adminNote: note });
      toast.success(modal.action === 'completed' ? 'দান নিশ্চিত হয়েছে!' : 'দান প্রত্যাখ্যাত');
      setModal(null); setNote(''); load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে');
    } finally {
      setActing(false);
    }
  };

  const stats = {
    total:     donations.length,
    verifying: donations.filter((d) => d.status === 'verifying').length,
    completed: donations.filter((d) => d.status === 'completed').length,
    amount:    donations.filter((d) => d.status === 'completed').reduce((s, d) => s + d.amount, 0),
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="মোট দান"      value={stats.total}     icon={<Receipt className="w-5 h-5" />}      accent="#6366f1" />
        <StatCard label="যাচাই চলছে"   value={stats.verifying} icon={<Clock className="w-5 h-5" />}        accent="#f59e0b" />
        <StatCard label="নিশ্চিত"      value={stats.completed} icon={<CheckCircle2 className="w-5 h-5" />} accent="#22c55e" />
        <StatCard label="মোট সংগৃহীত" value={fmt(stats.amount)} icon={<TrendingUp className="w-5 h-5" />} accent="#14b8a6" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }}>
          {(['verifying', 'completed', 'rejected', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === f ? 'var(--color-brand)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--color-text-secondary)',
              }}>
              {{ verifying: 'যাচাই চলছে', completed: 'নিশ্চিত', rejected: 'প্রত্যাখ্যাত', all: 'সব' }[f]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ border: '1.5px solid var(--color-border)', background: 'var(--color-bg)' }}>
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            <input placeholder="নাম / TrxID / প্রোগ্রাম…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent text-xs w-36"
              style={{ color: 'var(--color-text)' }} />
          </div>
          <button onClick={load} className="p-2 rounded-xl transition-all hover:bg-[var(--color-bg-hover)]"
            style={{ border: '1.5px solid var(--color-border)' }}>
            <RefreshCw className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid var(--color-border)' }}>
        <div className="grid text-[11px] font-bold uppercase tracking-wider px-4 py-3"
          style={{
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr auto',
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-muted)',
            borderBottom: '1px solid var(--color-border)',
          }}>
          <span>দাতা</span>
          <span>প্রোগ্রাম</span>
          <span>পরিমাণ</span>
          <span>পদ্ধতি</span>
          <span>স্ট্যাটাস</span>
          <span>তারিখ</span>
          <span />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>লোড হচ্ছে…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>কোনো রেকর্ড নেই</div>
        ) : (
          filtered.map((d, i) => (
            <div key={d._id}>
              <div
                className="grid items-center px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--color-bg-hover)]"
                style={{
                  gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr auto',
                  borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                }}
                onClick={() => setExpanded(expanded === d._id ? null : d._id)}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{d.donorName}</p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{d.donor.email}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs truncate font-medium" style={{ color: 'var(--color-text)' }}>{d.program.title}</p>
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    {CATEGORY_LABELS[d.program.category] ?? d.program.category}
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--color-brand)' }}>{fmt(d.amount)}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {PAYMENT_LABELS[d.method] ?? d.method}
                </span>
                <Badge status={d.status} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(d.createdAt)}</span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {d.status === 'verifying' && (
                    <>
                      <button
                        onClick={() => { setModal({ id: d._id, action: 'completed' }); setNote(''); }}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                        title="নিশ্চিত করুন">
                        <BadgeCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setModal({ id: d._id, action: 'rejected' }); setNote(''); }}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}
                        title="প্রত্যাখ্যান">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {expanded === d._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expanded === d._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2"
                      style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
                      <DetailRow label="Transaction ID" value={d.transactionId} />
                      <DetailRow label="ফোন"            value={d.donor.phone} />
                      <DetailRow label="Program Status" value={d.program.category} />
                      {d.adminNote && <DetailRow label="Admin নোট" value={d.adminNote} />}
                      {d.screenshot?.url && (
                        <div className="col-span-2 md:col-span-3 mt-2">
                          <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>স্ক্রিনশট</p>
                          <a href={d.screenshot.url} target="_blank" rel="noreferrer">
                            <img src={d.screenshot.url} alt="screenshot"
                              className="h-32 rounded-xl object-cover"
                              style={{ border: '1.5px solid var(--color-border)' }} />
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Verify modal */}
      <ConfirmModal
        open={!!modal}
        title={modal?.action === 'completed' ? 'দান নিশ্চিত করুন' : 'দান প্রত্যাখ্যান করুন'}
        onConfirm={act}
        onCancel={() => setModal(null)}
        loading={acting}
        confirmLabel={modal?.action === 'completed' ? 'নিশ্চিত করুন' : 'প্রত্যাখ্যান করুন'}
        confirmColor={modal?.action === 'completed' ? '#16a34a' : '#dc2626'}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {modal?.action === 'completed'
            ? 'নিশ্চিত হলে দাতার ব্যালেন্স আপডেট হবে এবং প্রোগ্রামের সংগৃহীত পরিমাণ বাড়বে।'
            : 'প্রত্যাখ্যাত হলে দাতাকে নোটিফিকেশন যাবে।'}
        </p>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Admin নোট {modal?.action === 'rejected' && '(প্রয়োজনীয়)'}
          </label>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="কারণ / মন্তব্য…"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 10, resize: 'none', border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        </div>
      </ConfirmModal>
    </div>
  );
}

// ─── ROOT PANEL ─────────────────────────────────────────────────────────────────
export default function OrgAdminPanel() {
  const [tab, setTab] = useState<Tab>('members');

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'members',   label: 'সদস্যপদ আবেদন', icon: <Users className="w-4 h-4" /> },
    { id: 'programs',  label: 'ডোনেশন প্রোগ্রাম', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'donations', label: 'দান যাচাই',       icon: <HandCoins className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Organisation Admin
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            সদস্যপদ, প্রোগ্রাম ও দান পরিচালনা
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit"
        style={{ background: 'var(--color-bg-secondary)', border: '1.5px solid var(--color-border)' }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t.id ? 'var(--color-bg-card, var(--color-bg))' : 'transparent',
              color: tab === t.id ? 'var(--color-brand)' : 'var(--color-text-secondary)',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {tab === 'members'   && <MembersTable />}
          {tab === 'programs'  && <ProgramsTable />}
          {tab === 'donations' && <DonationsTable />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
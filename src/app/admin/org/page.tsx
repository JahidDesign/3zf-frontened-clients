'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle, XCircle, Clock, Eye, Heart,
  ThumbsUp, DollarSign, Film, ChevronDown, ChevronUp,
  AlertTriangle, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { OrgMembership, DonationProgram, OrgDonation } from '@/types/organisation';
import { STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/org-constants';

// ─── Tab types ────────────────────────────────────────────────────────────────
type AdminTab = 'members' | 'programs' | 'donations';

// ─── Confirm dialog ───────────────────────────────────────────────────────────
interface ConfirmAction {
  title:    string;
  message:  string;
  onConfirm: () => void;
}

// ═══════════════════════════════════════════════════════════
//  Main Admin Page
// ═══════════════════════════════════════════════════════════
export default function OrgAdminPage() {
  const [tab, setTab] = useState<AdminTab>('programs');
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  // counts
  const [pendingMemberCount,  setPendingMemberCount]  = useState(0);
  const [pendingProgramCount, setPendingProgramCount] = useState(0);
  const [pendingDonationCount, setPendingDonationCount] = useState(0);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const [m, p, d] = await Promise.all([
        api.get('/org/members/pending'),
        api.get('/org/programs', { params: { status: 'pending_review' } }),
        api.get('/org/donations', { params: { status: 'verifying' } }),
      ]);
      setPendingMemberCount(m.data.members?.length ?? 0);
      setPendingProgramCount(p.data.data?.length ?? 0);
      setPendingDonationCount(d.data.donations?.length ?? 0);
    } catch { /* silent */ }
  };

  const tabs: { key: AdminTab; label: string; icon: any; count: number }[] = [
    { key: 'programs',  label: 'প্রোগ্রাম',   icon: Heart,   count: pendingProgramCount },
    { key: 'members',   label: 'সদস্য',        icon: Users,   count: pendingMemberCount },
    { key: 'donations', label: 'ডোনেশন',       icon: DollarSign, count: pendingDonationCount },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Harmony Admin Panel
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            ডোনেশন সিস্টেম পরিচালনা
          </p>
        </div>
        <button onClick={fetchCounts}
          className="p-2 rounded-xl hover:bg-[var(--color-bg-hover)] transition-all">
          <RefreshCw className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all
              ${tab === t.key
                ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count > 0 && (
              <span className="min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'programs'  && <ProgramsAdmin setConfirm={setConfirm} onRefresh={fetchCounts} />}
      {tab === 'members'   && <MembersAdmin  setConfirm={setConfirm} onRefresh={fetchCounts} />}
      {tab === 'donations' && <DonationsAdmin setConfirm={setConfirm} onRefresh={fetchCounts} />}

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{confirm.title}</h3>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>{confirm.message}</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirm(null)}
                  className="btn-ghost flex-1 py-2">বাতিল</button>
                <button
                  onClick={() => { confirm.onConfirm(); setConfirm(null); }}
                  className="btn-primary flex-1 py-2">নিশ্চিত করুন</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Programs Admin
// ═══════════════════════════════════════════════════════════
function ProgramsAdmin({ setConfirm, onRefresh }: {
  setConfirm: (c: ConfirmAction) => void;
  onRefresh: () => void;
}) {
  const [programs,     setPrograms]     = useState<DonationProgram[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [adminNote,    setAdminNote]    = useState('');
  const [docUrl,       setDocUrl]       = useState('');
  const [manualAmt,    setManualAmt]    = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/org/programs', { params });
      setPrograms(data.data || []);
    } catch { toast.error('লোড করতে সমস্যা'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    const tid = toast.loading('প্রক্রিয়া হচ্ছে...');
    try {
      await api.patch(`/org/programs/${id}/review`, { action, adminNote });
      toast.success(action === 'approve' ? 'ভোটিংয়ে পাঠানো হয়েছে!' : 'প্রত্যাখ্যাত হয়েছে', { id: tid });
      setAdminNote('');
      fetch(); onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে', { id: tid });
    }
  };

  const handleActivate = async (id: string) => {
    const tid = toast.loading('সক্রিয় করা হচ্ছে...');
    try {
      await api.patch(`/org/programs/${id}/activate`, {
        requiredAmount: Number(manualAmt),
        adminNote,
      });
      toast.success('প্রোগ্রাম সক্রিয় হয়েছে!', { id: tid });
      setManualAmt('');
      fetch(); onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে', { id: tid });
    }
  };

  const handleDocumentary = async (id: string) => {
    if (!docUrl.trim()) { toast.error('URL দিন'); return; }
    const tid = toast.loading('আপলোড হচ্ছে...');
    try {
      await api.patch(`/org/programs/${id}/documentary`, { documentaryUrl: docUrl });
      toast.success('ডকুমেন্টারি আপলোড হয়েছে!', { id: tid });
      setDocUrl('');
      fetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে', { id: tid });
    }
  };

  const STATUS_FILTERS = ['all', 'pending_review', 'pending_vote', 'active', 'completed', 'cancelled'];

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all
              ${statusFilter === s
                ? 'gradient-brand text-white border-transparent'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
          >
            {s === 'all' ? 'সব' : STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse h-20" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <div className="card text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          কোনো প্রোগ্রাম নেই
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <div key={p._id} className="card">
              {/* Header row */}
              <div className="flex items-start gap-3">
                {p.media?.[0] && (
                  <img src={p.media[0].url} alt={p.title}
                    className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {CATEGORY_ICONS[p.category]} {CATEGORY_LABELS[p.category]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{p.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    পোস্টদাতা: {(p.author as any)?.name} · ৳{p.requestedAmount.toLocaleString()} চেয়েছেন
                  </p>
                  {p.status === 'active' && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-brand)' }}>
                      সংগ্রহ: ৳{p.raisedAmount.toLocaleString()} / ৳{p.requiredAmount.toLocaleString()}
                    </p>
                  )}
                  {p.status === 'pending_vote' && (
                    <p className="text-xs mt-0.5" style={{ color: '#7F77DD' }}>
                      ভোট: হ্যাঁ {p.votes.yes} · না {p.votes.no}
                      {p.votes.yes > 0 && ` · গড় প্রস্তাব ৳${Math.round(p.votes.totalProposedAmount / p.votes.yes).toLocaleString()}`}
                    </p>
                  )}
                </div>
                <button onClick={() => setExpanded(expanded === p._id ? null : p._id)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]">
                  {expanded === p._id
                    ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  }
                </button>
              </div>

              {/* Expanded actions */}
              <AnimatePresence>
                {expanded === p._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t space-y-3"
                      style={{ borderColor: 'var(--color-border)' }}>

                      {/* Description */}
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {p.description}
                      </p>

                      {/* Admin note input */}
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                          Admin নোট
                        </label>
                        <input type="text" placeholder="নোট লিখুন (ঐচ্ছিক)"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          className="text-sm"
                        />
                      </div>

                      {/* Action buttons by status */}
                      {p.status === 'pending_review' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirm({
                              title: 'ভোটিংয়ে পাঠাবেন?',
                              message: `"${p.title}" পোস্টটি অনুমোদন করে সদস্যদের ভোটিংয়ে পাঠানো হবে।`,
                              onConfirm: () => handleReview(p._id, 'approve'),
                            })}
                            className="btn-primary flex-1 py-2 flex items-center justify-center gap-1.5 text-sm"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" /> অনুমোদন ও ভোটিং শুরু
                          </button>
                          <button
                            onClick={() => setConfirm({
                              title: 'প্রত্যাখ্যান করবেন?',
                              message: `"${p.title}" পোস্টটি প্রত্যাখ্যাত হবে।`,
                              onConfirm: () => handleReview(p._id, 'reject'),
                            })}
                            className="flex-1 py-2 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5"
                            style={{ borderColor: '#fca5a5', color: '#b91c1c' }}
                          >
                            <XCircle className="w-3.5 h-3.5" /> প্রত্যাখ্যান
                          </button>
                        </div>
                      )}

                      {p.status === 'pending_vote' && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                              ম্যানুয়াল লক্ষ্যমাত্রা (৳) — ভোটের গড় ব্যবহার না করলে
                            </label>
                            <input type="number" placeholder="যেমন: 30000"
                              value={manualAmt} onChange={(e) => setManualAmt(e.target.value)} />
                          </div>
                          <button
                            onClick={() => setConfirm({
                              title: 'ম্যানুয়ালি সক্রিয় করবেন?',
                              message: `লক্ষ্যমাত্রা: ৳${manualAmt || 'ভোটের গড়'}`,
                              onConfirm: () => handleActivate(p._id),
                            })}
                            className="btn-primary w-full py-2 flex items-center justify-center gap-1.5 text-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> সক্রিয় করুন
                          </button>
                        </div>
                      )}

                      {p.status === 'completed' && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                              ডকুমেন্টারি ভিডিও URL
                            </label>
                            <input type="url" placeholder="https://youtube.com/..."
                              value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
                          </div>
                          <button
                            onClick={() => handleDocumentary(p._id)}
                            className="btn-primary w-full py-2 flex items-center justify-center gap-1.5 text-sm"
                          >
                            <Film className="w-3.5 h-3.5" /> ডকুমেন্টারি আপলোড করুন
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Members Admin
// ═══════════════════════════════════════════════════════════
function MembersAdmin({ setConfirm, onRefresh }: {
  setConfirm: (c: ConfirmAction) => void;
  onRefresh: () => void;
}) {
  const [members,   setMembers]   = useState<OrgMembership[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/org/members/pending');
      setMembers(data.members || []);
    } catch { toast.error('লোড করতে সমস্যা'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleApprove = async (id: string, status: 'approved' | 'rejected') => {
    const tid = toast.loading('প্রক্রিয়া হচ্ছে...');
    try {
      await api.patch(`/org/members/${id}/approve`, { status, adminNote });
      toast.success(status === 'approved' ? 'সদস্য অনুমোদিত!' : 'প্রত্যাখ্যাত হয়েছে', { id: tid });
      setAdminNote('');
      fetch(); onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে', { id: tid });
    }
  };

  return (
    <div>
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="card text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          কোনো পেন্ডিং আবেদন নেই
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m._id} className="card">
              <div className="flex items-center gap-3">
                {m.profilePhoto?.url ? (
                  <img src={m.profilePhoto.url} className="w-12 h-12 rounded-full object-cover flex-shrink-0" alt={m.name} />
                ) : (
                  <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-white font-bold flex-shrink-0">
                    {m.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{m.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {m.phone} · {m.district}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {m.paymentMethod.toUpperCase()} · TrxID: {m.transactionId} · ৳{m.paymentAmount}
                  </p>
                </div>
                <button onClick={() => setExpanded(expanded === m._id ? null : m._id)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]">
                  {expanded === m._id
                    ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  }
                </button>
              </div>

              <AnimatePresence>
                {expanded === m._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t space-y-3"
                      style={{ borderColor: 'var(--color-border)' }}>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          ['ঠিকানা', m.address],
                          ['NID', m.nidNumber],
                          ['পেশা', m.occupation || '—'],
                          ['ইমেইল', m.email],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <span style={{ color: 'var(--color-text-muted)' }}>{label}: </span>
                            <span style={{ color: 'var(--color-text)' }}>{val}</span>
                          </div>
                        ))}
                      </div>

                      {/* NID image */}
                      {m.nidDocument?.url && (
                        <a href={m.nidDocument.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl w-fit"
                          style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                          <Eye className="w-3.5 h-3.5" /> NID দেখুন
                        </a>
                      )}

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                          Admin নোট
                        </label>
                        <input type="text" placeholder="কারণ লিখুন (প্রত্যাখ্যানের ক্ষেত্রে)"
                          value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirm({
                            title: 'সদস্য অনুমোদন করবেন?',
                            message: `${m.name}-কে Harmony-র সদস্য হিসেবে অনুমোদন করা হবে।`,
                            onConfirm: () => handleApprove(m._id, 'approved'),
                          })}
                          className="btn-primary flex-1 py-2 flex items-center justify-center gap-1.5 text-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> অনুমোদন
                        </button>
                        <button
                          onClick={() => setConfirm({
                            title: 'প্রত্যাখ্যান করবেন?',
                            message: `${m.name}-এর আবেদন প্রত্যাখ্যাত হবে।`,
                            onConfirm: () => handleApprove(m._id, 'rejected'),
                          })}
                          className="flex-1 py-2 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5"
                          style={{ borderColor: '#fca5a5', color: '#b91c1c' }}
                        >
                          <XCircle className="w-3.5 h-3.5" /> প্রত্যাখ্যান
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Donations Admin
// ═══════════════════════════════════════════════════════════
function DonationsAdmin({ setConfirm, onRefresh }: {
  setConfirm: (c: ConfirmAction) => void;
  onRefresh: () => void;
}) {
  const [donations,    setDonations]    = useState<OrgDonation[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('verifying');
  const [adminNote,    setAdminNote]    = useState('');
  const [expanded,     setExpanded]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/org/donations', { params });
      setDonations(data.donations || []);
    } catch { toast.error('লোড করতে সমস্যা'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleVerify = async (id: string, status: 'completed' | 'rejected') => {
    const tid = toast.loading('যাচাই হচ্ছে...');
    try {
      await api.patch(`/org/donations/${id}/verify`, { status, adminNote });
      toast.success(status === 'completed' ? 'ডোনেশন নিশ্চিত!' : 'প্রত্যাখ্যাত হয়েছে', { id: tid });
      setAdminNote('');
      fetch(); onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে', { id: tid });
    }
  };

  const STATUS_CHIP: Record<string, string> = {
    verifying:  'bg-amber-50 text-amber-800 border-amber-200',
    completed:  'bg-green-50 text-green-800 border-green-200',
    rejected:   'bg-red-50 text-red-800 border-red-200',
  };
  const STATUS_BN: Record<string, string> = {
    verifying: 'যাচাই চলছে', completed: 'নিশ্চিত', rejected: 'প্রত্যাখ্যাত',
  };

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['verifying', 'completed', 'rejected', 'all'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${statusFilter === s
                ? 'gradient-brand text-white border-transparent'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
          >
            {STATUS_BN[s] ?? 'সব'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
        </div>
      ) : donations.length === 0 ? (
        <div className="card text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          কোনো ডোনেশন নেই
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map((d) => (
            <div key={d._id} className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {d.donorName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{d.donorName}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_CHIP[d.status]}`}>
                      {STATUS_BN[d.status]}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    ৳{d.amount.toLocaleString()} · {d.method.toUpperCase()} · {d.transactionId}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    প্রোগ্রাম: {(d.program as any)?.title ?? d.program}
                  </p>
                </div>
                {d.status === 'verifying' && (
                  <button onClick={() => setExpanded(expanded === d._id ? null : d._id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]">
                    {expanded === d._id
                      ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                      : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    }
                  </button>
                )}
              </div>

              <AnimatePresence>
                {expanded === d._id && d.status === 'verifying' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t space-y-3"
                      style={{ borderColor: 'var(--color-border)' }}>
                      {/* Screenshot */}
                      {d.screenshot?.url && (
                        <a href={d.screenshot.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl w-fit"
                          style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                          <Eye className="w-3.5 h-3.5" /> স্ক্রিনশট দেখুন
                        </a>
                      )}
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                          Admin নোট
                        </label>
                        <input type="text" placeholder="নোট (ঐচ্ছিক)"
                          value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirm({
                            title: 'ডোনেশন নিশ্চিত করবেন?',
                            message: `৳${d.amount.toLocaleString()} — ${d.donorName}`,
                            onConfirm: () => handleVerify(d._id, 'completed'),
                          })}
                          className="btn-primary flex-1 py-2 flex items-center justify-center gap-1.5 text-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> নিশ্চিত করুন
                        </button>
                        <button
                          onClick={() => setConfirm({
                            title: 'প্রত্যাখ্যান করবেন?',
                            message: `${d.donorName}-এর ৳${d.amount} ডোনেশন প্রত্যাখ্যাত হবে।`,
                            onConfirm: () => handleVerify(d._id, 'rejected'),
                          })}
                          className="flex-1 py-2 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5"
                          style={{ borderColor: '#fca5a5', color: '#b91c1c' }}
                        >
                          <XCircle className="w-3.5 h-3.5" /> প্রত্যাখ্যান
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
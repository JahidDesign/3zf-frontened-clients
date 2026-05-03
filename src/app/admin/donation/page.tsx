'use client';

/**
 * Admin — Donation Management Panel
 * ====================================
 * Tabs:
 *   1. pending_review  → Admin reviews & approves/rejects
 *   2. pending_vote    → Admin finalizes voting
 *   3. active          → Admin verifies payments
 *   4. completed       → View completed with docs
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Eye, CheckCircle, XCircle, Clock, Users, Banknote,
  ThumbsUp, ThumbsDown, FileText, Upload, X, Phone,
  MapPin, ChevronDown, Award, TrendingUp, RefreshCw,
  AlertCircle, Check,
} from 'lucide-react';
import api         from '@/lib/api';
import { IDonation, DonationStatus, STATUS_LABELS, CATEGORY_LABELS } from '@/lib/donation.types';

async function uploadCloudinary(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset    = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
  if (!cloudName || !preset) throw new Error('Cloudinary config missing');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', preset);
  fd.append('folder', 'harmony_docs');
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok || data?.error) throw new Error(data?.error?.message || 'Upload failed');
  return { url: data.secure_url as string, publicId: data.public_id as string };
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<DonationStatus, string> = {
  pending_review: 'bg-amber-100  text-amber-800  border-amber-200',
  pending_vote:   'bg-purple-100 text-purple-800 border-purple-200',
  active:         'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed:      'bg-blue-100   text-blue-800   border-blue-200',
  cancelled:      'bg-red-100    text-red-800    border-red-200',
};

const ADMIN_TABS = [
  { key: 'pending_review', label: 'রিভিউ করুন',    icon: Eye,         color: 'amber'   },
  { key: 'pending_vote',   label: 'ভোট ফাইনাল',    icon: ThumbsUp,    color: 'purple'  },
  { key: 'active',         label: 'পেমেন্ট যাচাই', icon: Banknote,    color: 'emerald' },
  { key: 'completed',      label: 'সম্পন্ন',        icon: Award,       color: 'blue'    },
] as const;

type AdminTab = typeof ADMIN_TABS[number]['key'];

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({ donation, onClose, onDone }: {
  donation: IDonation;
  onClose:  () => void;
  onDone:   () => void;
}) {
  const [action,      setAction]      = useState<'approve' | 'reject' | null>(null);
  const [adminNote,   setAdminNote]   = useState('');
  const [votingDays,  setVotingDays]  = useState('3');
  const [loading,     setLoading]     = useState(false);

  const handleSubmit = async () => {
    if (!action) { toast.error('approve বা reject বেছে নিন'); return; }
    if (action === 'reject' && !adminNote.trim()) { toast.error('প্রত্যাখ্যানের কারণ লিখুন'); return; }
    setLoading(true);
    try {
      await api.patch(`/donations/${donation._id}/review`, { action, adminNote, votingDays: Number(votingDays) });
      toast.success(action === 'approve' ? 'অনুমোদিত! ভোটিং শুরু হয়েছে।' : 'প্রত্যাখ্যাত।');
      onDone();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="card w-full max-w-lg max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-heading font-bold text-xl" style={{ color: 'var(--color-text)' }}>আবেদন রিভিউ</h3>
            <p className="text-sm mt-0.5 line-clamp-1" style={{ color: 'var(--color-text-secondary)' }}>{donation.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Donation details */}
        <div className="p-4 rounded-xl border mb-5 space-y-3" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>চাওয়া পরিমাণ</p>
              {/* FIX: ?? 0 guard */}
              <p className="font-bold text-xl" style={{ color: 'var(--color-brand)' }}>৳{(donation.requestedAmount ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>বিভাগ</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{CATEGORY_LABELS[donation.category]}</p>
            </div>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>বিবরণ</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{donation.description}</p>
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p className="flex items-center gap-2"><Users className="w-3.5 h-3.5 shrink-0" /> {donation.applicantName}</p>
            <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" /> {donation.applicantPhone}</p>
            <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" /> {donation.applicantAddress}</p>
          </div>
          {donation.media?.find(m => m.type === 'image') && (
            <img src={donation.media.find(m => m.type === 'image')!.url} alt="media"
              className="w-full h-40 object-cover rounded-xl" />
          )}
        </div>

        {/* Action */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(['approve', 'reject'] as const).map(a => (
            <button key={a} onClick={() => setAction(a)}
              className={`py-3 rounded-xl border-2 font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                action === a
                  ? a === 'approve'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-red-400 bg-red-50 text-red-700'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
              }`}>
              {a === 'approve' ? <><CheckCircle className="w-4 h-4" /> অনুমোদন করুন</> : <><XCircle className="w-4 h-4" /> প্রত্যাখ্যান করুন</>}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {action === 'approve' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>ভোটিং সময়সীমা (দিন)</label>
              <select value={votingDays} onChange={e => setVotingDays(e.target.value)}>
                {['1','2','3','5','7'].map(d => <option key={d} value={d}>{d} দিন</option>)}
              </select>
              <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                অনুমোদন করলে সকল সদস্যকে ভোট দেওয়ার নোটিফিকেশন পাঠানো হবে।
              </p>
            </motion.div>
          )}
          {action === 'reject' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>প্রত্যাখ্যানের কারণ *</label>
              <textarea rows={3} placeholder="কেন প্রত্যাখ্যান করছেন?" value={adminNote}
                onChange={e => setAdminNote(e.target.value)} style={{ resize: 'none' }} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5" disabled={loading}>বাতিল</button>
          <button onClick={handleSubmit} disabled={loading || !action}
            className={`flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              action === 'reject' ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary'
            }`}>
            {loading ? '⏳' : action === 'approve' ? <><CheckCircle className="w-4 h-4" /> অনুমোদন করুন</> : <><XCircle className="w-4 h-4" /> প্রত্যাখ্যান করুন</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Finalize Voting Modal ────────────────────────────────────────────────────
function FinalizeModal({ donation, onClose, onDone }: {
  donation: IDonation; onClose: () => void; onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const yesVotes    = donation.votes?.filter(v => v.decision === 'yes') ?? [];
  const noVotes     = donation.votes?.filter(v => v.decision === 'no') ?? [];
  const totalPledge = yesVotes.reduce((s, v) => s + (v.amount ?? 0), 0);
  // FIX: ?? 0 guard on requestedAmount
  const approvedAmount = Math.min(totalPledge, donation.requestedAmount ?? 0);

  const handleFinalize = async () => {
    setLoading(true);
    try {
      await api.patch(`/donations/${donation._id}/finalize-voting`);
      toast.success('ভোটিং সম্পন্ন! ডোনেশন সক্রিয় হয়েছে।');
      onDone(); onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }} className="card w-full max-w-md">
        <div className="flex items-start justify-between mb-5">
          <h3 className="font-heading font-bold text-xl" style={{ color: 'var(--color-text)' }}>ভোটিং ফাইনাল করুন</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-sm font-medium mb-3 line-clamp-2" style={{ color: 'var(--color-text)' }}>{donation.title}</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'হ্যাঁ ভোট',        value: yesVotes.length,                          color: 'emerald' },
            { label: 'না ভোট',            value: noVotes.length,                           color: 'red'     },
            { label: 'মোট প্রতিশ্রুতি',  value: `৳${totalPledge.toLocaleString()}`,       color: 'purple'  },
            { label: 'অনুমোদিত হবে',     value: `৳${approvedAmount.toLocaleString()}`,    color: 'brand'   },
          ].map(s => (
            <div key={s.label} className={`p-3 rounded-xl border text-center
              ${s.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' :
                s.color === 'red'    ? 'bg-red-50    border-red-200'    :
                s.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                'border-[var(--color-border)]'}`}>
              <p className={`font-bold text-xl ${
                s.color === 'emerald' ? 'text-emerald-600' :
                s.color === 'red'    ? 'text-red-500' :
                s.color === 'purple' ? 'text-purple-600' : ''}`}
                style={s.color === 'brand' ? { color: 'var(--color-brand)' } : {}}>
                {s.value}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl mb-5 bg-amber-50 border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            ফাইনাল করলে সকল সদস্যকে <strong>৳{approvedAmount.toLocaleString()}</strong> দানের জন্য নোটিফিকেশন পাঠানো হবে।
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5" disabled={loading}>বাতিল</button>
          <button onClick={handleFinalize} disabled={loading}
            className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
            {loading ? '⏳' : <><CheckCircle className="w-4 h-4" /> ভোট ফাইনাল করুন</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Payment Verification Panel ───────────────────────────────────────────────
function PaymentVerifyPanel({ donation, onDone }: { donation: IDonation; onDone: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  const pendingPayments  = donation.payments?.filter(p => p.status === 'pending')  ?? [];
  const verifiedPayments = donation.payments?.filter(p => p.status === 'verified') ?? [];

  const verify = async (paymentId: string, status: 'verified' | 'rejected', note = '') => {
    setLoading(paymentId);
    try {
      await api.patch(`/donations/${donation._id}/payments/${paymentId}/verify`, { status, note });
      toast.success(status === 'verified' ? '✅ পেমেন্ট নিশ্চিত!' : '❌ প্রত্যাখ্যাত');
      onDone();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      {donation.approvedAmount && (
        <div className="p-4 rounded-xl border" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="flex justify-between text-sm mb-2">
            {/* FIX: ?? 0 on both sides */}
            <span style={{ color: 'var(--color-text-secondary)' }}>
              ৳{(donation.raisedAmount ?? 0).toLocaleString()} / ৳{(donation.approvedAmount ?? 0).toLocaleString()}
            </span>
            <span className="font-semibold" style={{ color: 'var(--color-brand)' }}>
              {Math.round(((donation.raisedAmount ?? 0) / (donation.approvedAmount ?? 1)) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
            <div className="h-full rounded-full gradient-brand transition-all"
              style={{ width: `${Math.min(((donation.raisedAmount ?? 0) / (donation.approvedAmount ?? 1)) * 100, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span style={{ color: 'var(--color-text-muted)' }}>{verifiedPayments.length} জন দান করেছেন</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{pendingPayments.length} টি যাচাই বাকি</span>
          </div>
        </div>
      )}

      {pendingPayments.length === 0 ? (
        <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          কোনো পেমেন্ট যাচাইয়ের অপেক্ষায় নেই
        </div>
      ) : pendingPayments.map(p => (
        <div key={p._id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                {(p.donor as any)?.name?.[0] ?? 'U'}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{(p.donor as any)?.name ?? 'অজানা'}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.method} • {p.transactionId}</p>
              </div>
            </div>
            {/* FIX: ?? 0 on amount */}
            <p className="font-bold text-lg" style={{ color: 'var(--color-brand)' }}>৳{(p.amount ?? 0).toLocaleString()}</p>
          </div>

          {(p as any).screenshot?.url && (
            <a href={(p as any).screenshot.url} target="_blank" rel="noopener noreferrer"
              className="block mb-3">
              <img src={(p as any).screenshot.url} alt="ss" className="w-full h-32 object-cover rounded-xl" />
            </a>
          )}

          <div className="flex gap-2">
            <button onClick={() => verify(p._id, 'rejected')}
              disabled={loading === p._id}
              className="flex-1 py-2 rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold transition-all flex items-center justify-center gap-1.5">
              <XCircle className="w-4 h-4" /> প্রত্যাখ্যান
            </button>
            <button onClick={() => verify(p._id, 'verified')}
              disabled={loading === p._id}
              className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5">
              {loading === p._id ? '⏳' : <><CheckCircle className="w-4 h-4" /> নিশ্চিত করুন</>}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Complete Donation Modal ──────────────────────────────────────────────────
function CompleteModal({ donation, onClose, onDone }: {
  donation: IDonation; onClose: () => void; onDone: () => void;
}) {
  const [note,    setNote]    = useState('');
  const [files,   setFiles]   = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    setFiles(prev => [...prev, ...picked].slice(0, 5));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const docUrls: { url: string; publicId: string }[] = [];
      for (const f of files) {
        const up = await uploadCloudinary(f);
        docUrls.push(up);
      }
      await api.patch(`/donations/${donation._id}/complete`, { completionNote: note, docUrls });
      toast.success('ডোনেশন সম্পন্ন হিসেবে চিহ্নিত!');
      onDone(); onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }} className="card w-full max-w-md">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-heading font-bold text-xl" style={{ color: 'var(--color-text)' }}>ডোনেশন সম্পন্ন করুন</h3>
            <p className="text-sm mt-0.5 line-clamp-1" style={{ color: 'var(--color-text-secondary)' }}>{donation.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>সমাপ্তি নোট</label>
            <textarea rows={3} placeholder="টাকা কীভাবে পৌঁছে দেওয়া হয়েছে তার বিবরণ..."
              value={note} onChange={e => setNote(e.target.value)} style={{ resize: 'none' }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
              ডকুমেন্ট আপলোড (সর্বোচ্চ ৫টি)
            </label>
            <label className="block cursor-pointer">
              <input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFiles} />
              <div className="border-2 border-dashed rounded-xl p-5 text-center hover:border-[var(--color-brand)] transition-colors"
                style={{ borderColor: 'var(--color-border)' }}>
                <Upload className="w-6 h-6 mx-auto mb-1.5" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  রসিদ, ছবি বা ডকুমেন্ট আপলোড করুন
                </p>
              </div>
            </label>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs"
                    style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    <FileText className="w-3 h-3" />
                    <span className="max-w-[80px] truncate">{f.name}</span>
                    <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                      className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5" disabled={loading}>বাতিল</button>
          <button onClick={handleComplete} disabled={loading}
            className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
            {loading ? '⏳ আপলোড হচ্ছে...' : <><Award className="w-4 h-4" /> সম্পন্ন চিহ্নিত করুন</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminDonationsPage() {
  const [tab,        setTab]        = useState<AdminTab>('pending_review');
  const [donations,  setDonations]  = useState<IDonation[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [reviewing,  setReviewing]  = useState<IDonation | null>(null);
  const [finalizing, setFinalizing] = useState<IDonation | null>(null);
  const [completing, setCompleting] = useState<IDonation | null>(null);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/donations', { params: { status: tab } });
      setDonations(data.donations || []);
    } catch { toast.error('লোড ব্যর্থ'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  // Fetch detailed single donation for expanded panel
  const fetchOne = async (id: string) => {
    try {
      const { data } = await api.get(`/donations/${id}`);
      setDonations(prev => prev.map(d => d._id === id ? data.donation : d));
    } catch {}
  };

  const counts = {
    pending_review: donations.filter(d => d.status === 'pending_review').length,
    pending_vote:   donations.filter(d => d.status === 'pending_vote').length,
    active:         donations.filter(d => d.status === 'active').length,
    completed:      donations.filter(d => d.status === 'completed').length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div className="gradient-brand text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-heading font-bold text-2xl mb-1">ডোনেশন ম্যানেজমেন্ট</h1>
          <p className="text-purple-200 text-sm">Harmony Organization — Admin Panel</p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {ADMIN_TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as AdminTab)}
                className={`p-3 rounded-xl text-left transition-all ${tab === t.key ? 'bg-white/25' : 'bg-white/10 hover:bg-white/15'}`}>
                <p className="font-bold text-2xl">{counts[t.key as AdminTab] ?? 0}</p>
                <p className="text-xs text-purple-200">{t.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b shadow-sm sticky top-0 z-20" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-4 overflow-x-auto">
          <div className="flex items-center gap-1 py-2">
            {ADMIN_TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  tab === t.key ? 'gradient-brand text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                }`}>
                <t.icon className="w-4 h-4" /> {t.label}
                {counts[t.key as AdminTab] > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/30' : 'bg-[var(--color-bg-secondary)]'}`}>
                    {counts[t.key as AdminTab]}
                  </span>
                )}
              </button>
            ))}
            <button onClick={fetchDonations} className="ml-auto p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors">
              <RefreshCw className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse h-24" />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>এই বিভাগে কিছু নেই</p>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map(d => {
              const isOpen = expanded === d._id;
              const yesCount        = d.votes?.filter(v => v.decision === 'yes').length ?? 0;
              const noCount         = d.votes?.filter(v => v.decision === 'no').length  ?? 0;
              const pendingPayments = d.payments?.filter(p => p.status === 'pending').length ?? 0;

              return (
                <motion.div key={d._id} layout className="card overflow-hidden p-0">
                  {/* Summary row */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors"
                    onClick={() => {
                      setExpanded(isOpen ? null : d._id);
                      if (!isOpen) fetchOne(d._id);
                    }}
                  >
                    {d.media?.find(m => m.type === 'image') && (
                      <img src={d.media.find(m => m.type === 'image')!.url} alt=""
                        className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[d.status]}`}>
                          {STATUS_LABELS[d.status]}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{CATEGORY_LABELS[d.category]}</span>
                        {pendingPayments > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            {pendingPayments} পেমেন্ট বাকি
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{d.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span>{d.applicantName}</span>
                        {/* FIX: ?? 0 */}
                        <span className="font-semibold" style={{ color: 'var(--color-brand)' }}>৳{(d.requestedAmount ?? 0).toLocaleString()}</span>
                        {tab === 'pending_vote' && <span className="text-emerald-600">{yesCount} হ্যাঁ / {noCount} না</span>}
                        {tab === 'active' && d.approvedAmount && (
                          <span>৳{(d.raisedAmount ?? 0).toLocaleString()} / ৳{(d.approvedAmount ?? 0).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--color-text-muted)' }} />
                  </div>

                  {/* Expanded panel */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}
                        exit={{ height: 0 }} className="overflow-hidden border-t"
                        style={{ borderColor: 'var(--color-border)' }}>
                        <div className="p-4 space-y-4">
                          {/* Description */}
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{d.description}</p>

                          {/* Applicant */}
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>আবেদনকারী</p>
                              <p className="font-medium" style={{ color: 'var(--color-text)' }}>{d.applicantName}</p>
                            </div>
                            <div>
                              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>ফোন</p>
                              <p className="font-medium" style={{ color: 'var(--color-text)' }}>{d.applicantPhone}</p>
                            </div>
                            <div>
                              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>পোস্টকারী</p>
                              <p className="font-medium" style={{ color: 'var(--color-text)' }}>{(d.author as any)?.name}</p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          {tab === 'pending_review' && (
                            <button onClick={() => setReviewing(d)}
                              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                              <Eye className="w-4 h-4" /> রিভিউ করুন
                            </button>
                          )}

                          {tab === 'pending_vote' && (
                            <div className="space-y-3">
                              {/* Voting bar */}
                              <div className="h-2.5 rounded-full overflow-hidden flex" style={{ background: 'var(--color-bg-secondary)' }}>
                                {(yesCount + noCount) > 0 && <>
                                  <div className="h-full bg-emerald-400 transition-all" style={{ width: `${(yesCount/(yesCount+noCount))*100}%` }} />
                                  <div className="h-full bg-red-400 transition-all"     style={{ width: `${(noCount /(yesCount+noCount))*100}%` }} />
                                </>}
                              </div>
                              {d.votingDeadline && (
                                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                                  <Clock className="w-3.5 h-3.5" />
                                  সময়সীমা: {new Date(d.votingDeadline).toLocaleDateString('bn-BD')}
                                </p>
                              )}
                              <button onClick={() => setFinalizing(d)}
                                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" /> ভোট ফাইনাল করুন
                              </button>
                            </div>
                          )}

                          {tab === 'active' && (
                            <div className="space-y-3">
                              <PaymentVerifyPanel donation={d} onDone={() => fetchOne(d._id)} />
                              {/* FIX: ?? 0 and ?? Infinity guards */}
                              {(d.raisedAmount ?? 0) >= (d.approvedAmount ?? Infinity) && (
                                <button onClick={() => setCompleting(d)}
                                  className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 transition-all">
                                  <Award className="w-4 h-4" /> সম্পন্ন হিসেবে চিহ্নিত করুন
                                </button>
                              )}
                            </div>
                          )}

                          {tab === 'completed' && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
                                <Award className="w-4 h-4 text-blue-600 shrink-0" />
                                <div>
                                  {/* FIX: ?? 0 */}
                                  <p className="text-sm font-semibold text-blue-700">
                                    ৳{(d.raisedAmount ?? 0).toLocaleString()} সংগ্রহ সম্পন্ন
                                  </p>
                                  {d.completedAt && (
                                    <p className="text-xs text-blue-500">
                                      {new Date(d.completedAt).toLocaleDateString('bn-BD')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {d.completionNote && (
                                <p className="text-sm p-3 rounded-xl border"
                                  style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                                  {d.completionNote}
                                </p>
                              )}
                              {d.completionDoc?.length ? (
                                <div className="flex gap-2 flex-wrap">
                                  {d.completionDoc.map((doc, i) => (
                                    <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm hover:bg-[var(--color-bg-hover)] transition-colors"
                                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                                      <FileText className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                                      ডকুমেন্ট {i+1}
                                    </a>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {reviewing  && <ReviewModal   donation={reviewing}  onClose={() => setReviewing(null)}  onDone={fetchDonations} />}
        {finalizing && <FinalizeModal donation={finalizing} onClose={() => setFinalizing(null)} onDone={fetchDonations} />}
        {completing && <CompleteModal donation={completing} onClose={() => setCompleting(null)} onDone={fetchDonations} />}
      </AnimatePresence>
    </div>
  );
}
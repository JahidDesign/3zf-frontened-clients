'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ThumbsUp, ThumbsDown, Heart, Upload,
  Clock, CheckCircle, XCircle, AlertCircle, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { DonationProgram, DonationProgramStatus } from '@/types/organisation';

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';

interface Props {
  program:        DonationProgram | null;
  paymentNumbers: Record<string, string>;
  currentUserId?: string;
  onClose:        () => void;
  onSuccess?:     () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  bkash:  '🩷 bKash',
  nagad:  '🧡 Nagad',
  rocket: '💜 Rocket',
  bank:   '🏦 ব্যাংক',
  cash:   '💵 ক্যাশ',
};

const STATUS_META: Record<DonationProgramStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending_review: { label: 'পর্যালোচনায়', color: '#d97706', icon: <Clock       className="w-4 h-4" /> },
  pending_vote:   { label: 'ভোট চলছে',     color: '#7c3aed', icon: <Users       className="w-4 h-4" /> },
  active:         { label: 'সক্রিয়',       color: '#059669', icon: <Heart       className="w-4 h-4" /> },
  completed:      { label: 'সম্পন্ন',      color: '#0284c7', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled:      { label: 'বাতিল',        color: '#dc2626', icon: <XCircle     className="w-4 h-4" /> },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DonateModal({
  program,
  paymentNumbers,
  currentUserId,
  onClose,
  onSuccess,
}: Props) {
  // ── Vote state ───────────────────────────────────────────────────────────────
  const [decision,      setDecision]      = useState<'yes' | 'no' | null>(null);
  const [pledgeAmount,  setPledgeAmount]  = useState('');
  const [votingSubmit,  setVotingSubmit]  = useState(false);

  // ── Payment state ────────────────────────────────────────────────────────────
  const [payAmount,     setPayAmount]     = useState('');
  const [method,        setMethod]        = useState<PaymentMethod>('bkash');
  const [trxId,         setTrxId]         = useState('');
  const [ssFile,        setSsFile]        = useState<File | null>(null);
  const [ssPreview,     setSsPreview]     = useState<string | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const [paySubmitting, setPaySubmitting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  if (!program) return null;

  // ── Derived ──────────────────────────────────────────────────────────────────

  const meta = STATUS_META[program.status];

  // votes is an OBJECT shape from DonationProgram — not an array
  const yesCount    = program.votes.yes;
  const noCount     = program.votes.no;
  const totalVotes  = yesCount + noCount;
  const yesPercent  = totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0;
  const noPercent   = totalVotes > 0 ? 100 - yesPercent : 0;
  const totalPledge = program.votes.totalProposedAmount;
  const avgPledge   = yesCount > 0 ? Math.round(totalPledge / yesCount) : 0;

  // myVote is already resolved by the API on the votes object
  const myVote = program.votes.myVote
    ? { decision: program.votes.myVote, amount: program.votes.myProposedAmount ?? 0 }
    : undefined;

  const target   = program.approvedAmount ?? program.requestedAmount;
  const progress = target > 0 ? Math.min((program.raisedAmount / target) * 100, 100) : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('সর্বোচ্চ 5MB'); return; }
    setSsFile(file);
    const reader = new FileReader();
    reader.onload = () => setSsPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Vote submit
  const handleVoteSubmit = async () => {
    if (!decision) { toast.error('হ্যাঁ বা না বেছে নিন'); return; }
    if (decision === 'yes' && (!pledgeAmount || Number(pledgeAmount) < 10)) {
      toast.error('কত টাকা দিতে চান লিখুন (সর্বনিম্ন ৳10)');
      return;
    }

    setVotingSubmit(true);
    const tid = toast.loading('ভোট জমা হচ্ছে...');
    try {
      await api.post(`/org/programs/${program._id}/vote`, {
        vote:           decision,
        proposedAmount: decision === 'yes' ? Number(pledgeAmount) : 0,
      });
      toast.success('ভোট সফলভাবে দেওয়া হয়েছে!', { id: tid });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'ভোট দিতে সমস্যা হয়েছে', { id: tid });
    } finally {
      setVotingSubmit(false);
    }
  };

  // Payment submit
  const handlePaySubmit = async () => {
    if (!payAmount || Number(payAmount) < 10) { toast.error('সর্বনিম্ন ৳10'); return; }
    if (!trxId.trim()) { toast.error('Transaction ID লিখুন'); return; }

    setPaySubmitting(true);
    const tid = toast.loading('পেমেন্ট জমা হচ্ছে...');
    try {
      const fd = new FormData();
      fd.append('program',       program._id);
      fd.append('amount',        String(Number(payAmount)));
      fd.append('method',        method);
      fd.append('transactionId', trxId.trim());
      if (ssFile) fd.append('screenshot', ssFile);

      await api.post('/org/donations', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('পেমেন্ট জমা হয়েছে! যাচাইয়ের পর আপডেট পাবেন।', { id: tid });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'পেমেন্ট জমা দিতে সমস্যা হয়েছে', { id: tid });
    } finally {
      setPaySubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-2xl"
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-3">
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mb-2"
                style={{
                  background: meta.color + '18',
                  color:      meta.color,
                  border:     `1px solid ${meta.color}33`,
                }}
              >
                {meta.icon} {meta.label}
              </span>
              <h3
                className="font-semibold text-base leading-snug line-clamp-2"
                style={{ color: 'var(--color-text)' }}
              >
                {program.title}
              </h3>
              {program.author && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  আবেদনকারী: {program.author.name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg flex-shrink-0 hover:bg-[var(--color-bg-hover)]"
            >
              <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          </div>

          {/* ── Media preview ───────────────────────────────────────────────── */}
          {program.media?.[0]?.type === 'image' && (
            <div className="h-36 rounded-xl overflow-hidden mb-4">
              <img
                src={program.media[0].url}
                alt={program.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* ── Amount pill ─────────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between p-3 rounded-xl mb-4 text-sm"
            style={{ background: 'var(--color-bg-secondary)' }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {program.status === 'active' || program.status === 'completed'
                ? 'অনুমোদিত লক্ষ্য'
                : 'চাহিদা'}
            </span>
            <span className="font-bold text-base" style={{ color: 'var(--color-brand)' }}>
              ৳{(program.approvedAmount ?? program.requestedAmount).toLocaleString()}
            </span>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              PHASE 1 — VOTING  (status: pending_vote)
          ══════════════════════════════════════════════════════════════════════*/}
          {program.status === 'pending_vote' && (
            <>
              {/* Vote stats */}
              <div
                className="rounded-xl p-3.5 mb-4 space-y-2.5"
                style={{ background: 'var(--color-bg-secondary)' }}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                    <Users className="w-3.5 h-3.5" /> {totalVotes} ভোট
                  </span>
                  {avgPledge > 0 && (
                    <span style={{ color: 'var(--color-brand)' }}>
                      গড় প্রতিশ্রুতি: ৳{avgPledge.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Yes bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#16a34a' }}>
                    <span>হ্যাঁ ({yesCount})</span>
                    <span>{yesPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: '#16a34a' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${yesPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* No bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#dc2626' }}>
                    <span>না ({noCount})</span>
                    <span>{noPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: '#dc2626' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${noPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Already voted */}
              {myVote ? (
                <div
                  className="flex items-center gap-2.5 p-3.5 rounded-xl text-sm"
                  style={{
                    background: myVote.decision === 'yes' ? '#f0fdf4' : '#fef2f2',
                    color:      myVote.decision === 'yes' ? '#166534'  : '#991b1b',
                    border:     `1px solid ${myVote.decision === 'yes' ? '#bbf7d0' : '#fca5a5'}`,
                  }}
                >
                  {myVote.decision === 'yes'
                    ? <ThumbsUp   className="w-4 h-4 flex-shrink-0" />
                    : <ThumbsDown className="w-4 h-4 flex-shrink-0" />}
                  <span>
                    আপনি <strong>{myVote.decision === 'yes' ? 'হ্যাঁ' : 'না'}</strong> ভোট দিয়েছেন
                    {myVote.amount > 0 && ` — প্রতিশ্রুতি: ৳${myVote.amount.toLocaleString()}`}
                  </span>
                </div>
              ) : (
                /* Vote form */
                <div className="space-y-3">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    আপনার ভোট দিন:
                  </p>

                  {/* Yes / No buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDecision('yes')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                        decision === 'yes'
                          ? 'bg-green-50 border-green-400 text-green-800 shadow-sm'
                          : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-green-50 hover:border-green-200'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" /> হ্যাঁ
                    </button>
                    <button
                      onClick={() => setDecision('no')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                        decision === 'no'
                          ? 'bg-red-50 border-red-400 text-red-800 shadow-sm'
                          : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-red-50 hover:border-red-200'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" /> না
                    </button>
                  </div>

                  {/* Pledge amount — only when yes */}
                  <AnimatePresence>
                    {decision === 'yes' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label
                          className="block text-xs font-medium mb-1"
                          style={{ color: 'var(--color-text)' }}
                        >
                          আমি দিতে চাই (৳) *
                        </label>
                        <div className="relative">
                          <span
                            className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm"
                            style={{ color: 'var(--color-brand)' }}
                          >
                            ৳
                          </span>
                          <input
                            type="number"
                            min="10"
                            placeholder="যেমন: 200"
                            value={pledgeAmount}
                            onChange={(e) => setPledgeAmount(e.target.value)}
                            style={{ paddingLeft: '1.75rem' }}
                          />
                        </div>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          ভোটের গড় প্রতিশ্রুতি থেকে চূড়ান্ত লক্ষ্যমাত্রা নির্ধারিত হবে
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleVoteSubmit}
                    disabled={votingSubmit || !decision}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                  >
                    {votingSubmit && (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    ভোট জমা দিন
                  </button>
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              PHASE 2 — ACTIVE / PAYMENT  (status: active)
          ══════════════════════════════════════════════════════════════════════*/}
          {program.status === 'active' && (
            <>
              {/* Progress bar */}
              <div className="mb-4">
                <div
                  className="flex justify-between text-xs mb-1.5"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span>৳{program.raisedAmount.toLocaleString()} সংগ্রহ</span>
                  <span>লক্ষ্য ৳{target.toLocaleString()}</span>
                </div>
                <div
                  className="h-2.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--color-bg-secondary)' }}
                >
                  <motion.div
                    className="h-full rounded-full gradient-brand"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs mt-1 text-right" style={{ color: 'var(--color-text-muted)' }}>
                  {Math.round(progress)}% পূর্ণ
                </p>
              </div>

              {/* My vote summary (if voted yes) */}
              {myVote?.decision === 'yes' && myVote.amount > 0 && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl text-xs mb-4"
                  style={{
                    background: '#f0fdf4',
                    border:     '1px solid #bbf7d0',
                    color:      '#166534',
                  }}
                >
                  <ThumbsUp className="w-3.5 h-3.5 flex-shrink-0" />
                  আপনি ভোটে ৳{myVote.amount.toLocaleString()} দেওয়ার প্রতিশ্রুতি দিয়েছিলেন
                </div>
              )}

              {/* Payment form */}
              <div className="space-y-3">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    দানের পরিমাণ (৳) *
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 font-bold"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      ৳
                    </span>
                    <input
                      type="number"
                      min="10"
                      placeholder="যেমন: 500"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      style={{ paddingLeft: '1.75rem' }}
                    />
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    পেমেন্ট পদ্ধতি *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bkash', 'nagad', 'rocket', 'bank', 'cash'] as PaymentMethod[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                          method === m
                            ? 'gradient-brand text-white border-transparent shadow-sm'
                            : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                        }`}
                      >
                        {PAYMENT_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment number */}
                {paymentNumbers[method] && (
                  <div
                    className="flex justify-between items-center p-3 rounded-xl"
                    style={{ background: 'var(--color-bg-secondary)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {method === 'bank' ? 'অ্যাকাউন্ট' : 'নম্বর'}:
                    </span>
                    <span className="font-bold tracking-wide" style={{ color: 'var(--color-brand)' }}>
                      {paymentNumbers[method]}
                    </span>
                  </div>
                )}

                {/* Transaction ID */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    placeholder="TrxID / রেফারেন্স নম্বর"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                  />
                </div>

                {/* Screenshot upload */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    পেমেন্ট স্ক্রিনশট{' '}
                    <span style={{ color: 'var(--color-text-muted)' }}>(ঐচ্ছিক)</span>
                  </label>

                  {ssPreview ? (
                    <div
                      className="relative h-28 rounded-xl overflow-hidden border"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <img src={ssPreview} className="w-full h-full object-cover" alt="screenshot" />
                      <button
                        type="button"
                        onClick={() => { setSsFile(null); setSsPreview(null); }}
                        className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <div
                        className="border-2 border-dashed rounded-xl p-4 text-center transition-colors hover:border-[var(--color-brand)]"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <Upload className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--color-text-muted)' }} />
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          পেমেন্টের স্ক্রিনশট আপলোড করুন (সর্বোচ্চ 5MB)
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handlePaySubmit}
                  disabled={paySubmitting || uploading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {(paySubmitting || uploading) ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                  {uploading ? 'ছবি আপলোড হচ্ছে...' : paySubmitting ? 'জমা হচ্ছে...' : 'দান নিশ্চিত করুন'}
                </button>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              OTHER STATUSES — info only
          ══════════════════════════════════════════════════════════════════════*/}
          {program.status === 'completed' && (
            <div
              className="flex flex-col items-center gap-2 py-6 text-center"
              style={{ color: '#0284c7' }}
            >
              <CheckCircle className="w-10 h-10" />
              <p className="font-semibold text-base">ডোনেশন সম্পন্ন হয়েছে!</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                মোট সংগ্রহ: ৳{program.raisedAmount.toLocaleString()}
              </p>
            </div>
          )}

          {program.status === 'cancelled' && (
            <div
              className="flex flex-col items-center gap-2 py-6 text-center"
              style={{ color: '#dc2626' }}
            >
              <XCircle className="w-10 h-10" />
              <p className="font-semibold text-base">আবেদন বাতিল হয়েছে</p>
            </div>
          )}

          {program.status === 'pending_review' && (
            <div
              className="flex flex-col items-center gap-2 py-6 text-center"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Clock className="w-10 h-10" />
              <p className="font-semibold text-base">পর্যালোচনায় আছে</p>
              <p className="text-sm">অ্যাডমিন অনুমোদন দিলে ভোটিং শুরু হবে</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
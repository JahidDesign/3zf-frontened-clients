'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ThumbsUp, ThumbsDown, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useOrgStore from '@/store/Orgstore';
import { DonationProgram } from '@/types/organisation';

interface Props {
  program: DonationProgram | null;
  onClose: () => void;
}

export default function VoteModal({ program, onClose }: Props) {
  const { updateProgramInList } = useOrgStore();
  const [vote, setVote]             = useState<'yes' | 'no' | null>(null);
  const [amount, setAmount]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!program) return null;

  const { votes } = program;
  const totalVotes  = votes.yes + votes.no;
  const yesPercent  = totalVotes > 0 ? Math.round((votes.yes / totalVotes) * 100) : 0;
  const noPercent   = 100 - yesPercent;
  const avgProposed = votes.yes > 0
    ? Math.round(votes.totalProposedAmount / votes.yes)
    : 0;

  const handleSubmit = async () => {
    if (!vote) { toast.error('হ্যাঁ বা না ভোট দিন'); return; }
    if (vote === 'yes' && (!amount || Number(amount) < 10)) {
      toast.error('আপনি কত টাকা দিতে চান লিখুন (সর্বনিম্ন ৳10)');
      return;
    }

    setSubmitting(true);
    const tid = toast.loading('ভোট জমা হচ্ছে...');
    try {
      // BUG FIX 1: The API call used /org/programs/:id/vote but the org_controller
      // expects proposedAmount, and vote. Field names were correct — but the response
      // shape returned by org_controller is:
      //   { votes: { yes, no, totalProposedAmount }, programStatus }
      // The old code destructured `data.votes` correctly but then spread the OLD `votes`
      // object and only updated yes/no/totalProposedAmount — myVote and myProposedAmount
      // were not set from the local state, causing the "already voted" badge to never show
      // until a page refresh.
      const { data } = await api.post(`/org/programs/${program._id}/vote`, {
        vote,
        proposedAmount: vote === 'yes' ? Number(amount) : 0,
      });

      toast.success('ভোট সফলভাবে দেওয়া হয়েছে!', { id: tid });

      // BUG FIX 1 (continued): Merge server counts with local user state so the
      // "already voted" section renders immediately without a reload.
      updateProgramInList(program._id, {
        votes: {
          yes:                data.votes.yes,
          no:                 data.votes.no,
          totalProposedAmount: data.votes.totalProposedAmount,
          // Optimistically mark the current user's vote so the "already voted"
          // banner shows immediately without a page refresh.
          myVote:             vote,
          myProposedAmount:   vote === 'yes' ? Number(amount) : undefined,
        },
      });
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'ভোট দিতে সমস্যা হয়েছে', { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 25 }}
          className="card w-full sm:max-w-md rounded-b-none sm:rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                {program.title}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                প্রয়োজন: ৳{program.requestedAmount.toLocaleString()}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]">
              <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          </div>

          {/* Current vote stats */}
          <div
            className="rounded-xl p-3 mb-4"
            style={{ background: 'var(--color-bg-secondary)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {totalVotes} জন ভোট দিয়েছেন
              </span>
              {avgProposed > 0 && (
                <span className="text-xs ml-auto" style={{ color: 'var(--color-brand)' }}>
                  গড় প্রস্তাব: ৳{avgProposed.toLocaleString()}
                </span>
              )}
            </div>

            {/* Yes bar */}
            <div className="mb-1.5">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#166534' }}>হ্যাঁ ({votes.yes} জন)</span>
                <span style={{ color: '#166534' }}>{yesPercent}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${yesPercent}%`, background: '#16a34a' }}
                />
              </div>
            </div>

            {/* No bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#991b1b' }}>না ({votes.no} জন)</span>
                <span style={{ color: '#991b1b' }}>{noPercent}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${noPercent}%`, background: '#dc2626' }}
                />
              </div>
            </div>
          </div>

          {/* Already voted */}
          {votes.myVote ? (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
            >
              <ThumbsUp className="w-4 h-4" />
              আপনি ইতিমধ্যে ভোট দিয়েছেন ({votes.myVote === 'yes' ? 'হ্যাঁ' : 'না'})
              {votes.myProposedAmount
                ? ` — প্রস্তাব: ৳${votes.myProposedAmount.toLocaleString()}`
                : ''}
            </div>
          ) : (
            <>
              {/* Vote buttons */}
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                আপনার ভোট:
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setVote('yes')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                    vote === 'yes'
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-green-50'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" /> হ্যাঁ
                </button>
                <button
                  onClick={() => setVote('no')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                    vote === 'no'
                      ? 'bg-red-50 border-red-300 text-red-800'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-red-50'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" /> না
                </button>
              </div>

              {/* BUG FIX 2: Clicking "না" while an amount was previously typed left
                  a stale amount in the input. Clear it when vote changes to 'no'. */}
              {vote === 'no' && amount && setAmount('')}

              {/* Amount (only for yes) */}
              {vote === 'yes' && (
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    আমি দিতে চাই (৳) *
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm"
                      style={{ color: 'var(--color-brand)' }}
                    >৳</span>
                    <input
                      type="number"
                      min="10"
                      placeholder="যেমন: 200"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ paddingLeft: '1.75rem' }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    ভোটের গড় থেকে চূড়ান্ত লক্ষ্যমাত্রা নির্ধারিত হবে
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !vote}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                ভোট জমা দিন
              </button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
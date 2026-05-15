'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, UserCheck, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useT } from '@/hooks/useT';

export default function FriendSuggestions() {
  const { t, lang } = useT();
  const isBn = lang === 'bn';
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/friends/suggestions')
      .then(({ data }) => setSuggestions(data.suggestions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sendRequest = async (userId: string) => {
    if (sent.has(userId) || pending.has(userId)) return;
    setPending(prev => new Set([...prev, userId]));
    try {
      await api.post(`/friends/request/${userId}`);
      setSent(prev => new Set([...prev, userId]));
      toast.success(isBn ? 'রিকোয়েস্ট পাঠানো হয়েছে!' : 'Friend request sent!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || t.common.error);
    } finally {
      setPending(prev => { const n = new Set(prev); n.delete(userId); return n; });
    }
  };

  const dismiss = (userId: string) => setDismissed(prev => new Set([...prev, userId]));

  const visible = suggestions.filter(s => !dismissed.has(s._id));

  if (loading) {
    return (
      <div className="card animate-pulse space-y-3">
        <div className="h-4 rounded w-40" style={{ background: 'var(--color-border)' }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{ background: 'var(--color-border)' }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 rounded w-28" style={{ background: 'var(--color-border)' }} />
              <div className="h-2.5 rounded w-20" style={{ background: 'var(--color-border)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visible.length === 0) return null;

  return (
    <div className="card">
      <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
        {t.community.suggested}
      </h3>

      <div className="space-y-3">
        <AnimatePresence>
          {visible.slice(0, 5).map((s: any) => {
            const isSent    = sent.has(s._id);
            const isPending = pending.has(s._id);

            return (
              <motion.div
                key={s._id}
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between gap-2"
              >
                {/* Avatar + Name */}
                <Link href={`/community/profile/${s.username}`} className="flex items-center gap-2.5 min-w-0 flex-1">
                  <img
                    src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=6B46C1&color=fff`}
                    alt={s.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{s.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>@{s.username}</p>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isSent ? (
                    // ── Sent state: icon-only green tick ──────────────────────
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100"
                      title={isBn ? 'রিকোয়েস্ট পাঠানো হয়েছে' : 'Request sent'}
                    >
                      <UserCheck className="w-4 h-4 text-green-600" />
                    </div>
                  ) : isPending ? (
                    // ── Loading state ─────────────────────────────────────────
                    <div className="w-8 h-8 rounded-full flex items-center justify-center gradient-brand opacity-70">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  ) : (
                    // ── Idle: Add button ──────────────────────────────────────
                    <button
                      onClick={() => sendRequest(s._id)}
                      aria-label={t.community.addFriend}
                      className="w-8 h-8 rounded-full flex items-center justify-center gradient-brand text-white hover:opacity-90 active:scale-95 transition-all"
                      title={t.community.addFriend}
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  )}

                  {/* Dismiss — hide after sent */}
                  {!isSent && (
                    <button
                      onClick={() => dismiss(s._id)}
                      aria-label="Dismiss suggestion"
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--color-bg-hover)] transition-colors"
                    >
                      <X className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {visible.length > 5 && (
        <Link
          href="/community/friends"
          className="block text-center text-sm font-medium mt-4 pt-3 border-t transition-colors hover:text-[var(--color-brand)]"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          {t.common.viewAll} →
        </Link>
      )}
    </div>
  );
}
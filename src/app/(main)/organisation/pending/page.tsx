'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Heart, BookOpen, CreditCard, Clock, Image as ImageIcon,
  Users, ThumbsUp, ThumbsDown, MapPin, Timer, CheckCircle, X,
} from 'lucide-react';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

const navItems = [
  { label: 'Organisation', href: '/organisation', icon: Users },
  { label: 'Donations Complete', href: '/organisation/books', icon: BookOpen },
  { label: 'Pending', href: '/organisation/pending', icon: Clock },
  { label: 'Requests', href: '/organisation/requests', icon: CreditCard },
  { label: 'Gallery', href: '/organisation/gallery', icon: ImageIcon },
];

const CATEGORY_LABELS: Record<string, string> = {
  blood: 'রক্ত', food: 'খাবার', clothes: 'পোশাক',
  money: 'অর্থ', medicine: 'ওষুধ', education: 'শিক্ষা', other: 'অন্যান্য',
};

interface PendingDonation {
  _id: string;
  title: string;
  description: string;
  category: string;
  name: string;
  targetAmount: number | null;
  photoUrl: string | null;
  videoUrl: string | null;
  location: { district: string | null };
  createdBy: { name: string; avatar: string | null };
  totalYesVotes: number;
  totalNoVotes: number;
  totalPledgedAmount: number;
  voteDeadline: string | null;
  createdAt: string;
}

export default function PendingPage() {
  const { isAuthenticated } = useAuthStore();
  const [donations, setDonations] = useState<PendingDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteModal, setVoteModal] = useState<{ donation: PendingDonation; type: 'yes' | 'no' } | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState<Set<string>>(new Set());

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/donations', { params: { status: 'pending_vote' } });
      setDonations(data.data || []);
    } catch {
      toast.error('তথ্য লোড করতে সমস্যা হয়েছে');
    } finally { setLoading(false); }
  };

  const openVoteModal = (donation: PendingDonation, type: 'yes' | 'no') => {
    if (!isAuthenticated) { toast.error('আগে লগইন করুন'); return; }
    if (voted.has(donation._id)) { toast.error('আপনি ইতিমধ্যে ভোট দিয়েছেন'); return; }
    setVoteModal({ donation, type });
    setPledgeAmount('');
  };

  const submitVote = async () => {
    if (!voteModal) return;
    setVoting(true);
    try {
      await api.post(`/donations/${voteModal.donation._id}/vote`, {
        voteType: voteModal.type,
        pledgeAmount: pledgeAmount ? Number(pledgeAmount) : 0,
      });
      toast.success(voteModal.type === 'yes' ? 'হ্যাঁ ভোট দেওয়া হয়েছে!' : 'না ভোট দেওয়া হয়েছে');
      setVoted(prev => new Set(prev).add(voteModal.donation._id));
      setVoteModal(null);
      fetchPending();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ভোট দিতে সমস্যা হয়েছে');
    } finally { setVoting(false); }
  };

  const getDeadlineText = (deadline: string | null) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return 'সময় শেষ';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days} দিন বাকি` : `${hours} ঘন্টা বাকি`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">

        <div className="gradient-brand text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-heading text-3xl font-bold mb-1">পেন্ডিং ডোনেশন</h1>
            <p className="text-purple-100">ভোট দিন — আপনার মতামতেই সিদ্ধান্ত হবে</p>
          </div>
        </div>

        {/* Sub nav */}
        <div className="sticky top-[var(--navbar-height)] z-30 border-b shadow-sm" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
            <div className="flex items-center gap-1 py-2">
              {navItems.map(item => (
                <Link key={item.label} href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                    ${item.label === 'Pending' ? 'gradient-brand text-white shadow-brand' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">

          {/* Info banner */}
          <div className="rounded-xl p-4 mb-6 flex items-start gap-3 border"
            style={{ background: 'var(--color-bg-info)', borderColor: 'var(--color-border-info)' }}>
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                কীভাবে ভোট দেবেন?
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                প্রতিটি পোস্টে হ্যাঁ ভোট দিলে আপনি কত টাকা দিতে চান তা জানান। নির্দিষ্ট সংখ্যক হ্যাঁ ভোট হলে পোস্টটি সক্রিয় ডোনেশনে যাবে।
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-5 rounded w-3/4 mb-3" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-3 rounded w-full mb-2" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-3 rounded w-2/3" style={{ background: 'var(--color-bg-secondary)' }} />
                </div>
              ))}
            </div>
          ) : donations.length === 0 ? (
            <div className="card text-center py-16">
              <Clock className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>কোনো পেন্ডিং পোস্ট নেই</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>নতুন পোস্ট অনুমোদন পেলে এখানে দেখা যাবে</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((d, i) => {
                const total = d.totalYesVotes + d.totalNoVotes;
                const yesPct = total > 0 ? Math.round((d.totalYesVotes / total) * 100) : 0;
                const noPct = total > 0 ? Math.round((d.totalNoVotes / total) * 100) : 0;
                const deadline = getDeadlineText(d.voteDeadline);
                const hasVoted = voted.has(d._id);

                return (
                  <motion.div key={d._id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="card overflow-hidden p-0">

                    <div className="flex flex-col sm:flex-row">
                      {d.photoUrl && (
                        <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0 overflow-hidden">
                          <img src={d.photoUrl} alt={d.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                              {CATEGORY_LABELS[d.category] || d.category}
                            </span>
                            {deadline && (
                              <span className="text-xs flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                <Timer className="w-3 h-3" />{deadline}
                              </span>
                            )}
                          </div>
                          {hasVoted && (
                            <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 flex-shrink-0">
                              ভোট দিয়েছেন
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--color-text)' }}>{d.title}</h3>
                        <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--color-text-secondary)' }}>{d.description}</p>

                        <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />{d.name}
                          </span>
                          {d.location?.district && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{d.location.district}
                            </span>
                          )}
                          {d.targetAmount && (
                            <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                              লক্ষ্য: ৳{d.targetAmount.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Vote progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            <span className="text-green-700 font-medium">হ্যাঁ: {d.totalYesVotes} ({yesPct}%)</span>
                            <span className="text-red-600 font-medium">না: {d.totalNoVotes} ({noPct}%)</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--color-bg-secondary)' }}>
                            <div className="h-full bg-green-500 transition-all rounded-l-full" style={{ width: `${yesPct}%` }} />
                            <div className="h-full bg-red-400 transition-all rounded-r-full" style={{ width: `${noPct}%` }} />
                          </div>
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            মোট ভোট: {total} • মোট প্রতিশ্রুত: ৳{d.totalPledgedAmount.toLocaleString()}
                          </p>
                        </div>

                        {/* Vote buttons */}
                        <div className="flex gap-2">
                          <button onClick={() => openVoteModal(d, 'yes')} disabled={hasVoted}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all
                              ${hasVoted
                                ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-500'
                                : 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100'}`}>
                            <ThumbsUp className="w-4 h-4" /> হ্যাঁ — ভোট দিন
                          </button>
                          <button onClick={() => openVoteModal(d, 'no')} disabled={hasVoted}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all
                              ${hasVoted
                                ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-500'
                                : 'bg-red-50 border-red-300 text-red-800 hover:bg-red-100'}`}>
                            <ThumbsDown className="w-4 h-4" /> না — ভোট দিন
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Vote Modal */}
      {voteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-md">

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                {voteModal.type === 'yes' ? 'হ্যাঁ ভোট দিন' : 'না ভোট দিন'}
              </h3>
              <button onClick={() => setVoteModal(null)} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]">
                <X className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </div>

            <p className="text-sm mb-4 line-clamp-2 font-medium" style={{ color: 'var(--color-text)' }}>
              "{voteModal.donation.title}"
            </p>

            {voteModal.type === 'yes' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  আপনি কত টাকা দিতে চান? (ঐচ্ছিক)
                </label>
                <input type="number" placeholder="যেমন: 500"
                  value={pledgeAmount} onChange={e => setPledgeAmount(e.target.value)} />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  এটি একটি প্রতিশ্রুতি — পরে donate করতে হবে
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setVoteModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-[var(--color-bg-hover)]"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                বাতিল
              </button>
              <button onClick={submitVote} disabled={voting}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2
                  ${voteModal.type === 'yes'
                    ? 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                    : 'bg-red-500 border-red-600 text-white hover:bg-red-600'}`}>
                {voting ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : voteModal.type === 'yes' ? <><ThumbsUp className="w-4 h-4" /> হ্যাঁ নিশ্চিত করুন</> : <><ThumbsDown className="w-4 h-4" /> না নিশ্চিত করুন</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <MainFooter />
    </div>
  );
}
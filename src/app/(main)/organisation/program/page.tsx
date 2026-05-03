'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Users, ThumbsUp, ThumbsDown, Clock, Heart, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import VoteModal from '@/components/organisation/Votemodal';
import api from '@/lib/api';
import useOrgStore from '@/store/Orgstore';
import useAuthStore from '@/store/authStore';
import { DonationProgram } from '@/types/organisation';
import { CATEGORY_ICONS, CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/org-constants';

const NAV_ITEMS = [
  { label: 'Home',             href: '/organisation',          icon: Users },
  { label: 'Donation Program', href: '/organisation/donate',   icon: Heart },
  { label: 'Pending',          href: '/organisation/pending',  icon: Bell  },
  { label: 'Complete',         href: '/organisation/complete', icon: Bookmark },
];

export default function PendingPage() {
  const { isAuthenticated } = useAuthStore();
  const { pendingPrograms, programsLoading, setPrograms, setProgramsLoading } = useOrgStore();
  const [selectedProgram, setSelectedProgram] = useState<DonationProgram | null>(null);

  useEffect(() => {
    (async () => {
      setProgramsLoading(true);
      try {
        const { data } = await api.get('/org/programs');
        setPrograms(data.data || []);
      } catch { toast.error('তথ্য লোড করতে সমস্যা'); }
      finally { setProgramsLoading(false); }
    })();
  }, []);

  const handleVoteClick = (program: DonationProgram) => {
    if (!isAuthenticated) { toast.error('আগে লগইন করুন'); return; }
    setSelectedProgram(program);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">

        {/* Hero */}
        <div className="gradient-brand text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-heading text-3xl font-bold mb-1">Pending Donation Program</h1>
            <p className="text-purple-100">সদস্যদের ভোটে ডোনেশন প্রোগ্রাম অনুমোদিত হয়</p>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="sticky top-[var(--navbar-height)] z-30 border-b shadow-sm"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
            <div className="flex items-center gap-1 py-2">
              {NAV_ITEMS.map((item) => (
                <Link key={item.label} href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                    ${item.href === '/organisation/pending'
                      ? 'gradient-brand text-white shadow-brand'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* How it works */}
          <div className="card mb-6 p-4" style={{ background: 'var(--color-bg)' }}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
              কীভাবে কাজ করে?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: '1️⃣', title: 'Admin অনুমোদন', desc: 'পোস্ট যাচাই করে Pending Voting-এ পাঠানো হয়' },
                { icon: '2️⃣', title: 'সদস্য ভোট', desc: 'সব সদস্য হ্যাঁ/না ভোট ও প্রস্তাবিত পরিমাণ দেন' },
                { icon: '3️⃣', title: 'Active হয়', desc: 'ভোটের গড় থেকে লক্ষ্যমাত্রা নির্ধারণ হয়' },
              ].map((step) => (
                <div key={step.icon} className="flex gap-3 items-start">
                  <span className="text-xl">{step.icon}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{step.title}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {programsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-5 rounded w-2/3 mb-3" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-4 rounded w-full mb-2" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-4 rounded w-3/4" style={{ background: 'var(--color-bg-secondary)' }} />
                </div>
              ))}
            </div>
          ) : pendingPrograms.length === 0 ? (
            <div className="card text-center py-16">
              <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>কোনো পেন্ডিং প্রোগ্রাম নেই</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPrograms.map((program, i) => {
                const totalVotes = program.votes.yes + program.votes.no;
                const yesPercent = totalVotes > 0
                  ? Math.round((program.votes.yes / totalVotes) * 100)
                  : 0;
                const avgProposed = program.votes.yes > 0
                  ? Math.round(program.votes.totalProposedAmount / program.votes.yes)
                  : 0;

                return (
                  <motion.div key={program._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[program.status]}`}>
                            {STATUS_LABELS[program.status]}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full border"
                            style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                            {CATEGORY_ICONS[program.category]} {CATEGORY_LABELS[program.category]}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                          {program.title}
                        </h3>
                        <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {program.description}
                        </p>
                      </div>
                      {program.media?.[0] && (
                        <img src={program.media[0].url} alt={program.title}
                          className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                        প্রয়োজন: ৳{program.requestedAmount.toLocaleString()}
                      </span>
                      {avgProposed > 0 && (
                        <span className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: '#f0fdf4', color: '#166534' }}>
                          গড় প্রস্তাব: ৳{avgProposed.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                        <Clock className="w-3 h-3" /> {new Date(program.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    {/* Voting (only pending_vote status) */}
                    {program.status === 'pending_vote' && (
                      <>
                        {totalVotes > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1"
                              style={{ color: 'var(--color-text-secondary)' }}>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" /> হ্যাঁ: {program.votes.yes}
                              </span>
                              <span className="flex items-center gap-1">
                                না: {program.votes.no} <ThumbsDown className="w-3 h-3" />
                              </span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden"
                              style={{ background: 'var(--color-bg-secondary)' }}>
                              <div className="h-full rounded-full transition-all"
                                style={{ width: `${yesPercent}%`, background: '#16a34a' }} />
                            </div>
                            <div className="flex justify-between text-xs mt-0.5"
                              style={{ color: 'var(--color-text-muted)' }}>
                              <span>{yesPercent}%</span>
                              <span>{totalVotes} ভোট</span>
                            </div>
                          </div>
                        )}

                        {program.votes.myVote ? (
                          <div className="flex items-center gap-2 text-sm py-2 px-3 rounded-xl"
                            style={{ background: '#f0fdf4', color: '#166534' }}>
                            <ThumbsUp className="w-4 h-4" />
                            আপনি ভোট দিয়েছেন: {program.votes.myVote === 'yes' ? 'হ্যাঁ' : 'না'}
                            {program.votes.myProposedAmount
                              ? ` (৳${program.votes.myProposedAmount.toLocaleString()})`
                              : ''}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => handleVoteClick(program)}
                              className="btn-primary flex-1 py-2 flex items-center justify-center gap-2">
                              <ThumbsUp className="w-4 h-4" /> ভোট দিন
                            </button>
                            <button onClick={() => handleVoteClick(program)}
                              className="flex-1 py-2 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all hover:bg-red-50"
                              style={{ borderColor: '#fca5a5', color: '#b91c1c' }}>
                              <ThumbsDown className="w-4 h-4" /> না
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Admin review status */}
                    {program.status === 'pending_review' && (
                      <div className="p-3 rounded-xl text-sm"
                        style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fcd34d' }}>
                        ⏳ Admin পোস্টটি যাচাই করছেন। অনুমোদনের পর সদস্যদের নোটিফিকেশন পাঠানো হবে।
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <VoteModal
        program={selectedProgram}
        onClose={() => setSelectedProgram(null)}
      />

      <MainFooter />
    </div>
  );
}
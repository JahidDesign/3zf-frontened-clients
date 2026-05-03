'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, Search, MapPin, Bookmark, Users, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import RegistrationModal from '@/components/organisation/Registrationmodal';
import CreatePostModal from '@/components/organisation/Createpostmodal';
import DonateModal from '@/components/organisation/Donatemodal';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import useOrgStore from '@/store/Orgstore';
import { DonationProgram } from '@/types/organisation';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  ALL_CATEGORIES,
} from '@/lib/org-constants';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Home',             href: '/organisation',          icon: Users },
  { label: 'Donation Program', href: '/organisation/donate',   icon: Heart },
  { label: 'Pending',          href: '/organisation/pending',  icon: Bell  },
  { label: 'Complete',         href: '/organisation/complete', icon: Bookmark },
];

// ─── Image component with robust fallback ────────────────────────────────────
function ProgramImage({ url, title }: { url: string; title: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  // Reset when URL changes
  useEffect(() => {
    setStatus('loading');
  }, [url]);

  if (!url) return null;

  return (
    <div className="relative h-44 overflow-hidden bg-[var(--color-bg-secondary)]">
      {/* Skeleton shimmer while loading */}
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-[var(--color-bg-secondary)]" />
      )}

      {/* Actual image — hidden on error */}
      {status !== 'error' && (
        <img
          src={url}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
      )}

      {/* Fallback placeholder on error */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Heart
            className="w-8 h-8 opacity-20"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <p className="text-xs opacity-40" style={{ color: 'var(--color-text-muted)' }}>
            ছবি লোড হয়নি
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OrgHomePage() {
  const { isAuthenticated } = useAuthStore();
  const {
    membership, membershipLoading, setMembership, setMembershipLoading,
    programs, programsLoading, setPrograms, setProgramsLoading,
    showRegistrationModal, setShowRegistrationModal,
  } = useOrgStore();

  const [search,          setSearch]          = useState('');
  const [activeCategory,  setActiveCategory]  = useState<string>('all');
  const [showCreatePost,  setShowCreatePost]  = useState(false);
  const [bookmarked,      setBookmarked]      = useState<Set<string>>(new Set());
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<DonationProgram | null>(null);
  const [paymentNumbers,  setPaymentNumbers]  = useState<Record<string, string>>({});

  // ── Fetch membership ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) { setMembershipLoading(false); return; }
    (async () => {
      try {
        const { data } = await api.get('/org/my-status');
        setMembership(data.membership);
      } catch { /* silent */ }
      finally { setMembershipLoading(false); }
    })();
  }, [isAuthenticated]);

  // ── Fetch payment numbers ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/org/config');
        if (data.paymentNumbers) setPaymentNumbers(data.paymentNumbers);
      } catch { /* silent */ }
    })();
  }, []);

  // ── Fetch programs ────────────────────────────────────────────────────────
  const fetchPrograms = useCallback(async () => {
    setProgramsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      const { data } = await api.get('/org/programs', { params });

      // Normalise: ensure media is always an array with a valid url string
      const normalised = (data.data || []).map((p: DonationProgram) => ({
        ...p,
        media: Array.isArray(p.media)
          ? p.media.filter(
              (m: any) =>
                m &&
                typeof m.url === 'string' &&
                m.url.trim().length > 0
            )
          : [],
      }));

      setPrograms(normalised);
    } catch {
      toast.error('তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setProgramsLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  // ── Guards ────────────────────────────────────────────────────────────────
  const handleNewPost = () => {
    if (!isAuthenticated)                { toast.error('আগে লগইন করুন'); return; }
    if (membershipLoading)               return;
    if (!membership)                     { setShowRegistrationModal(true); return; }
    if (membership.status === 'pending') {
      toast('আপনার সদস্যপদ আবেদন পর্যালোচনায় আছে', { icon: '⏳' });
      return;
    }
    if (membership.status === 'rejected') {
      toast.error('আপনার সদস্যপদ আবেদন প্রত্যাখ্যাত হয়েছে');
      return;
    }
    setShowCreatePost(true);
  };

  const openDonateModal = (program: DonationProgram) => {
    if (!isAuthenticated) { toast.error('আগে লগইন করুন'); return; }
    setSelectedProgram(program);
    setShowDonateModal(true);
  };

  const closeDonateModal = () => {
    setShowDonateModal(false);
    setSelectedProgram(null);
  };

  const handleHeroDonate = () => {
    if (!isAuthenticated) { toast.error('আগে লগইন করুন'); return; }
    const firstActive = programs.find((p) => p.status === 'active') ?? null;
    if (firstActive) openDonateModal(firstActive);
    else window.location.href = '/organisation/donate';
  };

  const handleBookmark = async (id: string) => {
    if (!isAuthenticated) { toast.error('আগে লগইন করুন'); return; }
    try {
      await api.post(`/org/programs/${id}/bookmark`);
      setBookmarked((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    } catch { toast.error('সমস্যা হয়েছে'); }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = programs.filter((p) => {
    if (search === '') return true;
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ── Derived membership state ──────────────────────────────────────────────
  const isApproved      = membership?.status === 'approved';
  const isPending       = membership?.status === 'pending';
  const isRejected      = membership?.status === 'rejected';
  const showRegisterBtn = isAuthenticated && !membershipLoading && (!membership || isRejected);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />

      <div className="pt-[var(--navbar-height)]">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="gradient-brand text-white py-10 px-4">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-1">Harmony Organization</h1>
              <p className="text-purple-100">স্বচ্ছ, সদস্যভিত্তিক ডোনেশন সিস্টেম</p>

              {isApproved && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">
                    সদস্য ID: {membership.membershipId}
                  </span>
                </div>
              )}
              {isPending && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-yellow-400/20 text-yellow-100 text-xs px-2.5 py-1 rounded-full border border-yellow-300/30">
                    ⏳ সদস্যপদ পর্যালোচনায় আছে
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {showRegisterBtn && (
                <button
                  onClick={() => setShowRegistrationModal(true)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 text-sm px-4 py-2.5 rounded-xl transition-all font-medium"
                >
                  <Users className="w-4 h-4" /> সদস্য হন
                </button>
              )}
              <button
                onClick={handleHeroDonate}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 text-sm px-4 py-2.5 rounded-xl transition-all font-medium"
              >
                <Heart className="w-4 h-4" /> দান করুন
              </button>
              <button
                onClick={handleNewPost}
                className="flex items-center gap-2 bg-white text-purple-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-all"
              >
                <Plus className="w-4 h-4" /> নতুন পোস্ট
              </button>
            </div>
          </div>
        </div>

        {/* ── Sub-nav ───────────────────────────────────────────────────────── */}
        <div
          className="sticky top-[var(--navbar-height)] z-30 border-b shadow-sm"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
        >
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
            <div className="flex items-center gap-1 py-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                    ${item.href === '/organisation'
                      ? 'gradient-brand text-white shadow-brand'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">

          {/* ── Membership banners ────────────────────────────────────────────── */}
          {isPending && (
            <div
              className="mb-4 p-3 rounded-xl border flex items-center gap-2 text-sm"
              style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#92400e' }}
            >
              ⏳ আপনার সদস্যপদ আবেদন পর্যালোচনায় আছে। Admin অনুমোদন দিলে জানানো হবে।
            </div>
          )}
          {isRejected && (
            <div
              className="mb-4 p-3 rounded-xl border flex items-center gap-2 text-sm"
              style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' }}
            >
              ❌ আপনার সদস্যপদ আবেদন প্রত্যাখ্যাত হয়েছে। পুনরায় আবেদন করতে "সদস্য হন" বাটনে চাপুন।
            </div>
          )}

          {/* ── Search ───────────────────────────────────────────────────────── */}
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="পোস্ট খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          {/* ── Category tabs ─────────────────────────────────────────────────── */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all
                ${activeCategory === 'all'
                  ? 'gradient-brand text-white border-transparent'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
            >
              সব
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all
                  ${activeCategory === cat
                    ? 'gradient-brand text-white border-transparent'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
              >
                {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* ── Program grid ──────────────────────────────────────────────────── */}
          {programsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-44 rounded-lg mb-4" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-4 rounded mb-2 w-3/4" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-3 rounded w-1/2" style={{ background: 'var(--color-bg-secondary)' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16">
              <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>কোনো পোস্ট পাওয়া যায়নি</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                প্রথম পোস্টটি আপনিই করুন!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((program, i) => {
                const hasImage   = Array.isArray(program.media) && program.media.length > 0 && !!program.media[0]?.url;
                const target     = program.approvedAmount ?? program.requiredAmount;
                const progress   = target > 0 ? Math.min((program.raisedAmount / target) * 100, 100) : 0;

                return (
                  <motion.div
                    key={program._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card hover:shadow-md transition-shadow overflow-hidden p-0"
                  >
                    {/* ── Image section ── */}
                    {hasImage ? (
                      <div className="relative overflow-hidden">
                        {/* ProgramImage handles loading / error internally */}
                        <ProgramImage url={program.media[0].url} title={program.title} />

                        {/* Badges overlaid on the image */}
                        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm ${STATUS_COLORS[program.status] ?? ''}`}
                          >
                            {STATUS_LABELS[program.status]}
                          </span>
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 text-gray-700 backdrop-blur-sm">
                            {CATEGORY_ICONS[program.category]} {CATEGORY_LABELS[program.category]}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <div className="p-4">
                      {/* Badges when NO image */}
                      {!hasImage && (
                        <div className="flex gap-2 mb-3 flex-wrap">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[program.status]}`}
                          >
                            {STATUS_LABELS[program.status]}
                          </span>
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full border"
                            style={{
                              background:  'var(--color-bg-secondary)',
                              borderColor: 'var(--color-border)',
                              color:       'var(--color-text-secondary)',
                            }}
                          >
                            {CATEGORY_ICONS[program.category]} {CATEGORY_LABELS[program.category]}
                          </span>
                        </div>
                      )}

                      <h3
                        className="font-semibold text-base mb-1 line-clamp-2"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {program.title}
                      </h3>
                      <p
                        className="text-sm line-clamp-2 mb-3"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {program.description}
                      </p>

                      {/* Progress — active */}
                      {program.status === 'active' && target > 0 && (
                        <div className="mb-3">
                          <div
                            className="flex justify-between text-xs mb-1"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <span>৳{program.raisedAmount.toLocaleString()} সংগ্রহ</span>
                            <span>লক্ষ্য ৳{target.toLocaleString()}</span>
                          </div>
                          <div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'var(--color-bg-secondary)' }}
                          >
                            <div
                              className="h-full rounded-full gradient-brand transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Vote bar — pending_vote */}
                      {program.status === 'pending_vote' && (
                        <div className="mb-3">
                          <div
                            className="flex justify-between text-xs mb-1"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <span>হ্যাঁ: {program.votes.yes} · না: {program.votes.no}</span>
                            <span>ভোট চলছে</span>
                          </div>
                          <div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'var(--color-bg-secondary)' }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: program.votes.yes + program.votes.no > 0
                                  ? `${Math.round(program.votes.yes / (program.votes.yes + program.votes.no) * 100)}%`
                                  : '0%',
                                background: '#7F77DD',
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Card footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {program.author?.name?.[0] ?? 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                              {program.author?.name}
                            </p>
                            {program.location?.district && (
                              <p className="text-xs flex items-center gap-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                <MapPin className="w-3 h-3" />{program.location.district}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {program.status === 'pending_vote' && (
                            <button
                              onClick={() => openDonateModal(program)}
                              className="text-xs px-2 py-1.5 rounded-lg font-medium transition-all hover:bg-[var(--color-bg-hover)]"
                              style={{ color: '#7F77DD' }}
                            >
                              ভোট দিন
                            </button>
                          )}
                          {program.status === 'active' && (
                            <button
                              onClick={() => openDonateModal(program)}
                              className="text-xs px-2 py-1.5 rounded-lg font-medium transition-all hover:bg-[var(--color-bg-hover)]"
                              style={{ color: 'var(--color-brand)' }}
                            >
                              দান করুন
                            </button>
                          )}
                          <button
                            onClick={() => handleBookmark(program._id)}
                            className="p-1.5 rounded-lg transition-all hover:bg-[var(--color-bg-hover)]"
                            style={{
                              color: bookmarked.has(program._id)
                                ? 'var(--color-brand)'
                                : 'var(--color-text-secondary)',
                            }}
                          >
                            <Bookmark
                              className="w-3.5 h-3.5"
                              fill={bookmarked.has(program._id) ? 'currentColor' : 'none'}
                            />
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

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <RegistrationModal />

      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => { setShowCreatePost(false); fetchPrograms(); }}
        />
      )}

      {showDonateModal && (
        <DonateModal
          program={selectedProgram}
          paymentNumbers={paymentNumbers}
          onClose={closeDonateModal}
          onSuccess={() => { closeDonateModal(); fetchPrograms(); }}
        />
      )}

      <MainFooter />
    </div>
  );
}
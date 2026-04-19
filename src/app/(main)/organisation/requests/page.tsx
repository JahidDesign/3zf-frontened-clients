'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Heart, BookOpen, CreditCard, Clock, Image as ImageIcon,
  Users, MapPin, X, Wallet, TrendingUp, Target,
} from 'lucide-react';
import MainNavbar from '@/components/layout/MainNavbar';
import MainFooter from '@/components/layout/MainFooter';
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

interface ActiveDonation {
  _id: string;
  title: string;
  description: string;
  category: string;
  name: string;
  approvedAmount: number;
  raisedAmount: number;
  photoUrl: string | null;
  location: { district: string | null };
  createdBy: { name: string; avatar: string | null };
  totalYesVotes: number;
  donors: { user: { name: string }; amount: number; paidAt: string }[];
  deadline: string | null;
  createdAt: string;
}

export default function DonationProgramPage() {
  const { isAuthenticated } = useAuthStore();
  const [donations, setDonations] = useState<ActiveDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [donateModal, setDonateModal] = useState<ActiveDonation | null>(null);
  const [donateForm, setDonateForm] = useState({ amount: '', transactionId: '' });
  const [donating, setDonating] = useState(false);
  const [donorsModal, setDonorsModal] = useState<ActiveDonation | null>(null);

  useEffect(() => { fetchActive(); }, []);

  const fetchActive = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/donations', { params: { status: 'active' } });
      setDonations(data.data || []);
    } catch {
      toast.error('তথ্য লোড করতে সমস্যা হয়েছে');
    } finally { setLoading(false); }
  };

  const submitDonation = async () => {
    if (!donateModal) return;
    if (!donateForm.amount || Number(donateForm.amount) <= 0) {
      toast.error('সঠিক পরিমাণ লিখুন'); return;
    }
    if (!donateForm.transactionId.trim()) {
      toast.error('Transaction ID দিন'); return;
    }
    setDonating(true);
    try {
      await api.post(`/donations/${donateModal._id}/donate`, {
        amount: Number(donateForm.amount),
        transactionId: donateForm.transactionId.trim(),
      });
      toast.success(`৳${Number(donateForm.amount).toLocaleString()} দান সফল হয়েছে!`);
      setDonateModal(null);
      setDonateForm({ amount: '', transactionId: '' });
      fetchActive();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'দান করতে সমস্যা হয়েছে');
    } finally { setDonating(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">

        <div className="gradient-brand text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-heading text-3xl font-bold mb-1">ডোনেশন প্রোগ্রাম</h1>
            <p className="text-purple-100">সক্রিয় ডোনেশনে অংশ নিন — প্রতিটি টাকা গুরুত্বপূর্ণ</p>
          </div>
        </div>

        {/* Sub nav */}
        <div className="sticky top-[var(--navbar-height)] z-30 border-b shadow-sm" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
            <div className="flex items-center gap-1 py-2">
              {navItems.map(item => (
                <Link key={item.label} href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                    ${item.label === 'Requests' ? 'gradient-brand text-white shadow-brand' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-44 rounded-lg mb-4" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-4 rounded w-3/4 mb-2" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-2 rounded w-full mb-4" style={{ background: 'var(--color-bg-secondary)' }} />
                </div>
              ))}
            </div>
          ) : donations.length === 0 ? (
            <div className="card text-center py-16">
              <Target className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>কোনো সক্রিয় প্রোগ্রাম নেই</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                ভোটিং সম্পন্ন হলে প্রোগ্রাম এখানে দেখা যাবে
              </p>
              <Link href="/organisation/pending" className="btn-primary inline-block mt-4 px-6 py-2">
                ভোটিং দেখুন
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {donations.map((d, i) => {
                const pct = d.approvedAmount > 0
                  ? Math.min(Math.round((d.raisedAmount / d.approvedAmount) * 100), 100) : 0;
                const remaining = Math.max(d.approvedAmount - d.raisedAmount, 0);

                return (
                  <motion.div key={d._id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="card overflow-hidden p-0 hover:shadow-md transition-shadow">

                    {d.photoUrl && (
                      <div className="h-44 overflow-hidden relative">
                        <img src={d.photoUrl} alt={d.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-800 border border-green-200">
                            সক্রিয়
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 text-gray-700">
                            {CATEGORY_LABELS[d.category] || d.category}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-4">
                      {!d.photoUrl && (
                        <div className="flex gap-2 mb-3">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-800 border border-green-200">সক্রিয়</span>
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full border" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                            {CATEGORY_LABELS[d.category] || d.category}
                          </span>
                        </div>
                      )}

                      <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--color-text)' }}>{d.title}</h3>
                      <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--color-text-secondary)' }}>{d.description}</p>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {[
                          { label: 'লক্ষ্য', value: `৳${d.approvedAmount.toLocaleString()}`, icon: Target },
                          { label: 'সংগ্রহ', value: `৳${d.raisedAmount.toLocaleString()}`, icon: TrendingUp },
                          { label: 'বাকি', value: `৳${remaining.toLocaleString()}`, icon: Wallet },
                        ].map(s => (
                          <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: 'var(--color-bg-secondary)' }}>
                            <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{s.value}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                          <span>{pct}% সম্পন্ন</span>
                          <span>{d.totalYesVotes} জন ভোট দিয়েছেন</span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
                          <motion.div className="h-full rounded-full gradient-brand"
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-xs">{d.name}</span>
                        {d.location?.district && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs">{d.location.district}</span>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => isAuthenticated ? setDonateModal(d) : toast.error('আগে লগইন করুন')}
                          disabled={pct >= 100}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                            ${pct >= 100
                              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500 border border-gray-200'
                              : 'btn-primary'}`}>
                          <Heart className="w-4 h-4" />
                          {pct >= 100 ? 'লক্ষ্য পূর্ণ' : 'ডোনেশন করুন'}
                        </button>
                        <button onClick={() => setDonorsModal(d)}
                          className="px-3 py-2.5 rounded-xl text-sm border transition-all hover:bg-[var(--color-bg-hover)]"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                          <Users className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Donate Modal */}
      {donateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--color-text)' }}>ডোনেশন করুন</h3>
              <button onClick={() => setDonateModal(null)} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]">
                <X className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </div>

            <p className="text-sm font-medium mb-1 line-clamp-1" style={{ color: 'var(--color-text)' }}>{donateModal.title}</p>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              বাকি: ৳{Math.max(donateModal.approvedAmount - donateModal.raisedAmount, 0).toLocaleString()}
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  পরিমাণ (টাকা) *
                </label>
                <input type="number" placeholder="যেমন: 500"
                  value={donateForm.amount} onChange={e => setDonateForm(p => ({ ...p, amount: e.target.value }))} />
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {[100, 200, 500, 1000].map(amt => (
                  <button key={amt} onClick={() => setDonateForm(p => ({ ...p, amount: String(amt) }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${donateForm.amount === String(amt)
                        ? 'gradient-brand text-white border-transparent'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                    ৳{amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Transaction ID *
                </label>
                <input type="text" placeholder="bKash/Nagad/রকেট Transaction ID"
                  value={donateForm.transactionId} onChange={e => setDonateForm(p => ({ ...p, transactionId: e.target.value }))} />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  bKash/Nagad/রকেটে পাঠানোর পর Transaction ID দিন
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setDonateModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-[var(--color-bg-hover)]"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                বাতিল
              </button>
              <button onClick={submitDonation} disabled={donating}
                className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                {donating ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : <><Heart className="w-4 h-4" /> দান নিশ্চিত করুন</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Donors Modal */}
      {donorsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                দাতাগণ ({donorsModal.donors?.length || 0} জন)
              </h3>
              <button onClick={() => setDonorsModal(null)} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]">
                <X className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </div>
            {!donorsModal.donors?.length ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>এখনো কেউ দান করেননি</p>
            ) : (
              <div className="space-y-2">
                {donorsModal.donors.map((donor, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                        {donor.user?.name?.[0] || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{donor.user?.name || 'বেনামী'}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {new Date(donor.paidAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-700">৳{donor.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      <MainFooter />
    </div>
  );
}
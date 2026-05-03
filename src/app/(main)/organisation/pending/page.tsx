'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Bell, Bookmark, CheckCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import DonateModal from '@/components/organisation/Donatemodal';
import api from '@/lib/api';
import useOrgStore from '@/store/Orgstore';
import useAuthStore from '@/store/authStore';
import { DonationProgram } from '@/types/organisation';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/org-constants';

const NAV_ITEMS = [
  { label: 'Home',             href: '/organisation',          icon: Users },
  { label: 'Donation Program', href: '/organisation/donate',   icon: Heart },
  { label: 'Pending',          href: '/organisation/pending',  icon: Bell  },
  { label: 'Complete',         href: '/organisation/complete', icon: Bookmark },
];

export default function DonateProgramPage() {
  const { isAuthenticated } = useAuthStore();
  const { activePrograms, programsLoading, setPrograms, setProgramsLoading, membership } = useOrgStore();
  const [selectedProgram, setSelectedProgram]   = useState<DonationProgram | null>(null);
  const [paymentNumbers, setPaymentNumbers]     = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      setProgramsLoading(true);
      try {
        const [programsRes, configRes] = await Promise.all([
          api.get('/org/programs'),
          api.get('/org/config'),
        ]);
        setPrograms(programsRes.data.data || []);
        if (configRes.data.paymentNumbers) setPaymentNumbers(configRes.data.paymentNumbers);
      } catch { toast.error('তথ্য লোড করতে সমস্যা'); }
      finally { setProgramsLoading(false); }
    })();
  }, []);

  const handleDonate = (program: DonationProgram) => {
    if (!isAuthenticated)                        { toast.error('আগে লগইন করুন'); return; }
    if (!membership || membership.status !== 'approved') {
      toast.error('শুধুমাত্র অনুমোদিত সদস্যরা দান করতে পারবেন');
      return;
    }
    setSelectedProgram(program);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">

        {/* Hero */}
        <div className="gradient-brand text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-heading text-3xl font-bold mb-1">Donation Program</h1>
            <p className="text-purple-100">সক্রিয় ডোনেশন প্রোগ্রামে অংশ নিন</p>
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
                    ${item.href === '/organisation/donate'
                      ? 'gradient-brand text-white shadow-brand'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {programsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-5 rounded w-2/3 mb-3" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-2 rounded-full w-full mb-2" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-10 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }} />
                </div>
              ))}
            </div>
          ) : activePrograms.length === 0 ? (
            <div className="card text-center py-16">
              <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>কোনো সক্রিয় প্রোগ্রাম নেই</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                নতুন প্রোগ্রাম অনুমোদিত হলে এখানে দেখা যাবে
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {activePrograms.map((program, i) => {
                const progress = program.requiredAmount > 0
                  ? Math.min((program.raisedAmount / program.requiredAmount) * 100, 100)
                  : 0;
                const remaining = Math.max(0, program.requiredAmount - program.raisedAmount);

                return (
                  <motion.div key={program._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="card overflow-hidden p-0"
                  >
                    {/* Media */}
                    {program.media?.[0] && (
                      <div className="h-48 overflow-hidden">
                        <img src={program.media[0].url} alt={program.title}
                          className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-800 border border-green-200">
                              ✅ সক্রিয়
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full border"
                              style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                              {CATEGORY_ICONS[program.category]} {CATEGORY_LABELS[program.category]}
                            </span>
                          </div>
                          <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>{program.title}</h3>
                          <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {program.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-semibold" style={{ color: 'var(--color-brand)' }}>
                            ৳{program.raisedAmount.toLocaleString()} সংগ্রহ
                          </span>
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            লক্ষ্য ৳{program.requiredAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden"
                          style={{ background: 'var(--color-bg-secondary)' }}>
                          <motion.div
                            className="h-full rounded-full gradient-brand"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, delay: i * 0.06 + 0.2 }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1"
                          style={{ color: 'var(--color-text-muted)' }}>
                          <span>{Math.round(progress)}% পূর্ণ</span>
                          <span>আরও ৳{remaining.toLocaleString()} দরকার</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { label: 'মোট দাতা', value: program.donors?.length ?? 0, icon: Users },
                          { label: 'ভোটে অনুমোদিত', value: `৳${(program.approvedAmount ?? program.requiredAmount).toLocaleString()}`, icon: CheckCircle },
                          { label: 'অগ্রগতি', value: `${Math.round(progress)}%`, icon: TrendingUp },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center p-2 rounded-xl"
                            style={{ background: 'var(--color-bg-secondary)' }}>
                            <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-brand)' }} />
                            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{stat.value}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Donate button */}
                      {progress >= 100 ? (
                        <div className="py-3 text-center rounded-xl font-medium text-sm"
                          style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                          ✅ লক্ষ্যমাত্রা পূর্ণ হয়েছে! Admin যাচাই করবেন।
                        </div>
                      ) : (
                        <button onClick={() => handleDonate(program)}
                          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
                          <Heart className="w-5 h-5" /> দান করুন
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <DonateModal
        program={selectedProgram}
        paymentNumbers={paymentNumbers}
        onClose={() => setSelectedProgram(null)}
      />

      <MainFooter />
    </div>
  );
}
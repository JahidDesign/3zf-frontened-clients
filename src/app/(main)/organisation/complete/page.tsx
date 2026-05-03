'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Heart, Users, Bell, Bookmark, ExternalLink, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';
import useOrgStore from '@/store/Orgstore';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/org-constants';

const NAV_ITEMS = [
  { label: 'Home',             href: '/organisation',          icon: Users },
  { label: 'Donation Program', href: '/organisation/donate',   icon: Heart },
  { label: 'Pending',          href: '/organisation/pending',  icon: Bell  },
  { label: 'Complete',         href: '/organisation/complete', icon: Bookmark },
];

export default function CompletePage() {
  const { completedPrograms, programsLoading, setPrograms, setProgramsLoading } = useOrgStore();

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

  // Summary stats
  const totalRaised = completedPrograms.reduce((acc, p) => acc + p.raisedAmount, 0);
  const totalDonors = completedPrograms.reduce((acc, p) => acc + (p.donors?.length ?? 0), 0);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">

        {/* Hero */}
        <div className="gradient-brand text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-heading text-3xl font-bold mb-1">Complete Donation Program</h1>
            <p className="text-purple-100">সফলভাবে সম্পন্ন হওয়া ডোনেশন প্রোগ্রামের ইতিহাস</p>
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
                    ${item.href === '/organisation/complete'
                      ? 'gradient-brand text-white shadow-brand'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Summary metrics */}
          {completedPrograms.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'সম্পন্ন প্রোগ্রাম', value: completedPrograms.length },
                { label: 'মোট সংগৃহীত', value: `৳${totalRaised.toLocaleString()}` },
                { label: 'মোট দাতা', value: totalDonors },
              ].map((m) => (
                <div key={m.label} className="card text-center py-4">
                  <p className="text-xl font-bold" style={{ color: 'var(--color-brand)' }}>{m.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{m.label}</p>
                </div>
              ))}
            </div>
          )}

          {programsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-5 rounded w-2/3 mb-3" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-4 rounded w-full" style={{ background: 'var(--color-bg-secondary)' }} />
                </div>
              ))}
            </div>
          ) : completedPrograms.length === 0 ? (
            <div className="card text-center py-16">
              <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                এখনও কোনো প্রোগ্রাম সম্পন্ন হয়নি
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedPrograms.map((program, i) => {
                const completedDate = program.completedAt
                  ? new Date(program.completedAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
                  : null;

                return (
                  <motion.div key={program._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card overflow-hidden p-0"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Media thumbnail */}
                      {program.media?.[0] && (
                        <div className="sm:w-36 h-36 overflow-hidden flex-shrink-0">
                          <img src={program.media[0].url} alt={program.title}
                            className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> সম্পন্ন
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full border"
                                style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                                {CATEGORY_ICONS[program.category]} {CATEGORY_LABELS[program.category]}
                              </span>
                            </div>
                            <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
                              {program.title}
                            </h3>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-base" style={{ color: 'var(--color-brand)' }}>
                              ৳{program.raisedAmount.toLocaleString()}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>সংগৃহীত</p>
                          </div>
                        </div>

                        <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                          {program.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs flex items-center gap-1"
                            style={{ color: 'var(--color-text-muted)' }}>
                            <Users className="w-3 h-3" /> {program.donors?.length ?? 0} জন দাতা
                          </span>
                          {completedDate && (
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              📅 {completedDate}
                            </span>
                          )}

                          {/* Documentary link */}
                          {program.documentaryUrl && (
                            <a
                              href={program.documentaryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl ml-auto transition-all"
                              style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
                            >
                              <Film className="w-3.5 h-3.5" style={{ color: 'var(--color-brand)' }} />
                              ডকুমেন্টারি দেখুন
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
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
      <MainFooter />
    </div>
  );
}
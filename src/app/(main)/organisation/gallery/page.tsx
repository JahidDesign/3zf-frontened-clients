'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Heart, BookOpen, CreditCard, Clock, Image as ImageIcon,
  Users, MapPin, CheckCircle, Play, X, Award, TrendingUp,
} from 'lucide-react';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';

const navItems = [
  { label: 'Organisation', href: '/organisation', icon: Users },
  { label: 'Donate', href: '/organisation/donate', icon: Heart },
  { label: 'Donations Complete', href: '/organisation/books', icon: BookOpen },
  { label: 'Pending', href: '/organisation/pending', icon: Clock },
  { label: 'Requests', href: '/organisation/requests', icon: CreditCard },
  { label: 'Gallery', href: '/organisation/gallery', icon: ImageIcon },
];

const CATEGORY_LABELS: Record<string, string> = {
  blood: 'রক্ত', food: 'খাবার', clothes: 'পোশাক',
  money: 'অর্থ', medicine: 'ওষুধ', education: 'শিক্ষা', other: 'অন্যান্য',
};

interface CompletedDonation {
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
  donors: { user: { name: string }; amount: number }[];
  documentary: { videoUrl: string; description: string | null; uploadedAt: string } | null;
  updatedAt: string;
}

export default function CompletePage() {
  const [donations, setDonations] = useState<CompletedDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [docModal, setDocModal] = useState<CompletedDonation | null>(null);
  const [stats, setStats] = useState({ total: 0, totalRaised: 0, totalDonors: 0 });

  useEffect(() => { fetchCompleted(); }, []);

  const fetchCompleted = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/donations', { params: { status: 'completed', limit: 50 } });
      const list: CompletedDonation[] = data.data || [];
      setDonations(list);
      setStats({
        total: list.length,
        totalRaised: list.reduce((s, d) => s + d.raisedAmount, 0),
        totalDonors: list.reduce((s, d) => s + (d.donors?.length || 0), 0),
      });
    } catch {
      toast.error('তথ্য লোড করতে সমস্যা হয়েছে');
    } finally { setLoading(false); }
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">

        <div className="gradient-brand text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-heading text-3xl font-bold mb-1">সম্পন্ন ডোনেশন</h1>
            <p className="text-purple-100">আমাদের সফল উদ্যোগগুলো — স্বচ্ছতার সাথে ডকুমেন্ট করা</p>
          </div>
        </div>

        {/* Sub nav */}
        <div className="sticky top-[var(--navbar-height)] z-30 border-b shadow-sm" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
            <div className="flex items-center gap-1 py-2">
              {navItems.map(item => (
                <Link key={item.label} href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                    ${item.label === 'Gallery' ? 'gradient-brand text-white shadow-brand' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">

          {/* Summary stats */}
          {!loading && donations.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'সম্পন্ন প্রোগ্রাম', value: stats.total, suffix: 'টি' },
                { label: 'মোট সংগ্রহ', value: `৳${stats.totalRaised.toLocaleString()}`, suffix: '' },
                { label: 'মোট দাতা', value: stats.totalDonors, suffix: 'জন' },
              ].map(s => (
                <div key={s.label} className="card text-center py-4">
                  <p className="font-heading text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {s.value}{s.suffix}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-44 rounded-lg mb-4" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-4 rounded w-3/4 mb-2" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-3 rounded w-1/2" style={{ background: 'var(--color-bg-secondary)' }} />
                </div>
              ))}
            </div>
          ) : donations.length === 0 ? (
            <div className="card text-center py-16">
              <Award className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>এখনো কোনো প্রোগ্রাম সম্পন্ন হয়নি</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>সক্রিয় প্রোগ্রামে অংশ নিন</p>
              <Link href="/organisation/requests" className="btn-primary inline-block mt-4 px-6 py-2">
                ডোনেশন করুন
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {donations.map((d, i) => (
                <motion.div key={d._id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card overflow-hidden p-0 hover:shadow-md transition-shadow">

                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100">
                    {d.photoUrl ? (
                      <img src={d.photoUrl} alt={d.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="w-12 h-12 text-purple-300" />
                      </div>
                    )}

                    {/* Completed overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        সম্পন্ন
                      </span>
                      {d.documentary?.videoUrl && (
                        <button onClick={() => setDocModal(d)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-gray-800 text-xs font-medium hover:bg-white transition-all">
                          <Play className="w-3 h-3 fill-current" /> ডকুমেন্টারি
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-base line-clamp-1 flex-1" style={{ color: 'var(--color-text)' }}>{d.title}</h3>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    </div>
                    <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--color-text-secondary)' }}>{d.description}</p>

                    {/* Completion stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: 'সংগ্রহ', value: `৳${d.raisedAmount.toLocaleString()}` },
                        { label: 'দাতা', value: `${d.donors?.length || 0} জন` },
                        { label: 'ভোট', value: `${d.totalYesVotes} হ্যাঁ` },
                      ].map(s => (
                        <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: 'var(--color-bg-secondary)' }}>
                          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{s.value}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* 100% progress bar */}
                    <div className="mb-3">
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
                        <motion.div className="h-full rounded-full bg-green-500"
                          initial={{ width: 0 }} animate={{ width: '100%' }}
                          transition={{ duration: 1.2, delay: i * 0.1 }} />
                      </div>
                      <p className="text-xs mt-1 text-green-700 font-medium">১০০% সম্পন্ন</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <Users className="w-3 h-3" />{d.name}
                      {d.location?.district && (
                        <><span>•</span><MapPin className="w-3 h-3" />{d.location.district}</>
                      )}
                      <span className="ml-auto">
                        {new Date(d.updatedAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Documentary Modal */}
      {docModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl">

            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-base text-white line-clamp-1">{docModal.title}</h3>
              <button onClick={() => setDocModal(null)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video player */}
            <div className="rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {getYouTubeId(docModal.documentary!.videoUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(docModal.documentary!.videoUrl)}`}
                  className="w-full h-full" allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <video src={docModal.documentary!.videoUrl} controls className="w-full h-full bg-black" />
              )}
            </div>

            {docModal.documentary?.description && (
              <div className="mt-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <p className="text-sm text-white/90">{docModal.documentary.description}</p>
                <p className="text-xs text-white/50 mt-2">
                  আপলোড: {new Date(docModal.documentary.uploadedAt).toLocaleDateString('bn-BD')}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      <MainFooter />
    </div>
  );
}
// organisation/donate/page.tsx — Full rewrite with Cloudinary photo upload fix

'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Heart, BookOpen, CreditCard, Clock, Image as ImageIcon,
  Users, Plus, Search, MapPin, Bookmark, X, Upload,
} from 'lucide-react';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

// ─── Nav ──────────────────────────────────────────────────────────────────────
const navItems = [
  { label: 'Organisation',       href: '/organisation',          icon: Users     },
  { label: 'Donate',             href: '/organisation/donate',   icon: Heart     },
  { label: 'Donations Complete', href: '/organisation/books',    icon: BookOpen  },
  { label: 'Pending',            href: '/organisation/pending',  icon: Clock     },
  { label: 'Requests',           href: '/organisation/requests', icon: CreditCard},
  { label: 'Gallery',            href: '/organisation/gallery',  icon: ImageIcon },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['all', 'blood', 'food', 'clothes', 'money', 'medicine', 'education', 'other'];

const STATUS_COLORS: Record<string, string> = {
  pending_review: 'bg-amber-50  text-amber-800  border-amber-200',
  pending_vote:   'bg-purple-50 text-purple-800 border-purple-200',
  active:         'bg-green-50  text-green-800  border-green-200',
  completed:      'bg-blue-50   text-blue-800   border-blue-200',
  cancelled:      'bg-red-50    text-red-800    border-red-200',
};
const STATUS_LABELS: Record<string, string> = {
  pending_review: 'পর্যালোচনায়',
  pending_vote:   'ভোটিং চলছে',
  active:         'সক্রিয়',
  completed:      'সম্পন্ন',
  cancelled:      'বাতিল',
};
const CATEGORY_LABELS: Record<string, string> = {
  all: 'সব', blood: 'রক্ত', food: 'খাবার', clothes: 'পোশাক',
  money: 'অর্থ', medicine: 'ওষুধ', education: 'শিক্ষা', other: 'অন্যান্য',
};

const MAX_FILE_SIZE_MB = 5;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Donation {
  _id:           string;
  title:         string;
  description:   string;
  category:      string;
  postType:      'request' | 'offer';
  status:        string;
  targetAmount:  number | null;
  approvedAmount:number | null;
  raisedAmount:  number;
  photoUrl:      string | null;
  name:          string;
  location:      { district: string | null; division: string | null };
  createdBy:     { name: string; avatar: string | null };
  reactions:     { like: number; love: number; sad: number; angry: number };
  commentsCount: number;
  sharesCount:   number;
  createdAt:     string;
}

type FormState = {
  title:        string;
  description:  string;
  category:     string;
  postType:     string;
  targetAmount: string;
  videoUrl:     string;
  name:         string;
  address:      string;
  phone:        string;
};

const EMPTY_FORM: FormState = {
  title: '', description: '', category: 'money', postType: 'request',
  targetAmount: '', videoUrl: '', name: '', address: '', phone: '',
};

// ─── Cloudinary upload ────────────────────────────────────────────────────────
async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const fd = new FormData();
  fd.append('file',           file);
  fd.append('upload_preset',  process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);
  fd.append('folder',         'donations');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: fd }
  );
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DonatePage() {
  const { isAuthenticated } = useAuthStore();

  const [donations,    setDonations]    = useState<Donation[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [category,     setCategory]     = useState('all');
  const [search,       setSearch]       = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [bookmarked,   setBookmarked]   = useState<Set<string>>(new Set());

  const [form,         setForm]         = useState<FormState>(EMPTY_FORM);
  const [photoFile,    setPhotoFile]    = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => { fetchDonations(); }, [category]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (category !== 'all') params.category = category;
      const { data } = await api.get('/donations', { params });
      setDonations(data.data || []);
    } catch {
      toast.error('তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // ── Photo pick ─────────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`ছবির সাইজ সর্বোচ্চ ${MAX_FILE_SIZE_MB}MB হতে পারবে`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('শুধু ছবি ফাইল (JPG, PNG, WEBP) আপলোড করুন');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('আগে লগইন করুন'); return; }
    if (!form.title.trim() || !form.description.trim() || !form.name.trim() || !form.address.trim()) {
      toast.error('সব প্রয়োজনীয় তথ্য পূরণ করুন'); return;
    }

    setSubmitting(true);

    let photoUrl:      string | null = null;
    let photoPublicId: string | null = null;

    // 1. Upload photo to Cloudinary first
    if (photoFile) {
      setUploadingImg(true);
      toast.loading('ছবি আপলোড হচ্ছে...', { id: 'img-upload' });
      try {
        const uploaded = await uploadToCloudinary(photoFile);
        photoUrl      = uploaded.url;
        photoPublicId = uploaded.publicId;
        toast.success('ছবি আপলোড সফল', { id: 'img-upload' });
      } catch {
        toast.error('ছবি আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', { id: 'img-upload' });
        setUploadingImg(false);
        setSubmitting(false);
        return;
      } finally {
        setUploadingImg(false);
      }
    }

    // 2. Post JSON to backend
    try {
      await api.post('/donations', {
        ...form,
        targetAmount:  form.targetAmount ? Number(form.targetAmount) : undefined,
        videoUrl:      form.videoUrl || undefined,
        phone:         form.phone    || undefined,
        photoUrl,
        photoPublicId,
      });

      toast.success('পোস্ট জমা হয়েছে! Admin review করবেন।');
      closeModal();
      fetchDonations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'জমা দিতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // ── Bookmark ───────────────────────────────────────────────────────────────
  const handleBookmark = async (id: string) => {
    if (!isAuthenticated) { toast.error('আগে লগইন করুন'); return; }
    try {
      await api.post(`/donations/${id}/bookmark`);
      setBookmarked(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    } catch { toast.error('সমস্যা হয়েছে'); }
  };

  // ── React ──────────────────────────────────────────────────────────────────
  const handleReact = async (id: string) => {
    if (!isAuthenticated) { toast.error('আগে লগইন করুন'); return; }
    try {
      await api.post(`/donations/${id}/react`, { type: 'like' });
      setDonations(prev => prev.map(d =>
        d._id === id ? { ...d, reactions: { ...d.reactions, like: d.reactions.like + 1 } } : d
      ));
    } catch { toast.error('সমস্যা হয়েছে'); }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = donations.filter(d =>
    search === '' ||
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );

  const f = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />

      <div className="pt-[var(--navbar-height)]">

        {/* Hero */}
        <div className="gradient-brand text-white py-10 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-1">ডোনেশন ফিড</h1>
              <p className="text-purple-100">সকল ডোনেশন পোস্ট একসাথে দেখুন</p>
            </div>
            <button
              onClick={() => isAuthenticated ? setShowModal(true) : toast.error('আগে লগইন করুন')}
              className="flex items-center gap-2 bg-white text-purple-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-all">
              <Plus className="w-4 h-4" /> নতুন পোস্ট
            </button>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="sticky top-[var(--navbar-height)] z-30 border-b shadow-sm"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
            <div className="flex items-center gap-1 py-2">
              {navItems.map(item => (
                <Link key={item.label} href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                    ${item.label === 'Donate'
                      ? 'gradient-brand text-white shadow-brand'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="পোস্ট খুঁজুন..."
                value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-full" />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all
                  ${category === cat
                    ? 'gradient-brand text-white border-transparent'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-40 rounded-lg mb-4" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-4 rounded mb-2 w-3/4" style={{ background: 'var(--color-bg-secondary)' }} />
                  <div className="h-3 rounded w-1/2"      style={{ background: 'var(--color-bg-secondary)' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16">
              <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>কোনো পোস্ট পাওয়া যায়নি</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>প্রথম পোস্টটি আপনিই করুন!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((d, i) => {
                const progress = d.targetAmount
                  ? Math.min((d.raisedAmount / d.targetAmount) * 100, 100)
                  : 0;

                return (
                  <motion.div key={d._id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card hover:shadow-md transition-shadow overflow-hidden p-0">

                    {/* Photo */}
                    {d.photoUrl && (
                      <div className="relative h-44 overflow-hidden">
                        <img src={d.photoUrl} alt={d.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[d.status] || ''}`}>
                            {STATUS_LABELS[d.status] || d.status}
                          </span>
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 text-gray-700 border border-white/50">
                            {CATEGORY_LABELS[d.category] || d.category}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-4">
                      {/* Badges (no photo) */}
                      {!d.photoUrl && (
                        <div className="flex gap-2 mb-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[d.status] || ''}`}>
                            {STATUS_LABELS[d.status] || d.status}
                          </span>
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full border"
                            style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                            {CATEGORY_LABELS[d.category] || d.category}
                          </span>
                        </div>
                      )}

                      <h3 className="font-semibold text-base mb-1 line-clamp-2" style={{ color: 'var(--color-text)' }}>
                        {d.title}
                      </h3>
                      <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        {d.description}
                      </p>

                      {/* Progress */}
                      {d.targetAmount && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                            <span>৳{(d.raisedAmount || 0).toLocaleString()} সংগ্রহ</span>
                            <span>লক্ষ্য ৳{d.targetAmount.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
                            <div className="h-full rounded-full gradient-brand transition-all" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                            {d.createdBy?.name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                              {d.createdBy?.name}
                            </p>
                            {d.location?.district && (
                              <p className="text-xs flex items-center gap-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                <MapPin className="w-3 h-3" />{d.location.district}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button onClick={() => handleReact(d._id)}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all hover:bg-[var(--color-bg-hover)]"
                            style={{ color: 'var(--color-text-secondary)' }}>
                            <Heart className="w-3.5 h-3.5" />{d.reactions.like + d.reactions.love}
                          </button>
                          <button onClick={() => handleBookmark(d._id)}
                            className="p-1.5 rounded-lg transition-all hover:bg-[var(--color-bg-hover)]"
                            style={{ color: bookmarked.has(d._id) ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}>
                            <Bookmark className="w-3.5 h-3.5" fill={bookmarked.has(d._id) ? 'currentColor' : 'none'} />
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

      {/* ── Create Post Modal ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>

            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="card w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-2xl">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
                  নতুন পোস্ট তৈরি করুন
                </h2>
                <button onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors">
                  <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Type + Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                      ধরন *
                    </label>
                    <select value={form.postType} onChange={f('postType')}>
                      <option value="request">সাহায্য চাই</option>
                      <option value="offer">সাহায্য করতে চাই</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                      বিভাগ *
                    </label>
                    <select value={form.category} onChange={f('category')}>
                      {CATEGORIES.filter(c => c !== 'all').map(c => (
                        <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    শিরোনাম *
                  </label>
                  <input type="text" placeholder="পোস্টের শিরোনাম লিখুন"
                    value={form.title} onChange={f('title')} />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    বিস্তারিত বিবরণ *
                  </label>
                  <textarea rows={3} placeholder="বিস্তারিত লিখুন..."
                    value={form.description} onChange={f('description')}
                    style={{ resize: 'none' }} />
                </div>

                {/* Name + Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                      আপনার নাম *
                    </label>
                    <input type="text" placeholder="পূর্ণ নাম"
                      value={form.name} onChange={f('name')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                      ফোন
                    </label>
                    <input type="tel" placeholder="01XXXXXXXXX"
                      value={form.phone} onChange={f('phone')} />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    ঠিকানা *
                  </label>
                  <input type="text" placeholder="বর্তমান ঠিকানা"
                    value={form.address} onChange={f('address')} />
                </div>

                {/* Target amount */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    প্রয়োজনীয় অর্থ (টাকা)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold"
                      style={{ color: 'var(--color-brand)' }}>৳</span>
                    <input type="number" min="0" placeholder="যেমন: 50000"
                      value={form.targetAmount} onChange={f('targetAmount')}
                      style={{ paddingLeft: '1.75rem' }} />
                  </div>
                </div>

                {/* Photo upload */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    ছবি আপলোড
                  </label>

                  {photoPreview ? (
                    <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                      <img src={photoPreview} alt="preview" className="w-full h-full object-cover opacity-90" />

                      {/* Remove */}
                      <button type="button" onClick={removePhoto}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors">
                        <X className="w-4 h-4 text-white" />
                      </button>

                      {/* Re-pick */}
                      <label className="absolute inset-0 flex items-end cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        <span className="w-full py-2 text-center text-white text-xs font-medium"
                          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }}>
                          পরিবর্তন করতে ক্লিক করুন
                        </span>
                      </label>

                      {/* File name */}
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg max-w-[60%] truncate">
                        {photoFile?.name}
                      </div>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      <div className="border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-bg-hover)]"
                        style={{ borderColor: 'var(--color-border)' }}>
                        <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          ছবি আপলোড করুন
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          JPG, PNG, WEBP — সর্বোচ্চ {MAX_FILE_SIZE_MB}MB
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal}
                    className="btn-ghost flex-1 py-3">
                    বাতিল করুন
                  </button>
                  <button type="submit"
                    disabled={submitting || uploadingImg}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                    {submitting || uploadingImg ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {uploadingImg ? 'ছবি আপলোড হচ্ছে...' : 'জমা হচ্ছে...'}
                      </>
                    ) : (
                      <><Heart className="w-4 h-4" /> পোস্ট জমা দিন</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MainFooter />
    </div>
  );
}
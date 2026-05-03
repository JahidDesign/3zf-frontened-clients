'use client';

/**
 * Admin — Posts Management Table
 * ================================
 * Features:
 *   - Paginated table of all posts
 *   - Search / filter by audience
 *   - Inline Edit modal (content, audience, feeling, location)
 *   - Delete with confirmation
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Search, Trash2, Pencil, X, RefreshCw, Globe,
  Users, Lock, Image, MapPin, Smile, ChevronLeft,
  ChevronRight, AlertTriangle, Eye, Filter,
} from 'lucide-react';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface IPost {
  _id: string;
  content?: string;
  audience: 'public' | 'friends' | 'private';
  feeling?: string;
  location?: string;
  media?: { url: string; type: string }[];
  author: { _id: string; name: string; avatar?: string };
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
}

const AUDIENCE_LABELS: Record<string, { label: string; icon: typeof Globe; color: string }> = {
  public:  { label: 'পাবলিক',       icon: Globe,  color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  friends: { label: 'বন্ধুরা',      icon: Users,  color: 'text-blue-600 bg-blue-50 border-blue-200'         },
  private: { label: 'প্রাইভেট',    icon: Lock,   color: 'text-gray-600 bg-gray-100 border-gray-200'         },
};

const FEELINGS_BN = [
  '😊 খুশি','😢 দুঃখিত','😍 প্রেমে','🎉 উদযাপন',
  '😤 রাগান্বিত','😴 ক্লান্ত','🤔 ভাবছি','💪 অনুপ্রাণিত',
];

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ post, onClose, onDone }: {
  post: IPost; onClose: () => void; onDone: (updated: IPost) => void;
}) {
  const [content,  setContent]  = useState(post.content  ?? '');
  const [audience, setAudience] = useState(post.audience);
  const [feeling,  setFeeling]  = useState(post.feeling  ?? '');
  const [location, setLocation] = useState(post.location ?? '');
  const [loading,  setLoading]  = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch(`/posts/${post._id}`, { content, audience, feeling, location });
      toast.success('পোস্ট আপডেট হয়েছে!');
      onDone(data.post);
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="card w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-bold text-xl" style={{ color: 'var(--color-text)' }}>
            পোস্ট এডিট করুন
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
              বিষয়বস্তু
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="পোস্টের বিষয়বস্তু..."
              style={{ resize: 'none' }}
            />
          </div>

          {/* Audience */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
              দর্শক
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(AUDIENCE_LABELS).map(([val, meta]) => {
                const Icon = meta.icon;
                return (
                  <button
                    key={val}
                    onClick={() => setAudience(val as IPost['audience'])}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      audience === val
                        ? meta.color + ' border-current'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feeling */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
              অনুভূতি
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {FEELINGS_BN.map(f => (
                <button
                  key={f}
                  onClick={() => setFeeling(feeling === f ? '' : f)}
                  className={`py-1.5 px-2 rounded-lg text-xs border transition-all ${
                    feeling === f
                      ? 'border-[var(--color-brand)] bg-purple-50 text-purple-700'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
              অবস্থান
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="অবস্থান লিখুন..."
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5" disabled={loading}>
            বাতিল
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
          >
            {loading ? '⏳' : <><Pencil className="w-4 h-4" /> সংরক্ষণ করুন</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ post, onClose, onDone }: {
  post: IPost; onClose: () => void; onDone: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('পোস্ট মুছে ফেলা হয়েছে!');
      onDone(post._id);
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="card w-full max-w-sm text-center"
      >
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="font-heading font-bold text-xl mb-2" style={{ color: 'var(--color-text)' }}>
          পোস্ট মুছবেন?
        </h3>
        <p className="text-sm mb-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
          {post.content ? `"${post.content.slice(0, 80)}${post.content.length > 80 ? '…' : ''}"` : 'মিডিয়া পোস্ট'}
        </p>
        <p className="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
          এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5" disabled={loading}>
            বাতিল
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {loading ? '⏳' : <><Trash2 className="w-4 h-4" /> মুছুন</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Admin Posts Page ────────────────────────────────────────────────────
export default function AdminPostsPage() {
  const [posts,      setPosts]      = useState<IPost[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [audience,   setAudience]   = useState('');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [editing,    setEditing]    = useState<IPost | null>(null);
  const [deleting,   setDeleting]   = useState<IPost | null>(null);

  const LIMIT = 10;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/posts/admin', {
        params: { page, limit: LIMIT, search: search || undefined, audience: audience || undefined },
      });
      setPosts(data.posts      ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total      ?? 0);
    } catch {
      toast.error('পোস্ট লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [page, search, audience]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, audience]);

  const handleUpdated = (updated: IPost) => {
    setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));
  };

  const handleDeleted = (id: string) => {
    setPosts(prev => prev.filter(p => p._id !== id));
    setTotal(t => t - 1);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div className="gradient-brand text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-heading font-bold text-2xl mb-1">পোস্ট ম্যানেজমেন্ট</h1>
          <p className="text-purple-200 text-sm">Harmony Organization — Admin Panel</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="px-4 py-2 rounded-xl bg-white/15">
              <span className="font-bold text-2xl">{total}</span>
              <span className="text-xs text-purple-200 ml-2">মোট পোস্ট</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="পোস্ট বা লেখক খুঁজুন..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 w-full"
              />
            </div>

            {/* Audience filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <select
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="pl-9 pr-8"
                style={{ minWidth: '160px' }}
              >
                <option value="">সব দর্শক</option>
                <option value="public">পাবলিক</option>
                <option value="friends">বন্ধুরা</option>
                <option value="private">প্রাইভেট</option>
              </select>
            </div>

            <button
              onClick={fetchPosts}
              className="p-2.5 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <RefreshCw className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>লেখক</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>বিষয়বস্তু</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>দর্শক</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>মিডিয়া</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>তারিখ</th>
                  <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--color-text-muted)' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded animate-pulse" style={{ background: 'var(--color-border)', width: j === 1 ? '80%' : '60%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>কোনো পোস্ট পাওয়া যায়নি</p>
                    </td>
                  </tr>
                ) : (
                  posts.map((post, idx) => {
                    const audienceMeta = AUDIENCE_LABELS[post.audience] ?? AUDIENCE_LABELS.public;
                    const AudienceIcon = audienceMeta.icon;
                    return (
                      <motion.tr
                        key={post._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                        className="hover:bg-[var(--color-bg-hover)] transition-colors"
                      >
                        {/* Author */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5 min-w-[140px]">
                            <img
                              src={
                                post.author?.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name ?? 'U')}&background=6B46C1&color=fff`
                              }
                              alt=""
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                            <span className="font-medium truncate max-w-[100px]" style={{ color: 'var(--color-text)' }}>
                              {post.author?.name ?? 'অজানা'}
                            </span>
                          </div>
                        </td>

                        {/* Content */}
                        <td className="px-4 py-3 max-w-xs">
                          <p className="truncate" style={{ color: 'var(--color-text-secondary)' }}>
                            {post.content
                              ? post.content.slice(0, 80) + (post.content.length > 80 ? '…' : '')
                              : <span style={{ color: 'var(--color-text-muted)' }}>— কোনো টেক্সট নেই —</span>
                            }
                          </p>
                          {(post.feeling || post.location) && (
                            <div className="flex items-center gap-2 mt-1">
                              {post.feeling && (
                                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{post.feeling}</span>
                              )}
                              {post.location && (
                                <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                  <MapPin className="w-3 h-3" /> {post.location}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Audience */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${audienceMeta.color}`}>
                            <AudienceIcon className="w-3 h-3" />
                            {audienceMeta.label}
                          </span>
                        </td>

                        {/* Media */}
                        <td className="px-4 py-3">
                          {post.media && post.media.length > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <img
                                src={post.media[0].url}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              {post.media.length > 1 && (
                                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                                  +{post.media.length - 1}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {formatDate(post.createdAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditing(post)}
                              className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              style={{ color: 'var(--color-text-muted)' }}
                              title="এডিট করুন"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleting(post)}
                              className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                              style={{ color: 'var(--color-text-muted)' }}
                              title="মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-3 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                মোট {total} টি পোস্ট — পৃষ্ঠা {page} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                          p === page ? 'gradient-brand text-white' : 'hover:bg-[var(--color-bg-hover)]'
                        }`}
                        style={p !== page ? { color: 'var(--color-text)' } : {}}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (Math.abs(p - page) === 2) return <span key={p} style={{ color: 'var(--color-text-muted)' }}>…</span>;
                  return null;
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editing  && <EditModal   post={editing}  onClose={() => setEditing(null)}  onDone={handleUpdated} />}
        {deleting && <DeleteModal post={deleting} onClose={() => setDeleting(null)} onDone={handleDeleted} />}
      </AnimatePresence>
    </div>
  );
}
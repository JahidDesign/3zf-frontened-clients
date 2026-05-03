'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Eye, Tag, BookOpen, Search,
  AlertCircle, RefreshCw, Calendar, User, ChevronRight, ArrowRight
} from 'lucide-react';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: { url: string; publicId: string };
  category: string;
  tags?: string[];
  author: { _id: string; name: string; avatar?: string; bio?: string };
  likes: string[];
  comments: any[];
  views: number;
  isPublished: boolean;
  publishedAt: string;
  language?: string;
}

interface PaginationMeta {
  total: number;
  pages: number;
  current: number;
}

const LIMIT = 9;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function excerpt(text: string, max = 120): string {
  if (!text) return '';
  const stripped = text.replace(/<[^>]+>/g, '');
  return stripped.length > max ? stripped.slice(0, max).trimEnd() + '…' : stripped;
}

// ─── Featured Hero Card ────────────────────────────────────────────────────────
function FeaturedCard({ post }: { post: Blog }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group relative flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Cover */}
        <div className="relative lg:w-1/2 h-56 lg:h-auto overflow-hidden flex-shrink-0">
          {post.coverImage?.url ? (
            <img
              src={post.coverImage.url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full gradient-brand flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-white opacity-30" />
            </div>
          )}
          <span
            className="absolute top-3 left-3 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{ background: 'var(--color-brand)', color: '#fff', letterSpacing: '0.08em' }}
          >
            Featured
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-6 lg:p-10 lg:w-1/2">
          <span
            className="badge text-xs mb-3 self-start"
            style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-brand)' }}
          >
            {post.category}
          </span>
          <h2
            className="font-heading text-2xl lg:text-3xl font-bold leading-snug mb-3 group-hover:text-[var(--color-brand)] transition-colors"
            style={{ color: 'var(--color-text)' }}
          >
            {post.title}
          </h2>
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text-secondary)' }}>
            {excerpt(post.excerpt || post.content || '', 180)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'A')}&background=6B46C1&color=fff`}
                alt={post.author?.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{post.author?.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatDate(post.publishedAt)}</p>
              </div>
            </div>
            <span
              className="flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all"
              style={{ color: 'var(--color-brand)' }}
            >
              Read more <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Blog Card ─────────────────────────────────────────────────────────────────
function BlogCard({ post, index }: { post: Blog; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="h-full"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="card group flex flex-col overflow-hidden p-0 h-full hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
      >
        {/* Cover Image */}
        <div className="relative h-44 overflow-hidden flex-shrink-0">
          {post.coverImage?.url ? (
            <img
              src={post.coverImage.url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full gradient-brand flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white opacity-30" />
            </div>
          )}
          <span
            className="absolute top-2 left-2 badge text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}
          >
            {post.category}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4">
          <h3
            className="font-heading font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-[var(--color-brand)] transition-colors"
            style={{ color: 'var(--color-text)' }}
          >
            {post.title}
          </h3>
          <p className="text-xs leading-relaxed line-clamp-2 mb-3 flex-1" style={{ color: 'var(--color-text-secondary)' }}>
            {excerpt(post.excerpt || post.content || '', 110)}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}
                >
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <div className="flex items-center gap-1.5">
              <img
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'A')}&background=6B46C1&color=fff`}
                alt={post.author?.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="truncate max-w-[80px]">{post.author?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes?.length ?? 0}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views ?? 0}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.publishedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card animate-pulse overflow-hidden p-0">
      <div className="h-44" style={{ background: 'var(--color-border)' }} />
      <div className="p-4 space-y-2">
        <div className="h-4 rounded w-3/4" style={{ background: 'var(--color-border)' }} />
        <div className="h-3 rounded" style={{ background: 'var(--color-border)' }} />
        <div className="h-3 rounded w-2/3" style={{ background: 'var(--color-border)' }} />
        <div className="flex gap-1 mt-2">
          <div className="h-4 w-12 rounded-full" style={{ background: 'var(--color-border)' }} />
          <div className="h-4 w-12 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ meta, onPage }: { meta: PaginationMeta; onPage: (p: number) => void }) {
  if (meta.pages <= 1) return null;
  const pages = Array.from({ length: meta.pages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
            p === meta.current
              ? 'gradient-brand text-white shadow-sm scale-110'
              : 'btn-secondary'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, pages: 1, current: 1 });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [category, debouncedSearch]);

  // Fetch categories once
  useEffect(() => {
    api.get('/blogs/categories')
      .then(({ data }) => setCategories(data.categories ?? []))
      .catch(() => { /* non-critical */ });
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(LIMIT));
      if (category) params.set('category', category);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const { data } = await api.get(`/blogs?${params.toString()}`);
      setPosts(data.blogs ?? []);
      setMeta({ total: data.total ?? 0, pages: data.pages ?? 1, current: page });
    } catch (e: any) {
      setFetchError(e?.response?.data?.message || 'Failed to load blog posts.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch, page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />

      <div className="pt-[var(--navbar-height)]">
        {/* ── Hero Banner ─────────────────────────────────────────────── */}
        <div className="gradient-brand text-white py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-purple-200 text-xs font-bold uppercase tracking-widest mb-2">3ZF Community</p>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold mb-3">Blog & Articles</h1>
            <p className="text-purple-100 max-w-xl">
              Stories, updates, and insights from our community — read, share, and stay informed.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* ── Search + Filters ─────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search articles…"
                className="input w-full pl-9"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  !category ? 'gradient-brand text-white shadow-sm' : 'btn-secondary'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat === category ? '' : cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    category === cat ? 'gradient-brand text-white shadow-sm' : 'btn-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ── Error ────────────────────────────────────────────────── */}
          <AnimatePresence>
            {fetchError && !loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-6 text-sm text-red-700 dark:text-red-300"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {fetchError}
                </div>
                <button onClick={fetchPosts} className="flex items-center gap-1 font-medium underline whitespace-nowrap">
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Content ──────────────────────────────────────────────── */}
          {loading ? (
            <div className="space-y-6">
              {/* Featured skeleton */}
              <div className="card animate-pulse overflow-hidden p-0 rounded-2xl">
                <div className="flex flex-col lg:flex-row">
                  <div className="h-56 lg:h-64 lg:w-1/2" style={{ background: 'var(--color-border)' }} />
                  <div className="p-8 lg:w-1/2 space-y-3">
                    <div className="h-4 rounded w-1/4" style={{ background: 'var(--color-border)' }} />
                    <div className="h-6 rounded w-3/4" style={{ background: 'var(--color-border)' }} />
                    <div className="h-6 rounded w-2/3" style={{ background: 'var(--color-border)' }} />
                    <div className="h-3 rounded" style={{ background: 'var(--color-border)' }} />
                    <div className="h-3 rounded w-4/5" style={{ background: 'var(--color-border)' }} />
                  </div>
                </div>
              </div>
              {/* Grid skeletons */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="card text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
              <p className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>No articles found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {debouncedSearch || category ? 'Try adjusting your filters.' : 'Check back soon for new posts.'}
              </p>
              {(debouncedSearch || category) && (
                <button
                  onClick={() => { setSearch(''); setCategory(''); }}
                  className="btn-secondary mt-4 mx-auto"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Featured — only on page 1 with no search/filter active */}
              {page === 1 && !debouncedSearch && !category && featured && (
                <FeaturedCard post={featured} />
              )}

              {/* Grid */}
              {(page > 1 || debouncedSearch || category ? posts : rest).length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(page > 1 || debouncedSearch || category ? posts : rest).map((post, i) => (
                    <BlogCard key={post._id} post={post} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Pagination ───────────────────────────────────────────── */}
          {!loading && (
            <Pagination
              meta={meta}
              onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          )}

          {/* ── Count ────────────────────────────────────────────────── */}
          {!loading && meta.total > 0 && (
            <p className="text-center text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
              Showing {posts.length} of {meta.total} article{meta.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <MainFooter />
    </div>
  );
}
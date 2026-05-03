'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Eye, Tag, BookOpen, Calendar, User,
  ArrowLeft, MessageCircle, Send, Share2,
  Copy, Check, AlertCircle, ChevronRight,
} from 'lucide-react';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Comment {
  _id?:      string;
  user?:     string;
  name:      string;
  content:   string;
  createdAt: string;
}

interface Blog {
  _id:         string;
  title:       string;
  slug:        string;
  excerpt?:    string;
  content?:    string;
  coverImage?: { url: string; publicId: string };
  category:    string;
  tags?:       string[];
  author:      { _id: string; name: string; avatar?: string; bio?: string };
  likes:       string[];
  comments:    Comment[];
  views:       number;
  isPublished: boolean;
  publishedAt: string;
  language?:   string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date(iso));
  } catch { return iso; }
}

function readTime(content = '') {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ─── Share Button ─────────────────────────────────────────────────────────────

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all btn-secondary"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}

// ─── Like Button ──────────────────────────────────────────────────────────────

function LikeButton({
  slug, initialCount, initialLiked,
}: { slug: string; initialCount: number; initialLiked: boolean }) {
  const [liked, setLiked]   = useState(initialLiked);
  const [count, setCount]   = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/blogs/${slug}/like`);
      setLiked(data.liked);
      setCount(data.count);
    } catch {
      // not logged in — optimistic UI still OK to skip
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
        liked
          ? 'bg-red-50 text-red-500 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          : 'btn-secondary'
      }`}
    >
      <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
      {count}
    </button>
  );
}

// ─── Comment Form ─────────────────────────────────────────────────────────────

function CommentForm({ slug, onAdded }: { slug: string; onAdded: (c: Comment) => void }) {
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/blogs/${slug}/comment`, { content: text.trim() });
      const added = data.blog?.comments?.at(-1);
      if (added) onAdded(added);
      setText('');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to post comment. Please log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write a comment…"
        rows={3}
        className="input w-full resize-none"
      />
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold gradient-brand text-white transition disabled:opacity-50"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Send className="w-4 h-4" />
          }
          {loading ? 'Posting…' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

function CommentItem({ comment, index }: { comment: Comment; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex gap-3"
    >
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name)}&background=6B46C1&color=fff&size=40`}
        alt={comment.name}
        className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5"
      />
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            {comment.name}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {comment.content}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-72 rounded-2xl" style={{ background: 'var(--color-border)' }} />
      <div className="max-w-3xl mx-auto space-y-4 px-4">
        <div className="h-4 w-24 rounded" style={{ background: 'var(--color-border)' }} />
        <div className="h-8 rounded w-4/5" style={{ background: 'var(--color-border)' }} />
        <div className="h-8 rounded w-3/5" style={{ background: 'var(--color-border)' }} />
        <div className="flex gap-4 mt-4">
          <div className="h-4 w-28 rounded" style={{ background: 'var(--color-border)' }} />
          <div className="h-4 w-20 rounded" style={{ background: 'var(--color-border)' }} />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-3 rounded" style={{ background: 'var(--color-border)', width: i % 3 === 2 ? '75%' : '100%' }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BlogDetailPage() {
  const { slug }  = useParams<{ slug: string }>();
  const router    = useRouter();

  const [blog,     setBlog]     = useState<Blog | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');
    api.get(`/blogs/${slug}`)
      .then(({ data }) => {
        setBlog(data.blog);
        setComments(data.blog?.comments ?? []);
      })
      .catch(e => {
        setError(e?.response?.data?.message ?? 'Post not found.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
        <MainNavbar />
        <div className="pt-[var(--navbar-height)]"><Skeleton /></div>
        <MainFooter />
      </div>
    );
  }

  // ── Error / Not found ──────────────────────────────────────────────────────
  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-secondary)' }}>
        <MainNavbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-[var(--navbar-height)]">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {error || 'Post not found'}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/blog" className="btn-secondary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </div>
        </div>
        <MainFooter />
      </div>
    );
  }

  const mins = readTime(blog.content);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />

      <div className="pt-[var(--navbar-height)]">

        {/* ── Cover Image ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full h-64 md:h-96 overflow-hidden"
        >
          {blog.coverImage?.url ? (
            <img
              src={blog.coverImage.url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-brand flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-white opacity-20" />
            </div>
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Back button over image */}
          <div className="absolute top-4 left-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white font-medium backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>

          {/* Category badge on image */}
          <div className="absolute bottom-4 left-4">
            <span className="badge text-xs font-semibold px-3 py-1 text-white"
              style={{ background: 'var(--color-brand)' }}>
              {blog.category}
            </span>
          </div>
        </motion.div>

        {/* ── Article Content ───────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
            <Link href="/blog" className="hover:underline" style={{ color: 'var(--color-brand)' }}>Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{blog.category}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="truncate max-w-[200px]">{blog.title}</span>
          </nav>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-3xl md:text-4xl font-bold leading-tight mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            {blog.title}
          </motion.h1>

          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-4 text-sm mb-6 pb-6 border-b"
            style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
          >
            {/* Author */}
            <div className="flex items-center gap-2">
              <img
                src={blog.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author?.name || 'A')}&background=6B46C1&color=fff`}
                alt={blog.author?.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                {blog.author?.name}
              </span>
            </div>

            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(blog.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> {blog.views} views
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> {mins} min read
            </span>
          </motion.div>

          {/* Excerpt */}
          {blog.excerpt && (
            <p
              className="text-base leading-relaxed mb-6 font-medium italic"
              style={{ color: 'var(--color-text-secondary)', borderLeft: '3px solid var(--color-brand)', paddingLeft: '1rem' }}
            >
              {blog.excerpt}
            </p>
          )}

          {/* Body content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-sm md:prose-base max-w-none mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
            dangerouslySetInnerHTML={{ __html: blog.content ?? '' }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
              {blog.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
                  style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}
                >
                  <Tag className="w-3 h-3" /> {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Action bar: Like + Share */}
          <div className="flex items-center gap-3 mb-8 py-4 border-y" style={{ borderColor: 'var(--color-border)' }}>
            <LikeButton
              slug={blog.slug}
              initialCount={blog.likes?.length ?? 0}
              initialLiked={false}
            />
            <ShareButton title={blog.title} />
            <span className="ml-auto flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <MessageCircle className="w-4 h-4" /> {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Author card */}
          {blog.author?.bio && (
            <div
              className="flex gap-4 p-5 rounded-2xl mb-8"
              style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}
            >
              <img
                src={blog.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author.name)}&background=6B46C1&color=fff&size=80`}
                alt={blog.author.name}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-brand)' }}>
                  About the Author
                </p>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                  {blog.author.name}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {blog.author.bio}
                </p>
              </div>
            </div>
          )}

          {/* ── Comments ───────────────────────────────────────────────── */}
          <div>
            <h2 className="font-heading text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              Comments ({comments.length})
            </h2>

            {/* Comment form */}
            <div
              className="p-4 rounded-2xl mb-6"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                Leave a comment
              </p>
              <CommentForm
                slug={blog.slug}
                onAdded={c => setComments(prev => [...prev, c])}
              />
            </div>

            {/* Comment list */}
            <div className="space-y-5">
              <AnimatePresence>
                {comments.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                    No comments yet — be the first!
                  </p>
                ) : (
                  comments.map((c, i) => (
                    <CommentItem key={c._id ?? i} comment={c} index={i} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      <MainFooter />
    </div>
  );
}
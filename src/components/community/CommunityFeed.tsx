'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Plus, Heart, MessageSquare, Pin, Megaphone,
  CalendarDays, Zap, Loader2, X, Image as ImageIcon,
  ExternalLink, ChevronDown, ChevronUp, Send,
} from 'lucide-react';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Membership { _id: string; role: string }

const POST_TYPES = [
  { id: 'update',       label: 'আপডেট',  Icon: Zap,          color: '#7c3aed' },
  { id: 'announcement', label: 'ঘোষণা',  Icon: Megaphone,    color: '#ef4444' },
  { id: 'meeting',      label: 'মিটিং',  Icon: CalendarDays, color: '#06b6d4' },
  { id: 'event',        label: 'ইভেন্ট', Icon: CalendarDays, color: '#f59e0b' },
] as const;

type PostTypeId = typeof POST_TYPES[number]['id'];

const TYPE_FILTERS: { id: string; label: string }[] = [
  { id: '', label: 'সব' },
  ...POST_TYPES.map(({ id, label }) => ({ id, label })),
];

// ── PostCard ──────────────────────────────────────────────────────────────────
function PostCard({
  post,
  shopId,
  userId,
}: {
  post: any;
  shopId: string;
  userId: string | undefined; // FIX: allow undefined (user may not be logged in)
}) {
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText]   = useState('');
  const typeInfo = POST_TYPES.find((t) => t.id === post.type);

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/community-shop/${shopId}/posts/${post._id}/like`),
    onSuccess: () =>
      // FIX: invalidate both possible query key shapes
      qc.invalidateQueries({ queryKey: ['community-posts', shopId] }),
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) =>
      api.post(`/community-shop/${shopId}/posts/${post._id}/comment`, { text }),
    onSuccess: () => {
      setCommentText('');
      qc.invalidateQueries({ queryKey: ['community-posts', shopId] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'ব্যর্থ'),
  });

  // FIX: safe check — userId may be undefined when user is not logged in
  const isLiked = userId ? (post.likes as string[])?.includes(userId) : false;

  const submitComment = () => {
    const trimmed = commentText.trim();
    if (trimmed) commentMutation.mutate(trimmed);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
      {post.image?.url && (
        <div className="h-48 overflow-hidden">
          <img src={post.image.url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
            >
              {post.author?.profilePhoto?.url
                ? <img src={post.author.profilePhoto.url} alt="" className="w-full h-full object-cover" />
                : post.author?.name?.[0]
              }
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                {post.author?.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {format(new Date(post.createdAt), 'dd MMM yyyy · HH:mm')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {post.pinned && <Pin className="w-3.5 h-3.5 text-purple-500" />}
            {typeInfo && (
              <span
                className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: `${typeInfo.color}18`, color: typeInfo.color }}
              >
                <typeInfo.Icon className="w-3 h-3" />
                {typeInfo.label}
              </span>
            )}
          </div>
        </div>

        {post.title && (
          <h3 className="font-black text-base mb-1.5" style={{ color: 'var(--color-text)' }}>
            {post.title}
          </h3>
        )}

        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text)' }}>
          {post.content}
        </p>

        {post.meetingLink && (
          <a
            href={post.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg,#06b6d4,#3b82f6)' }}
          >
            <ExternalLink className="w-3.5 h-3.5" /> মিটিং লিঙ্ক
          </a>
        )}

        {post.meetingDate && (
          <p className="flex items-center gap-1.5 text-xs mt-2 text-cyan-600 font-semibold">
            <CalendarDays className="w-3.5 h-3.5" />
            {format(new Date(post.meetingDate), 'dd MMMM yyyy, hh:mm a')}
          </p>
        )}

        {/* Actions */}
        <div
          className="flex items-center gap-4 mt-4 pt-3 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className={`flex items-center gap-1.5 text-sm font-semibold transition ${isLiked ? 'text-red-500' : ''}`}
            style={{ color: isLiked ? undefined : 'var(--color-text-secondary)' }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            {(post.likes as string[])?.length ?? 0}
          </button>

          <button
            onClick={() => setShowComments((p) => !p)}
            className="flex items-center gap-1.5 text-sm font-semibold transition"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <MessageSquare className="w-4 h-4" />
            {post.comments?.length ?? 0}
            {showComments
              ? <ChevronUp className="w-3.5 h-3.5" />
              : <ChevronDown className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        {/* Comments */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2.5 overflow-hidden"
            >
              {post.comments?.map((c: any) => (
                <div key={c._id ?? c.createdAt} className="flex gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
                  >
                    {c.user?.name?.[0]}
                  </div>
                  <div
                    className="flex-1 min-w-0 px-3 py-2 rounded-2xl rounded-tl-sm text-sm break-words"
                    style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text)' }}
                  >
                    <span className="font-semibold text-xs text-purple-600">{c.user?.name}: </span>
                    {c.text}
                  </div>
                </div>
              ))}

              {/* Add comment */}
              <div className="flex gap-2 pt-1">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitComment(); }}
                  placeholder="মন্তব্য করুন..."
                  className="flex-1 px-3 py-2 rounded-2xl border outline-none text-sm"
                  style={{
                    borderColor: 'var(--color-border)',
                    background:  'var(--color-bg)',
                    color:       'var(--color-text)',
                  }}
                />
                <button
                  onClick={submitComment}
                  disabled={commentMutation.isPending || !commentText.trim()}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
                >
                  {commentMutation.isPending
                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                    : <Send className="w-4 h-4 text-white" />
                  }
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Create Post Modal ─────────────────────────────────────────────────────────
interface PostFormValues {
  type:        PostTypeId;
  title:       string;
  content:     string;
  meetingLink: string;
  meetingDate: string;
}

function CreatePostModal({
  shopId,
  membership,
  onClose,
}: {
  shopId: string;
  membership: Membership;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const isAdmin = membership.role === 'admin' || membership.role === 'moderator';

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PostFormValues>({
    defaultValues: { type: 'update', title: '', content: '', meetingLink: '', meetingDate: '' },
  });

  const postType = watch('type');

  const mutation = useMutation({
    mutationFn: (data: PostFormValues) => {
      const fd = new FormData();
      (Object.keys(data) as Array<keyof PostFormValues>).forEach((k) => {
        if (data[k]) fd.append(k, data[k]);
      });
      if (imageFile) fd.append('image', imageFile);
      return api.post(`/community-shop/${shopId}/posts`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-posts', shopId] });
      toast.success('পোস্ট হয়েছে!');
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'ব্যর্থ'),
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--color-bg)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h3 className="font-black" style={{ color: 'var(--color-text)' }}>নতুন পোস্ট</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[70vh] space-y-4">
          {/* Type selector */}
          <div className="flex flex-wrap gap-2">
            {POST_TYPES.filter((t) => t.id !== 'announcement' || isAdmin).map(({ id, label, Icon, color }) => (
              <label
                key={id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 cursor-pointer text-xs font-semibold transition ${
                  postType === id ? 'border-purple-500' : 'border-[var(--color-border)]'
                }`}
                style={{ color: postType === id ? color : 'var(--color-text-secondary)' }}
              >
                <input {...register('type')} type="radio" value={id} hidden />
                <Icon className="w-3.5 h-3.5" />
                {label}
              </label>
            ))}
          </div>

          <input
            {...register('title')}
            placeholder="শিরোনাম (ঐচ্ছিক)"
            className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          />

          <textarea
            {...register('content', { required: true })}
            rows={4}
            placeholder="কী জানাতে চান?"
            className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm resize-none"
            style={{
              borderColor: errors.content ? '#f43f5e' : 'var(--color-border)',
              background:  'var(--color-bg)',
              color:       'var(--color-text)',
            }}
          />

          {(postType === 'meeting' || postType === 'event') && (
            <>
              <input
                {...register('meetingLink')}
                placeholder="মিটিং লিঙ্ক (Google Meet, Zoom...)"
                className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
              />
              <input
                {...register('meetingDate')}
                type="datetime-local"
                className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
              />
            </>
          )}

          {/* Image upload */}
          <label
            className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 border-dashed transition hover:border-purple-400"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <ImageIcon className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {imagePreview ? 'ছবি পরিবর্তন করুন' : 'ছবি যুক্ত করুন (ঐচ্ছিক)'}
            </span>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
              }}
            />
          </label>

          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="" className="w-full h-40 object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(''); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit((d) => mutation.mutate(d))}
            disabled={mutation.isPending}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            পোস্ট করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Feed ─────────────────────────────────────────────────────────────────
export default function CommunityFeed({
  shopId,
  membership,
}: {
  shopId: string;
  membership: Membership;
}) {
  const { user }     = useAuthStore();
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['community-posts', shopId, typeFilter],
    queryFn:  () =>
      api
        .get(`/community-shop/${shopId}/posts`, {
          params: { type: typeFilter || undefined },
        })
        .then((r) => r.data as { posts: any[] }),
    enabled: !!shopId,
  });

  const posts = data?.posts ?? [];

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto">
      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {TYPE_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTypeFilter(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex-shrink-0 ${
                typeFilter === id ? 'bg-purple-600 text-white' : 'hover:bg-[var(--color-bg-hover)]'
              }`}
              style={{ color: typeFilter === id ? undefined : 'var(--color-text-secondary)' }}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white flex-shrink-0 hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
        >
          <Plus className="w-3.5 h-3.5" /> পোস্ট
        </button>
      </div>

      {/* Post list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post: any) => (
            // FIX: pass user?._id safely (undefined if not logged in)
            <PostCard key={post._id} post={post} shopId={shopId} userId={user?._id} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>কোনো পোস্ট নেই</p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>প্রথম পোস্ট করুন!</p>
        </div>
      )}

      {showCreate && (
        <CreatePostModal shopId={shopId} membership={membership} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
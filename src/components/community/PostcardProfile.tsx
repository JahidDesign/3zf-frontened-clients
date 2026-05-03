'use client';
import { useState } from 'react';
import { Heart, MessageCircle, Share2, Trash2, MoreHorizontal, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

const avatarSrc = (name: string, avatar?: string) =>
  avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1877F2&color=fff&size=200`;

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d`;
  return new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

interface PostCardProps {
  post:     any;
  onDelete?: (id: string) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user: me } = useAuthStore();

  const [liked,        setLiked]        = useState(post.likes?.some((l: any) => (l._id ?? l) === me?._id));
  const [likeCount,    setLikeCount]    = useState(post.likes?.length || 0);
  const [comments,     setComments]     = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [showMenu,     setShowMenu]     = useState(false);

  const isOwner = me?._id === (post.author._id ?? post.author);

  const handleLike = async () => {
    if (!me) return toast.error('Please log in to like posts');
    setLiked((l: boolean) => !l);
    setLikeCount((c: number) => liked ? c - 1 : c + 1);
    try {
      await api.post(`/posts/${post._id}/like`);
    } catch {
      setLiked((l: boolean) => !l);
      setLikeCount((c: number) => liked ? c + 1 : c - 1);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !me) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comment`, { content: commentInput });
      setComments((c: any[]) => [...c, data.comment]);
      setCommentInput('');
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete?.(post._id);
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete post'); }
    setShowMenu(false);
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[#242526]">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <a href={`/community/profile/${post.author.username}`} className="flex items-center gap-3 group">
          <img src={avatarSrc(post.author.name, post.author.avatar)} alt={post.author.name}
            className="h-10 w-10 rounded-full object-cover transition-opacity group-hover:opacity-90" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#1877F2]">
              {post.author.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.createdAt)}</p>
          </div>
        </a>
        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu(s => !s)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.1 }}
                  className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-xl bg-white shadow-lg dark:bg-[#3a3b3c]">
                  <button onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" /> Delete Post
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 pb-3 text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Media */}
      {post.media?.length > 0 && (
        <div className={`grid gap-0.5 ${post.media.length === 1 ? 'grid-cols-1' : post.media.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {post.media.slice(0, 4).map((m: any, i: number) => (
            <div key={i} className={`relative overflow-hidden bg-gray-100 dark:bg-[#3a3b3c] ${
              post.media.length === 1 ? 'aspect-video' :
              post.media.length === 3 && i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'
            } ${i === 3 && post.media.length > 4 ? 'relative' : ''}`}>
              {m.type === 'video'
                ? <video src={m.url} controls className="h-full w-full object-cover" />
                : <img src={m.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              }
              {i === 3 && post.media.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-2xl font-bold text-white">+{post.media.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-100 dark:border-gray-700">
        <div className="flex px-2">
          <button onClick={handleLike}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors rounded-lg m-1 ${
              liked ? 'text-[#1877F2] hover:bg-[#e7f0fd] dark:hover:bg-[#263651]' : 'text-gray-600 hover:bg-[#f0f2f5] dark:text-gray-400 dark:hover:bg-[#3a3b3c]'
            }`}>
            <Heart className={`h-4 w-4 ${liked ? 'fill-[#1877F2]' : ''}`} />
            {likeCount > 0 && <span>{likeCount}</span>}
            <span className="hidden sm:inline">Like</span>
          </button>
          <button onClick={() => setShowComments(s => !s)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg m-1 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-[#f0f2f5] dark:text-gray-400 dark:hover:bg-[#3a3b3c]">
            <MessageCircle className="h-4 w-4" />
            {comments.length > 0 && <span>{comments.length}</span>}
            <span className="hidden sm:inline">Comment</span>
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg m-1 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-[#f0f2f5] dark:text-gray-400 dark:hover:bg-[#3a3b3c]">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-700">
            <div className="p-4 space-y-3">
              {comments.map((c: any) => (
                <div key={c._id} className="flex gap-2">
                  <img src={avatarSrc(c.user?.name || 'U', c.user?.avatar)}
                    alt="" className="h-7 w-7 flex-shrink-0 rounded-full object-cover" />
                  <div className="rounded-2xl bg-[#f0f2f5] px-3 py-2 dark:bg-[#3a3b3c]">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{c.user?.name}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{c.content}</p>
                  </div>
                </div>
              ))}
              {me && (
                <form onSubmit={handleComment} className="flex gap-2">
                  <img src={avatarSrc(me.name, me.avatar)}
                    alt="" className="h-7 w-7 flex-shrink-0 rounded-full object-cover" />
                  <div className="flex flex-1 items-center gap-2 rounded-full bg-[#f0f2f5] px-4 py-1.5 dark:bg-[#3a3b3c]">
                    <input value={commentInput} onChange={e => setCommentInput(e.target.value)}
                      placeholder="Write a comment…"
                      className="flex-1 bg-transparent text-xs text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100" />
                    <button type="submit" disabled={!commentInput.trim() || submitting}
                      className="flex-shrink-0 text-[#1877F2] disabled:opacity-40 transition-opacity hover:opacity-80">
                      {submitting
                        ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1877F2] border-t-transparent" />
                        : <Send className="h-3.5 w-3.5" />
                      }
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
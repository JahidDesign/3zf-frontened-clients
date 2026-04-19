'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Globe, Users, Lock, BadgeCheck, Trash2, Edit3, Bookmark, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface PostCardProps {
  post: any;
  onDelete?: (id: string) => void;
  onUpdate?: (post: any) => void;
}

export default function PostCard({ post, onDelete, onUpdate }: PostCardProps) {
  const { user } = useAuthStore();
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLiked = user ? likes.includes(user._id) : false;
  const isOwner = user?._id === post.author?._id;

  const toggleLike = async () => {
    if (!user) return;
    const prev = [...likes];
    if (isLiked) setLikes(likes.filter(id => id !== user._id));
    else setLikes([...likes, user._id]);
    try {
      await api.post(`/posts/${post._id}/like`);
    } catch {
      setLikes(prev);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !user) return;
    try {
      const { data } = await api.post(`/posts/${post._id}/comment`, { text: commentText });
      setComments(prev => [...prev, { ...data.comment, user: { _id: user._id, name: user.name, username: user.username, avatar: user.avatar } }]);
      setCommentText('');
    } catch { toast.error('Failed to comment'); }
  };

  const deletePost = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete?.(post._id);
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const audienceIcon = { public: Globe, friends: Users, private: Lock }[post.audience as string] || Globe;
  const AudienceIcon = audienceIcon;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card hover:shadow-card-hover transition-shadow duration-200">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Link href={`/community/profile/${post.author?.username}`} className="flex items-center gap-2.5 group">
          <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=6B46C1&color=fff`}
            alt={post.author?.name} className="w-10 h-10 avatar" />
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold group-hover:text-[var(--color-brand)] transition-colors"
                style={{ color: 'var(--color-text)' }}>{post.author?.name}</p>
              {post.author?.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
              {post.feeling && <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>is feeling {post.feeling}</span>}
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              <span>·</span>
              <AudienceIcon className="w-3 h-3" />
              {post.location && <><span>·</span><span>📍 {post.location}</span></>}
            </div>
          </div>
        </Link>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost w-8 h-8 flex items-center justify-center p-0 rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-9 w-44 card shadow-modal py-1 z-20">
                <button className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[var(--color-bg-hover)] rounded-lg mx-0.5 transition-colors"
                  style={{ color: 'var(--color-text)' }}>
                  <Bookmark className="w-4 h-4" /> Save post
                </button>
                {isOwner && (
                  <>
                    <button className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[var(--color-bg-hover)] rounded-lg mx-0.5 transition-colors"
                      style={{ color: 'var(--color-text)' }}>
                      <Edit3 className="w-4 h-4" /> Edit post
                    </button>
                    <button onClick={deletePost}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mx-0.5 transition-colors text-red-500">
                      <Trash2 className="w-4 h-4" /> Delete post
                    </button>
                  </>
                )}
                {!isOwner && (
                  <button className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[var(--color-bg-hover)] rounded-lg mx-0.5 transition-colors"
                    style={{ color: 'var(--color-text)' }}>
                    <Flag className="w-4 h-4" /> Report
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
          {post.content}
        </p>
      )}

      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.hashtags.map((tag: string) => (
            <Link key={tag} href={`/community/explore?tag=${tag}`}
              className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: 'var(--color-brand)', background: 'var(--color-bg-tertiary)' }}>
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Media */}
      {post.media?.length > 0 && (
        <div className={`rounded-xl overflow-hidden mb-3 ${post.media.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
          {post.media.map((m: any, i: number) => (
            i < 4 && (
              <div key={i} className={`relative overflow-hidden bg-black ${post.media.length === 1 ? 'rounded-xl' : ''} ${post.media.length === 3 && i === 0 ? 'col-span-2' : ''}`}
                style={{ aspectRatio: post.media.length === 1 ? '16/9' : '1/1' }}>
                {m.type === 'video' ? (
                  <video src={m.url} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={m.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
                )}
                {i === 3 && post.media.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold">
                    +{post.media.length - 4}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {/* Shared post */}
      {post.sharedFrom && (
        <div className="rounded-xl border p-3 mb-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}>
          <div className="flex items-center gap-2 mb-2">
            <img src={post.sharedFrom?.author?.avatar || `https://ui-avatars.com/api/?name=U&background=6B46C1&color=fff`}
              alt="" className="w-7 h-7 avatar" />
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{post.sharedFrom?.author?.name}</p>
          </div>
          {post.sharedFrom?.content && <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{post.sharedFrom.content}</p>}
        </div>
      )}

      {/* Stats */}
      {(likes.length > 0 || comments.length > 0 || post.shares?.length > 0) && (
        <div className="flex items-center justify-between py-2 border-t border-b text-xs mb-2" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          {likes.length > 0 && (
            <span className="flex items-center gap-1 cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>
              👍 {likes.length}
            </span>
          )}
          <div className="flex gap-3 ml-auto">
            {comments.length > 0 && <span className="cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>{comments.length} comments</span>}
            {post.shares?.length > 0 && <span>{post.shares.length} shares</span>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 -mx-1">
        <div className="relative flex-1">
          <button onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}
            onClick={toggleLike}
            className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-sm font-medium transition-colors
              ${isLiked ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[var(--color-brand)]' : ''}`} />
            Like
          </button>
          <AnimatePresence>
            {showReactions && (
              <motion.div initial={{ opacity: 0, scale: 0.8, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 5 }}
                className="absolute bottom-10 left-0 card shadow-modal px-2 py-1.5 flex gap-1 z-10"
                onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                {REACTIONS.map((r) => (
                  <button key={r} onClick={toggleLike}
                    className="text-xl hover:scale-150 transition-transform w-8 h-8 flex items-center justify-center">{r}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
          <MessageCircle className="w-4 h-4" /> Comment
        </button>

        <button className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="pt-3 border-t space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              {comments.slice(0, 5).map((c: any) => (
                <div key={c._id} className="flex gap-2.5">
                  <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.name || 'U')}&background=6B46C1&color=fff`}
                    alt="" className="w-8 h-8 avatar flex-shrink-0" />
                  <div>
                    <div className="inline-block px-3 py-2 rounded-2xl rounded-tl-sm text-sm" style={{ background: 'var(--color-bg-secondary)' }}>
                      <p className="font-semibold text-xs mb-0.5" style={{ color: 'var(--color-text)' }}>{c.user?.name}</p>
                      <p style={{ color: 'var(--color-text)' }}>{c.text}</p>
                    </div>
                    <div className="flex gap-3 mt-1 ml-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <button className="hover:text-[var(--color-brand)] font-medium">Like</button>
                      <button className="hover:text-[var(--color-brand)] font-medium">Reply</button>
                      <span>{formatDistanceToNow(new Date(c.createdAt || Date.now()), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Comment input */}
              <div className="flex gap-2.5 pt-1">
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6B46C1&color=fff`}
                  alt="" className="w-8 h-8 avatar flex-shrink-0" />
                <div className="flex-1 relative">
                  <input value={commentText} onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submitComment())}
                    placeholder="Write a comment..." className="rounded-full py-2 pr-10 text-sm"
                    style={{ paddingLeft: '14px', border: '1.5px solid var(--color-border)', background: 'var(--color-bg-secondary)' }} />
                  <button onClick={submitComment} disabled={!commentText.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg disabled:opacity-30">
                    🚀
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

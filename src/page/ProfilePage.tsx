"use client";

import React, {
  useState,
  useRef,
  useEffect,
  FormEvent,
  ChangeEvent,
  createContext,
  useContext,
} from "react";
import {
  Camera,
  UserPlus,
  UserCheck,
  MessageCircle,
  MoreHorizontal,
  BadgeCheck,
  Link2,
  Calendar,
  MapPin,
  Briefcase,
  Grid3x3,
  Users,
  BookMarked,
  ThumbsUp,
  Heart,
  Share2,
  Bookmark,
  Send,
  Loader2,
  X,
  ImageIcon,
  Video,
  Smile,
  Search,
  UserMinus,
  Check,
  Phone,
  Mail,
} from "lucide-react";
import Swal from "sweetalert2";

// ─── APIs ─────────────────────────────────────────────────────────────────────

const CUSTOMERS_API = "https://threezf-backend.onrender.com/customers";
const POST_API      = "https://threezf-backend.onrender.com/blogpost";
const COMMENTS_API  = "https://threezf-backend.onrender.com/comments";
const FRIENDS_API   = "https://threezf-backend.onrender.com/frineds"; // note: matches your spelling

// ─── Logged-in user (swap with your auth) ────────────────────────────────────

const LOGGED_IN_EMAIL = "jhadam904@gmail.com";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
  _id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  provider?: string;
  role?: string;
  createdAt: string;
  bio?: string;
  location?: string;
  work?: string;
}

interface Friend {
  _id: string;
  userId: string;
  friendId: string;
  status: "pending" | "accepted" | "blocked";
  createdAt: string;
  friend?: Customer; // populated
}

interface Post {
  _id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  image?: string;
  video?: string;
  likes?: number;
  createdAt: string;
  comments?: number;
}

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: string;
  likes?: number;
  replies?: Comment[];
}

type ReactionKey = "like" | "love" | "haha" | "wow" | "sad" | "angry";
type ProfileTab  = "posts" | "friends" | "photos" | "about";

// ─── Reactions ────────────────────────────────────────────────────────────────

const REACTIONS = [
  { key: "like"  as ReactionKey, emoji: "👍", label: "Like",  color: "text-blue-500",   bg: "bg-blue-50"   },
  { key: "love"  as ReactionKey, emoji: "❤️", label: "Love",  color: "text-rose-500",   bg: "bg-rose-50"   },
  { key: "haha"  as ReactionKey, emoji: "😂", label: "Haha",  color: "text-amber-500",  bg: "bg-amber-50"  },
  { key: "wow"   as ReactionKey, emoji: "😮", label: "Wow",   color: "text-amber-500",  bg: "bg-amber-50"  },
  { key: "sad"   as ReactionKey, emoji: "😢", label: "Sad",   color: "text-sky-400",    bg: "bg-sky-50"    },
  { key: "angry" as ReactionKey, emoji: "😡", label: "Angry", color: "text-orange-600", bg: "bg-orange-50" },
];

// ─── Gradients ────────────────────────────────────────────────────────────────

const GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-cyan-400 to-blue-500",
];

const COVERS = [
  "from-violet-600 via-fuchsia-500 to-pink-500",
  "from-sky-500 via-indigo-600 to-violet-700",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-amber-500 via-orange-500 to-rose-600",
];

// ─── Context ──────────────────────────────────────────────────────────────────

const UserCtx = createContext<Customer | null>(null);
const useMe   = () => useContext(UserCtx);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}
function gradientFor(seed: string) {
  return GRADIENTS[(seed?.charCodeAt(0) ?? 0) % GRADIENTS.length];
}
function coverFor(uid: string) {
  return COVERS[(uid?.charCodeAt(0) ?? 0) % COVERS.length];
}
function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60)    return "just now";
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;
}

// ─── UserAvatar ───────────────────────────────────────────────────────────────

function UserAvatar({
  user, size = "md", rounded = "full", className = "",
}: {
  user: { name: string; photo?: string; uid?: string };
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  rounded?: "full" | "xl";
  className?: string;
}) {
  const [err, setErr] = useState(false);
  const sz = { xs: "w-7 h-7 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl", "2xl": "w-24 h-24 text-3xl" }[size];
  const r  = rounded === "xl" ? "rounded-xl" : "rounded-full";
  const g  = gradientFor(user.uid ?? user.name);

  if (user.photo && !err) {
    return <img src={user.photo} alt={user.name} onError={() => setErr(true)}
      className={`${sz} ${r} object-cover flex-shrink-0 ${className}`} />;
  }
  return (
    <div className={`${sz} ${r} bg-gradient-to-br ${g} flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
      {initials(user.name)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REACTION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

function ReactionPicker({ onSelect, onClose }: { onSelect: (k: ReactionKey) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-full shadow-2xl border border-slate-100 px-2 py-1.5 flex items-center gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
      onMouseLeave={onClose}>
      {REACTIONS.map(r => (
        <button key={r.key} title={r.label} onClick={() => onSelect(r.key)}
          className="relative flex items-center justify-center w-10 h-10 rounded-full hover:scale-125 hover:-translate-y-2 transition-all duration-150 text-2xl leading-none group">
          <span className="select-none">{r.emoji}</span>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-semibold rounded-full opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            {r.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function ReactionButton({ postId, initialLikes = 0 }: { postId: string; initialLikes?: number }) {
  const [myReaction, setMyReaction] = useState<ReactionKey | null>(null);
  const [counts, setCounts]         = useState<Record<ReactionKey, number>>({ like: initialLikes, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
  const [showPicker, setShowPicker] = useState(false);
  const hoverT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdT  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrap   = useRef<HTMLDivElement>(null);
  const activeR = myReaction ? REACTIONS.find(r => r.key === myReaction)! : null;

  const select = (key: ReactionKey) => {
    setShowPicker(false);
    if (myReaction === key) { setCounts(p => ({ ...p, [key]: Math.max(0, p[key] - 1) })); setMyReaction(null); }
    else {
      if (myReaction) setCounts(p => ({ ...p, [myReaction]: Math.max(0, p[myReaction] - 1) }));
      setCounts(p => ({ ...p, [key]: p[key] + 1 }));
      setMyReaction(key);
    }
  };

  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setShowPicker(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={wrap} className="relative flex-1">
      <button
        onClick={() => { if (showPicker) { setShowPicker(false); return; } select("like"); }}
        onMouseEnter={() => { hoverT.current = setTimeout(() => setShowPicker(true), 400); }}
        onMouseLeave={() => { if (hoverT.current) clearTimeout(hoverT.current); }}
        onTouchStart={() => { holdT.current = setTimeout(() => setShowPicker(true), 500); }}
        onTouchEnd={() => { if (holdT.current) clearTimeout(holdT.current); }}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none
          ${activeR ? `${activeR.bg} ${activeR.color}` : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
      >
        {activeR ? <span className="text-lg leading-none">{activeR.emoji}</span> : <ThumbsUp className="w-4 h-4" strokeWidth={1.8} />}
        <span>{activeR ? activeR.label : "Like"}</span>
      </button>
      {showPicker && <ReactionPicker onSelect={select} onClose={() => setShowPicker(false)} />}
    </div>
  );
}

function ReactionBar({ reactions = {}, commentCount = 0, onCommentClick }: {
  reactions?: Partial<Record<ReactionKey, number>>;
  commentCount?: number;
  onCommentClick?: () => void;
}) {
  const top = (Object.entries(reactions) as [ReactionKey, number][])
    .filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).slice(0, 3)
    .map(([k]) => REACTIONS.find(r => r.key === k)!.emoji);
  if (top.length === 0) top.push("👍");
  const total = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-50">
      <span className="flex items-center gap-1.5">
        <span className="flex -space-x-1">
          {top.map((e, i) => (
            <span key={i} className="w-5 h-5 bg-white rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[12px] leading-none">{e}</span>
          ))}
        </span>
        {total > 0 && <span>{total.toLocaleString()}</span>}
      </span>
      {commentCount > 0 && (
        <button onClick={onCommentClick} className="hover:underline hover:text-slate-600 transition-colors">
          {commentCount} comments
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMENT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const me = useMe();
  const [liked, setLiked]         = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes ?? 0);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");

  return (
    <div className={`flex gap-2.5 ${depth > 0 ? "ml-9 mt-2" : ""}`}>
      <UserAvatar user={{ name: comment.userName, photo: comment.userPhoto, uid: comment.userId }} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-3.5 py-2.5 inline-block max-w-full">
          <p className="text-xs font-bold text-slate-800">{comment.userName}</p>
          <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{comment.text}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-[10px] text-slate-400">{timeAgo(comment.createdAt)}</span>
          <button onClick={() => { setLiked(p => !p); setLikeCount(p => liked ? p - 1 : p + 1); }}
            className={`text-[11px] font-bold transition-colors ${liked ? "text-violet-600" : "text-slate-400 hover:text-slate-600"}`}>
            Like{likeCount > 0 && <span className="font-normal"> · {likeCount}</span>}
          </button>
          {depth === 0 && (
            <button onClick={() => setShowReply(p => !p)} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Reply</button>
          )}
        </div>
        {showReply && (
          <div className="flex gap-2 mt-2">
            <UserAvatar user={me ?? { name: "Me" }} size="xs" />
            <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-full px-3 py-1.5 border border-slate-200 focus-within:border-violet-300 focus-within:bg-white transition-all">
              <input autoFocus value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.userName}…`}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none" />
              <button disabled={!replyText.trim()} className="text-violet-500 hover:text-violet-700 disabled:opacity-30 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        {comment.replies?.map(r => <CommentItem key={r._id} comment={r} depth={depth + 1} />)}
      </div>
    </div>
  );
}

function CommentsSection({ postId }: { postId: string }) {
  const me = useMe();
  const [comments, setComments]       = useState<Comment[]>([]);
  const [text, setText]               = useState("");
  const [loading, setLoading]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [open, setOpen]               = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${COMMENTS_API}?postId=${postId}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : data.comments ?? []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const openComments = () => {
    if (!open) { setOpen(true); fetchComments(); setTimeout(() => inputRef.current?.focus(), 100); }
    else inputRef.current?.focus();
  };

  const submitComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(COMMENTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: me?._id ?? "demo", userName: me?.name ?? "Demo User", userPhoto: me?.photo ?? "", text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments(p => [{ _id: data._id ?? Date.now().toString(), userId: me?._id ?? "demo", userName: me?.name ?? "Demo User", userPhoto: me?.photo ?? "", text, createdAt: new Date().toISOString(), likes: 0 }, ...p]);
      setText("");
    } catch (err: unknown) {
  const message = err instanceof Error ? err.message : "Something went wrong";

  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonColor: "#7c3aed",
  });
} finally {
  setLoading(false);
}
  };

  return (
    <div>
      {open && (
        <div className="px-4 pt-3 pb-4 space-y-3 border-t border-slate-50">
          <form onSubmit={submitComment} className="flex items-center gap-2.5">
            <UserAvatar user={me ?? { name: "Me" }} size="sm" />
            <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2 border border-slate-200 focus-within:border-violet-300 focus-within:bg-white transition-all">
              <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
                placeholder={`Comment as ${me?.name ?? "you"}…`}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none" />
              <button type="submit" disabled={submitting || !text.trim()}
                className="text-violet-500 hover:text-violet-700 disabled:opacity-30 transition-colors flex-shrink-0">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
          {loading ? (
            <div className="flex items-center justify-center py-3 gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Loading…</span>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-2">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {comments.map(c => <CommentItem key={c._id} comment={c} />)}
            </div>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="px-3 py-1 border-t border-slate-50 flex items-center">
        <ReactionButton postId={postId} />
        <button onClick={openComments}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition-all group">
          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.8} />
          Comment
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-all group">
          <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.8} />
          Share
        </button>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-violet-500 transition-colors">
          <Bookmark className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST CARD
// ═══════════════════════════════════════════════════════════════════════════════

function PostCard({ post }: { post: Post }) {
  return (
    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <UserAvatar user={{ name: post.userName, photo: post.userPhoto, uid: post.userId }} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-900">{post.userName}</p>
          <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p>
        </div>
        <button className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      {post.text && (
        <div className="px-4 pb-3">
          <p className="text-sm text-slate-700 leading-relaxed">{post.text}</p>
        </div>
      )}

      {/* Media */}
      {post.image && (
        <div className="overflow-hidden border-y border-slate-50">
          <img src={post.image} alt="post" className="w-full max-h-96 object-cover hover:scale-[1.02] transition-transform duration-300" />
        </div>
      )}
      {post.video && (
        <div className="overflow-hidden border-y border-slate-50">
          <video src={post.video} controls className="w-full max-h-96" />
        </div>
      )}

      {/* Reactions bar */}
      <ReactionBar reactions={{ like: post.likes ?? 0 }} commentCount={post.comments ?? 0} />

      {/* Actions */}
      <CommentsSection postId={post._id} />
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSE BOX
// ═══════════════════════════════════════════════════════════════════════════════

function ComposeBox({ onPosted }: { onPosted?: () => void }) {
  const me = useMe();
  const [text, setText]               = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [image, setImage]             = useState<File | null>(null);
  const [video, setVideo]             = useState<File | null>(null);
  const [loading, setLoading]         = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  const handleImg = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setImage(f); setImagePreview(URL.createObjectURL(f)); setVideo(null); setVideoPreview(null);
  };
  const handleVid = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setVideo(f); setVideoPreview(URL.createObjectURL(f)); setImage(null); setImagePreview(null);
  };
  const clearMedia = () => { setImage(null); setVideo(null); setImagePreview(null); setVideoPreview(null); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image && !video)
      return Swal.fire({ icon: "warning", title: "Empty post", confirmButtonColor: "#7c3aed" });
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("userId",    me?._id   ?? "demo");
      fd.append("userName",  me?.name  ?? "Demo");
      fd.append("userPhoto", me?.photo ?? "");
      fd.append("text", text);
      if (image) fd.append("image", image);
      if (video) fd.append("video", video);
      const res  = await fetch(POST_API, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      Swal.fire({ icon: "success", title: "Posted!", confirmButtonColor: "#7c3aed" });
      setText(""); clearMedia(); onPosted?.();
    } catch (err: unknown) {
  const message = err instanceof Error ? err.message : "Something went wrong";

  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    confirmButtonColor: "#7c3aed",
  });
} finally {
  setLoading(false);
}
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex gap-3 p-4 pb-3">
        <UserAvatar user={me ?? { name: "Me" }} size="md" />
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder={`What's on your mind, ${me?.name.split(" ")[0] ?? "friend"}?`}
          rows={text.length > 80 ? 3 : 2}
          className="flex-1 resize-none bg-slate-50 hover:bg-slate-100 focus:bg-slate-100 rounded-2xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors leading-relaxed" />
      </div>

      {(imagePreview || videoPreview) && (
        <div className="mx-4 mb-3 relative rounded-xl overflow-hidden border border-slate-100">
          {imagePreview && <img src={imagePreview} alt="" className="w-full max-h-64 object-cover" />}
          {videoPreview && <video src={videoPreview} controls className="w-full max-h-64" />}
          <button type="button" onClick={clearMedia}
            className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="px-4 pb-4 flex items-center justify-between border-t border-slate-50 pt-3">
        <div className="flex gap-1">
          <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
          <input ref={vidRef} type="file" accept="video/*" onChange={handleVid} className="hidden" />
          {[
            { icon: ImageIcon, label: "Photo",   color: "hover:text-emerald-600 hover:bg-emerald-50", onClick: () => imgRef.current?.click() },
            { icon: Video,     label: "Video",   color: "hover:text-rose-500 hover:bg-rose-50",       onClick: () => vidRef.current?.click() },
            { icon: Smile,     label: "Feeling", color: "hover:text-amber-500 hover:bg-amber-50",     onClick: undefined },
          ].map(({ icon: Icon, label, color, onClick }) => (
            <button key={label} type="button" onClick={onClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 ${color} transition-all`}>
              <Icon className="w-4 h-4" strokeWidth={1.8} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <button type="submit" disabled={loading || (!text.trim() && !image && !video)}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm shadow-violet-200 transition-all hover:scale-105 active:scale-100 flex items-center gap-2">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {loading ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FRIENDS LIST
// ═══════════════════════════════════════════════════════════════════════════════

function FriendCard({ customer }: { customer: Customer }) {
  const [status, setStatus] = useState<"none" | "pending" | "friends">("friends");

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* Mini cover */}
      <div className={`h-16 bg-gradient-to-br ${coverFor(customer.uid)}`} />
      <div className="px-3 pb-3">
        <div className="-mt-7 mb-2 flex items-end justify-between">
          <UserAvatar user={customer} size="lg" className="ring-3 ring-white shadow-md" />
          <button
            onClick={() => setStatus(s => s === "friends" ? "none" : "friends")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all mb-1 ${
              status === "friends"
                ? "bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500"
                : "bg-violet-600 hover:bg-violet-700 text-white"
            }`}
          >
            {status === "friends" ? <><UserCheck className="w-3.5 h-3.5" /> Friends</> : <><UserPlus className="w-3.5 h-3.5" /> Add</>}
          </button>
        </div>
        <p className="text-sm font-bold text-slate-900 truncate">{customer.name}</p>
        <p className="text-xs text-slate-400 truncate">{customer.email}</p>
        <div className="flex gap-1.5 mt-2.5">
          <button className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-xs font-semibold transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> Message
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FriendsList({ profileUserId }: { profileUserId: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");

 useEffect(() => {
  if (!profileUserId) return;

  const load = async () => {
    try {
      const [allCustomers, _friends]: [Customer[], unknown] =
        await Promise.all([
          fetch(CUSTOMERS_API).then(r => r.json()),
          fetch(`${FRIENDS_API}?userId=${profileUserId}`)
            .then(r => r.json())
            .catch(() => []),
        ]);

      setCustomers(
        allCustomers.filter(c => c._id !== profileUserId)
      );
    } finally {
      setLoading(false);
    }
  };

  load();
}, [profileUserId]);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <Sk className="h-16 rounded-none" />
          <div className="p-3 space-y-2"><Sk className="h-10 w-10 rounded-full" /><Sk className="h-4 w-24" /><Sk className="h-3 w-32" /></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search friends…"
          className="w-full bg-slate-100 rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-slate-200 transition-colors" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No friends found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map(c => <FriendCard key={c._id} customer={c} />)}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// POSTS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function PostsTab({ profile }: { profile: Customer }) {
  const me = useMe();
  const [posts, setPosts]     = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    setLoading(true);
    fetch(`${POST_API}?userId=${profile._id}`)
      .then(r => r.json())
      .then((data: Post[]) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
  if (!profile._id) return;

  const load = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/posts?userId=${profile._id}`);
      const data = await res.json();

      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  load();
}, [profile._id]);

  return (
    <div className="space-y-4">
      {me?._id === profile._id && <ComposeBox onPosted={fetchPosts} />}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <div className="flex gap-3"><Sk className="w-10 h-10 rounded-full" /><div className="flex-1 space-y-2"><Sk className="h-4 w-32" /><Sk className="h-3 w-20" /></div></div>
              <Sk className="h-4 w-full" /><Sk className="h-4 w-3/4" /><Sk className="h-40 w-full" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Grid3x3 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
          <p className="text-sm font-semibold text-slate-500">No posts yet</p>
          <p className="text-xs text-slate-400 mt-1">Posts will appear here</p>
        </div>
      ) : (
        posts.map(p => <PostCard key={p._id} post={p} />)
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABOUT TAB
// ═══════════════════════════════════════════════════════════════════════════════

function AboutTab({ profile }: { profile: Customer }) {
  const rows = [
    { icon: Mail,     label: "Email",    value: profile.email },
    { icon: Phone,    label: "Phone",    value: profile.phone || "Not provided" },
    { icon: MapPin,   label: "Location", value: profile.location || "Not set" },
    { icon: Briefcase,label: "Work",     value: profile.work || "Not set" },
    { icon: Calendar, label: "Joined",   value: formatDate(profile.createdAt) },
    { icon: Link2,    label: "Provider", value: profile.provider ? `${profile.provider} account` : "—" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">About</h3>
      {profile.bio && (
        <p className="text-sm text-slate-600 leading-relaxed border-b border-slate-50 pb-4">{profile.bio}</p>
      )}
      <div className="space-y-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-slate-400" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
              <p className="text-sm text-slate-700 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COVER + PROFILE HEADER
// ═══════════════════════════════════════════════════════════════════════════════

function ProfileHeader({ profile, isOwnProfile }: { profile: Customer; isOwnProfile: boolean }) {
  const [following, setFollowing] = useState(false);
  const [coverErr, setCoverErr]   = useState(false);
  const cover = coverFor(profile.uid);
  const isVerified = ["google", "facebook"].includes(profile.provider ?? "");

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Cover photo */}
      <div className={`relative h-48 sm:h-56 bg-gradient-to-br ${cover}`}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px,white 1.5px,transparent 0)", backgroundSize: "28px 28px" }} />
        {isOwnProfile && (
          <button className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/30 hover:bg-black/50 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
            <Camera className="w-3.5 h-3.5" /> Edit cover
          </button>
        )}
      </div>

      {/* Profile info */}
      <div className="px-5 pb-0">
        <div className="flex flex-wrap items-end justify-between gap-3 -mt-14 mb-4">
          {/* Avatar */}
          <div className="relative">
            <UserAvatar user={profile} size="2xl" className="ring-4 ring-white shadow-lg" />
            {isOwnProfile && (
              <button className="absolute bottom-1 right-1 w-8 h-8 bg-slate-200 hover:bg-slate-300 border-2 border-white rounded-full flex items-center justify-center transition-colors">
                <Camera className="w-4 h-4 text-slate-700" />
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pb-2">
            {isOwnProfile ? (
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                <Camera className="w-4 h-4" /> Edit profile
              </button>
            ) : (
              <>
                <button onClick={() => setFollowing(p => !p)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    following ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200"
                  }`}>
                  {following ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                  <MessageCircle className="w-4 h-4" /> Message
                </button>
              </>
            )}
            <button className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Name + bio */}
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{profile.name}</h1>
            {isVerified && (
              <span className="flex items-center gap-1 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>
          {profile.role && <p className="text-sm text-slate-500 capitalize mt-0.5">{profile.role}</p>}
          {profile.bio && <p className="text-sm text-slate-600 mt-2 max-w-lg">{profile.bio}</p>}

          {/* Quick meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {profile.location && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joined {formatDate(profile.createdAt)}
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-3">
            {[["128", "Posts"], ["4.2k", "Followers"], ["312", "Following"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="text-base font-black text-slate-900">{v}</p>
                <p className="text-xs text-slate-400">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Friend avatar previews */}
        <div className="flex items-center gap-2 pb-4 border-t border-slate-50 pt-3">
          <div className="flex -space-x-2">
            {GRADIENTS.slice(0, 5).map((g, i) => (
              <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">4,200</span> followers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-slate-100 flex overflow-x-auto">
        {(["posts", "friends", "photos", "about"] as ProfileTab[]).map((tab, i, arr) => (
          <button
            key={tab}
            onClick={() => {
              // Tab switching handled by parent
              document.dispatchEvent(new CustomEvent("profileTab", { detail: tab }));
            }}
            className={`flex-shrink-0 px-5 py-3.5 text-sm font-semibold capitalize transition-colors border-b-2
              ${i === 0 ? "border-violet-600 text-violet-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProfilePage() {
  const [me, setMe]           = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setTab]   = useState<ProfileTab>("posts");

  useEffect(() => {
    fetch(CUSTOMERS_API)
      .then(r => r.json())
      .then((all: Customer[]) => {
        const found = all.find(c => c.email === LOGGED_IN_EMAIL) ?? all[0] ?? null;
        setMe(found);
      })
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  // Listen to tab events from ProfileHeader
  useEffect(() => {
    const h = (e: Event) => setTab((e as CustomEvent).detail as ProfileTab);
    document.addEventListener("profileTab", h);
    return () => document.removeEventListener("profileTab", h);
  }, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 space-y-4 py-4">
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
        <Sk className="h-52 rounded-none" />
        <div className="px-5 pb-6 pt-2 space-y-3">
          <div className="flex items-end justify-between -mt-12">
            <Sk className="w-24 h-24 rounded-full ring-4 ring-white" />
            <div className="flex gap-2 pb-1"><Sk className="w-24 h-9 rounded-xl" /><Sk className="w-24 h-9 rounded-xl" /></div>
          </div>
          <Sk className="h-6 w-48" /><Sk className="h-4 w-32" /><Sk className="h-4 w-full" />
        </div>
      </div>
    </div>
  );

  if (!me) return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <p className="text-slate-500">Could not load profile. Check your API.</p>
    </div>
  );

  return (
    <UserCtx.Provider value={me}>
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">

        {/* Profile header with cover + tabs */}
        <ProfileHeader profile={me} isOwnProfile={true} />

        {/* Tab content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* LEFT: about + mini friends */}
          <aside className="lg:col-span-4 space-y-4">
            <AboutTab profile={me} />

            {/* Mini friends preview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-800">Friends</h3>
                <button onClick={() => setTab("friends")} className="text-xs font-semibold text-violet-600 hover:underline">See all</button>
              </div>
              <MiniFriendPreviews userId={me._id} />
            </div>
          </aside>

          {/* RIGHT: main tab content */}
          <main className="lg:col-span-8 space-y-4">
            {activeTab === "posts"   && <PostsTab profile={me} />}
            {activeTab === "friends" && <FriendsList profileUserId={me._id} />}
            {activeTab === "photos"  && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                <p className="text-slate-400 text-sm">No photos yet.</p>
              </div>
            )}
            {activeTab === "about"   && <AboutTab profile={me} />}
          </main>
        </div>
      </div>
    </UserCtx.Provider>
  );
}

// ─── Mini friends grid (sidebar) ─────────────────────────────────────────────

function MiniFriendPreviews({ userId }: { userId: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);

 useEffect(() => {
  Promise.all([
    fetch(CUSTOMERS_API).then(r => r.json()),
    fetch(`${FRIENDS_API}?userId=${userId}`)
      .then(r => r.json())
      .catch(() => []),
  ])
    .then(([allCustomers]: [Customer[], unknown]) => {
      setCustomers(
        allCustomers
          .filter(c => c._id !== userId)
          .slice(0, 9)
      );
    })
    .finally(() => setLoading(false));
}, [userId]);

  if (loading) return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 9 }).map((_, i) => <Sk key={i} className="aspect-square rounded-xl" />)}
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-2">
      {customers.map(c => (
        <div key={c._id} className="relative group cursor-pointer">
          <UserAvatar user={c} size="xl" rounded="xl" className="w-full aspect-square object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all" />
          <p className="absolute bottom-1 left-1 right-1 text-center text-[9px] font-bold text-white drop-shadow line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">{c.name.split(" ")[0]}</p>
        </div>
      ))}
    </div>
  );
}
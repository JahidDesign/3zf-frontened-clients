'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Image as ImageIcon, Smile, Reply, Trash2,
  X, Loader2, ChevronDown,
} from 'lucide-react';
import api from '@/lib/axios';
import useAuthStore from '@/store/authStore';
import useCommunityStore from '@/store/communityStore';
import { format, isToday, isYesterday } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface Membership { _id: string; role: string }

const REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

function formatMsgTime(date: string) {
  const d = new Date(date);
  if (isToday(d))     return format(d, 'HH:mm');
  if (isYesterday(d)) return `গতকাল ${format(d, 'HH:mm')}`;
  return format(d, 'dd MMM HH:mm');
}

function groupByDate(messages: any[]) {
  const groups: { date: string; messages: any[] }[] = [];
  messages.forEach((m) => {
    const d     = new Date(m.createdAt);
    const label = isToday(d) ? 'আজ' : isYesterday(d) ? 'গতকাল' : format(d, 'dd MMMM yyyy');
    const last  = groups[groups.length - 1];
    if (last?.date === label) last.messages.push(m);
    else groups.push({ date: label, messages: [m] });
  });
  return groups;
}

export default function GroupChat({
  shopId,
  membership,
}: {
  shopId: string;
  membership: Membership;
}) {
  const { user } = useAuthStore();
  const {
    messages, setMessages, appendMessage, updateMessage,
    deleteMessage, typingUser, setTypingUser,
  } = useCommunityStore();

  const [text, setText]                   = useState('');
  const [imageFile, setImageFile]         = useState<File | null>(null);
  const [imagePreview, setImagePreview]   = useState('');
  const [replyTo, setReplyTo]             = useState<any>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [reactTarget, setReactTarget]     = useState<string | null>(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const socketRef   = useRef<Socket | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fileRef     = useRef<HTMLInputElement>(null);
  // FIX: keep scrollToBottom stable across renders so socket listener doesn't recreate
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── Initial messages fetch ──────────────────────────────────────────────
  const { isLoading } = useQuery({
    queryKey: ['community-messages', shopId],
    queryFn:  () =>
      api.get(`/community-shop/${shopId}/messages`).then((r) => {
        setMessages(r.data.messages);
        return r.data.messages;
      }),
    enabled:             !!shopId,
    refetchOnWindowFocus: false,
  });

  // ── Socket.io ───────────────────────────────────────────────────────────
  // FIX: include scrollToBottom in dep array; define handlers inside so they capture latest store fns
  useEffect(() => {
    if (!shopId) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? '', {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.emit('join-shop', { shopId, userId: user?._id });

    socket.on('new-message', (msg: any) => {
      appendMessage(msg);
      scrollToBottom();
    });
    socket.on('message-deleted',  ({ _id }: { _id: string }) => deleteMessage(_id));
    socket.on('message-reaction', ({ _id, reactions }: any) => updateMessage(_id, { reactions }));
    socket.on('user-typing', ({ userName }: { userName: string }) => {
      setTypingUser(userName);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingUser(null), 3000);
    });
    socket.on('user-stop-typing', () => setTypingUser(null));

    return () => {
      socket.emit('leave-shop', { shopId });
      socket.disconnect();
      socketRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  };

  // ── Send ────────────────────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (text.trim()) fd.append('text', text.trim());
      if (imageFile)   fd.append('image', imageFile);
      if (replyTo)     fd.append('replyTo', replyTo._id);
      return api.post(`/community-shop/${shopId}/messages`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      setText('');
      setImageFile(null);
      setImagePreview('');
      setReplyTo(null);
      socketRef.current?.emit('stop-typing', { shopId });
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'ব্যর্থ'),
  });

  const handleSend = () => {
    if (!text.trim() && !imageFile) return;
    sendMutation.mutate();
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (msgId: string) =>
      api.delete(`/community-shop/${shopId}/messages/${msgId}`),
    onError: () => toast.error('মুছতে পারা যায়নি'),
  });

  // ── React ───────────────────────────────────────────────────────────────
  const reactMutation = useMutation({
    mutationFn: ({ msgId, emoji }: { msgId: string; emoji: string }) =>
      api.post(`/community-shop/${shopId}/messages/${msgId}/react`, { emoji }),
    onSuccess: () => setReactTarget(null),
  });

  // ── Typing indicator ────────────────────────────────────────────────────
  const emitTyping = () => {
    socketRef.current?.emit('typing', { shopId, userName: user?.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('stop-typing', { shopId });
    }, 2000);
  };

  // ── Image pick ──────────────────────────────────────────────────────────
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
  };

  const groups = groupByDate(messages);

  return (
    // FIX: use relative positioning on container so scroll-btn is positioned correctly
    <div className="relative flex flex-col h-[calc(100vh-var(--navbar-height)-180px)] sm:h-[calc(100vh-var(--navbar-height)-140px)]">

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
        onScroll={handleScroll}
      >
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        )}

        {groups.map(({ date, messages: dayMsgs }) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}
              >
                {date}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            </div>

            {dayMsgs.map((msg) => {
              const isMine   = msg.sender?._id === user?._id;
              const isSystem = msg.type === 'system';

              if (isSystem) {
                return (
                  <div key={msg._id} className="text-center my-2">
                    <span
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}
                    >
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 group mb-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar (others only) */}
                  {!isMine && (
                    <div
                      className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 self-end"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
                    >
                      {msg.sender?.profilePhoto?.url ? (
                        <img src={msg.sender.profilePhoto.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {msg.sender?.name?.[0]}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={`max-w-[72%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    {!isMine && (
                      <span className="text-xs font-semibold mb-0.5 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {msg.sender?.name}
                      </span>
                    )}

                    {/* Reply preview */}
                    {msg.replyTo && (
                      <div
                        className="text-xs px-2 py-1 rounded-t-lg mb-0.5 border-l-2 border-purple-400"
                        style={{ background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}
                      >
                        <span className="font-semibold">{msg.replyTo.sender?.name}: </span>
                        {msg.replyTo.text?.slice(0, 60)}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`relative px-3 py-2 rounded-2xl text-sm shadow-sm ${
                        isMine ? 'rounded-tr-sm text-white' : 'rounded-tl-sm'
                      }`}
                      style={
                        isMine
                          ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }
                          : { background: 'var(--color-bg-hover)', color: 'var(--color-text)' }
                      }
                    >
                      {msg.deleted ? (
                        <span className="italic opacity-60 text-xs">বার্তাটি মুছে ফেলা হয়েছে</span>
                      ) : (
                        <>
                          {msg.image?.url && (
                            // FIX: null-safe image click
                            <img
                              src={msg.image.url}
                              alt=""
                              className="rounded-xl mb-1 max-w-[220px] cursor-pointer"
                              onClick={() => msg.image?.url && window.open(msg.image.url, '_blank')}
                            />
                          )}
                          {msg.text && <p className="leading-relaxed break-words">{msg.text}</p>}
                        </>
                      )}

                      {/* Reactions */}
                      {msg.reactions?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Object.entries(
                            (msg.reactions as { emoji: string }[]).reduce<Record<string, number>>(
                              (acc, r) => { acc[r.emoji] = (acc[r.emoji] ?? 0) + 1; return acc; },
                              {}
                            )
                          ).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              onClick={() => reactMutation.mutate({ msgId: msg._id, emoji })}
                              className="text-xs px-1.5 py-0.5 rounded-full bg-black/10 hover:bg-black/20 transition"
                            >
                              {emoji} {count}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] mt-0.5 px-1" style={{ color: 'var(--color-text-muted)' }}>
                      {formatMsgTime(msg.createdAt)}
                    </span>

                    {/* Reaction picker */}
                    <AnimatePresence>
                      {reactTarget === msg._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex gap-1 p-2 rounded-2xl shadow-lg border mt-1"
                          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                        >
                          {REACTIONS.map((e) => (
                            <button
                              key={e}
                              onClick={() => reactMutation.mutate({ msgId: msg._id, emoji: e })}
                              className="text-lg hover:scale-125 transition-transform"
                            >
                              {e}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Hover action buttons */}
                  {!msg.deleted && (
                    <div
                      className={`flex flex-col gap-1 self-center opacity-0 group-hover:opacity-100 transition ${
                        isMine ? 'mr-1' : 'ml-1'
                      }`}
                    >
                      <button
                        onClick={() => setReplyTo(msg)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--color-bg-hover)] transition"
                      >
                        <Reply className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
                      </button>
                      <button
                        onClick={() => setReactTarget(reactTarget === msg._id ? null : msg._id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--color-bg-hover)] transition"
                      >
                        <Smile className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
                      </button>
                      {(isMine || membership.role === 'admin' || membership.role === 'moderator') && (
                        <button
                          onClick={() => deleteMutation.mutate(msg._id)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {typingUser && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex items-center gap-2 px-1"
            >
              <div
                className="flex gap-1 px-3 py-2 rounded-2xl rounded-tl-sm"
                style={{ background: 'var(--color-bg-hover)' }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {typingUser} লিখছেন...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom button — FIX: positioned inside relative parent */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-20 right-4 w-9 h-9 rounded-full shadow-lg flex items-center justify-center z-10"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          >
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div
        className="border-t px-3 py-3 flex-shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
      >
        {/* Reply preview */}
        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-xl border-l-2 border-purple-400"
              style={{ background: 'var(--color-bg-hover)' }}
            >
              <Reply className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-purple-600">{replyTo.sender?.name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {replyTo.text?.slice(0, 60)}
                </p>
              </div>
              <button onClick={() => setReplyTo(null)}>
                <X className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image preview */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 relative inline-block"
            >
              <img src={imagePreview} alt="" className="h-20 rounded-xl object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(''); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImagePick} />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[var(--color-bg-hover)] transition"
          >
            <ImageIcon className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          </button>

          <input
            ref={inputRef}
            value={text}
            onChange={(e) => { setText(e.target.value); emitTyping(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="মেসেজ লিখুন..."
            className="flex-1 px-4 py-2.5 rounded-2xl border outline-none text-sm"
            style={{
              borderColor: 'var(--color-border)',
              background:  'var(--color-bg-hover)',
              color:       'var(--color-text)',
            }}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={sendMutation.isPending || (!text.trim() && !imageFile)}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition active:scale-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
          >
            {sendMutation.isPending
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-4 h-4 text-white" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
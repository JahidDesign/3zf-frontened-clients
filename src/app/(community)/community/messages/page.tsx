'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Send, Phone, Video, Info, Smile, Paperclip,
  ArrowLeft, Check, CheckCheck, X, ZoomIn, ChevronLeft,
  ChevronRight, Download, FileText, Music, Film, Image as ImageIcon,
  MoreVertical, Trash2, Reply, Plus,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { getSocket } from '@/hooks/useSocket';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface MediaItem {
  url: string;
  publicId: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'gif';
  originalName?: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
}

interface Message {
  _id: string;
  text?: string;
  media?: MediaItem;
  mediaList?: MediaItem[];
  sender: { _id: string; name: string; avatar?: string };
  createdAt: string;
  readBy: string[];
  replyTo?: any;
  reactions?: { user: string; emoji: string }[];
  isDeleted?: boolean;
  pending?: boolean;
}

interface Participant {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  isVerified?: boolean;
  isOnline?: boolean;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: Message;
  lastMessageAt?: string;
  isGroup?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatMsgTime = (date: string) => {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const avatarUrl = (name: string, avatar?: string) =>
  avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6B46C1&color=fff`;

const getFileIcon = (type: MediaItem['type']) => {
  switch (type) {
    case 'video': return Film;
    case 'audio': return Music;
    case 'document': return FileText;
    default: return ImageIcon;
  }
};

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Animated typing dots */
const TypingIndicator = ({ avatar, name }: { avatar?: string; name: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    className="flex items-end gap-2"
  >
    <img src={avatarUrl(name, avatar)} alt="" className="w-7 h-7 avatar flex-shrink-0" />
    <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="flex gap-1 items-center">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{ background: 'var(--color-text-muted)', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

/** Media grid for multiple images/videos in one message */
const MediaGrid = ({ items, onPreview }: { items: MediaItem[]; onPreview: (index: number) => void }) => {
  const count = items.length;
  if (count === 0) return null;

  const gridClass =
    count === 1 ? 'grid-cols-1' :
    count === 2 ? 'grid-cols-2' :
    count === 3 ? 'grid-cols-2' :
    'grid-cols-2';

  return (
    <div className={`grid gap-1 mb-1 rounded-2xl overflow-hidden max-w-[280px]`} style={{ gridTemplateColumns: count === 1 ? '1fr' : '1fr 1fr' }}>
      {items.map((item, i) => {
        // When 3+ items, show "+N more" overlay on the last visible slot (slot 3)
        const isLastVisible = count > 4 && i === 3;
        const extraCount = count - 4;

        return (
          <div
            key={i}
            className={`relative cursor-pointer overflow-hidden group
              ${count === 3 && i === 0 ? 'row-span-2' : ''}
              ${count === 1 ? 'rounded-2xl' : ''}
            `}
            style={{ aspectRatio: count === 1 ? '4/3' : '1/1' }}
            onClick={() => onPreview(i)}
          >
            {item.type === 'video' ? (
              <>
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Film className="w-4 h-4 text-gray-800 ml-0.5" />
                  </div>
                </div>
              </>
            ) : item.type === 'gif' ? (
              <img src={item.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <img src={item.url} alt={item.originalName || ''} className="w-full h-full object-cover" />
            )}

            {/* Zoom overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* "+N more" overlay */}
            {isLastVisible && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-xl">+{extraCount}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/** Document / audio attachment bubble */
const FileBubble = ({ item, isMe }: { item: MediaItem; isMe: boolean }) => {
  const Icon = getFileIcon(item.type);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      download={item.originalName}
      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 max-w-[240px] transition-opacity hover:opacity-80"
      style={{
        background: isMe ? 'rgba(255,255,255,0.15)' : 'var(--color-bg-tertiary)',
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: isMe ? 'rgba(255,255,255,0.2)' : 'var(--color-brand-alpha)' }}>
        <Icon className="w-4 h-4" style={{ color: isMe ? 'white' : 'var(--color-brand)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: isMe ? 'white' : 'var(--color-text)' }}>
          {item.originalName || 'File'}
        </p>
        <p className="text-[10px]" style={{ color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
          {formatFileSize(item.size)}
        </p>
      </div>
      <Download className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }} />
    </a>
  );
};

/** Full-screen media lightbox */
const Lightbox = ({
  items,
  startIndex,
  onClose,
}: {
  items: MediaItem[];
  startIndex: number;
  onClose: () => void;
}) => {
  const [index, setIndex] = useState(startIndex);
  const item = items[index];

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(items.length - 1, i + 1));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.95)' }}
        onClick={onClose}
      >
        {/* Controls */}
        <div
          className="absolute top-4 right-4 flex items-center gap-2 z-10"
          onClick={e => e.stopPropagation()}
        >
          <a
            href={item.url}
            download={item.originalName}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Download className="w-4 h-4 text-white" />
          </a>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Counter */}
        {items.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {index + 1} / {items.length}
          </div>
        )}

        {/* Prev/next arrows */}
        {index > 0 && (
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {index < items.length - 1 && (
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Media content */}
        <motion.div
          key={index}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
          onClick={e => e.stopPropagation()}
        >
          {item.type === 'video' ? (
            <video
              src={item.url}
              controls
              autoPlay
              className="max-w-full max-h-[85vh] rounded-xl"
            />
          ) : item.type === 'audio' ? (
            <audio src={item.url} controls autoPlay className="w-80" />
          ) : (
            <img
              src={item.url}
              alt={item.originalName || ''}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          )}
        </motion.div>

        {/* Thumbnail strip */}
        {items.length > 1 && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            {items.map((it, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                  i === index ? 'border-white scale-110' : 'border-transparent opacity-60'
                }`}
              >
                {it.type === 'video' ? (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <Film className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <img src={it.url} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/** Pending upload preview strip above the input */
const MediaPreviewStrip = ({
  previews,
  onRemove,
}: {
  previews: { url: string; name: string; type: string; size: number }[];
  onRemove: (i: number) => void;
}) => {
  if (previews.length === 0) return null;
  return (
    <div
      className="px-4 py-2 flex gap-2 flex-wrap border-t"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
    >
      {previews.map((p, i) => (
        <div key={i} className="relative group flex-shrink-0">
          {p.type.startsWith('image') || p.type === 'image/gif' ? (
            <img
              src={p.url}
              alt={p.name}
              className="w-16 h-16 object-cover rounded-xl border"
              style={{ borderColor: 'var(--color-border)' }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-xl border flex flex-col items-center justify-center gap-1"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}
            >
              {p.type.startsWith('video') ? (
                <Film className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
              ) : p.type.startsWith('audio') ? (
                <Music className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
              ) : (
                <FileText className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
              )}
              <span className="text-[9px] text-center px-1 truncate w-full text-center"
                style={{ color: 'var(--color-text-muted)' }}>
                {formatFileSize(p.size)}
              </span>
            </div>
          )}
          {/* Remove button */}
          <button
            onClick={() => onRemove(i)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white
                       flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user } = useAuthStore();

  // Core state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typing, setTyping] = useState(false);

  // Search
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<Participant[]>([]);

  // Media upload
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<
    { url: string; name: string; type: string; size: number }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox
  const [lightboxItems, setLightboxItems] = useState<MediaItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Mobile
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchConversations();
    const cleanup = setupSocket();
    return cleanup;
  }, []);

  useEffect(() => {
    if (activeConv) fetchMessages(activeConv._id);
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data.conversations || []);
    } catch {}
  };

  const fetchMessages = async (convId: string) => {
    try {
      const { data } = await api.get(`/messages/${convId}/messages`);
      setMessages(data.messages || []);
      await api.post(`/messages/${convId}/read`);
    } catch {}
  };

  // ── Socket ─────────────────────────────────────────────────────────────────

  const setupSocket = () => {
    const socket = getSocket();
    if (!socket) return () => {};

    const onNewMessage = ({ message, conversationId }: any) => {
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) return prev;
        return activeConv?._id === conversationId ? [...prev, message] : prev;
      });
      setConversations(prev =>
        prev.map(c =>
          c._id === conversationId
            ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
            : c
        )
      );
    };

    const onTyping = ({ userId, conversationId }: any) => {
      if (activeConv?._id === conversationId && userId !== user?._id) {
        setIsTyping(true);
      }
    };

    const onStopTyping = ({ conversationId }: any) => {
      if (activeConv?._id === conversationId) setIsTyping(false);
    };

    const onMessageDeleted = ({ messageId }: any) => {
      setMessages(prev =>
        prev.map(m =>
          m._id === messageId ? { ...m, isDeleted: true, text: 'This message was deleted', media: undefined, mediaList: undefined } : m
        )
      );
    };

    socket.on('newMessage', onNewMessage);
    socket.on('userTyping', onTyping);
    socket.on('userStopTyping', onStopTyping);
    socket.on('messageDeleted', onMessageDeleted);

    return () => {
      socket.off('newMessage', onNewMessage);
      socket.off('userTyping', onTyping);
      socket.off('userStopTyping', onStopTyping);
      socket.off('messageDeleted', onMessageDeleted);
    };
  };

  // ── File handling ──────────────────────────────────────────────────────────

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPendingFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      if (file.type.startsWith('image') || file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = ev => {
          setPendingPreviews(prev => [
            ...prev,
            { url: ev.target?.result as string, name: file.name, type: file.type, size: file.size },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setPendingPreviews(prev => [
          ...prev,
          { url: '', name: file.name, type: file.type, size: file.size },
        ]);
      }
    });

    // Reset input so the same files can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removeMedia = useCallback((index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
    setPendingPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ── Send message ───────────────────────────────────────────────────────────

  const sendMessage = async () => {
    if ((!text.trim() && pendingFiles.length === 0) || !activeConv || sending) return;
    setSending(true);

    const formData = new FormData();
    if (text.trim()) formData.append('text', text.trim());
    pendingFiles.forEach(f => formData.append('media', f));

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMedia = pendingPreviews.map((p, i) => ({
      url: p.url || '',
      publicId: '',
      type: (p.type.startsWith('image') ? 'image' : p.type.startsWith('video') ? 'video' : p.type.startsWith('audio') ? 'audio' : 'document') as MediaItem['type'],
      originalName: p.name,
      size: p.size,
    }));

    const optimistic: Message = {
      _id: tempId,
      text: text.trim() || undefined,
      mediaList: optimisticMedia.length > 1 ? optimisticMedia : undefined,
      media: optimisticMedia.length === 1 ? optimisticMedia[0] : undefined,
      sender: { _id: user!._id, name: user!.name, avatar: user!.avatar },
      createdAt: new Date().toISOString(),
      readBy: [user!._id],
      pending: true,
    };

    setMessages(prev => [...prev, optimistic]);
    setText('');
    setPendingFiles([]);
    setPendingPreviews([]);

    try {
      const { data } = await api.post(
        `/messages/${activeConv._id}/send`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setMessages(prev => prev.map(m => m._id === tempId ? data.message : m));

      setConversations(prev =>
        prev.map(c =>
          c._id === activeConv._id
            ? { ...c, lastMessage: data.message, lastMessageAt: data.message.createdAt }
            : c
        )
      );

      const other = activeConv.participants?.find(p => p._id !== user?._id);
      if (other) {
        getSocket()?.emit('sendMessage', {
          receiverId: other._id,
          message: data.message,
          conversationId: activeConv._id,
        });
      }
    } catch {
      setMessages(prev => prev.filter(m => m._id !== tempId));
    } finally {
      setSending(false);
    }
  };

  // ── Typing indicator ───────────────────────────────────────────────────────

  const handleTyping = (val: string) => {
    setText(val);
    const socket = getSocket();
    if (!socket || !activeConv) return;
    const other = activeConv.participants?.find(p => p._id !== user?._id);
    if (!typing) {
      setTyping(true);
      socket.emit('typing', { receiverId: other?._id, conversationId: activeConv._id });
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit('stopTyping', { receiverId: other?._id, conversationId: activeConv._id });
    }, 1500);
  };

  // ── Search ─────────────────────────────────────────────────────────────────

  const searchUsers = async (q: string) => {
    setSearchQ(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const { data } = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      setSearchResults(data.users || []);
    } catch {}
  };

  const startConversation = async (userId: string) => {
    try {
      const { data } = await api.post('/messages/conversation', { participantId: userId });
      setActiveConv(data.conversation);
      setSearchResults([]);
      setSearchQ('');
      if (!conversations.find(c => c._id === data.conversation._id)) {
        setConversations(prev => [data.conversation, ...prev]);
      }
      setMobileView('chat');
    } catch {}
  };

  // ── Lightbox helpers ───────────────────────────────────────────────────────

  const openLightbox = (items: MediaItem[], index: number) => {
    setLightboxItems(items);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // ── Utilities ──────────────────────────────────────────────────────────────

  const getOtherParticipant = (conv: Conversation) =>
    conv.participants?.find(p => p._id !== user?._id) || conv.participants?.[0];

  const getAllMediaForMessage = (msg: Message): MediaItem[] => {
    if (msg.mediaList?.length) return msg.mediaList;
    if (msg.media) return [msg.media];
    return [];
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Hidden file input — no accept restriction = all file types, no limit */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          items={lightboxItems}
          startIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="flex h-[calc(100vh-var(--navbar-height)-24px)] card overflow-hidden p-0">

        {/* ── Conversations sidebar ───────────────────────────────────────── */}
        <div
          className={`w-full md:w-80 flex-shrink-0 border-r flex flex-col ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: 'var(--color-text)' }}>
              Messages
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
              <input
                value={searchQ}
                onChange={e => searchUsers(e.target.value)}
                placeholder="Search people..."
                className="pl-10 py-2 text-sm rounded-full w-full"
                style={{ background: 'var(--color-bg-secondary)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          {/* Search results */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {searchResults.map(u => (
                  <button
                    key={u._id}
                    onClick={() => startConversation(u._id)}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <img src={avatarUrl(u.name, u.avatar)} alt="" className="w-10 h-10 avatar" />
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{u.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{u.username}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No conversations yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Search for people to message</p>
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOtherParticipant(conv);
                const isActive = activeConv?._id === conv._id;
                const lastMsg = conv.lastMessage;
                const preview =
                  lastMsg?.isDeleted ? '🚫 Message deleted' :
                  lastMsg?.text ? lastMsg.text :
                  lastMsg?.mediaList?.length ? `📎 ${lastMsg.mediaList.length} files` :
                  lastMsg?.media ? (lastMsg.media.type === 'image' ? '📷 Photo' : lastMsg.media.type === 'video' ? '🎥 Video' : '📎 File') :
                  'Start a conversation';

                return (
                  <button
                    key={conv._id}
                    onClick={() => { setActiveConv(conv); setMobileView('chat'); }}
                    className={`flex items-center gap-3 w-full px-4 py-3 transition-colors text-left
                      ${isActive ? 'bg-[var(--color-bg-tertiary)]' : 'hover:bg-[var(--color-bg-hover)]'}`}
                  >
                    <div className="relative flex-shrink-0">
                      <img src={avatarUrl(other?.name || 'U', other?.avatar)} alt="" className="w-12 h-12 avatar" />
                      {other?.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[var(--color-bg)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{other?.name}</p>
                        {conv.lastMessageAt && (
                          <p className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                            {formatMsgTime(conv.lastMessageAt)}
                          </p>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{preview}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat area ───────────────────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {!activeConv ? (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center flex-col gap-4">
              <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center shadow-xl">
                <Send className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <p className="font-heading font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Your Messages</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Send photos, videos, files, and more
                </p>
              </div>
            </div>
          ) : (() => {
            const other = getOtherParticipant(activeConv);
            return (
              <>
                {/* Chat header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
                >
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden btn-ghost w-8 h-8 flex items-center justify-center p-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <img src={avatarUrl(other?.name || 'U', other?.avatar)} alt="" className="w-10 h-10 avatar" />
                    {other?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--color-bg)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{other?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {isTyping
                        ? <span style={{ color: 'var(--color-brand)' }}>typing...</span>
                        : other?.isOnline ? 'Active now' : 'Offline'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="btn-ghost w-9 h-9 flex items-center justify-center p-0"><Phone className="w-4 h-4" /></button>
                    <button className="btn-ghost w-9 h-9 flex items-center justify-center p-0"><Video className="w-4 h-4" /></button>
                    <button className="btn-ghost w-9 h-9 flex items-center justify-center p-0"><Info className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                      const isMe = msg.sender?._id === user?._id;
                      const prevMsg = messages[i - 1];
                      const nextMsg = messages[i + 1];
                      const isFirstInGroup = !prevMsg || prevMsg.sender?._id !== msg.sender?._id;
                      const isLastInGroup = !nextMsg || nextMsg.sender?._id !== msg.sender?._id;
                      const allMedia = getAllMediaForMessage(msg);
                      const visualMedia = allMedia.filter(m => m.type === 'image' || m.type === 'video' || m.type === 'gif');
                      const fileMedia = allMedia.filter(m => m.type === 'audio' || m.type === 'document');

                      return (
                        <motion.div
                          key={msg._id}
                          layout
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                          className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''} ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}
                        >
                          {/* Avatar (only for last message in group) */}
                          {!isMe && (
                            <div className="w-7 flex-shrink-0 self-end mb-1">
                              {isLastInGroup ? (
                                <img src={avatarUrl(other?.name || 'U', other?.avatar)} alt="" className="w-7 h-7 avatar" />
                              ) : (
                                <div className="w-7" />
                              )}
                            </div>
                          )}

                          {/* Message bubble */}
                          <div
                            className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            {/* Reply-to preview */}
                            {msg.replyTo && (
                              <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl mb-1 max-w-full text-xs opacity-80
                                  ${isMe ? 'mr-1' : 'ml-1'}`}
                                style={{ background: 'var(--color-bg-tertiary)', borderLeft: '3px solid var(--color-brand)' }}
                              >
                                <Reply className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-brand)' }} />
                                <span className="truncate" style={{ color: 'var(--color-text-secondary)' }}>
                                  {msg.replyTo.text || '📎 Media'}
                                </span>
                              </div>
                            )}

                            {/* Visual media grid */}
                            {visualMedia.length > 0 && !msg.isDeleted && (
                              <MediaGrid
                                items={visualMedia}
                                onPreview={idx => openLightbox(visualMedia, idx)}
                              />
                            )}

                            {/* File attachments */}
                            {fileMedia.length > 0 && !msg.isDeleted && fileMedia.map((item, fi) => (
                              <FileBubble key={fi} item={item} isMe={isMe} />
                            ))}

                            {/* Text bubble */}
                            {(msg.text || msg.isDeleted) && (
                              <div
                                className={`px-4 py-2.5 text-sm leading-relaxed max-w-full
                                  ${isMe
                                    ? 'gradient-brand text-white rounded-2xl rounded-br-sm'
                                    : 'rounded-2xl rounded-bl-sm'}
                                  ${msg.pending ? 'opacity-70' : ''}
                                `}
                                style={!isMe ? { background: 'var(--color-bg-secondary)', color: 'var(--color-text)' } : {}}
                              >
                                {msg.isDeleted
                                  ? <em style={{ opacity: 0.6, fontSize: '0.85em' }}>🚫 Message deleted</em>
                                  : msg.text}
                              </div>
                            )}

                            {/* Timestamp + read receipt */}
                            <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                {formatMsgTime(msg.createdAt)}
                              </span>
                              {isMe && (
                                msg.pending
                                  ? <Check className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                                  : <CheckCheck className="w-3 h-3" style={{ color: 'var(--color-brand)' }} />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <TypingIndicator avatar={other?.avatar} name={other?.name || 'User'} />
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>

                {/* Media preview strip */}
                <MediaPreviewStrip previews={pendingPreviews} onRemove={removeMedia} />

                {/* Input bar */}
                <div
                  className="px-3 py-3 border-t flex items-center gap-2 flex-shrink-0"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
                >
                  {/* Attach button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-ghost w-9 h-9 flex items-center justify-center p-0 flex-shrink-0 relative"
                    title="Attach files (unlimited)"
                  >
                    {pendingFiles.length > 0 ? (
                      <>
                        <Paperclip className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
                        <span
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-brand text-white text-[9px] flex items-center justify-center font-bold shadow"
                        >
                          {pendingFiles.length > 9 ? '9+' : pendingFiles.length}
                        </span>
                      </>
                    ) : (
                      <Plus className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                    )}
                  </button>

                  {/* Text input */}
                  <div className="flex-1 relative">
                    <input
                      value={text}
                      onChange={e => handleTyping(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full rounded-full py-2.5 pr-12 text-sm"
                      style={{
                        paddingLeft: '16px',
                        background: 'var(--color-bg-secondary)',
                        border: '1.5px solid var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                    {/* Send button */}
                    <button
                      onClick={sendMessage}
                      disabled={(!text.trim() && pendingFiles.length === 0) || sending}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
                    >
                      {sending ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </>
  );
}
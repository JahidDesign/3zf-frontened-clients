'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Phone, Video, Info, Smile, Image, MoreHorizontal, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { getSocket } from '@/hooks/useSocket';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { fetchConversations(); setupSocket(); }, []);
  useEffect(() => { if (activeConv) fetchMessages(activeConv._id); }, [activeConv]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConversations = async () => {
    try { const { data } = await api.get('/messages/conversations'); setConversations(data.conversations || []); } catch {}
  };

  const fetchMessages = async (convId: string) => {
    try {
      const { data } = await api.get(`/messages/${convId}/messages`);
      setMessages(data.messages || []);
      await api.post(`/messages/${convId}/read`);
    } catch {}
  };

  const setupSocket = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('newMessage', ({ message, conversationId }) => {
      if (activeConv?._id === conversationId) {
        setMessages(prev => [...prev, message]);
      }
      setConversations(prev => prev.map(c => c._id === conversationId ? { ...c, lastMessage: message, lastMessageAt: message.createdAt } : c));
    });
    socket.on('userTyping', ({ userId, conversationId }) => {
      if (activeConv?._id === conversationId && userId !== user?._id) setIsTyping(true);
    });
    socket.on('userStopTyping', ({ conversationId }) => {
      if (activeConv?._id === conversationId) setIsTyping(false);
    });
    return () => { socket.off('newMessage'); socket.off('userTyping'); socket.off('userStopTyping'); };
  };

  const sendMessage = async () => {
    if (!text.trim() || !activeConv || sending) return;
    setSending(true);
    const tempId = Date.now().toString();
    const optimistic = { _id: tempId, text, sender: { _id: user!._id, name: user!.name, avatar: user!.avatar }, createdAt: new Date().toISOString(), readBy: [user!._id], pending: true };
    setMessages(prev => [...prev, optimistic]);
    setText('');
    try {
      const { data } = await api.post(`/messages/${activeConv._id}/send`, { text });
      setMessages(prev => prev.map(m => m._id === tempId ? data.message : m));
      const otherParticipant = activeConv.participants?.find((p: any) => p._id !== user?._id);
      if (otherParticipant) {
        getSocket()?.emit('sendMessage', { receiverId: otherParticipant._id, message: data.message, conversationId: activeConv._id });
      }
    } catch {
      setMessages(prev => prev.filter(m => m._id !== tempId));
    } finally { setSending(false); }
  };

  const handleTyping = (val: string) => {
    setText(val);
    const socket = getSocket();
    if (!socket || !activeConv) return;
    const otherParticipant = activeConv.participants?.find((p: any) => p._id !== user?._id);
    if (!typing) { setTyping(true); socket.emit('typing', { receiverId: otherParticipant?._id, conversationId: activeConv._id }); }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { setTyping(false); socket.emit('stopTyping', { receiverId: otherParticipant?._id, conversationId: activeConv._id }); }, 1500);
  };

  const searchUsers = async (q: string) => {
    setSearchQ(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try { const { data } = await api.get(`/users/search?q=${q}`); setSearchResults(data.users || []); } catch {}
  };

  const startConversation = async (userId: string) => {
    try {
      const { data } = await api.post('/messages/conversation', { participantId: userId });
      setActiveConv(data.conversation);
      setSearchResults([]); setSearchQ('');
      if (!conversations.find(c => c._id === data.conversation._id)) {
        setConversations(prev => [data.conversation, ...prev]);
      }
      setMobileView('chat');
    } catch {}
  };

  const getOtherParticipant = (conv: any) => conv.participants?.find((p: any) => p._id !== user?._id) || conv.participants?.[0];

  const formatMsgTime = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'h:mm a');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  };

  return (
    <div className="flex h-[calc(100vh-var(--navbar-height)-24px)] card overflow-hidden p-0">
      {/* Conversations list */}
      <div className={`w-full md:w-80 flex-shrink-0 border-r flex flex-col ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}
        style={{ borderColor: 'var(--color-border)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-heading font-bold text-xl mb-3" style={{ color: 'var(--color-text)' }}>Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
            <input value={searchQ} onChange={e => searchUsers(e.target.value)} placeholder="Search people..." className="pl-10 py-2 text-sm rounded-full" />
          </div>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="border-b" style={{ borderColor: 'var(--color-border)' }}>
            {searchResults.map(u => (
              <button key={u._id} onClick={() => startConversation(u._id)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[var(--color-bg-hover)] transition-colors">
                <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6B46C1&color=fff`}
                  alt="" className="w-10 h-10 avatar" />
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{u.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{u.username}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>No conversations yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Search for people to message</p>
            </div>
          ) : conversations.map(conv => {
            const other = getOtherParticipant(conv);
            const isActive = activeConv?._id === conv._id;
            return (
              <button key={conv._id} onClick={() => { setActiveConv(conv); setMobileView('chat'); }}
                className={`flex items-center gap-3 w-full px-4 py-3 transition-colors ${isActive ? 'bg-[var(--color-bg-tertiary)]' : 'hover:bg-[var(--color-bg-hover)]'}`}>
                <div className="relative flex-shrink-0">
                  <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6B46C1&color=fff`}
                    alt="" className="w-12 h-12 avatar" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[var(--color-bg)]" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{other?.name}</p>
                    <p className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--color-text-muted)' }}>
                      {conv.lastMessageAt && formatMsgTime(conv.lastMessageAt)}
                    </p>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {conv.lastMessage?.text || 'Start a conversation'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center">
              <Send className="w-8 h-8 text-white" />
            </div>
            <p className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Your Messages</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Send a message to start a conversation</p>
          </div>
        ) : (() => {
          const other = getOtherParticipant(activeConv);
          return (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                <button onClick={() => setMobileView('list')} className="md:hidden btn-ghost w-8 h-8 flex items-center justify-center p-0">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6B46C1&color=fff`}
                    alt="" className="w-10 h-10 avatar" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--color-bg)]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{other?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {isTyping ? <span className="text-[var(--color-brand)]">typing...</span> : 'Active now'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="btn-ghost w-9 h-9 flex items-center justify-center p-0"><Phone className="w-4 h-4" /></button>
                  <button className="btn-ghost w-9 h-9 flex items-center justify-center p-0"><Video className="w-4 h-4" /></button>
                  <button className="btn-ghost w-9 h-9 flex items-center justify-center p-0"><Info className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {messages.map((msg, i) => {
                  const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                  const showAvatar = !isMe && (i === 0 || messages[i - 1]?.sender?._id !== msg.sender?._id);
                  return (
                    <motion.div key={msg._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && (
                        <div className="w-7 flex-shrink-0">
                          {showAvatar && (
                            <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6B46C1&color=fff`}
                              alt="" className="w-7 h-7 avatar" />
                          )}
                        </div>
                      )}
                      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {msg.media && (
                          <img src={msg.media.url} alt="" className="rounded-2xl max-w-full mb-1" style={{ maxHeight: 200 }} />
                        )}
                        {msg.text && (
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                            ${isMe ? 'gradient-brand text-white rounded-br-sm' : 'rounded-bl-sm'}`}
                            style={!isMe ? { background: 'var(--color-bg-secondary)', color: 'var(--color-text)' } : {}}>
                            {msg.isDeleted ? <em style={{ opacity: 0.7 }}>Message deleted</em> : msg.text}
                          </div>
                        )}
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                            {formatMsgTime(msg.createdAt)}
                          </p>
                          {isMe && (
                            msg.pending ? <Check className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                              : <CheckCheck className="w-3 h-3" style={{ color: 'var(--color-brand)' }} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-end gap-2">
                    <img src={other?.avatar || `https://ui-avatars.com/api/?name=U&background=6B46C1&color=fff`}
                      alt="" className="w-7 h-7 avatar" />
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: 'var(--color-bg-secondary)' }}>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-text-muted)', animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--color-border)' }}>
                <button className="btn-ghost w-9 h-9 flex items-center justify-center p-0 flex-shrink-0">
                  <Image className="w-5 h-5 text-[var(--color-brand)]" />
                </button>
                <button className="btn-ghost w-9 h-9 flex items-center justify-center p-0 flex-shrink-0">
                  <Smile className="w-5 h-5 text-yellow-500" />
                </button>
                <div className="flex-1 relative">
                  <input value={text} onChange={e => handleTyping(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="Type a message..." className="w-full rounded-full py-2.5 pr-12 text-sm"
                    style={{ paddingLeft: '16px', background: 'var(--color-bg-secondary)', border: '1.5px solid var(--color-border)' }} />
                  <button onClick={sendMessage} disabled={!text.trim() || sending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white disabled:opacity-40 transition-opacity">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

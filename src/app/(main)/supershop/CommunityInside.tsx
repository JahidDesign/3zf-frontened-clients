'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MessageCircle, Bell, Users, Send,
  Video, FileText, Megaphone, Link2, CheckCircle,
  Calendar, Plus, Store
} from 'lucide-react';
import { useMessages, useCommunityUpdates, useInviteLink } from '@/hooks/Usecommunityshop';
import CreateShopForm from './CreateShopForm';
import api from '@/lib/api';

interface Props {
  shopId: string | null;
  onBack: () => void;
}

type Panel = 'chat' | 'updates' | 'members' | 'create';

const UPDATE_ICONS: Record<string, React.ReactNode> = {
  announcement: <Megaphone className="w-4 h-4 text-purple-500" />,
  meeting:      <Video     className="w-4 h-4 text-blue-500"   />,
  document:     <FileText  className="w-4 h-4 text-amber-500"  />,
  general:      <Bell      className="w-4 h-4 text-teal-500"   />,
};

const UPDATE_BG: Record<string, string> = {
  announcement: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800',
  meeting:      'bg-blue-50   dark:bg-blue-900/20   border-blue-100   dark:border-blue-800',
  document:     'bg-amber-50  dark:bg-amber-900/20  border-amber-100  dark:border-amber-800',
  general:      'bg-teal-50   dark:bg-teal-900/20   border-teal-100   dark:border-teal-800',
};

function formatTime(iso: string) {
  const d    = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)    return 'এইমাত্র';
  if (diff < 3600)  return `${Math.floor(diff / 60)} মিনিট আগে`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ঘণ্টা আগে`;
  return d.toLocaleDateString('bn-BD');
}

export default function CommunityInside({ shopId, onBack }: Props) {
  const [panel, setPanel]       = useState<Panel>('chat');
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [members, setMembers]   = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const { messages, loading: msgLoading, sendMessage } = useMessages(shopId || '');
  const { updates,  loading: updLoading }              = useCommunityUpdates(shopId || '');
  const { link: inviteLink, copyLink }                 = useInviteLink(shopId || '');

  // Fetch shop info
  useEffect(() => {
    if (!shopId) return;
    api.get(`/community-shop/shops/${shopId}`)
      .then(r => setShopInfo(r.data.shop))
      .catch(() => {});
  }, [shopId]);

  // Fetch members when members panel opens
  useEffect(() => {
    if (panel !== 'members' || !shopId) return;
    api.get(`/community-shop/membership/shop/${shopId}`)
      .then(r => setMembers(r.data.members))
      .catch(() => {});
  }, [panel, shopId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── No shopId: show create-shop landing ──────────────────────────────
  if (!shopId) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-teal-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">কোনো শপ নির্বাচন করা হয়নি</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs leading-relaxed">
          Shop List থেকে একটি শপ বেছে নিন অথবা নতুন শপ তৈরি করুন।
        </p>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            ← Shop List
          </button>
          <button
            onClick={() => setPanel('create')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-bold hover:from-teal-500 hover:to-emerald-500 transition shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> নতুন শপ তৈরি
          </button>
        </div>

        {/* Create Shop panel when no shopId */}
        <AnimatePresence>
          {panel === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="mt-8 w-full max-w-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setPanel('chat')}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">নতুন কমিউনিটি শপ তৈরি</h3>
              </div>
              <CreateShopForm onSuccess={() => { setPanel('chat'); onBack(); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const ok = await sendMessage(inputText.trim());
    if (ok) setInputText('');
  };

  const tabs: { key: Panel; label: string; icon: React.ReactNode }[] = [
    { key: 'chat',    label: 'গ্রুপ চ্যাট', icon: <MessageCircle className="w-4 h-4" /> },
    { key: 'updates', label: 'আপডেট',        icon: <Bell          className="w-4 h-4" /> },
    { key: 'members', label: 'সদস্যরা',      icon: <Users         className="w-4 h-4" /> },
    { key: 'create',  label: 'নতুন শপ',      icon: <Plus          className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">

      {/* ── Shop Header ─────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 dark:text-white truncate">
            {shopInfo?.name || 'কমিউনিটি শপ'}
          </h2>
          <p className="text-xs text-gray-400">{shopInfo?.area} · {shopInfo?.memberCount || 0} সদস্য</p>
        </div>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 px-3 py-1.5 rounded-xl hover:bg-teal-100 transition"
        >
          <Link2 className="w-3.5 h-3.5" /> আমন্ত্রণ
        </button>
      </div>

      {/* ── Panel Tabs ───────────────────────────────────── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setPanel(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              panel === t.key
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── GROUP CHAT ──────────────────────────────────── */}
      {panel === 'chat' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {msgLoading ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">লোড হচ্ছে...</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">কোনো বার্তা নেই। প্রথম বার্তা পাঠান!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = false; // replace with: msg.user._id === currentUserId
                return (
                  <motion.div
                    key={msg._id || i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-xs font-bold text-teal-700 dark:text-teal-300 shrink-0">
                      {msg.user?.profilePhoto
                        ? <img src={msg.user.profilePhoto} alt="" className="w-full h-full rounded-full object-cover" />
                        : (msg.user?.name?.[0] || '?')}
                    </div>
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <span className="text-[10px] text-gray-400 mb-0.5 px-1">
                        {msg.user?.name} · {formatTime(msg.createdAt)}
                      </span>
                      <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-teal-600 text-white rounded-tr-sm'
                          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <input
              type="text"
              placeholder="বার্তা লিখুন..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-teal-400 dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── UPDATES / ANNOUNCEMENTS ─────────────────────── */}
      {panel === 'updates' && (
        <div className="flex-1 overflow-y-auto space-y-3">
          {updLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">লোড হচ্ছে...</div>
          ) : updates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">কোনো আপডেট নেই</p>
            </div>
          ) : (
            updates.map((u, i) => (
              <motion.div
                key={u._id || i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-2xl p-4 ${UPDATE_BG[u.type] || UPDATE_BG.general}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0">
                    {UPDATE_ICONS[u.type] || UPDATE_ICONS.general}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{u.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{u.body}</p>
                    {u.meetingDate && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 dark:text-blue-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(u.meetingDate).toLocaleString('bn-BD')}</span>
                      </div>
                    )}
                    {u.meetingLink && (
                      <a
                        href={u.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Video className="w-3.5 h-3.5" /> মিটিং লিঙ্ক ↗
                      </a>
                    )}
                    {u.fileUrl && (
                      <a
                        href={u.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition"
                      >
                        <FileText className="w-3.5 h-3.5" /> ফাইল দেখুন ↗
                      </a>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2">
                      {u.author?.name} · {formatTime(u.createdAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── MEMBERS ─────────────────────────────────────── */}
      {panel === 'members' && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Users className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">সদস্য তালিকা লোড হচ্ছে...</p>
            </div>
          ) : (
            members.map((m, i) => (
              <motion.div
                key={m._id || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-3"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-sm font-bold text-teal-700 dark:text-teal-300 shrink-0">
                  {m.profilePhoto?.url
                    ? <img src={m.profilePhoto.url} alt="" className="w-full h-full rounded-xl object-cover" />
                    : (m.name?.[0] || '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.region} · {m.gender}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-teal-600 font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    <span>{m.memberId}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('bn-BD') : ''}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── CREATE SHOP ─────────────────────────────────── */}
      {panel === 'create' && (
        <div className="flex-1 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">নতুন কমিউনিটি শপ তৈরি করুন</h3>
            <p className="text-xs text-gray-400 mt-0.5">আবেদন জমার পর অ্যাডমিন অনুমোদন করবেন</p>
          </div>
          <CreateShopForm onSuccess={() => setPanel('chat')} />
        </div>
      )}

    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { ThumbsUp, MessageCircle, UserPlus, Share2, Bell, Check } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getSocket } from '@/hooks/useSocket';
import useAuthStore from '@/store/authStore';

const ICONS: Record<string, any> = {
  like: ThumbsUp, comment: MessageCircle, friendRequest: UserPlus,
  friendAccepted: UserPlus, share: Share2, system: Bell, default: Bell,
};
const COLORS: Record<string, string> = {
  like: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  comment: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  friendRequest: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  friendAccepted: 'text-teal-500 bg-teal-100 dark:bg-teal-900/30',
  share: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  system: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const socket = getSocket();
    if (socket) {
      socket.on('newNotification', (n: any) => {
        setNotifications(prev => [n, ...prev]);
        setUnread(prev => prev + 1);
      });
    }
    return () => { getSocket()?.off('newNotification'); };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {} finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
      toast.success('All marked as read');
    } catch {}
  };

  const handleFriendAction = async (notif: any, action: 'accept' | 'reject') => {
    try {
      await api.post(`/friends/${action}/${notif.sender?._id}`);
      setNotifications(prev => prev.filter(n => n._id !== notif._id));
      toast.success(action === 'accept' ? 'Friend request accepted!' : 'Request rejected');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="card mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Notifications</h1>
            {unread > 0 && <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{unread} unread</p>}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 btn-ghost text-sm px-3">
              <Check className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full" style={{ background: 'var(--color-border)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded w-3/4" style={{ background: 'var(--color-border)' }} />
                <div className="h-2 rounded w-1/3" style={{ background: 'var(--color-border)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
          <p className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>No notifications yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>When someone interacts with you, it'll show here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n, i) => {
            const Icon = ICONS[n.type] || ICONS.default;
            const colorClass = COLORS[n.type] || COLORS.system;
            return (
              <motion.div key={n._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={n.link || '/community'}
                  className={`flex items-start gap-3 p-4 rounded-2xl transition-colors ${n.isRead ? '' : 'border-l-2 border-[var(--color-brand)]'} hover:bg-[var(--color-bg-hover)]`}
                  style={{ background: n.isRead ? 'var(--color-bg)' : 'var(--color-bg-tertiary)' }}>
                  <div className="relative flex-shrink-0">
                    <img src={n.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.sender?.name || '3ZF')}&background=6B46C1&color=fff`}
                      alt="" className="w-12 h-12 avatar" />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug" style={{ color: 'var(--color-text)' }}>
                      <span className="font-semibold">{n.sender?.name || '3ZF'}</span>{' '}
                      {n.body}
                    </p>
                    <p className="text-xs mt-1" style={{ color: n.isRead ? 'var(--color-text-muted)' : 'var(--color-brand)' }}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                    {n.type === 'friendRequest' && (
                      <div className="flex gap-2 mt-2" onClick={e => e.preventDefault()}>
                        <button onClick={() => handleFriendAction(n, 'accept')}
                          className="btn-primary text-xs px-4 py-1.5">Accept</button>
                        <button onClick={() => handleFriendAction(n, 'reject')}
                          className="btn-secondary text-xs px-4 py-1.5">Decline</button>
                      </div>
                    )}
                  </div>
                  {!n.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full gradient-brand flex-shrink-0 mt-1" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

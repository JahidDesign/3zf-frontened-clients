'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, UserMinus, Users, Search, Clock } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

type FriendsTab = 'friends' | 'requests' | 'suggestions' | 'sent';

export default function FriendsPage() {
  const { user, fetchMe } = useAuthStore();
  const [tab, setTab] = useState<FriendsTab>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set()); // ← track sent requests
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'friends' && user) {
        const { data } = await api.get(`/friends/${user._id}`);
        setFriends(data.friends || []);
      } else if (tab === 'requests') {
        const me = await api.get('/auth/me');
        setRequests(me.data.user?.friendRequests || []);
      } else if (tab === 'suggestions') {
        const { data } = await api.get('/friends/suggestions');
        setSuggestions(data.suggestions || []);
      }
    } catch {} finally { setLoading(false); }
  };

  const acceptRequest = async (userId: string) => {
    try {
      await api.post(`/friends/accept/${userId}`);
      setRequests(r => r.filter((u: any) => u._id !== userId));
      toast.success('Friend request accepted!');
      fetchMe();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const declineRequest = async (userId: string) => {
    try {
      await api.post(`/friends/reject/${userId}`);
      setRequests(r => r.filter((u: any) => u._id !== userId));
      toast.success('Request declined');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const sendRequest = async (userId: string) => {
    try {
      await api.post(`/friends/request/${userId}`);
      setSentIds(prev => new Set(prev).add(userId)); // ← mark as sent, keep card visible
      toast.success('Friend request sent!');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const cancelRequest = async (userId: string) => {
    try {
      await api.post(`/friends/cancel/${userId}`); // adjust endpoint if different
      setSentIds(prev => { const s = new Set(prev); s.delete(userId); return s; });
      toast.success('Request cancelled');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const unfriend = async (userId: string) => {
    if (!confirm('Unfriend this person?')) return;
    try {
      await api.delete(`/friends/unfriend/${userId}`);
      setFriends(f => f.filter((u: any) => u._id !== userId));
      toast.success('Unfriended');
    } catch { toast.error('Failed'); }
  };

  const tabs: { key: FriendsTab; label: string; count?: number }[] = [
    { key: 'friends',     label: 'All Friends', count: friends.length },
    { key: 'requests',    label: 'Requests',    count: requests.length },
    { key: 'suggestions', label: 'Suggestions' },
  ];

  const filteredFriends = friends.filter((f: any) =>
    !search ||
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.username?.toLowerCase().includes(search.toLowerCase())
  );

  const UserCard = ({ u, actions }: { u: any; actions: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center gap-3">
      <Link href={`/community/profile/${u.username}`} className="flex-shrink-0">
        <img
          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6B46C1&color=fff`}
          alt=""
          className="w-14 h-14 rounded-full object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/community/profile/${u.username}`}>
          <p className="font-semibold text-sm hover:text-[var(--color-brand)] transition-colors" style={{ color: 'var(--color-text)' }}>{u.name}</p>
        </Link>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{u.username}</p>
        {u.bio && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>{u.bio}</p>}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">{actions}</div>
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading text-xl font-bold" style={{ color: 'var(--color-text)' }}>Friends</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
                ${tab === t.key ? 'gradient-brand text-white' : 'btn-secondary'}`}>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tab === t.key ? 'bg-white/30' : 'bg-[var(--color-brand)] text-white'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'friends' && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..." className="pl-10" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card flex gap-3 animate-pulse">
              <div className="w-14 h-14 rounded-full" style={{ background: 'var(--color-border)' }} />
              <div className="flex-1 space-y-2 py-2">
                <div className="h-3 rounded w-1/2" style={{ background: 'var(--color-border)' }} />
                <div className="h-3 rounded w-1/3" style={{ background: 'var(--color-border)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">

          {/* FRIENDS */}
          {tab === 'friends' && (
            filteredFriends.length === 0
              ? <div className="card text-center py-14">
                  <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
                  <p style={{ color: 'var(--color-text-secondary)' }}>{search ? 'No results' : 'No friends yet'}</p>
                </div>
              : filteredFriends.map((f: any) => (
                <UserCard key={f._id} u={f} actions={
                  <>
                    <Link href="/community/messages" className="btn-primary text-xs px-3 py-1.5">Message</Link>
                    <button onClick={() => unfriend(f._id)} className="btn-ghost text-xs px-2 py-1.5 text-red-500">
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </>
                } />
              ))
          )}

          {/* REQUESTS */}
          {tab === 'requests' && (
            requests.length === 0
              ? <div className="card text-center py-14">
                  <UserPlus className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
                  <p style={{ color: 'var(--color-text-secondary)' }}>No pending requests</p>
                </div>
              : requests.map((u: any) => (
                <UserCard key={u._id} u={u} actions={
                  <>
                    <button onClick={() => acceptRequest(u._id)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button onClick={() => declineRequest(u._id)} className="btn-secondary text-xs px-3 py-1.5">Decline</button>
                  </>
                } />
              ))
          )}

          {/* SUGGESTIONS */}
          {tab === 'suggestions' && (
            suggestions.length === 0
              ? <div className="card text-center py-14">
                  <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
                  <p style={{ color: 'var(--color-text-secondary)' }}>No suggestions right now</p>
                </div>
              : suggestions.map((u: any) => (
                <UserCard key={u._id} u={u} actions={
                  sentIds.has(u._id) ? (
                    // ← Request sent: show "Sent" state + cancel option
                    <button
                      onClick={() => cancelRequest(u._id)}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                      title="Cancel request"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Sent
                    </button>
                  ) : (
                    // ← Not sent yet: show Add button
                    <button
                      onClick={() => sendRequest(u._id)}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Add
                    </button>
                  )
                } />
              ))
          )}

        </div>
      )}
    </div>
  );
}
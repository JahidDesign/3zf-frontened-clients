'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Plus, Lock, Globe, Search } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'discover' | 'mine'>('discover');
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', privacy: 'public', category: 'General' });

  useEffect(() => { fetchGroups(); }, [search]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${search}` : '';
      const { data } = await api.get(`/groups${params}`);
      setGroups(data.groups || []);
    } catch {} finally { setLoading(false); }
  };

  const joinGroup = async (groupId: string) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      toast.success('Joined group!');
      fetchGroups();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const createGroup = async () => {
    if (!newGroup.name.trim()) return toast.error('Group name required');
    try {
      await api.post('/groups', newGroup);
      toast.success('Group created!');
      setCreating(false);
      setNewGroup({ name: '', description: '', privacy: 'public', category: 'General' });
      fetchGroups();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading text-xl font-bold" style={{ color: 'var(--color-text)' }}>Groups</h1>
          <button onClick={() => setCreating(!creating)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Create Group
          </button>
        </div>

        {/* Create form */}
        {creating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="border-t pt-4 space-y-3" style={{ borderColor: 'var(--color-border)' }}>
            <input value={newGroup.name} onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))} placeholder="Group name *" />
            <textarea rows={2} value={newGroup.description} onChange={e => setNewGroup(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" />
            <div className="grid grid-cols-2 gap-3">
              <select value={newGroup.privacy} onChange={e => setNewGroup(p => ({ ...p, privacy: e.target.value }))}>
                <option value="public">🌍 Public</option>
                <option value="private">🔒 Private</option>
              </select>
              <input value={newGroup.category} onChange={e => setNewGroup(p => ({ ...p, category: e.target.value }))} placeholder="Category" />
            </div>
            <div className="flex gap-2">
              <button onClick={createGroup} className="btn-primary px-5 py-2 text-sm">Create</button>
              <button onClick={() => setCreating(false)} className="btn-secondary px-5 py-2 text-sm">Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..." className="pl-10" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {(['discover', 'mine'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t ? 'gradient-brand text-white' : 'btn-secondary'}`}>
              {t === 'discover' ? 'Discover' : 'My Groups'}
            </button>
          ))}
        </div>
      </div>

      {/* Groups list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card flex gap-4 animate-pulse">
              <div className="w-16 h-16 rounded-2xl flex-shrink-0" style={{ background: 'var(--color-border)' }} />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 rounded w-1/2" style={{ background: 'var(--color-border)' }} />
                <div className="h-3 rounded w-3/4" style={{ background: 'var(--color-border)' }} />
              </div>
            </div>
          ))
        ) : groups.length === 0 ? (
          <div className="card text-center py-14">
            <Users className="w-14 h-14 mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>No groups found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Create one and invite your friends</p>
          </div>
        ) : groups.map((group, i) => (
          <motion.div key={group._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <div className="card flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: 'var(--color-bg-tertiary)' }}>
                {group.avatar
                  ? <img src={group.avatar} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">👥</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>{group.name}</h3>
                  {group.privacy === 'private' ? <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    : <Globe className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />}
                </div>
                {group.description && (
                  <p className="text-xs truncate mb-1" style={{ color: 'var(--color-text-secondary)' }}>{group.description}</p>
                )}
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {group.memberCount || 0} members · {group.category}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/community/groups/${group._id}`} className="btn-secondary text-xs px-3 py-1.5">View</Link>
                <button onClick={() => joinGroup(group._id)} className="btn-primary text-xs px-3 py-1.5">Join</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

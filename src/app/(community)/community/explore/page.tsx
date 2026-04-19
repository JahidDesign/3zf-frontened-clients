'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Hash, TrendingUp } from 'lucide-react';
import PostCard from '@/components/community/PostCard';
import api from '@/lib/api';
import { useT } from '@/hooks/useT';

export default function ExplorePage() {
  const { t } = useT();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || params.get('tag') || '');
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'posts' | 'people'>('posts');
  const [inputVal, setInputVal] = useState(q);

  useEffect(() => { if (q) doSearch(); }, [q]);

  const doSearch = async () => {
    setLoading(true);
    try {
      const [pr, ur] = await Promise.all([
        api.get('/posts/feed?limit=20'),
        api.get('/users/search?q=' + encodeURIComponent(q) + '&limit=15'),
      ]);
      setPosts(pr.data.posts || []);
      setUsers(ur.data.users || []);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="card mb-4">
        <h1 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{t.community.explore}</h1>
        <form onSubmit={e => { e.preventDefault(); setQ(inputVal); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
            <input value={inputVal} onChange={e => setInputVal(e.target.value)} placeholder={t.common.search + '...'} className="pl-10" />
          </div>
          <button type="submit" className="btn-primary px-5">{t.common.search}</button>
        </form>
        {q && (
          <div className="flex gap-2 mt-3">
            {(['posts', 'people'] as const).map(tb => (
              <button key={tb} onClick={() => setTab(tb)} className={'px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ' + (tab === tb ? 'gradient-brand text-white' : 'btn-secondary')}>{tb}</button>
            ))}
          </div>
        )}
      </div>
      {!q ? (
        <div className="card text-center py-14"><TrendingUp className="w-14 h-14 mx-auto mb-3" style={{ color: 'var(--color-border)' }} /><p style={{ color: 'var(--color-text-secondary)' }}>Search for posts, people, or hashtags</p></div>
      ) : loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="card animate-pulse h-32" style={{ background: 'var(--color-border)' }} />)}</div>
      ) : tab === 'posts' ? (
        <div className="space-y-3">{posts.map(p => <PostCard key={p._id} post={p} />)}</div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u._id} className="card flex items-center gap-3">
              <img src={u.avatar || 'https://ui-avatars.com/api/?name=U&background=6B46C1&color=fff'} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1"><p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{u.name}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{u.username}</p></div>
              <a href={'/community/profile/' + u.username} className="btn-primary text-xs px-4 py-1.5">View</a>
            </div>
          ))}
          {users.length === 0 && <div className="card text-center py-8"><p style={{ color: 'var(--color-text-secondary)' }}>{t.common.noResults}</p></div>}
        </div>
      )}
    </div>
  );
}

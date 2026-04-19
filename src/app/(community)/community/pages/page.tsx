'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Globe, ThumbsUp, Search } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useT } from '@/hooks/useT';

export default function PagesListPage() {
  const { t } = useT();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => { fetchPages(); }, [search]);
  const fetchPages = async () => {
    setLoading(true);
    try {
      const p = search ? '?search=' + search : '';
      const { data } = await api.get('/pages' + p);
      setPages(data.pages || []);
    } catch {} finally { setLoading(false); }
  };
  const likePage = async (id: string) => {
    try { await api.post('/pages/' + id + '/like'); fetchPages(); toast.success('Done!'); } catch {}
  };
  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="card mb-4">
        <h1 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{t.community.pages}</h1>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.common.search + ' pages...'} className="pl-10" />
        </div>
      </div>
      <div className="space-y-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card animate-pulse h-20" style={{ background: 'var(--color-border)' }} />)
        : pages.length === 0 ? (
          <div className="card text-center py-12"><Globe className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-border)' }} /><p style={{ color: 'var(--color-text-secondary)' }}>No pages found</p></div>
        ) : pages.map((page, i) => (
          <motion.div key={page._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="card flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: 'var(--color-bg-tertiary)' }}>
              {page.avatar ? <img src={page.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>{page.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{page.likeCount || 0} likes · {page.category}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href={'/community/pages/' + page.slug} className="btn-secondary text-xs px-3 py-1.5">View</Link>
              <button onClick={() => likePage(page._id)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> Like
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

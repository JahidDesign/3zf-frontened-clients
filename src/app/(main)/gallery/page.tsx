// ============================================================
// Gallery page: apps/frontend/src/app/(main)/gallery/page.tsx
// ============================================================
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, ZoomIn } from 'lucide-react';
import MainNavbar from '@/components/layout/MainNavbar';
import MainFooter from '@/components/layout/MainFooter';
import api from '@/lib/api';

const CATEGORIES = ['All', 'Events', 'Community', 'Nature', 'Organisation', 'Others'];

export function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => { fetchGallery(); }, [category]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const params = category && category !== 'All' ? `?category=${category}` : '';
      const { data } = await api.get(`/gallery${params}`);
      setItems(data.items || []);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">
        <div className="gradient-brand text-white py-12 px-4 text-center">
          <h1 className="font-heading text-4xl font-bold mb-2">Gallery</h1>
          <p className="text-purple-100">Our photo and video collection</p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all
                  ${(category === cat) || (cat === 'All' && !category) ? 'gradient-brand text-white' : 'btn-secondary'}`}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl break-inside-avoid" style={{ height: `${140 + (i % 3) * 60}px`, background: 'var(--color-border)' }} />
              ))}
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
              {items.map((item, i) => (
                <motion.div key={item._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                  className="break-inside-avoid mb-3 cursor-pointer group relative rounded-xl overflow-hidden"
                  onClick={() => setSelected(item)}>
                  {item.type === 'video' ? (
                    <div className="relative">
                      <video src={item.url} className="w-full rounded-xl" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img src={item.url} alt={item.title} className="w-full rounded-xl group-hover:scale-105 transition-transform duration-300" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <ZoomIn className="w-6 h-6 text-white" />
                    <span className="flex items-center gap-1 text-white text-sm"><Heart className="w-4 h-4" /> {item.likes?.length || 0}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            {selected.type === 'video' ? (
              <video src={selected.url} controls className="max-w-full max-h-[80vh] rounded-xl" autoPlay />
            ) : (
              <img src={selected.url} alt={selected.title} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            )}
            <p className="text-white text-center mt-3 font-medium">{selected.title}</p>
          </div>
        </div>
      )}

      <MainFooter />
    </div>
  );
}
export default GalleryPage;

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, ZoomIn, X, ChevronLeft, ChevronRight,
  Images, Loader2, Film,
} from 'lucide-react';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaFile {
  url: string;
  publicId: string;
  type: 'image' | 'video';
}

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  album?: string;
  category?: string;
  media: MediaFile[];
  isPublished: boolean;
  isFeatured?: boolean;
}

const CATEGORIES = ['All', 'Events', 'Community', 'Nature', 'Organisation', 'Others'];

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  items, startIndex, onClose,
}: {
  items: GalleryItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const item  = items[index];
  const media = item?.media?.[0];

  const prev = useCallback(() => setIndex(i => (i - 1 + items.length) % items.length), [items.length]);
  const next = useCallback(() => setIndex(i => (i + 1) % items.length), [items.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')       onClose();
      if (e.key === 'ArrowLeft')    prev();
      if (e.key === 'ArrowRight')   next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  if (!item || !media) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.93)' }}
        onClick={onClose}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Prev */}
        {items.length > 1 && (
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Media */}
        <div
          className="max-w-4xl w-full flex flex-col items-center gap-4"
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full flex justify-center"
          >
            {media.type === 'video' ? (
              <video
                src={media.url}
                controls
                autoPlay
                className="max-w-full max-h-[75vh] rounded-2xl"
              />
            ) : (
              <img
                src={media.url}
                alt={item.title}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl"
              />
            )}
          </motion.div>

          {/* Caption */}
          <div className="text-center">
            <p className="text-white font-semibold text-base">{item.title}</p>
            {item.description && (
              <p className="text-white/60 text-sm mt-1">{item.description}</p>
            )}
            {items.length > 1 && (
              <p className="text-white/40 text-xs mt-1">{index + 1} / {items.length}</p>
            )}
          </div>

          {/* Dot indicators */}
          {items.length > 1 && items.length <= 20 && (
            <div className="flex gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === index ? '#fff' : 'rgba(255,255,255,0.3)' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Next */}
        {items.length > 1 && (
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Gallery Card ─────────────────────────────────────────────────────────────

function GalleryCard({
  item, index, onClick,
}: {
  item: GalleryItem; index: number; onClick: () => void;
}) {
  const media   = item.media?.[0];
  const isVideo = media?.type === 'video';

  if (!media) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className="break-inside-avoid mb-3 cursor-pointer group relative rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)' }}
      onClick={onClick}
    >
      {isVideo ? (
        <div className="relative w-full" style={{ minHeight: 160, background: 'var(--color-bg-secondary)' }}>
          <video
            src={media.url}
            className="w-full rounded-2xl"
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>
      ) : (
        <img
          src={media.url}
          alt={item.title}
          className="w-full rounded-2xl transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <div className="flex items-center gap-2">
          {isVideo
            ? <Film className="w-5 h-5 text-white" />
            : <ZoomIn className="w-5 h-5 text-white" />}
        </div>
        {item.title && (
          <p className="text-white text-xs font-medium px-3 text-center line-clamp-2">
            {item.title}
          </p>
        )}
      </div>

      {/* Multi-media badge */}
      {item.media.length > 1 && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
          +{item.media.length}
        </div>
      )}

      {/* Featured star */}
      {item.isFeatured && (
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)' }}>
          <span className="text-amber-400 text-xs">★</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [items,         setItems]         = useState<GalleryItem[]>([]);
  const [albums,        setAlbums]        = useState<string[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [category,      setCategory]      = useState('');
  const [albumFilter,   setAlbumFilter]   = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch gallery items
  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category)    params.set('category', category);
        if (albumFilter) params.set('album',    albumFilter);
        const { data } = await api.get(`/gallery?${params.toString()}`);
        setItems(data.items ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [category, albumFilter]);

  // Fetch albums once
  useEffect(() => {
    api.get('/gallery/albums')
      .then(({ data }) => setAlbums(data.albums ?? []))
      .catch(() => {});
  }, []);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  // Stats for hero
  const imageCount = items.filter(i => i.media?.[0]?.type !== 'video').length;
  const videoCount = items.filter(i => i.media?.[0]?.type === 'video').length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />

      <div className="pt-[var(--navbar-height)]">

        {/* Hero */}
        <div className="gradient-brand text-white py-14 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Images className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-3">Gallery</h1>
            <p className="text-purple-100 text-base">
              Our photo and video collection
            </p>
            {!loading && (imageCount + videoCount) > 0 && (
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-white/70">
                <span>{imageCount} photo{imageCount !== 1 ? 's' : ''}</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Category filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => {
              const val = cat === 'All' ? '' : cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(val)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all border ${
                    category === val
                      ? 'gradient-brand text-white border-transparent'
                      : 'btn-secondary'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Album filter */}
          {albums.length > 0 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
              {['', ...albums].map(a => (
                <button
                  key={a || '__all__'}
                  onClick={() => setAlbumFilter(a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all border ${
                    albumFilter === a
                      ? 'gradient-brand text-white border-transparent'
                      : 'btn-secondary'
                  }`}
                >
                  {a || 'All Albums'}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            /* Skeleton */
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="break-inside-avoid mb-3 animate-pulse rounded-2xl"
                  style={{ height: `${140 + (i % 4) * 55}px`, background: 'var(--color-border)' }}
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-32 text-center" style={{ color: 'var(--color-text-muted)' }}>
              <Images className="w-14 h-14 mx-auto mb-4 opacity-25" />
              <p className="font-semibold text-lg">No items found</p>
              <p className="text-sm mt-1">Try selecting a different category or album.</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
              {items.map((item, i) => (
                <GalleryCard
                  key={item._id}
                  item={item}
                  index={i}
                  onClick={() => openLightbox(i)}
                />
              ))}
            </div>
          )}

        </div>
      </div>

      <MainFooter />

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          items={items}
          startIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
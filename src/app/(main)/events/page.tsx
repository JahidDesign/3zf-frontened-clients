'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Clock, Globe,
  Search, SlidersHorizontal, X, Star,
  ChevronLeft, ChevronRight, ArrowRight,
  Loader2, Frown, Sparkles,
} from 'lucide-react';
import { format, isPast, isFuture, formatDistanceToNow } from 'date-fns';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Event {
  _id:         string;
  title:       string;
  slug?:       string;
  description?: string;
  banner?:     { url: string; publicId: string };
  image?:      string;
  location?:   string;
  isOnline?:   boolean;
  startDate:   string;
  endDate?:    string;
  capacity?:   number;
  attendees:   string[];
  organizer:   { _id: string; name: string; avatar?: string };
  status?:     'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isFeatured?: boolean;
  isPublished: boolean;
  tags?:       string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: 'all',       label: 'All Events' },
  { key: 'upcoming',  label: 'Upcoming'   },
  { key: 'ongoing',   label: 'Live Now'   },
  { key: 'completed', label: 'Past'       },
] as const;

type StatusKey = (typeof STATUS_TABS)[number]['key'];

const PAGE_SIZE = 9;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function eventStatus(event: Event): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' {
  if (event.status === 'cancelled') return 'cancelled';
  if (event.status) return event.status;
  const start = new Date(event.startDate);
  const end   = event.endDate ? new Date(event.endDate) : null;
  if (isPast(start) && end && !isPast(end)) return 'ongoing';
  if (isPast(start)) return 'completed';
  return 'upcoming';
}

function statusBadge(status: ReturnType<typeof eventStatus>) {
  const map = {
    upcoming:  { label: 'Upcoming',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',    dot: 'bg-blue-500' },
    ongoing:   { label: 'Live Now',  cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500 animate-pulse' },
    completed: { label: 'Past',      cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',        dot: 'bg-gray-400' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',         dot: 'bg-red-500' },
  };
  return map[status];
}

// ─── Featured Hero Card ───────────────────────────────────────────────────────

function FeaturedCard({ event }: { event: Event }) {
  const href      = `/events/${event.slug ?? event._id}`;
  const bannerUrl = event.banner?.url ?? event.image ?? null;
  const status    = eventStatus(event);
  const badge     = statusBadge(status);
  const spotsLeft = event.capacity ? event.capacity - event.attendees.length : null;
  const startsIn  = isFuture(new Date(event.startDate))
    ? formatDistanceToNow(new Date(event.startDate), { addSuffix: true })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-3xl overflow-hidden group"
      style={{ border: '1px solid var(--color-border)' }}
    >
      {/* Background image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full gradient-brand" />
        )}
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        <div className="max-w-xl">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-amber-900">
              <Star className="w-3 h-3 fill-current" /> Featured
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
            {event.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full text-white/70 backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.12)' }}>
                {tag}
              </span>
            ))}
          </div>

          <h2 className="font-heading text-2xl md:text-3xl font-black text-white leading-tight mb-2 drop-shadow-lg">
            {event.title}
          </h2>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
            <span className="flex items-center gap-1.5 text-sm text-white/80">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(event.startDate), 'MMM d, yyyy')}
              {startsIn && <span className="text-white/60">· {startsIn}</span>}
            </span>
            {(event.location || event.isOnline) && (
              <span className="flex items-center gap-1.5 text-sm text-white/80">
                {event.isOnline ? <Globe className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                {event.isOnline ? 'Online' : event.location}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-white/80">
              <Users className="w-3.5 h-3.5" />
              {event.attendees.length} attending
              {spotsLeft !== null && spotsLeft > 0 && (
                <span className="text-white/60">· {spotsLeft} spots left</span>
              )}
            </span>
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-2 gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-brand hover:opacity-90 transition-all group/btn"
          >
            View Event
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event, index }: { event: Event; index: number }) {
  const href      = `/events/${event.slug ?? event._id}`;
  const bannerUrl = event.banner?.url ?? event.image ?? null;
  const status    = eventStatus(event);
  const badge     = statusBadge(status);
  const spotsLeft = event.capacity ? event.capacity - event.attendees.length : null;
  const isFull    = spotsLeft !== null && spotsLeft <= 0;
  const startsIn  = isFuture(new Date(event.startDate))
    ? formatDistanceToNow(new Date(event.startDate), { addSuffix: true })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Image */}
      <Link href={href} className="block relative h-44 overflow-hidden flex-shrink-0 bg-[var(--color-bg-secondary)]">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full gradient-brand flex items-center justify-center">
            <Calendar className="w-12 h-12 text-white opacity-20" />
          </div>
        )}

        {/* Date chip */}
        <div className="absolute top-3 left-3 bg-white rounded-xl overflow-hidden text-center w-11 shadow-lg flex-shrink-0">
          <div className="gradient-brand text-white text-[9px] font-black uppercase py-0.5">
            {format(new Date(event.startDate), 'MMM')}
          </div>
          <div className="text-gray-900 text-base font-black py-0.5 leading-none pb-1">
            {format(new Date(event.startDate), 'd')}
          </div>
        </div>

        {/* Featured star */}
        {event.isFeatured && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow">
            <Star className="w-3.5 h-3.5 text-amber-900 fill-current" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${badge.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dot}`} />
            {badge.label}
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.slice(0, 3).map(tag => (
              <span key={tag}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={href}>
          <h3 className="font-heading font-bold text-base leading-snug line-clamp-2 hover:underline decoration-1 underline-offset-2 transition-colors"
            style={{ color: 'var(--color-text)' }}>
            {event.title}
          </h3>
        </Link>

        {/* Meta */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {format(new Date(event.startDate), 'EEE, MMM d · h:mm a')}
              {startsIn && <span className="ml-1 opacity-70">({startsIn})</span>}
            </span>
          </div>
          {(event.location || event.isOnline) && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {event.isOnline
                ? <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                : <MapPin className="w-3.5 h-3.5 flex-shrink-0" />}
              <span className="truncate">{event.isOnline ? 'Online Event' : event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {event.attendees.length} attending
              {spotsLeft !== null && (
                <span className={`ml-1 ${isFull ? 'text-red-500 font-semibold' : 'opacity-70'}`}>
                  · {isFull ? 'Full' : `${spotsLeft} left`}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Organizer + CTA */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={event.organizer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizer?.name ?? 'O')}&background=6B46C1&color=fff&size=40`}
              alt={event.organizer?.name}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
            <span className="text-xs truncate font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {event.organizer?.name}
            </span>
          </div>
          <Link
            href={href}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all gradient-brand text-white hover:opacity-90 flex-shrink-0"
          >
            Details <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton Cards ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
      <div className="h-44" style={{ background: 'var(--color-border)' }} />
      <div className="p-4 space-y-3">
        <div className="h-3 rounded w-1/3" style={{ background: 'var(--color-border)' }} />
        <div className="h-5 rounded w-4/5" style={{ background: 'var(--color-border)' }} />
        <div className="h-3 rounded w-3/5" style={{ background: 'var(--color-border)' }} />
        <div className="h-3 rounded w-2/5" style={{ background: 'var(--color-border)' }} />
        <div className="h-px"             style={{ background: 'var(--color-border)' }} />
        <div className="flex justify-between items-center">
          <div className="h-6 w-24 rounded-full" style={{ background: 'var(--color-border)' }} />
          <div className="h-7 w-16 rounded-lg"   style={{ background: 'var(--color-border)' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events,       setEvents]       = useState<Event[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [activeTab,    setActiveTab]    = useState<StatusKey>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters,  setShowFilters]  = useState(false);
  const [page,         setPage]         = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    api.get('/events?limit=200&isPublished=true')
      .then(({ data }) => setEvents(data.events ?? data.data ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────
  const allTags = Array.from(new Set(events.flatMap(e => e.tags ?? []))).sort();

  const featured = events.filter(e => e.isFeatured && eventStatus(e) !== 'cancelled').slice(0, 1);

  const filtered = events.filter(e => {
    const status = eventStatus(e);
    const matchTab    = activeTab === 'all' || status === activeTab;
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase())
      || e.location?.toLowerCase().includes(search.toLowerCase())
      || e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchTags   = selectedTags.length === 0 || selectedTags.every(t => e.tags?.includes(t));
    return matchTab && matchSearch && matchTags;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const resetFilters = () => { setSearch(''); setSelectedTags([]); setActiveTab('all'); };

  const goPage = (p: number) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => { setPage(1); }, [search, activeTab, selectedTags]);

  const hasActiveFilters = search || selectedTags.length > 0 || activeTab !== 'all';

  // ── Tab counts ─────────────────────────────────────────────────────────
  const tabCounts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === 'all'
      ? events.length
      : events.filter(e => eventStatus(e) === tab.key).length;
    return acc;
  }, {} as Record<StatusKey, number>);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />

      <div className="pt-[var(--navbar-height)]" ref={topRef}>

        {/* ── Hero header ─────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-[0.04] gradient-brand pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-[0.04] gradient-brand pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand)' }}>
                  Community Events
                </span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-black mb-3 leading-tight"
                style={{ color: 'var(--color-text)' }}>
                Discover Events
              </h1>
              <p className="text-base max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
                Find workshops, meetups, and gatherings happening in your community — online and in person.
              </p>
            </motion.div>

            {/* ── Search bar ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mt-6 flex gap-3 max-w-2xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name, location, or tag…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(f => !f)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border flex-shrink-0 ${
                  showFilters || selectedTags.length > 0
                    ? 'gradient-brand text-white border-transparent shadow-brand'
                    : 'btn-secondary'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {selectedTags.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white/30 text-white text-xs font-black flex items-center justify-center">
                    {selectedTags.length}
                  </span>
                )}
              </button>
            </motion.div>

            {/* ── Tag filter panel ────────────────────────────────────── */}
            <AnimatePresence>
              {showFilters && allTags.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-3"
                      style={{ color: 'var(--color-text-muted)' }}>
                      Filter by Tag
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border capitalize ${
                            selectedTags.includes(tag)
                              ? 'gradient-brand text-white border-transparent'
                              : 'btn-secondary'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Featured event ──────────────────────────────────────── */}
          {!loading && featured.length > 0 && !hasActiveFilters && (
            <div className="mb-10">
              <FeaturedCard event={featured[0]} />
            </div>
          )}

          {/* ── Status tabs ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div
              className="flex items-center gap-1 p-1 rounded-xl flex-wrap"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            >
              {STATUS_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'gradient-brand text-white shadow-sm'
                      : ''
                  }`}
                  style={activeTab !== tab.key ? { color: 'var(--color-text-secondary)' } : {}}
                >
                  {tab.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === tab.key
                        ? 'bg-white/20 text-white'
                        : ''
                    }`}
                    style={activeTab !== tab.key ? { background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' } : {}}
                  >
                    {tabCounts[tab.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Active filter chips + clear */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    {tag}
                    <button onClick={() => toggleTag(tag)} className="ml-0.5 hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button onClick={resetFilters} className="text-xs font-semibold px-3 py-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-800">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* ── Results summary ─────────────────────────────────────── */}
          {!loading && (
            <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
              {filtered.length === 0
                ? 'No events found'
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} event${filtered.length !== 1 ? 's' : ''}`}
            </p>
          )}

          {/* ── Grid ────────────────────────────────────────────────── */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : paged.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <Frown className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <p className="font-heading font-bold text-lg mb-1" style={{ color: 'var(--color-text)' }}>
                No events found
              </p>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                Try adjusting your search or filters.
              </p>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold">
                  Clear filters
                </button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${search}-${page}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {paged.map((event, i) => (
                  <EventCard key={event._id} event={event} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── Pagination ───────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => goPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary p-2.5 rounded-xl disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...'
                    ? <span key={`dot-${i}`} className="px-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>…</span>
                    : (
                      <button
                        key={p}
                        onClick={() => goPage(p as number)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                          p === page ? 'gradient-brand text-white shadow-brand' : 'btn-secondary'
                        }`}
                      >
                        {p}
                      </button>
                    )
                )}

              <button
                onClick={() => goPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-secondary p-2.5 rounded-xl disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      <MainFooter />
    </div>
  );
}
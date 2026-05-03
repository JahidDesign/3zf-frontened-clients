'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Clock, ExternalLink,
  ArrowLeft, Share2, Check, ChevronRight,
  AlertCircle, Globe, UserCheck, UserMinus,
  ZoomIn, X,
} from 'lucide-react';
import { format, isPast, isFuture, formatDistanceToNow } from 'date-fns';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Event {
  _id:          string;
  title:        string;
  slug?:        string;
  description?: string;
  banner?:      { url: string; publicId: string };
  image?:       string;
  location?:    string;
  isOnline?:    boolean;
  onlineUrl?:   string;
  startDate:    string;
  endDate?:     string;
  capacity?:    number;
  attendees:    string[];
  organizer:    { _id: string; name: string; avatar?: string };
  status?:      'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isFeatured?:  boolean;
  isPublished:  boolean;
  tags?:        string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(event: Event) {
  if (event.status === 'cancelled')
    return { label: 'Cancelled', cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' };
  if (event.status === 'ongoing' || (!isPast(new Date(event.endDate ?? event.startDate)) && isPast(new Date(event.startDate))))
    return { label: 'Happening Now', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  if (isPast(new Date(event.startDate)))
    return { label: 'Past', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' };
  return { label: 'Upcoming', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white transition hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
        <motion.img
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          src={src}
          alt={alt}
          onClick={e => e.stopPropagation()}
          className="max-w-full max-h-[88vh] rounded-2xl object-contain shadow-2xl"
        />
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Attend Button ────────────────────────────────────────────────────────────

function AttendButton({ event }: { event: Event }) {
  const isFull    = !!(event.capacity && event.attendees.length >= event.capacity);
  const isPastEvt = isPast(new Date(event.startDate));
  const cancelled = event.status === 'cancelled';

  const [attending, setAttending] = useState(false);
  const [count,     setCount]     = useState(event.attendees.length);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const toggle = async () => {
    if (loading || isPastEvt || cancelled) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/events/${event._id}/attend`);
      setAttending(data.attending);
      setCount(data.count);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Please log in to RSVP.');
    } finally {
      setLoading(false);
    }
  };

  if (isPastEvt || cancelled) {
    return (
      <button disabled className="w-full py-3 rounded-xl text-sm font-semibold opacity-50 btn-secondary">
        {cancelled ? 'Event Cancelled' : 'Event Ended'}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={toggle}
        disabled={loading || (isFull && !attending)}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
          attending
            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800'
            : isFull
            ? 'opacity-50 cursor-not-allowed btn-secondary'
            : 'gradient-brand text-white shadow-brand hover:opacity-90'
        }`}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : attending ? (
          <><UserMinus className="w-4 h-4" /> Cancel RSVP</>
        ) : isFull ? (
          <><Users className="w-4 h-4" /> Event Full</>
        ) : (
          <><UserCheck className="w-4 h-4" /> Attend This Event</>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
      <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
        {count} attending{event.capacity ? ` · ${event.capacity - count} spots left` : ''}
      </p>
    </div>
  );
}

// ─── Share Button ─────────────────────────────────────────────────────────────

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button
      onClick={handle}
      className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 rounded-xl w-full justify-center"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Share Event'}
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-72 w-full" style={{ background: 'var(--color-border)' }} />
      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 rounded w-1/4"  style={{ background: 'var(--color-border)' }} />
          <div className="h-8 rounded w-3/4"  style={{ background: 'var(--color-border)' }} />
          <div className="h-56 rounded-2xl"   style={{ background: 'var(--color-border)' }} />
          <div className="h-4 rounded w-2/3"  style={{ background: 'var(--color-border)' }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 rounded" style={{ background: 'var(--color-border)', width: i % 3 === 2 ? '70%' : '100%' }} />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-40 rounded-2xl" style={{ background: 'var(--color-border)' }} />
          <div className="h-12 rounded-xl"  style={{ background: 'var(--color-border)' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const params   = useParams<{ slug: string }>();
  const router   = useRouter();
  const idOrSlug = params.slug;

  const [event,     setEvent]     = useState<Event | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [lightbox,  setLightbox]  = useState(false);

  useEffect(() => {
    if (!idOrSlug) return;
    setLoading(true);
    api.get(`/events/${idOrSlug}`)
      .then(({ data }) => setEvent(data.event))
      .catch(e => setError(e?.response?.data?.message ?? 'Event not found.'))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
        <MainNavbar />
        <div className="pt-[var(--navbar-height)]"><Skeleton /></div>
        <MainFooter />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-secondary)' }}>
        <MainNavbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-[var(--navbar-height)]">
          <div className="text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {error || 'Event not found'}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              This event doesn't exist or has been removed.
            </p>
            <Link href="/events" className="btn-secondary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>
          </div>
        </div>
        <MainFooter />
      </div>
    );
  }

  const bannerUrl = event.banner?.url ?? event.image ?? null;
  const badge     = statusBadge(event);
  const startsIn  = isFuture(new Date(event.startDate))
    ? formatDistanceToNow(new Date(event.startDate), { addSuffix: true })
    : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />

      {/* Lightbox */}
      {lightbox && bannerUrl && (
        <Lightbox src={bannerUrl} alt={event.title} onClose={() => setLightbox(false)} />
      )}

      <div className="pt-[var(--navbar-height)]">

        {/* ── Hero Banner ──────────────────────────────────────────────── */}
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-brand flex items-center justify-center">
              <Calendar className="w-20 h-20 text-white opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Back */}
          <div className="absolute top-4 left-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white font-medium backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>

          {/* Zoom button — only if banner exists */}
          {bannerUrl && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {event.isFeatured && (
                <span className="badge bg-amber-400 text-amber-900 font-bold text-xs px-3 py-1">
                  ⭐ Featured
                </span>
              )}
              <button
                onClick={() => setLightbox(true)}
                title="View full image"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white backdrop-blur-sm bg-black/30 hover:bg-black/50 transition"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Featured badge when no banner */}
          {!bannerUrl && event.isFeatured && (
            <div className="absolute top-4 right-4">
              <span className="badge bg-amber-400 text-amber-900 font-bold text-xs px-3 py-1">
                ⭐ Featured
              </span>
            </div>
          )}

          {/* Date on banner */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="bg-white rounded-xl overflow-hidden text-center w-14 shadow-lg flex-shrink-0">
              <div className="gradient-brand text-white text-xs font-bold uppercase py-0.5 px-2">
                {format(new Date(event.startDate), 'MMM')}
              </div>
              <div className="text-gray-900 text-xl font-black py-1">
                {format(new Date(event.startDate), 'd')}
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight drop-shadow">{event.title}</p>
              {startsIn && (
                <p className="text-white/80 text-sm">Starts {startsIn}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
            <Link href="/events" className="hover:underline" style={{ color: 'var(--color-brand)' }}>Events</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="truncate max-w-[240px]">{event.title}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* ── Left: main info ──────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Title + status */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`badge text-xs font-semibold px-3 py-1 ${badge.cls}`}>
                    {badge.label}
                  </span>
                  {event.tags?.map(tag => (
                    <span key={tag} className="badge text-xs"
                      style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight"
                  style={{ color: 'var(--color-text)' }}>
                  {event.title}
                </h1>
              </div>

              {/* ── Event Image (body) ──────────────────────────────── */}
              {bannerUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative group rounded-2xl overflow-hidden cursor-pointer"
                  style={{ border: '1px solid var(--color-border)' }}
                  onClick={() => setLightbox(true)}
                >
                  <img
                    src={bannerUrl}
                    alt={event.title}
                    className="w-full max-h-[420px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {/* hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <ZoomIn className="w-5 h-5 text-gray-800" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Detail chips */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
              >
                {/* Start date */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Start</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      {format(new Date(event.startDate), 'EEEE, MMM d, yyyy')}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {format(new Date(event.startDate), 'h:mm a')}
                    </p>
                  </div>
                </div>

                {/* End date */}
                {event.endDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-text-muted)' }}>End</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {format(new Date(event.endDate), 'EEEE, MMM d, yyyy')}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {format(new Date(event.endDate), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {event.location && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Location</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{event.location}</p>
                    </div>
                  </div>
                )}

                {/* Online */}
                {event.isOnline && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Online Event</p>
                      {event.onlineUrl ? (
                        <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-medium flex items-center gap-1 hover:underline"
                          style={{ color: 'var(--color-brand)' }}>
                          Join Link <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Link shared on start</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Capacity */}
                {event.capacity && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Capacity</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {event.attendees.length} / {event.capacity} attending
                      </p>
                      <div className="mt-1 h-1.5 w-32 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                        <div
                          className="h-full rounded-full gradient-brand"
                          style={{ width: `${Math.min(100, (event.attendees.length / event.capacity) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div>
                  <h2 className="font-heading text-xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                    About This Event
                  </h2>
                  <div
                    className="prose prose-sm max-w-none leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                </div>
              )}

              {/* Organizer */}
              {event.organizer && (
                <div
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                >
                  <img
                    src={event.organizer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizer.name)}&background=6B46C1&color=fff&size=80`}
                    alt={event.organizer.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-brand)' }}>
                      Organizer
                    </p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                      {event.organizer.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: sticky RSVP sidebar ───────────────────────── */}
            <div className="space-y-4 lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="card p-5 space-y-4"
              >
                {/* Sidebar image thumbnail */}
                {bannerUrl && (
                  <div
                    className="w-full h-32 rounded-xl overflow-hidden cursor-pointer group relative"
                    onClick={() => setLightbox(true)}
                  >
                    <img
                      src={bannerUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                )}

                {/* Quick date recap */}
                <div className="text-center pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-3xl font-black" style={{ color: 'var(--color-brand)' }}>
                    {format(new Date(event.startDate), 'd')}
                  </p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {format(new Date(event.startDate), 'MMMM yyyy')}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {format(new Date(event.startDate), 'EEEE · h:mm a')}
                  </p>
                  {startsIn && (
                    <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-brand)' }}>
                      Starts {startsIn}
                    </span>
                  )}
                </div>

                {/* RSVP */}
                <AttendButton event={event} />

                {/* Share */}
                <ShareButton title={event.title} />
              </motion.div>

              {/* Back to events */}
              <Link
                href="/events"
                className="flex items-center justify-center gap-2 text-sm btn-secondary w-full py-2.5 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4" /> All Events
              </Link>
            </div>

          </div>
        </div>
      </div>

      <MainFooter />
    </div>
  );
}
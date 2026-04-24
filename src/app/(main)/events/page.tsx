'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ExternalLink, Search } from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try { const { data } = await api.get('/events'); setEvents(data.events || []); }
    catch { setEvents([]); } finally { setLoading(false); }
  };

  const filtered = events.filter(e => {
    if (filter === 'upcoming') return isFuture(new Date(e.startDate));
    if (filter === 'past') return isPast(new Date(e.startDate));
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">
        <div className="gradient-brand text-white py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-4xl font-bold mb-3">Events</h1>
            <p className="text-purple-100 text-lg">Discover and join upcoming events</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            {(['all', 'upcoming', 'past'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all
                  ${filter === f ? 'gradient-brand text-white shadow-brand' : 'btn-secondary'}`}>
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card animate-pulse flex gap-4">
                  <div className="w-24 h-24 rounded-xl flex-shrink-0" style={{ background: 'var(--color-border)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-3/4" style={{ background: 'var(--color-border)' }} />
                    <div className="h-3 rounded w-1/2" style={{ background: 'var(--color-border)' }} />
                    <div className="h-3 rounded w-2/3" style={{ background: 'var(--color-border)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16">
              <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
              <p className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>No events found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((event, i) => (
                <motion.div key={event._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/events/${event.slug}`}
                    className="card flex gap-4 hover:shadow-card-hover transition-all hover:-translate-y-0.5 group">
                    <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden gradient-brand flex flex-col items-center justify-center text-white">
                      {event.image ? <img src={event.image} alt="" className="w-full h-full object-cover" /> : (
                        <>
                          <p className="text-2xl font-bold">{format(new Date(event.startDate), 'd')}</p>
                          <p className="text-xs uppercase tracking-wide">{format(new Date(event.startDate), 'MMM')}</p>
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-semibold text-lg leading-snug group-hover:text-[var(--color-brand)] transition-colors"
                          style={{ color: 'var(--color-text)' }}>{event.title}</h3>
                        {event.isFeatured && (
                          <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 flex-shrink-0">Featured</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {format(new Date(event.startDate), 'MMM d, yyyy · h:mm a')}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> {event.location}
                          </span>
                        )}
                        {event.isOnline && (
                          <span className="flex items-center gap-1.5">
                            <ExternalLink className="w-4 h-4" /> Online Event
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> {event.attendees?.length || 0} attending
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {event.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MainFooter />
    </div>
  );
}

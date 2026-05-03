'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarDays, ExternalLink, Clock, Video, Zap } from 'lucide-react';
import api from '@/lib/axios';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

interface Membership { _id: string; role: string }

function getDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isPast(d)) return { label: 'শেষ হয়েছে', color: '#9ca3af' };
  if (isToday(d)) return { label: 'আজ', color: '#ef4444' };
  if (isTomorrow(d)) return { label: 'আগামীকাল', color: '#f59e0b' };
  return { label: format(d, 'dd MMM'), color: '#7c3aed' };
}

export default function MeetingsTab({ shopId, membership }: { shopId: string; membership: Membership }) {
  const { data, isLoading } = useQuery({
    queryKey: ['community-posts', shopId, 'meeting'],
    queryFn: () =>
      api.get(`/community-shop/${shopId}/posts`, { params: { type: 'meeting' } })
        .then((r) => r.data),
    enabled: !!shopId,
  });

  const { data: eventsData } = useQuery({
    queryKey: ['community-posts', shopId, 'event'],
    queryFn: () =>
      api.get(`/community-shop/${shopId}/posts`, { params: { type: 'event' } })
        .then((r) => r.data),
    enabled: !!shopId,
  });

  const meetings = data?.posts ?? [];
  const events   = eventsData?.posts ?? [];
  const all      = [...meetings, ...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="px-4 py-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-5 animate-pulse flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto">
      <h3 className="font-black flex items-center gap-2 mb-5" style={{ color: 'var(--color-text)' }}>
        <CalendarDays className="w-5 h-5 text-purple-500" />
        মিটিং ও ইভেন্ট ({all.length})
      </h3>

      {all.length > 0 ? (
        <div className="space-y-3">
          {all.map((post: any, i: number) => {
            const dateInfo = post.meetingDate ? getDateLabel(post.meetingDate) : null;
            const isMeeting = post.type === 'meeting';

            return (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card p-4 flex gap-4 items-start hover:shadow-md transition"
              >
                {/* Date block */}
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 text-white font-black"
                  style={{ background: isMeeting ? 'linear-gradient(135deg,#06b6d4,#3b82f6)' : 'linear-gradient(135deg,#f59e0b,#ef4444)' }}
                >
                  {post.meetingDate ? (
                    <>
                      <span className="text-lg leading-none">{format(new Date(post.meetingDate), 'dd')}</span>
                      <span className="text-[10px] uppercase opacity-80">{format(new Date(post.meetingDate), 'MMM')}</span>
                    </>
                  ) : (
                    isMeeting ? <Video className="w-6 h-6" /> : <Zap className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-black text-sm truncate" style={{ color: 'var(--color-text)' }}>
                      {post.title || (isMeeting ? 'মিটিং' : 'ইভেন্ট')}
                    </h4>
                    {dateInfo && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${dateInfo.color}18`, color: dateInfo.color }}
                      >
                        {dateInfo.label}
                      </span>
                    )}
                  </div>

                  <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {post.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    {post.meetingDate && (
                      <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock className="w-3 h-3" />
                        {format(new Date(post.meetingDate), 'hh:mm a')}
                      </p>
                    )}
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      by {post.author?.name}
                    </p>
                  </div>

                  {post.meetingLink && (
                    <a
                      href={post.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition hover:opacity-90"
                      style={{ background: isMeeting ? 'linear-gradient(135deg,#06b6d4,#3b82f6)' : 'linear-gradient(135deg,#f59e0b,#ef4444)' }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      {isMeeting ? 'মিটিং যোগ দিন' : 'ইভেন্ট দেখুন'}
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>কোনো মিটিং নেই</p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            ফিড ট্যাবে গিয়ে মিটিং পোস্ট করুন।
          </p>
        </div>
      )}
    </div>
  );
}
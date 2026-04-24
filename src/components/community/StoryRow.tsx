'use client';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useT } from '@/hooks/useT';
import api from '@/lib/api';

export default function StoryRow() {
  const { user } = useAuthStore();
  const { t } = useT();
  const [stories, setStories] = useState<any[]>([]);
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/community/stories')
      .then(({ data }) => setStories(data.stories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex gap-3 mb-3 overflow-x-auto pb-1 scrollbar-hide">
      {/* Create story card */}
      <div className="flex-shrink-0 w-28">
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer group"
          style={{ aspectRatio: '9/16', maxHeight: '180px' }}
        >
          <div className="w-full h-full">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6B46C1&color=fff`}
              alt=""
              className="w-full h-3/4 object-cover"
            />
            <div
              className="h-1/4 flex flex-col items-center justify-end pb-2"
              style={{ background: 'var(--color-bg)' }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                {t.community.createStory}
              </p>
            </div>
          </div>
          <div className="absolute top-[calc(75%-14px)] left-1/2 -translate-x-1/2 w-7 h-7 rounded-full gradient-brand flex items-center justify-center border-2 border-[var(--color-bg)] z-10">
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl" />
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && [1, 2, 3, 4].map(i => (
        <div key={i} className="flex-shrink-0 w-28">
          <div
            className="rounded-2xl animate-pulse"
            style={{ aspectRatio: '9/16', maxHeight: '180px', background: 'var(--color-border)' }}
          />
        </div>
      ))}

      {/* Real stories */}
      {!loading && stories.map(story => (
        <div key={story._id} className="flex-shrink-0 w-28">
          <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{ aspectRatio: '9/16', maxHeight: '180px', background: '#1a1a2e' }}
            onClick={() => setViewed(prev => new Set([...prev, story._id]))}
          >
            {/* Story media or text background */}
            {story.media?.url ? (
              <img
                src={story.media.url}
                alt=""
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center p-2 text-center text-sm font-medium text-white"
                style={{ background: story.backgroundColor || '#6B46C1' }}
              >
                {story.text}
              </div>
            )}

            {/* Author avatar ring */}
            <div
              className={`absolute top-2 left-2 w-8 h-8 rounded-full overflow-hidden border-[3px] ${
                viewed.has(story._id) ? 'border-gray-400' : 'border-[var(--color-brand)]'
              }`}
            >
              <img
                src={story.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.author?.name || 'U')}&background=6B46C1&color=fff`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Author name */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-xs font-semibold drop-shadow truncate">
                {story.author?.name?.split(' ')[0]}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {!loading && stories.length === 0 && (
        <div className="flex items-center px-2">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            No stories yet. Be the first!
          </p>
        </div>
      )}
    </div>
  );
}
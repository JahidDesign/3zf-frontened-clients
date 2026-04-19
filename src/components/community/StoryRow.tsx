'use client';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useT } from '@/hooks/useT';

const DEMO_STORIES = [
  { id: '1', name: 'Sarah K.',  avatar: 'https://ui-avatars.com/api/?name=Sarah&background=EC4899&color=fff',  gradient: 'from-pink-500 to-rose-600' },
  { id: '2', name: 'Ahmed R.',  avatar: 'https://ui-avatars.com/api/?name=Ahmed&background=3B82F6&color=fff',  gradient: 'from-blue-500 to-indigo-600' },
  { id: '3', name: 'Nadia M.',  avatar: 'https://ui-avatars.com/api/?name=Nadia&background=10B981&color=fff',  gradient: 'from-green-500 to-teal-600' },
  { id: '4', name: 'Karim B.',  avatar: 'https://ui-avatars.com/api/?name=Karim&background=F59E0B&color=fff',  gradient: 'from-amber-500 to-orange-600' },
  { id: '5', name: 'Riya S.',   avatar: 'https://ui-avatars.com/api/?name=Riya&background=8B5CF6&color=fff',   gradient: 'from-violet-500 to-purple-600' },
];

export default function StoryRow() {
  const { user } = useAuthStore();
  const { t } = useT();
  const [viewed, setViewed] = useState<Set<string>>(new Set());

  return (
    <div className="flex gap-3 mb-3 overflow-x-auto pb-1 scrollbar-hide">
      {/* Create story card */}
      <div className="flex-shrink-0 w-28">
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer group"
          style={{ aspectRatio: '9/16', maxHeight: '180px' }}
        >
          {/* User avatar top 75% */}
          <div className="w-full h-full">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6B46C1&color=fff`}
              alt=""
              className="w-full h-3/4 object-cover"
            />
            <div className="h-1/4 flex flex-col items-center justify-end pb-2"
              style={{ background: 'var(--color-bg)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                {t.community.createStory}
              </p>
            </div>
          </div>
          {/* Plus button */}
          <div className="absolute top-[calc(75%-14px)] left-1/2 -translate-x-1/2 w-7 h-7 rounded-full gradient-brand flex items-center justify-center border-2 border-[var(--color-bg)] z-10">
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl" />
        </div>
      </div>

      {/* Friend stories */}
      {DEMO_STORIES.map(story => (
        <div key={story.id} className="flex-shrink-0 w-28">
          <div
            className={`relative rounded-2xl overflow-hidden bg-gradient-to-b ${story.gradient} cursor-pointer group`}
            style={{ aspectRatio: '9/16', maxHeight: '180px' }}
            onClick={() => setViewed(prev => new Set([...prev, story.id]))}
          >
            <img
              src={story.avatar}
              alt={story.name}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
            />
            {/* Avatar ring */}
            <div
              className={`absolute top-2 left-2 w-8 h-8 rounded-full overflow-hidden border-[3px] ${viewed.has(story.id) ? 'border-gray-400' : 'border-[var(--color-brand)]'}`}
            >
              <img src={story.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            {/* Name */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-xs font-semibold drop-shadow truncate">{story.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

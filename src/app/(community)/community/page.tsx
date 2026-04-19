'use client';
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import CreatePost from '@/components/community/CreatePost';
import PostCard from '@/components/community/PostCard';
import StoryRow from '@/components/community/StoryRow';
import FriendSuggestions from '@/components/community/FriendSuggestions';
import { useT } from '@/hooks/useT';
import api from '@/lib/api';

export default function CommunityFeedPage() {
  const { t } = useT();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1 });

  const fetchFeed = async (pageNum: number) => {
    if (fetching) return;
    setFetching(true);
    try {
      const { data } = await api.get('/posts/feed?page=' + pageNum + '&limit=10');
      if (pageNum === 1) setPosts(data.posts || []);
      else setPosts(prev => [...prev, ...(data.posts || [])]);
      setHasMore(data.hasMore || false);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setFetching(false); }
  };

  useEffect(() => { fetchFeed(1); }, []);

  useEffect(() => {
    if (inView && hasMore && !fetching) {
      const next = page + 1;
      setPage(next);
      fetchFeed(next);
    }
  }, [inView]);

  const handlePostCreated = (post: any) => setPosts(prev => [post, ...prev]);
  const handlePostDeleted = (id: string) => setPosts(prev => prev.filter(p => p._id !== id));
  const handlePostUpdated = (updated: any) => setPosts(prev => prev.map(p => p._id === updated._id ? updated : p));

  return (
    <div className="max-w-[640px] mx-auto pb-10">
      <StoryRow />
      <CreatePost onPostCreated={handlePostCreated} />

      <div className="space-y-3 mt-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full" style={{ background: 'var(--color-border)' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded w-32" style={{ background: 'var(--color-border)' }} />
                  <div className="h-2 rounded w-24" style={{ background: 'var(--color-border)' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded" style={{ background: 'var(--color-border)' }} />
                <div className="h-3 rounded w-4/5" style={{ background: 'var(--color-border)' }} />
                <div className="h-48 rounded-xl mt-3" style={{ background: 'var(--color-border)' }} />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-4">👋</p>
            <p className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text)' }}>{t.community.noPosts}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Add friends or follow pages to see their posts here
            </p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handlePostDeleted}
              onUpdate={handlePostUpdated}
            />
          ))
        )}

        {hasMore && <div ref={ref} className="h-10" />}
        {fetching && page > 1 && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }} />
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-sm py-4" style={{ color: 'var(--color-text-muted)' }}>
            ✓ You've seen all posts
          </p>
        )}
      </div>

      <div className="lg:hidden mt-4">
        <FriendSuggestions />
      </div>
    </div>
  );
}

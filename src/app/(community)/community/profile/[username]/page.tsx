'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { BadgeCheck, MapPin, Link as LinkIcon, Calendar, UserPlus, UserMinus, MessageCircle, MoreHorizontal, Camera, Edit3, Users, Image as ImageIcon, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import PostCard from '@/components/community/PostCard';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

type Tab = 'posts' | 'about' | 'friends' | 'photos';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('posts');
  const [friendStatus, setFriendStatus] = useState<'none' | 'friends' | 'sent' | 'received'>('none');
  const [isFollowing, setIsFollowing] = useState(false);

  const resolvedUsername = username === 'me' ? currentUser?.username : username;
  const isOwner = currentUser?.username === resolvedUsername;

  useEffect(() => {
    if (resolvedUsername) fetchProfile();
  }, [resolvedUsername]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/${resolvedUsername}`),
        api.get(`/posts/user/${resolvedUsername}`),
      ]);
      const p = profileRes.data.user;
      setProfile(p);
      setPosts(postsRes.data.posts || []);
      if (currentUser && !isOwner) {
        const isFriend = p.friends?.some((f: any) => f._id === currentUser._id || f === currentUser._id);
        const sentReq = currentUser.sentFriendRequests?.some((r: any) => r === p._id || r._id === p._id);
        const receivedReq = p.friendRequests?.some((r: any) => r._id === currentUser._id || r === currentUser._id);
        setFriendStatus(isFriend ? 'friends' : sentReq ? 'sent' : receivedReq ? 'received' : 'none');
        setIsFollowing(p.followers?.some((f: any) => f._id === currentUser._id || f === currentUser._id));
      }
    } catch { toast.error('Profile not found'); }
    finally { setLoading(false); }
  };

  const handleFriendAction = async () => {
    try {
      if (friendStatus === 'none') {
        await api.post(`/friends/request/${profile._id}`);
        setFriendStatus('sent');
        toast.success('Friend request sent!');
      } else if (friendStatus === 'sent') {
        await api.post(`/friends/reject/${profile._id}`);
        setFriendStatus('none');
        toast.success('Request cancelled');
      } else if (friendStatus === 'received') {
        await api.post(`/friends/accept/${profile._id}`);
        setFriendStatus('friends');
        toast.success('Now friends!');
      } else {
        await api.delete(`/friends/unfriend/${profile._id}`);
        setFriendStatus('none');
        toast.success('Unfriended');
      }
    } catch (e: any) { toast.error(e.response?.data?.message || 'Action failed'); }
  };

  const handleFollow = async () => {
    try {
      await api.post(`/users/${profile._id}/follow`);
      setIsFollowing(!isFollowing);
    } catch (e: any) { toast.error('Failed'); }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto pb-10 animate-pulse">
      <div className="rounded-2xl mb-3" style={{ height: 280, background: 'var(--color-border)' }} />
      <div className="card -mt-16 ml-4 mr-4 relative z-10 pt-14">
        <div className="h-4 rounded w-48 mb-2" style={{ background: 'var(--color-border)' }} />
        <div className="h-3 rounded w-32" style={{ background: 'var(--color-border)' }} />
      </div>
    </div>
  );

  if (!profile) return (
    <div className="card text-center py-16 max-w-lg mx-auto mt-10">
      <p className="text-5xl mb-4">👤</p>
      <p className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Profile not found</p>
    </div>
  );

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'posts', label: 'Posts', icon: Edit3 },
    { key: 'about', label: 'About', icon: Users },
    { key: 'friends', label: 'Friends', icon: Users },
    { key: 'photos', label: 'Photos', icon: ImageIcon },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Cover photo */}
      <div className="relative rounded-2xl overflow-hidden mb-0"
        style={{ height: 280, background: 'linear-gradient(135deg, #6B46C1, #805AD5, #9F7AEA)' }}>
        {profile.coverPhoto && (
          <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        )}
        {isOwner && (
          <button className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 text-white text-sm px-3 py-2 rounded-xl hover:bg-black/70 transition-colors">
            <Camera className="w-4 h-4" /> Edit cover
          </button>
        )}
      </div>

      {/* Profile info card */}
      <div className="card mx-0 rounded-t-none rounded-b-2xl pt-0 mb-3">
        <div className="relative flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-4 px-4 pt-0">
          <div className="relative w-32 h-32 flex-shrink-0">
            <img src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6B46C1&color=fff&size=128`}
              alt={profile.name} className="w-32 h-32 rounded-full border-4 object-cover"
              style={{ borderColor: 'var(--color-bg)' }} />
            {isOwner && (
              <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white shadow-brand">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{profile.name}</h1>
                  {profile.isVerified && <BadgeCheck className="w-6 h-6 text-blue-500" />}
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>@{profile.username}</p>
                <div className="flex items-center gap-4 mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span><strong style={{ color: 'var(--color-text)' }}>{profile.friends?.length || 0}</strong> Friends</span>
                  <span><strong style={{ color: 'var(--color-text)' }}>{profile.followers?.length || 0}</strong> Followers</span>
                  <span><strong style={{ color: 'var(--color-text)' }}>{profile.following?.length || 0}</strong> Following</span>
                </div>
              </div>

              {/* Action buttons */}
              {!isOwner && currentUser && (
                <div className="flex items-center gap-2">
                  <button onClick={handleFriendAction}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all
                      ${friendStatus === 'friends' ? 'btn-secondary' : 'btn-primary'}`}>
                    {friendStatus === 'none' && <><UserPlus className="w-4 h-4" /> Add Friend</>}
                    {friendStatus === 'sent' && <><UserMinus className="w-4 h-4" /> Cancel Request</>}
                    {friendStatus === 'received' && <><UserPlus className="w-4 h-4" /> Accept</>}
                    {friendStatus === 'friends' && <><UserMinus className="w-4 h-4" /> Friends</>}
                  </button>
                  <button onClick={handleFollow}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isFollowing ? 'btn-secondary' : 'btn-secondary'}`}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                  <button className="btn-ghost w-9 h-9 flex items-center justify-center p-0">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              )}
              {isOwner && (
                <button className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bio + details */}
        {(profile.bio || profile.location || profile.website || profile.dateOfBirth) && (
          <div className="px-4 pb-4 space-y-2 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
            {profile.bio && <p className="text-sm" style={{ color: 'var(--color-text)' }}>{profile.bio}</p>}
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[var(--color-brand)] transition-colors">
                  <LinkIcon className="w-4 h-4" /> {profile.website.replace('https://', '')}
                </a>
              )}
              {profile.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Joined {new Date(profile.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-t overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-1 justify-center
                ${tab === t.key ? 'border-[var(--color-brand)] text-[var(--color-brand)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {tab === 'posts' && (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-4xl mb-3">📝</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>No posts yet</p>
              </div>
            ) : posts.map(post => (
              <PostCard key={post._id} post={post} onDelete={id => setPosts(p => p.filter(x => x._id !== id))} />
            ))}
          </div>
        )}

        {tab === 'about' && (
          <div className="card space-y-5">
            <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>About</h2>
            {[
              { label: 'Full Name', value: profile.name },
              { label: 'Username', value: `@${profile.username}` },
              { label: 'Email', value: isOwner ? profile.email : null },
              { label: 'Phone', value: isOwner ? profile.phone : null },
              { label: 'Gender', value: profile.gender },
              { label: 'Location', value: profile.location },
              { label: 'Website', value: profile.website },
              { label: 'Bio', value: profile.bio },
              { label: 'Joined', value: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en', { dateStyle: 'long' }) : null },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="flex items-start gap-4">
                <p className="w-32 text-sm font-medium flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>{f.label}</p>
                <p className="text-sm flex-1" style={{ color: 'var(--color-text)' }}>{f.value}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'friends' && (
          <div className="card">
            <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--color-text)' }}>
              Friends ({profile.friends?.length || 0})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(profile.friends || []).map((friend: any) => (
                <a key={friend._id} href={`/community/profile/${friend.username}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                  <img src={friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=6B46C1&color=fff`}
                    alt="" className="w-10 h-10 avatar" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{friend.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>@{friend.username}</p>
                  </div>
                </a>
              ))}
              {(!profile.friends || profile.friends.length === 0) && (
                <p className="col-span-3 text-center py-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>No friends yet</p>
              )}
            </div>
          </div>
        )}

        {tab === 'photos' && (
          <div className="card">
            <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--color-text)' }}>Photos</h2>
            <div className="grid grid-cols-3 gap-1">
              {posts.filter(p => p.media?.some((m: any) => m.type === 'image')).flatMap(p => p.media.filter((m: any) => m.type === 'image')).slice(0, 9).map((m: any, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
                  <img src={m.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
                </div>
              ))}
              {posts.filter(p => p.media?.some((m: any) => m.type === 'image')).length === 0 && (
                <p className="col-span-3 text-center py-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>No photos yet</p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

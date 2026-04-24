'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck, MapPin, Link as LinkIcon, Calendar, UserPlus, UserMinus,
  MessageCircle, MoreHorizontal, Camera, Edit3, Users, Image as ImageIcon,
  Loader2, X, Check, Grid3X3, Info, Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PostCard from '@/components/community/PostCard';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

type Tab = 'posts' | 'about' | 'friends' | 'photos';
type FriendStatus = 'none' | 'friends' | 'sent' | 'received';
type UploadState = 'idle' | 'uploading' | 'success' | 'error';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function avatarSrc(name: string, avatar?: string) {
  return avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1877F2&color=fff&size=200`;
}

function flashThenIdle(setter: (s: UploadState) => void, state: UploadState) {
  setter(state);
  setTimeout(() => setter('idle'), 2000);
}

function validateImage(file: File): boolean {
  if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return false; }
  if (file.size > 10 * 1024 * 1024)  { toast.error('Image must be under 10 MB');    return false; }
  return true;
}

// ─── Upload Overlay ───────────────────────────────────────────────────────────
function UploadOverlay({ state }: { state: UploadState }) {
  if (state === 'idle') return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 backdrop-blur-[2px] z-20 rounded-[inherit]">
      {state === 'uploading' && <><Loader2 className="w-7 h-7 text-white animate-spin" /><span className="text-white text-xs font-medium">Uploading…</span></>}
      {state === 'success'   && <><div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center"><Check className="w-5 h-5 text-white" strokeWidth={3} /></div><span className="text-white text-xs font-medium">Updated!</span></>}
      {state === 'error'     && <><div className="w-9 h-9 rounded-full bg-red-500   flex items-center justify-center"><X     className="w-5 h-5 text-white" strokeWidth={3} /></div><span className="text-white text-xs font-medium">Failed</span></>}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="max-w-[820px] mx-auto animate-pulse">
      <div className="bg-[#e4e6eb] dark:bg-[#3a3b3c]" style={{ height: 360 }} />
      <div className="bg-white dark:bg-[#242526] px-4 pb-3 shadow-sm">
        <div className="flex items-end gap-4 -mt-9">
          <div className="w-40 h-40 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] border-4 border-white dark:border-[#242526] flex-shrink-0" />
          <div className="flex-1 pb-3 space-y-2">
            <div className="h-7 w-48 rounded bg-[#e4e6eb] dark:bg-[#3a3b3c]" />
            <div className="h-4 w-32 rounded bg-[#e4e6eb] dark:bg-[#3a3b3c]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();

  const [profile, setProfile]               = useState<any>(null);
  const [posts, setPosts]                   = useState<any[]>([]);
  const [loading, setLoading]               = useState(true);
  const [tab, setTab]                       = useState<Tab>('posts');
  const [friendStatus, setFriendStatus]     = useState<FriendStatus>('none');
  const [isFollowing, setIsFollowing]       = useState(false);
  const [coverUpload, setCoverUpload]       = useState<UploadState>('idle');
  const [avatarUpload, setAvatarUpload]     = useState<UploadState>('idle');
  const [isDraggingCover, setIsDragging]    = useState(false);

  const coverRef  = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const resolvedUsername = username === 'me' ? currentUser?.username : username;
  const isOwner = currentUser?.username === resolvedUsername;

  // ── Fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => { if (resolvedUsername) fetchProfile(); }, [resolvedUsername]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [{ data: ud }, { data: pd }] = await Promise.all([
        api.get(`/users/${resolvedUsername}`),
        api.get(`/posts/user/${resolvedUsername}`),
      ]);
      const p = ud.user;
      setProfile(p);
      setPosts(pd.posts || []);
      if (currentUser && !isOwner) {
        const isFriend     = p.friends?.some((f: any) => (f._id ?? f) === currentUser._id);
        const sentReq      = currentUser.sentFriendRequests?.some((r: any) => (r._id ?? r) === p._id);
        const receivedReq  = p.friendRequests?.some((f: any) => (f._id ?? f) === currentUser._id);
        setFriendStatus(isFriend ? 'friends' : sentReq ? 'sent' : receivedReq ? 'received' : 'none');
        setIsFollowing(p.followers?.some((f: any) => (f._id ?? f) === currentUser._id));
      }
    } catch { toast.error('Profile not found'); }
    finally  { setLoading(false); }
  };

  // ── Uploads — FIX: use PUT /users/profile/update/avatar|coverPhoto ──────────
  const uploadAvatar = useCallback(async (file: File) => {
    if (!validateImage(file)) return;
    setAvatarUpload('uploading');
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      // PUT matches router.put('/profile/update/avatar', ...)
      const { data } = await api.put('/users/profile/update/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((p: any) => ({ ...p, avatar: data.avatar }));
      flashThenIdle(setAvatarUpload, 'success');
      toast.success('Profile photo updated!');
    } catch {
      flashThenIdle(setAvatarUpload, 'error');
      toast.error('Failed to update profile photo');
    }
  }, []);

  const uploadCover = useCallback(async (file: File) => {
    if (!validateImage(file)) return;
    setCoverUpload('uploading');
    try {
      const fd = new FormData();
      fd.append('coverPhoto', file);
      // PUT matches router.put('/profile/update/coverPhoto', ...)
      const { data } = await api.put('/users/profile/update/coverPhoto', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((p: any) => ({ ...p, coverPhoto: data.coverPhoto }));
      flashThenIdle(setCoverUpload, 'success');
      toast.success('Cover photo updated!');
    } catch {
      flashThenIdle(setCoverUpload, 'error');
      toast.error('Failed to update cover photo');
    }
  }, []);

  // ── Drag-and-drop cover ─────────────────────────────────────────────────────
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true);  };
  const onDragLeave = ()                   => setIsDragging(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadCover(f);
  };

  // ── Friend / Follow ─────────────────────────────────────────────────────────
  const handleFriendAction = async () => {
    try {
      if (friendStatus === 'none') {
        await api.post(`/friends/request/${profile._id}`);
        setFriendStatus('sent');   toast.success('Friend request sent!');
      } else if (friendStatus === 'sent') {
        await api.post(`/friends/reject/${profile._id}`);
        setFriendStatus('none');   toast.success('Request cancelled');
      } else if (friendStatus === 'received') {
        await api.post(`/friends/accept/${profile._id}`);
        setFriendStatus('friends'); toast.success('Now friends!');
      } else {
        await api.delete(`/friends/unfriend/${profile._id}`);
        setFriendStatus('none');   toast.success('Unfriended');
      }
    } catch (e: any) { toast.error(e.response?.data?.message || 'Action failed'); }
  };

  const handleFollow = async () => {
    try { await api.post(`/users/${profile._id}/follow`); setIsFollowing(p => !p); }
    catch { toast.error('Failed'); }
  };

  // ── Early returns ───────────────────────────────────────────────────────────
  if (loading) return <ProfileSkeleton />;
  if (!profile) return (
    <div className="max-w-[820px] mx-auto mt-10 bg-white dark:bg-[#242526] rounded-xl shadow-sm text-center py-20">
      <p className="text-5xl mb-4">👤</p>
      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">Profile not found</p>
    </div>
  );

  const photoMedia = posts
    .filter(p => p.media?.some((m: any) => m.type === 'image'))
    .flatMap(p => p.media.filter((m: any) => m.type === 'image'));

  const friendBtnConfig = {
    none:     { label: 'Add Friend',    Icon: UserPlus,  bg: 'bg-[#1877F2] hover:bg-[#166FE5] text-white' },
    sent:     { label: 'Cancel Request', Icon: UserMinus, bg: 'bg-[#e4e6eb] hover:bg-[#d8dadf] text-gray-800 dark:bg-[#3a3b3c] dark:text-gray-100 dark:hover:bg-[#4a4b4c]' },
    received: { label: 'Accept',         Icon: UserPlus,  bg: 'bg-[#1877F2] hover:bg-[#166FE5] text-white' },
    friends:  { label: 'Friends',        Icon: Users,     bg: 'bg-[#e4e6eb] hover:bg-[#d8dadf] text-gray-800 dark:bg-[#3a3b3c] dark:text-gray-100 dark:hover:bg-[#4a4b4c]' },
  }[friendStatus];

  const tabs: { key: Tab; label: string; Icon: any }[] = [
    { key: 'posts',   label: 'Posts',   Icon: Edit3      },
    { key: 'about',   label: 'About',   Icon: Info       },
    { key: 'friends', label: 'Friends', Icon: Users      },
    { key: 'photos',  label: 'Photos',  Icon: Grid3X3    },
  ];

  return (
    <div className="max-w-[820px] mx-auto pb-12 bg-[#f0f2f5] dark:bg-[#18191a] min-h-screen">

      {/* Hidden file inputs */}
      <input ref={coverRef}  type="file" accept="image/*" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f);  e.target.value = ''; }} />
      <input ref={avatarRef} type="file" accept="image/*" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ''; }} />

      {/* ── Cover Photo ─────────────────────────────────────────────────────── */}
      <div
        className={`relative overflow-hidden transition-all duration-200 ${isDraggingCover ? 'brightness-75' : ''}`}
        style={{ height: 'clamp(200px, 38vw, 360px)', background: 'linear-gradient(160deg,#1877F2,#42b883)' }}
        onDragOver={isOwner ? onDragOver : undefined}
        onDragLeave={isOwner ? onDragLeave : undefined}
        onDrop={isOwner ? onDrop : undefined}
      >
        {profile.coverPhoto && (
          <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover"
            style={{ opacity: coverUpload === 'uploading' ? 0.5 : 1, transition: 'opacity .3s' }} />
        )}
        <UploadOverlay state={coverUpload} />

        {isDraggingCover && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 pointer-events-none">
            <Camera className="w-10 h-10 text-white drop-shadow-lg" />
            <span className="text-white font-semibold drop-shadow-lg">Drop to set cover photo</span>
          </div>
        )}

        {isOwner && coverUpload === 'idle' && !isDraggingCover && (
          <button onClick={() => coverRef.current?.click()}
            className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 hover:bg-white dark:bg-[#3a3b3c]/90 dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-gray-100 text-sm font-semibold px-3 py-2 rounded-lg shadow transition-all active:scale-95">
            <Camera className="w-4 h-4" />
            <span className="hidden xs:inline">Edit cover photo</span>
          </button>
        )}
      </div>

      {/* ── Profile Header Card ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#242526] shadow-sm px-4 md:px-8">

        {/* Avatar + Name row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-x-4 -mt-9 sm:-mt-[68px] pb-0">

          {/* Avatar */}
          <div className="relative w-[120px] h-[120px] sm:w-[168px] sm:h-[168px] flex-shrink-0 group self-center sm:self-auto">
            <img
              src={avatarSrc(profile.name, profile.avatar)}
              alt={profile.name}
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-[#242526] shadow-md"
            />
            <div className="absolute inset-0 rounded-full overflow-hidden"><UploadOverlay state={avatarUpload} /></div>
            {isOwner && avatarUpload === 'idle' && (
              <button onClick={() => avatarRef.current?.click()} aria-label="Change profile photo"
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e4e6eb] hover:bg-[#d8dadf] dark:bg-[#3a3b3c] dark:hover:bg-[#4a4b4c] flex items-center justify-center shadow transition-all active:scale-95 z-10">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-200" />
              </button>
            )}
          </div>

          {/* Name / stats / actions */}
          <div className="flex-1 min-w-0 sm:pb-3 pt-2 sm:pt-0 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-[2rem] font-bold text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
                    {profile.name}
                  </h1>
                  {profile.isVerified && <BadgeCheck className="w-6 h-6 text-[#1877F2] flex-shrink-0" />}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">@{profile.username}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 flex-wrap text-sm text-gray-600 dark:text-gray-300 font-medium">
                  <span><strong className="text-gray-900 dark:text-gray-100">{profile.friends?.length || 0}</strong> Friends</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span><strong className="text-gray-900 dark:text-gray-100">{profile.followers?.length || 0}</strong> Followers</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span><strong className="text-gray-900 dark:text-gray-100">{profile.following?.length || 0}</strong> Following</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap sm:pb-1">
                {!isOwner && currentUser && (
                  <>
                    <button onClick={handleFriendAction}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${friendBtnConfig.bg}`}>
                      <friendBtnConfig.Icon className="w-4 h-4" />
                      {friendBtnConfig.label}
                    </button>
                    <button onClick={handleFollow}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#e4e6eb] hover:bg-[#d8dadf] dark:bg-[#3a3b3c] dark:hover:bg-[#4a4b4c] text-gray-800 dark:text-gray-100 transition-all active:scale-95">
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#e4e6eb] hover:bg-[#d8dadf] dark:bg-[#3a3b3c] dark:hover:bg-[#4a4b4c] text-gray-800 dark:text-gray-100 transition-all active:scale-95">
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Message</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#e4e6eb] hover:bg-[#d8dadf] dark:bg-[#3a3b3c] dark:hover:bg-[#4a4b4c] transition-all active:scale-95" aria-label="More">
                      <MoreHorizontal className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>
                  </>
                )}
                {isOwner && (
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#e4e6eb] hover:bg-[#d8dadf] dark:bg-[#3a3b3c] dark:hover:bg-[#4a4b4c] text-gray-800 dark:text-gray-100 transition-all active:scale-95">
                    <Edit3 className="w-4 h-4" />
                    Edit profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-3" />

        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide -mb-px" role="tablist">
          {tabs.map(({ key, label, Icon }) => (
            <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-[3px] whitespace-nowrap transition-colors focus-visible:outline-none
                ${tab === key
                  ? 'border-[#1877F2] text-[#1877F2]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] hover:text-gray-700 dark:hover:text-gray-200'
                } rounded-t-lg`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      <div className="mt-4 px-0 md:px-0">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="tabpanel">

            {/* Posts */}
            {tab === 'posts' && (
              <div className="space-y-3">
                {posts.length === 0 ? (
                  <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm text-center py-16">
                    <p className="text-4xl mb-3">📝</p>
                    <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
                  </div>
                ) : posts.map(post => (
                  <PostCard key={post._id} post={post} onDelete={id => setPosts(p => p.filter(x => x._id !== id))} />
                ))}
              </div>
            )}

            {/* About */}
            {tab === 'about' && (
              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm p-5 space-y-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">About</h2>

                {profile.bio && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pb-4 border-b border-gray-100 dark:border-gray-700">
                    {profile.bio}
                  </p>
                )}

                <div className="space-y-3 pt-2">
                  {[
                    { Icon: MapPin,   value: profile.location, label: 'Lives in' },
                    { Icon: Globe,    value: profile.website,   label: 'Website', isLink: true },
                    { Icon: Calendar, value: profile.createdAt ? `Joined ${new Date(profile.createdAt).toLocaleDateString('en',{month:'long',year:'numeric'})}` : null },
                    { Icon: Users,    value: isOwner ? profile.email : null, label: 'Email' },
                  ].filter(f => f.value).map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <f.Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      {f.isLink ? (
                        <a href={f.value!} target="_blank" rel="noopener noreferrer"
                          className="text-[#1877F2] hover:underline">
                          {f.value!.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span>{f.label ? <><strong className="font-normal text-gray-500">{f.label} </strong>{f.value}</> : f.value}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Full info table (owner-only sensitive fields) */}
                {[
                  { label: 'Full Name', value: profile.name },
                  { label: 'Username',  value: `@${profile.username}` },
                  { label: 'Gender',    value: profile.gender },
                  ...(isOwner ? [
                    { label: 'Phone', value: profile.phone },
                  ] : []),
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="flex items-center gap-4 py-2 border-t border-gray-100 dark:border-gray-700 text-sm">
                    <span className="w-28 text-gray-500 flex-shrink-0">{f.label}</span>
                    <span className="text-gray-800 dark:text-gray-200">{f.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Friends */}
            {tab === 'friends' && (
              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm p-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Friends
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{profile.friends?.length || 0} friends</p>
                {(!profile.friends || profile.friends.length === 0) ? (
                  <p className="text-center py-10 text-sm text-gray-500">No friends yet</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {profile.friends.map((friend: any) => (
                      <a key={friend._id} href={`/community/profile/${friend.username}`}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] transition-colors group">
                        <img
                          src={avatarSrc(friend.name, friend.avatar)}
                          alt={friend.name}
                          className="w-16 h-16 rounded-xl object-cover group-hover:brightness-95 transition-all"
                        />
                        <div className="text-center min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{friend.name}</p>
                          <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Photos */}
            {tab === 'photos' && (
              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm p-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Photos</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{photoMedia.length} photos</p>
                {photoMedia.length === 0 ? (
                  <p className="text-center py-10 text-sm text-gray-500">No photos yet</p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {photoMedia.map((m: any, i: number) => (
                      <div key={i} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-[#3a3b3c] cursor-pointer group" style={{ aspectRatio: '1' }}>
                        <img src={m.url} alt={`Photo ${i + 1}`} loading="lazy"
                          className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
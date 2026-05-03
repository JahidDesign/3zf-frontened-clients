'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck, MapPin, Calendar, UserPlus, UserMinus,
  MessageCircle, MoreHorizontal, Camera, Edit3, Users,
  Loader2, X, Check, Grid3X3, Info, Globe, AlertCircle, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PostCard from '@/components/community/PostCard';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import { CreatePost } from '@/components/community';

type Tab          = 'posts' | 'about' | 'friends' | 'photos';
type FriendStatus = 'none' | 'friends' | 'sent' | 'received';
type UploadState  = 'idle' | 'uploading' | 'success' | 'error';
interface UploadError { message: string }

const avatarSrc = (name: string, avatar?: string) =>
  avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1877F2&color=fff&size=200`;

function flashThenIdle(set: (s: UploadState) => void, state: UploadState, ms = 2500) {
  set(state);
  setTimeout(() => set('idle'), ms);
}

function validateImage(file: File) {
  const allowed = ['image/jpeg','image/png','image/gif','image/webp'];
  if (!allowed.includes(file.type)) return { valid: false, error: 'Use JPG, PNG, GIF, or WebP.' };
  if (file.size > 10 * 1024 * 1024) return { valid: false, error: `File too large (${(file.size/1024/1024).toFixed(1)} MB). Max 10 MB.` };
  return { valid: true };
}

function uploadErrorMsg(err: any): string {
  const s = err?.response?.status;
  if (s === 413) return 'File too large for server.';
  if (s === 415) return 'Unsupported file type.';
  if (s === 401) return 'Session expired. Please log in again.';
  if (s === 403) return "You don't have permission to do this.";
  if (s >= 500)  return 'Server error. Please try again later.';
  if (!err?.response) return 'Network error. Check your connection.';
  return err?.response?.data?.message || 'Upload failed. Please try again.';
}

function UploadOverlay({ state, error, onRetry }: {
  state: UploadState; error?: UploadError | null; onRetry?: () => void;
}) {
  if (state === 'idle') return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-[inherit] bg-black/60 backdrop-blur-[3px]">
      {state === 'uploading' && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="text-xs font-semibold tracking-wide text-white">Uploading…</span>
        </>
      )}
      {state === 'success' && (
        <>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 shadow-lg">
            <Check className="h-5 w-5 text-white" strokeWidth={3} />
          </motion.div>
          <span className="text-xs font-semibold text-white">Updated!</span>
        </>
      )}
      {state === 'error' && (
        <>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 shadow-lg">
            <AlertCircle className="h-5 w-5 text-white" />
          </motion.div>
          <span className="px-4 text-center text-xs font-semibold leading-tight text-white">
            {error?.message || 'Upload failed'}
          </span>
          {onRetry && (
            <button onClick={onRetry}
              className="mt-1 flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] text-white/80 transition-all hover:bg-white/30">
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          )}
        </>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[820px] animate-pulse">
      <div className="rounded-b-2xl bg-[#e4e6eb] dark:bg-[#3a3b3c]" style={{ height: 'clamp(180px,36vw,340px)' }} />
      <div className="bg-white px-4 pb-4 shadow-sm dark:bg-[#242526] md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end" style={{ marginTop: '-2.5rem' }}>
          <div className="h-[100px] w-[100px] flex-shrink-0 self-center rounded-full border-4 border-white bg-[#e4e6eb] dark:border-[#242526] dark:bg-[#3a3b3c] sm:h-[150px] sm:w-[150px]" />
          <div className="flex-1 space-y-2 pb-3 pt-2">
            <div className="h-7 w-48 rounded-lg bg-[#e4e6eb] dark:bg-[#3a3b3c]" />
            <div className="h-4 w-32 rounded-lg bg-[#e4e6eb] dark:bg-[#3a3b3c]" />
            <div className="h-4 w-64 rounded-lg bg-[#e4e6eb] dark:bg-[#3a3b3c]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: me } = useAuthStore();

  const [profile,      setProfile]      = useState<any>(null);
  const [posts,        setPosts]        = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState<Tab>('posts');
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [isFollowing,  setIsFollowing]  = useState(false);
  const [coverUpload,  setCoverUpload]  = useState<UploadState>('idle');
  const [avatarUpload, setAvatarUpload] = useState<UploadState>('idle');
  const [coverError,   setCoverError]   = useState<UploadError | null>(null);
  const [avatarError,  setAvatarError]  = useState<UploadError | null>(null);
  const [isDragging,   setIsDragging]   = useState(false);
 const handlePostCreated = (post: any) => setPosts(prev => [post, ...prev]);
  const coverRef       = useRef<HTMLInputElement>(null);
  const avatarRef      = useRef<HTMLInputElement>(null);
  const lastCoverFile  = useRef<File | null>(null);
  const lastAvatarFile = useRef<File | null>(null);

  const resolvedUsername = username === 'me' ? me?.username : username;
  const isOwner = me?.username === resolvedUsername;

  useEffect(() => { if (resolvedUsername) fetchProfile(); }, [resolvedUsername]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const [{ data: ud }, { data: pd }] = await Promise.all([
        api.get(`/users/${resolvedUsername}`),
        api.get(`/posts/user/${resolvedUsername}`),
      ]);
      const p = ud.user;
      setProfile(p);
      setPosts(pd.posts || []);
      if (me && !isOwner) {
        const isFriend    = p.friends?.some((f: any) => (f._id ?? f) === me._id);
        const sentReq     = me.sentFriendRequests?.some((r: any) => (r._id ?? r) === p._id);
        const receivedReq = p.friendRequests?.some((f: any) => (f._id ?? f) === me._id);
        setFriendStatus(isFriend ? 'friends' : sentReq ? 'sent' : receivedReq ? 'received' : 'none');
        setIsFollowing(p.followers?.some((f: any) => (f._id ?? f) === me._id));
      }
    } catch (err: any) {
      toast.error(err?.response?.status === 404 ? 'Profile not found' : 'Failed to load profile');
    } finally { setLoading(false); }
  }

  const uploadAvatar = useCallback(async (file: File) => {
    const v = validateImage(file);
    if (!v.valid) { toast.error(v.error!); return; }
    lastAvatarFile.current = file;
    setAvatarError(null);
    setAvatarUpload('uploading');
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.put('/users/profile/update/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((p: any) => ({ ...p, avatar: data.avatar }));
      flashThenIdle(setAvatarUpload, 'success');
      toast.success('Profile photo updated!');
    } catch (err: any) {
      const msg = uploadErrorMsg(err);
      setAvatarError({ message: msg });
      flashThenIdle(setAvatarUpload, 'error', 4000);
      toast.error(msg);
    }
  }, []);

  const uploadCover = useCallback(async (file: File) => {
    const v = validateImage(file);
    if (!v.valid) { toast.error(v.error!); return; }
    lastCoverFile.current = file;
    setCoverError(null);
    setCoverUpload('uploading');
    try {
      const fd = new FormData();
      fd.append('coverPhoto', file);
      const { data } = await api.put('/users/profile/update/coverPhoto', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((p: any) => ({ ...p, coverPhoto: data.coverPhoto }));
      flashThenIdle(setCoverUpload, 'success');
      toast.success('Cover photo updated!');
    } catch (err: any) {
      const msg = uploadErrorMsg(err);
      setCoverError({ message: msg });
      flashThenIdle(setCoverUpload, 'error', 4000);
      toast.error(msg);
    }
  }, []);

  const retryCover  = useCallback(() => { if (lastCoverFile.current)  uploadCover(lastCoverFile.current); },  [uploadCover]);
  const retryAvatar = useCallback(() => { if (lastAvatarFile.current) uploadAvatar(lastAvatarFile.current); }, [uploadAvatar]);

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadCover(f);
  };

  const handleFriendAction = async () => {
    try {
      if (friendStatus === 'none') {
        await api.post(`/friends/request/${profile._id}`);
        setFriendStatus('sent'); toast.success('Friend request sent!');
      } else if (friendStatus === 'sent') {
        await api.post(`/friends/reject/${profile._id}`);
        setFriendStatus('none'); toast.success('Request cancelled');
      } else if (friendStatus === 'received') {
        await api.post(`/friends/accept/${profile._id}`);
        setFriendStatus('friends'); toast.success('Now friends!');
        setProfile((p: any) => ({ ...p, friends: [...(p.friends || []), me] }));
      } else {
        await api.delete(`/friends/unfriend/${profile._id}`);
        setFriendStatus('none'); toast.success('Unfriended');
        setProfile((p: any) => ({
          ...p,
          friends: (p.friends || []).filter((f: any) => (f._id ?? f) !== me?._id),
        }));
      }
    } catch (e: any) { toast.error(e.response?.data?.message || 'Action failed'); }
  };

  const handleFollow = async () => {
    try {
      await api.post(`/users/${profile._id}/follow`);
      setIsFollowing(f => !f);
      setProfile((p: any) => ({
        ...p,
        followers: isFollowing
          ? (p.followers || []).filter((f: any) => (f._id ?? f) !== me?._id)
          : [...(p.followers || []), me],
      }));
    } catch { toast.error('Failed to update follow status'); }
  };

  if (loading) return <ProfileSkeleton />;
  if (!profile) return (
    <div className="mx-auto mt-10 max-w-[820px] rounded-2xl bg-white px-4 py-20 text-center shadow-sm dark:bg-[#242526]">
      <p className="mb-4 text-5xl">👤</p>
      <p className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">Profile not found</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">This account may not exist or has been removed.</p>
    </div>
  );

  const photoMedia = posts
    .filter(p => p.media?.some((m: any) => m.type === 'image'))
    .flatMap(p => p.media.filter((m: any) => m.type === 'image'));

  const friendBtnCfg = {
    none:     { label: 'Add Friend',     Icon: UserPlus,  cls: 'bg-[#1877F2] hover:bg-[#166FE5] text-white' },
    sent:     { label: 'Cancel Request', Icon: UserMinus, cls: 'bg-[#e4e6eb] hover:bg-[#d8dadf] text-gray-800 dark:bg-[#3a3b3c] dark:text-gray-100' },
    received: { label: 'Accept Request', Icon: UserPlus,  cls: 'bg-[#1877F2] hover:bg-[#166FE5] text-white' },
    friends:  { label: 'Friends',        Icon: Users,     cls: 'bg-[#e4e6eb] hover:bg-[#d8dadf] text-gray-800 dark:bg-[#3a3b3c] dark:text-gray-100' },
  }[friendStatus];

  const tabs: { key: Tab; label: string; Icon: any }[] = [
    { key: 'posts',   label: 'Posts',   Icon: Edit3   },
    { key: 'about',   label: 'About',   Icon: Info    },
    { key: 'friends', label: 'Friends', Icon: Users   },
    { key: 'photos',  label: 'Photos',  Icon: Grid3X3 },
  ];

  return (
    <div className="mx-auto max-w-[820px] min-h-screen pb-12 bg-[#f0f2f5] dark:bg-[#18191a]">
      <input ref={coverRef}  type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only"
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f);  e.target.value = ''; }} />
      <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only"
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ''; }} />

      {/* Cover */}
      <div
        className={`relative overflow-hidden rounded-b-2xl transition-all duration-200 ${isDragging ? 'brightness-90 ring-4 ring-inset ring-[#1877F2]' : ''}`}
        style={{ height: 'clamp(180px,36vw,340px)', background: 'linear-gradient(160deg,#1877F2,#42b883)' }}
        onDragOver={isOwner ? onDragOver : undefined}
        onDragLeave={isOwner ? onDragLeave : undefined}
        onDrop={isOwner ? onDrop : undefined}
      >
        {profile.coverPhoto && (
          <img src={profile.coverPhoto} alt="Cover"
            className="h-full w-full object-cover transition-opacity duration-300"
            style={{ opacity: coverUpload === 'uploading' ? 0.4 : 1 }} />
        )}
        <UploadOverlay state={coverUpload} error={coverError} onRetry={retryCover} />
        <AnimatePresence>
          {isDragging && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <span className="rounded-full bg-black/30 px-4 py-1.5 text-sm font-semibold text-white">
                Drop to set cover photo
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {isOwner && coverUpload === 'idle' && !isDragging && (
          <button onClick={() => coverRef.current?.click()} aria-label="Edit cover photo"
            className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-black/50 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur transition-all hover:bg-black/70 active:scale-95 sm:bottom-4 sm:right-4 sm:text-sm">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Edit cover</span>
          </button>
        )}
      </div>

      {/* Header Card */}
      <div className="bg-white px-3 shadow-sm dark:bg-[#242526] sm:px-6 md:px-8">
        <div className="flex flex-col gap-x-4 pb-0 sm:flex-row sm:items-end"
          style={{ marginTop: 'clamp(-2.5rem,-5vw,-3.5rem)' }}>

          {/* Avatar */}
          <div className="relative h-[100px] w-[100px] flex-shrink-0 self-center sm:h-[140px] sm:w-[140px] md:h-[160px] md:w-[160px]">
            <img src={avatarSrc(profile.name, profile.avatar)} alt={profile.name}
              className="h-full w-full rounded-full border-4 border-white object-cover shadow-md transition-opacity duration-300 dark:border-[#242526]"
              style={{ opacity: avatarUpload === 'uploading' ? 0.5 : 1 }} />
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <UploadOverlay state={avatarUpload} error={avatarError} onRetry={retryAvatar} />
            </div>
            {isOwner && avatarUpload === 'idle' && (
              <button onClick={() => avatarRef.current?.click()} aria-label="Change profile photo"
                className="absolute bottom-0.5 right-0.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#e4e6eb] shadow-md transition-all hover:bg-[#d8dadf] active:scale-95 dark:border-[#242526] dark:bg-[#3a3b3c] sm:h-10 sm:w-10">
                <Camera className="h-3.5 w-3.5 text-gray-700 dark:text-gray-200 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>

          {/* Name / stats / buttons */}
          <div className="min-w-0 flex-1 pt-2 text-center sm:pb-3 sm:pt-0 sm:text-left">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="truncate text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl md:text-[2rem]">
                    {profile.name}
                  </h1>
                  {profile.isVerified && <BadgeCheck className="h-5 w-5 flex-shrink-0 text-[#1877F2] sm:h-6 sm:w-6" />}
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">@{profile.username}</p>
                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300 sm:justify-start sm:gap-3 sm:text-sm">
                  <span><strong className="text-gray-900 dark:text-gray-100">{profile.friends?.length || 0}</strong> <span className="text-gray-500">Friends</span></span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span><strong className="text-gray-900 dark:text-gray-100">{profile.followers?.length || 0}</strong> <span className="text-gray-500">Followers</span></span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span><strong className="text-gray-900 dark:text-gray-100">{profile.following?.length || 0}</strong> <span className="text-gray-500">Following</span></span>
                </div>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5 sm:mt-0 sm:flex-nowrap sm:pb-1">
                {!isOwner && me && (
                  <>
                    <button onClick={handleFriendAction}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all active:scale-95 sm:px-4 sm:text-sm ${friendBtnCfg.cls}`}>
                      <friendBtnCfg.Icon className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                      <span className="whitespace-nowrap">{friendBtnCfg.label}</span>
                    </button>
                    <button onClick={handleFollow}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all active:scale-95 sm:px-4 sm:text-sm ${
                        isFollowing
                          ? 'bg-[#1877F2] text-white hover:bg-[#166FE5]'
                          : 'bg-[#e4e6eb] text-gray-800 hover:bg-[#d8dadf] dark:bg-[#3a3b3c] dark:text-gray-100'
                      }`}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg bg-[#e4e6eb] px-3 py-2 text-xs font-semibold text-gray-800 transition-all hover:bg-[#d8dadf] active:scale-95 dark:bg-[#3a3b3c] dark:text-gray-100 sm:px-4 sm:text-sm">
                      <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Message</span>
                    </button>
                    <button aria-label="More options"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4e6eb] transition-all hover:bg-[#d8dadf] active:scale-95 dark:bg-[#3a3b3c] sm:h-10 sm:w-10">
                      <MoreHorizontal className="h-4 w-4 text-gray-700 dark:text-gray-200 sm:h-5 sm:w-5" />
                    </button>
                  </>
                )}
                {isOwner && (
                  <button className="flex items-center gap-1.5 rounded-lg bg-[#e4e6eb] px-3 py-2 text-xs font-semibold text-gray-800 transition-all hover:bg-[#d8dadf] active:scale-95 dark:bg-[#3a3b3c] dark:text-gray-100 sm:px-4 sm:text-sm">
                    <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Edit profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 border-t border-gray-200 dark:border-gray-700" />
         
        {/* Tabs */}
        <div className="-mb-px flex overflow-x-auto scrollbar-hide" role="tablist">
          {tabs.map(({ key, label, Icon }) => (
            <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
              className={`flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-t-lg border-b-[3px] px-3 py-3 text-xs font-semibold transition-colors focus-visible:outline-none sm:gap-1.5 sm:px-4 sm:py-3.5 sm:text-sm ${
                tab === key
                  ? 'border-[#1877F2] text-[#1877F2]'
                  : 'border-transparent text-gray-500 hover:bg-[#f0f2f5] hover:text-gray-700 dark:text-gray-400 dark:hover:bg-[#3a3b3c]'
              }`}>
              <Icon className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mt-3 sm:mt-4">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="tabpanel">

            {tab === 'posts' && (
              <div className="space-y-3">
                {posts.length === 0 ? (
                  <div className="rounded-xl bg-white py-16 text-center shadow-sm dark:bg-[#242526]">
                    <p className="mb-3 text-4xl">📝</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No posts yet</p>
                  </div>
                ) : posts.map(post => (
                  <PostCard key={post._id} post={post}
                    onDelete={id => setPosts(p => p.filter(x => x._id !== id))} />
                ))}
              </div>
            )}

            {tab === 'about' && (
              <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-[#242526] sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">About</h2>
                {profile.bio && (
                  <p className="mb-4 border-b border-gray-100 pb-4 text-sm leading-relaxed text-gray-700 dark:border-gray-700 dark:text-gray-300">
                    {profile.bio}
                  </p>
                )}
                <div className="space-y-3">
                  {[
                    { Icon: MapPin,   value: profile.location, label: 'Lives in' },
                    { Icon: Globe,    value: profile.website,  label: 'Website', isLink: true },
                    { Icon: Calendar, value: profile.createdAt ? `Joined ${new Date(profile.createdAt).toLocaleDateString('en',{month:'long',year:'numeric'})}` : null },
                    { Icon: Users,    value: isOwner ? profile.email : null, label: 'Email' },
                  ].filter(f => f.value).map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <f.Icon className="h-4 w-4 flex-shrink-0 text-gray-400 sm:h-5 sm:w-5" />
                      {f.isLink ? (
                        <a href={f.value!} target="_blank" rel="noopener noreferrer"
                          className="truncate text-[#1877F2] hover:underline">
                          {f.value!.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="truncate">
                          {f.label ? <><strong className="font-normal text-gray-400">{f.label} </strong>{f.value}</> : f.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  {[
                    { label: 'Full Name', value: profile.name },
                    { label: 'Username',  value: `@${profile.username}` },
                    { label: 'Gender',    value: profile.gender },
                    ...(isOwner ? [{ label: 'Phone', value: profile.phone }] : []),
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} className="flex items-center gap-4 border-t border-gray-100 py-2.5 text-sm dark:border-gray-700">
                      <span className="w-24 flex-shrink-0 text-xs text-gray-400 sm:w-28 sm:text-sm">{f.label}</span>
                      <span className="truncate text-gray-800 dark:text-gray-200">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'friends' && (
              <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-[#242526] sm:p-6">
                <h2 className="mb-0.5 text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">Friends</h2>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">{profile.friends?.length || 0} friends</p>
                {(!profile.friends || profile.friends.length === 0) ? (
                  <p className="py-10 text-center text-sm text-gray-500">No friends yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                    {profile.friends.map((f: any) => (
                      <a key={f._id} href={`/community/profile/${f.username}`}
                        className="group flex flex-col items-center gap-2 rounded-xl p-2 transition-colors hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] sm:p-3">
                        <img src={avatarSrc(f.name, f.avatar)} alt={f.name}
                          className="h-14 w-14 rounded-xl object-cover transition-all group-hover:brightness-95 sm:h-16 sm:w-16" />
                        <div className="w-full min-w-0 text-center">
                          <p className="truncate text-xs font-semibold text-gray-900 dark:text-gray-100 sm:text-sm">{f.name}</p>
                          <p className="truncate text-[10px] text-gray-500 sm:text-xs">@{f.username}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'photos' && (
              <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-[#242526] sm:p-6">
                <h2 className="mb-0.5 text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">Photos</h2>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">{photoMedia.length} photos</p>
                {photoMedia.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-500">No photos yet</p>
                ) : (
                  <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                    {photoMedia.map((m: any, i: number) => (
                      <div key={i} style={{ aspectRatio: '1' }}
                        className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-[#3a3b3c]">
                        <img src={m.url} alt={`Photo ${i+1}`} loading="lazy"
                          className="h-full w-full object-cover transition-all duration-200 group-hover:scale-105 group-hover:brightness-90" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
             
          </motion.div>
          
        </AnimatePresence>
          <CreatePost onPostCreated={handlePostCreated} />
      </div>
    </div>
  );
}
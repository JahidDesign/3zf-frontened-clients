'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, Smile, MapPin, Tag, Globe, Users, Lock, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { useT } from '@/hooks/useT';
import api from '@/lib/api';

const FEELINGS_EN = ['😊 Happy','😢 Sad','😍 In Love','🎉 Celebrating','😤 Angry','😴 Tired','🤔 Thinking','💪 Motivated'];
const FEELINGS_BN = ['😊 খুশি','😢 দুঃখিত','😍 প্রেমে','🎉 উদযাপন','😤 রাগান্বিত','😴 ক্লান্ত','🤔 ভাবছি','💪 অনুপ্রাণিত'];

export default function CreatePost({ onPostCreated }: { onPostCreated: (post: any) => void }) {
  const { user } = useAuthStore();
  const { t, lang } = useT();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [audience, setAudience] = useState('friends');
  const [feeling, setFeeling] = useState('');
  const [location, setLocation] = useState('');
  const [showFeelings, setShowFeelings] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const FEELINGS = lang === 'bn' ? FEELINGS_BN : FEELINGS_EN;

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    setFiles((prev) => [...prev, ...arr]);
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (!content.trim() && files.length === 0) return toast.error(lang === 'bn' ? 'কিছু লিখুন বা মিডিয়া যোগ করুন' : 'Write something or add media');
    setLoading(true);
    try {
      const formData = new FormData();
      if (content) formData.append('content', content);
      formData.append('audience', audience);
      if (feeling) formData.append('feeling', feeling);
      if (location) formData.append('location', location);
      files.forEach((f) => formData.append('media', f));
      const { data } = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) {
        onPostCreated(data.post);
        setContent(''); setFiles([]); setPreviews([]); setFeeling(''); setLocation(''); setOpen(false);
        toast.success(lang === 'bn' ? 'পোস্ট প্রকাশিত হয়েছে!' : 'Post published!');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || t.common.error);
    } finally { setLoading(false); }
  };

  if (!user) return null;

  const audienceOptions = [
    { value: 'public',  label: t.community.public,      icon: Globe  },
    { value: 'friends', label: t.community.friendsOnly,  icon: Users  },
    { value: 'private', label: t.community.private,      icon: Lock   },
  ];

  return (
    <div className="card mb-3">
      {!open ? (
        <>
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6B46C1&color=fff`}
              alt="" className="w-10 h-10 avatar flex-shrink-0"
            />
            <button
              onClick={() => setOpen(true)}
              className="flex-1 text-left px-4 py-2.5 rounded-full text-sm transition-colors"
              style={{ background: 'var(--color-bg-secondary)', border: '1.5px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              {t.community.whatsOnMind}, {user.name.split(' ')[0]}?
            </button>
          </div>

          <div className="flex items-center gap-1 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button onClick={() => { setOpen(true); fileRef.current?.click(); }}
              className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl text-sm font-medium transition-colors text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
              <Image className="w-5 h-5" /> {t.community.photo}
            </button>
            <button onClick={() => { setOpen(true); setShowFeelings(true); }}
              className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl text-sm font-medium transition-colors text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
              <Smile className="w-5 h-5" /> {t.community.feeling}
            </button>
            <button onClick={() => setOpen(true)}
              className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl text-sm font-medium transition-colors text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]">
              <MapPin className="w-5 h-5" /> Location
            </button>
          </div>
        </>
      ) : (
        <AnimatePresence>
          <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{t.community.createPost}</h3>
              <button onClick={() => setOpen(false)} className="btn-ghost w-8 h-8 flex items-center justify-center p-0 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 mb-4">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6B46C1&color=fff`}
                alt="" className="w-10 h-10 avatar"
              />
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{user.name}</p>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="text-xs py-0.5 px-2 rounded-md"
                  style={{ width: 'auto', border: '1px solid var(--color-border)' }}
                >
                  {audienceOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${t.community.whatsOnMind}, ${user.name.split(' ')[0]}?`}
              rows={4}
              className="w-full resize-none text-base border-0 p-0 bg-transparent"
              style={{ outline: 'none', boxShadow: 'none', border: 'none', fontSize: '16px' }}
              autoFocus
            />

            {(feeling || location) && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {feeling && (
                  <span className="flex items-center gap-1 text-sm px-3 py-1 rounded-full"
                    style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text)' }}>
                    {feeling}
                    <button onClick={() => setFeeling('')}><X className="w-3 h-3 ml-1" /></button>
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1 text-sm px-3 py-1 rounded-full"
                    style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text)' }}>
                    📍 {location}
                    <button onClick={() => setLocation('')}><X className="w-3 h-3 ml-1" /></button>
                  </span>
                )}
              </div>
            )}

            {previews.length > 0 && (
              <div className={`grid gap-1 mb-3 rounded-xl overflow-hidden ${previews.length > 1 ? 'grid-cols-2' : ''}`}>
                {previews.map((p, i) => (
                  <div key={i} className="relative" style={{ aspectRatio: '16/9' }}>
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => fileRef.current?.click()}
                  className="aspect-video flex items-center justify-center border-2 border-dashed rounded-xl transition-colors hover:border-[var(--color-brand)]"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <Plus className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>
            )}

            <AnimatePresence>
              {showFeelings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl p-3 mb-3 grid grid-cols-2 gap-1 overflow-hidden"
                  style={{ background: 'var(--color-bg-secondary)' }}
                >
                  {FEELINGS.map((f) => (
                    <button key={f} onClick={() => { setFeeling(f); setShowFeelings(false); }}
                      className="text-left px-3 py-2 rounded-lg text-sm hover:bg-[var(--color-bg-hover)] transition-colors"
                      style={{ color: 'var(--color-text)' }}>
                      {f}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-0.5">
                <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden"
                  onChange={(e) => handleFiles(e.target.files)} />
                <button onClick={() => fileRef.current?.click()}
                  className="btn-ghost w-9 h-9 flex items-center justify-center p-0 rounded-full" title={t.community.photo}>
                  <Image className="w-5 h-5 text-green-500" />
                </button>
                <button onClick={() => setShowFeelings(!showFeelings)}
                  className="btn-ghost w-9 h-9 flex items-center justify-center p-0 rounded-full" title={t.community.feeling}>
                  <Smile className="w-5 h-5 text-yellow-500" />
                </button>
                <button
                  onClick={() => { const loc = prompt('Add location:'); if (loc) setLocation(loc); }}
                  className="btn-ghost w-9 h-9 flex items-center justify-center p-0 rounded-full">
                  <MapPin className="w-5 h-5 text-red-500" />
                </button>
              </div>
              <button
                onClick={submit}
                disabled={loading || (!content.trim() && files.length === 0)}
                className="btn-primary px-6 py-2 text-sm"
              >
                {loading
                  ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : t.community.post}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

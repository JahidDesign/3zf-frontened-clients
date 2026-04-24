'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Lock, Bell, Eye, Trash2, Globe, Moon, Sun, LogOut, Save, Camera, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';
import MainNavbar from '@/components/layout/Navbar';
import useAuthStore from '@/store/authStore';
import { useT } from '@/hooks/useT';
import api from '@/lib/api';

type Tab = 'profile' | 'privacy' | 'security' | 'notifications' | 'appearance' | 'account';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'privacy', label: 'Privacy', icon: Eye },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: Sun },
  { key: 'account', label: 'Account', icon: AlertTriangle },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const { lang, setLang } = useT();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: {
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  }});

  const saveProfile = async (data: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, v as string); });
      if (avatarFile) formData.append('avatar', avatarFile);
      const res = await api.put('/users/profile/update', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(res.data.user);
      toast.success('Profile updated!');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const savePrivacy = async (settings: any) => {
    try {
      await api.put('/users/settings/update', { privacySettings: settings });
      toast.success('Privacy settings saved');
    } catch { toast.error('Failed to save'); }
  };

  const changePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) return toast.error("Passwords don't match");
    setLoading(true);
    try {
      await api.post('/auth/change-password', data);
      toast.success('Password changed!');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const requestDeletion = async () => {
    if (!confirm('Are you sure you want to request account deletion? An admin will review and permanently delete your account.')) return;
    try {
      await api.post('/auth/request-deletion');
      toast.success('Deletion request sent to admin');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)] max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-heading text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Settings</h1>

        <div className="flex gap-5">
          {/* Sidebar */}
          <aside className="w-52 flex-shrink-0 hidden md:block">
            <div className="card p-2 space-y-0.5">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                    ${activeTab === tab.key ? 'gradient-brand text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Mobile tab select */}
          <div className="md:hidden mb-4 w-full">
            <select value={activeTab} onChange={e => setActiveTab(e.target.value as Tab)} className="w-full">
              {TABS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

              {/* ── PROFILE ── */}
              {activeTab === 'profile' && (
                <div className="card">
                  <h2 className="font-semibold text-lg mb-5" style={{ color: 'var(--color-text)' }}>Edit Profile</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <img src={avatarPreview || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6B46C1&color=fff`}
                        alt="" className="w-20 h-20 rounded-full object-cover" />
                      <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-brand flex items-center justify-center cursor-pointer shadow-brand">
                        <Camera className="w-3.5 h-3.5 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      </label>
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{user.name}</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>@{user.username}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Full Name</label>
                        <input {...register('name', { required: true })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Location</label>
                        <input {...register('location')} placeholder="City, Country" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Bio</label>
                      <textarea rows={3} {...register('bio')} placeholder="Tell people about yourself..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Website</label>
                      <input {...register('website')} placeholder="https://yourwebsite.com" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5">
                      {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* ── PRIVACY ── */}
              {activeTab === 'privacy' && (
                <div className="card space-y-5">
                  <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Privacy Settings</h2>
                  {[
                    { key: 'profileVisibility', label: 'Who can see your profile?', options: ['public', 'friends', 'private'] },
                    { key: 'friendListVisibility', label: 'Who can see your friends list?', options: ['public', 'friends', 'private'] },
                    { key: 'postDefaultAudience', label: 'Default post audience', options: ['public', 'friends', 'private'] },
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{setting.label}</p>
                      </div>
                      <select defaultValue={user.privacySettings?.[setting.key as keyof typeof user.privacySettings] || 'public'}
                        onChange={async (e) => {
                          await savePrivacy({ ...user.privacySettings, [setting.key]: e.target.value });
                        }}
                        className="w-auto text-sm">
                        {setting.options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* ── SECURITY ── */}
              {activeTab === 'security' && (
                <div className="card space-y-5">
                  <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Change Password</h2>
                  <form onSubmit={handleSubmit(changePassword as any)} className="space-y-4">
                    {[
                      { name: 'currentPassword', label: 'Current Password' },
                      { name: 'newPassword', label: 'New Password' },
                      { name: 'confirmPassword', label: 'Confirm New Password' },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>{f.label}</label>
                        <input type="password" {...register(f.name as any, { required: true, minLength: f.name !== 'currentPassword' ? 6 : 1 })} />
                      </div>
                    ))}
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5">
                      <Lock className="w-4 h-4" /> Update Password
                    </button>
                  </form>
                </div>
              )}

              {/* ── APPEARANCE ── */}
              {activeTab === 'appearance' && (
                <div className="card space-y-6">
                  <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Appearance</h2>

                  {/* Theme */}
                  <div>
                    <p className="font-medium text-sm mb-3" style={{ color: 'var(--color-text)' }}>Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Globe },
                      ].map(t => (
                        <button key={t.value} onClick={() => setTheme(t.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all
                            ${theme === t.value ? 'border-[var(--color-brand)] bg-[var(--color-bg-tertiary)]' : 'border-[var(--color-border)] hover:border-[var(--color-brand)]'}`}>
                          <t.icon className="w-6 h-6" style={{ color: theme === t.value ? 'var(--color-brand)' : 'var(--color-text-secondary)' }} />
                          <p className="text-sm font-medium" style={{ color: theme === t.value ? 'var(--color-brand)' : 'var(--color-text)' }}>{t.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <p className="font-medium text-sm mb-3" style={{ color: 'var(--color-text)' }}>Language</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ value: 'en', label: 'English' }, { value: 'bn', label: 'বাংলা' }].map(l => (
                        <button key={l.value} onClick={() => setLang(l.value as 'en' | 'bn')}
                          className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-medium
                            ${lang === l.value ? 'border-[var(--color-brand)] bg-[var(--color-bg-tertiary)] text-[var(--color-brand)]' : 'border-[var(--color-border)] hover:border-[var(--color-brand)]'}`}
                          style={{ color: lang !== l.value ? 'var(--color-text)' : undefined }}>
                          <Globe className="w-4 h-4" /> {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── ACCOUNT ── */}
              {activeTab === 'account' && (
                <div className="space-y-4">
                  {/* Logout */}
                  <div className="card">
                    <h2 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text)' }}>Session</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      You are currently logged in as <strong>{user.email}</strong>
                    </p>
                    <button onClick={logout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>

                  {/* Danger zone */}
                  <div className="card border-2 border-red-200 dark:border-red-900">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h2 className="font-semibold text-lg text-red-500">Danger Zone</h2>
                    </div>
                    <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                      Deleting your account is permanent and irreversible. All your posts, messages, and data will be removed. Your request will be reviewed by an admin before deletion.
                    </p>
                    {user.deleteRequested ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Deletion request is pending admin review
                      </div>
                    ) : (
                      <button onClick={requestDeletion}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" /> Request Account Deletion
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

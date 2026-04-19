'use client';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useT } from '@/hooks/useT';

export default function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'full' }) {
  const { theme, setTheme } = useTheme();
  const { t } = useT();

  if (variant === 'full') {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: 'light', label: t.settings.light, icon: Sun },
          { value: 'dark',  label: t.settings.dark,  icon: Moon },
          { value: 'system',label: t.settings.system,icon: Monitor },
        ].map(opt => (
          <button key={opt.value} onClick={() => setTheme(opt.value)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
            style={{
              borderColor: theme === opt.value ? 'var(--color-brand)' : 'var(--color-border)',
              background: theme === opt.value ? 'var(--color-bg-tertiary)' : 'var(--color-bg)',
              color: theme === opt.value ? 'var(--color-brand)' : 'var(--color-text-secondary)',
            }}>
            <opt.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="btn-ghost w-9 h-9 flex items-center justify-center p-0"
      title={theme === 'dark' ? t.common.lightMode : t.common.darkMode}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

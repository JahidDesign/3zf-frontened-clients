'use client';
import { useT } from '@/hooks/useT';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  /** 'icon'  — shows globe + short label (EN / বাং), used in navbar */
  /** 'full'  — shows full label card, used in settings */
  /** 'badge' — tiny toggle pill */
  variant?: 'icon' | 'full' | 'badge';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'icon', className = '' }: LanguageSwitcherProps) {
  const { lang, setLang, t } = useT();
  const isEn = lang === 'en';
  const toggle = () => setLang(isEn ? 'bn' : 'en');

  if (variant === 'badge') {
    return (
      <button
        onClick={toggle}
        title={isEn ? 'Switch to বাংলা' : 'Switch to English'}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
          hover:opacity-80 active:scale-95 ${className}`}
        style={{
          borderColor: 'var(--color-brand)',
          color: 'var(--color-brand)',
          background: 'var(--color-bg-tertiary)',
        }}
      >
        <Globe className="w-3 h-3" />
        {isEn ? 'বাং' : 'EN'}
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        {(['en', 'bn'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-medium transition-all"
            style={{
              borderColor: lang === l ? 'var(--color-brand)' : 'var(--color-border)',
              background: lang === l ? 'var(--color-bg-tertiary)' : 'var(--color-bg)',
              color: lang === l ? 'var(--color-brand)' : 'var(--color-text)',
            }}
          >
            <Globe className="w-4 h-4" />
            {l === 'en' ? 'English' : 'বাংলা'}
          </button>
        ))}
      </div>
    );
  }

  // Default: icon variant (for navbar)
  return (
    <button
      onClick={toggle}
      title={isEn ? 'Switch to বাংলা' : 'Switch to English'}
      className={`btn-ghost flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold transition-all ${className}`}
    >
      <Globe className="w-4 h-4" />
      {isEn ? 'বাং' : 'EN'}
    </button>
  );
}

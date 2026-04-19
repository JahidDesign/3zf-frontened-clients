'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ─── MODAL ───────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }[size];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className={`card w-full ${sizeClass} shadow-modal max-h-[90vh] overflow-y-auto`}
          >
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-text)' }}>{title}</h2>
                <button onClick={onClose} className="btn-ghost w-8 h-8 flex items-center justify-center p-0 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── SPINNER ────────────────────────────────────────────────
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-3' };
  return (
    <div
      className={`${sizes[size]} rounded-full animate-spin ${className}`}
      style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
          3Z
        </div>
        <Spinner size="md" />
      </div>
    </div>
  );
}

// ─── BADGE ──────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  error:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  brand:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-0.5';
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${BADGE_STYLES[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── AVATAR ─────────────────────────────────────────────────
interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  online?: boolean;
  className?: string;
}

export function Avatar({ src, name = 'U', size = 40, online, className = '' }: AvatarProps) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6B46C1&color=fff&size=${size * 2}`;
  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img
        src={src || fallback}
        alt={name}
        className="rounded-full object-cover w-full h-full"
      />
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-[var(--color-bg)] ${online ? 'bg-green-500' : 'bg-gray-400'}`}
          style={{ width: Math.max(8, size / 4), height: Math.max(8, size / 4) }}
        />
      )}
    </div>
  );
}

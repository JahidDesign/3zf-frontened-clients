'use client';
import { Video } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function ReelsPage() {
  const { t } = useT();
  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="card text-center py-20">
        <Video className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-brand)' }} />
        <h1 className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>{t.community.reels}</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Short video reels — coming soon!</p>
      </div>
    </div>
  );
}

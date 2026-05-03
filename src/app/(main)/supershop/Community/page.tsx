'use client';

import { Suspense } from 'react';
import CommunityContent from '@/components/CommunityContent';

export default function CommunityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CommunityContent />
    </Suspense>
  );
}
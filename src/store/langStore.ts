import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/lib/i18n';

interface LangState {
  lang: Language;
  setLang: (lang: Language) => void;
}

// Store only the language string — never the full translation object.
// The translations object is imported fresh in useT() hook each render.
const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'en' as Language,
      setLang: (lang: Language) => set({ lang }),
    }),
    {
      name: '3zf-lang',
      // Only persist the lang key, nothing else
      partialize: (state) => ({ lang: state.lang }),
    }
  )
);

export default useLangStore;

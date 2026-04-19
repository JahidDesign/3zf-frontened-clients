/**
 * useT — translation hook
 *
 * Usage:
 *   const { t, lang, setLang } = useT();
 *   <p>{t.nav.home}</p>
 *   <button onClick={() => setLang('bn')}>বাংলা</button>
 *
 * This hook imports the translations map fresh every render,
 * then selects the correct language from the Zustand lang store.
 * No stale closure / hydration mismatch possible.
 */
import { translations } from '@/lib/i18n';
import useLangStore from '@/store/langStore';

export function useT() {
  const { lang, setLang } = useLangStore();
  const t = translations[lang] ?? translations.en;
  return { t, lang, setLang };
}

export default useT;

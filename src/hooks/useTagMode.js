import { useSearchParams } from 'react-router-dom';
import { usePrefs } from '../store/prefs.store.js';
import { TAG_MODES } from '../lib/filters.js';

// the tag mode in effect on this page: the URL says so when it carries one, otherwise the visitor's saved choice
export function useTagMode() {
  const [params] = useSearchParams();
  const saved = usePrefs((s) => s.tagMode);
  const fromUrl = params.get('tags');
  return TAG_MODES.some((m) => m.id === fromUrl) ? fromUrl : saved;
}

import { useSyncExternalStore } from 'react';

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(query); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); },
    () => window.matchMedia(query).matches,
  );
}
export const BP = { rail: '(min-width: 1024px)', phone: '(max-width: 640px)', sheet: '(max-width: 768px)' };

// View preferences for the results (layout, density, visible fields, page size). Persisted, validated on read, safe when storage is blocked.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PAGE_SIZES } from '../lib/filters.js';

export const DEFAULT_PREFS = {
  layout: 'cards',
  density: 'comfortable',
  pageSize: 50,
  avatars: true,
  show: { description: true, tags: true, stats: true, activity: true, domain: true },
  imagesAlways: false,
  panelAutoTags: false,
  tagMode: 'real',
  panelWidth: 820,
};
const VERSION = 1;

export function sanitizePrefs(src) {
  const s = src && typeof src === 'object' ? src : {};
  const out = { ...DEFAULT_PREFS, show: { ...DEFAULT_PREFS.show } };
  if (s.layout === 'cards' || s.layout === 'rows') out.layout = s.layout;
  if (s.density === 'comfortable' || s.density === 'compact') out.density = s.density;
  if (PAGE_SIZES.includes(s.pageSize)) out.pageSize = s.pageSize;
  if (typeof s.avatars === 'boolean') out.avatars = s.avatars;
  if (typeof s.imagesAlways === 'boolean') out.imagesAlways = s.imagesAlways;
  if (typeof s.panelAutoTags === 'boolean') out.panelAutoTags = s.panelAutoTags;
  if (Number.isFinite(s.panelWidth)) out.panelWidth = Math.max(480, Math.min(1600, Math.round(s.panelWidth)));
  if (s.tagMode === 'real' || s.tagMode === 'auto' || s.tagMode === 'both') out.tagMode = s.tagMode;
  if (s.show && typeof s.show === 'object') for (const k of Object.keys(out.show)) if (typeof s.show[k] === 'boolean') out.show[k] = s.show[k];
  return out;
}

const memory = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const storage = () => { try { return window.localStorage; } catch { return memory; } };

export const usePrefs = create(
  persist(
    (set) => ({
      ...DEFAULT_PREFS,
      setPref: (key, value) => set((s) => sanitizePrefs({ ...s, [key]: value })),
      setShow: (key, value) => set((s) => sanitizePrefs({ ...s, show: { ...s.show, [key]: value } })),
      resetPrefs: () => set({ ...DEFAULT_PREFS, show: { ...DEFAULT_PREFS.show } }),
    }),
    {
      name: 'rz-prefs',
      version: VERSION,
      storage: createJSONStorage(storage),
      partialize: (s) => ({ layout: s.layout, density: s.density, pageSize: s.pageSize, avatars: s.avatars, show: s.show, imagesAlways: s.imagesAlways, panelAutoTags: s.panelAutoTags, tagMode: s.tagMode, panelWidth: s.panelWidth }),
      migrate: (persisted) => sanitizePrefs(persisted),
      merge: (persisted, current) => ({ ...current, ...sanitizePrefs(persisted) }),
    },
  ),
);

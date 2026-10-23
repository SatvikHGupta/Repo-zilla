// Runtime theme store: the <html> attributes are the truth, localStorage remembers them, React subscribes via useSyncExternalStore.
import { useSyncExternalStore } from 'react';
import { MODES, ACCENTS, DEFAULTS, KEYS } from './registry.js';
import { createStore } from './core.js';

const memory = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const storage = (() => { try { return window.localStorage; } catch { return memory; } })();
const modes = MODES.map((m) => m.id), accents = ACCENTS.map((a) => a.id);

export const themeStore = createStore({ doc: document, storage, modes, accents, def: DEFAULTS, keys: KEYS });

// snapshots are cached per combination so React sees a stable reference until something really changes
let cached = null;
const getSnapshot = () => {
  const s = themeStore.get();
  if (!cached || cached.mode !== s.mode || cached.accent !== s.accent || cached.partner !== s.partner) cached = s;
  return cached;
};
export const useTheme = () => useSyncExternalStore(themeStore.subscribe, getSnapshot);

// another tab changed the theme: re-apply the stored (validated) values here
window.addEventListener('storage', (e) => {
  if (e.key !== null && !Object.values(KEYS).includes(e.key)) return;
  const st = themeStore.stored(), root = document.documentElement;
  root.setAttribute('data-mode', modes.includes(st.mode) ? st.mode : DEFAULTS.mode);
  root.setAttribute('data-accent', accents.includes(st.accent) ? st.accent : DEFAULTS.accent);
  if (accents.includes(st.partner)) root.setAttribute('data-partner', st.partner); else root.removeAttribute('data-partner');
  themeStore.notify();
});

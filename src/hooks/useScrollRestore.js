// Scroll behaviour for the page underneath: Back / Forward put each history entry back where it was, a new page starts at the top,
// and filter changes on the same page leave the scroll alone. The repo panel opening or closing never reaches this hook (its key does not change).
import { useEffect, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';

const STORE_KEY = 'rz-scroll', MAX_ENTRIES = 60, RETRY_MS = 50, MAX_TRIES = 30;
const read = () => { try { return JSON.parse(window.sessionStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; } };
const saved = typeof window === 'undefined' ? {} : read(); // history entry key -> scrollY, survives a reload of the same tab
const persist = () => {
  const keys = Object.keys(saved);
  for (const k of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) delete saved[k]; // oldest entries go first
  try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify(saved)); } catch { /* blocked storage: positions are kept for this session only */ }
};

// the page may still be loading its content, so keep trying until it is tall enough, the time is up, or the user scrolls
function restore(y) {
  let tries = 0, timer = 0;
  const stop = () => { clearTimeout(timer); window.removeEventListener('wheel', stop); window.removeEventListener('touchstart', stop); window.removeEventListener('keydown', stop); };
  const step = () => {
    window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    if (Math.abs(window.scrollY - y) > 2 && tries++ < MAX_TRIES) timer = setTimeout(step, RETRY_MS); // loop: retry while the page is shorter than the saved position
    else stop();
  };
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', stop);
  step();
  return stop;
}

export function useScrollRestore(location) {
  const navType = useNavigationType();
  const { key, pathname } = location;
  const lastPath = useRef(null);
  // keep the position of the current entry up to date while it is on screen
  useEffect(() => {
    let raf = 0;
    const remember = () => { saved[key] = Math.round(window.scrollY); };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(remember); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); remember(); persist(); };
  }, [key]);
  // arriving on an entry: restore it on Back / Forward, start at the top on a new page, do nothing for a change on the same page
  useEffect(() => {
    const samePage = lastPath.current === pathname;
    lastPath.current = pathname;
    if (navType === 'POP' && typeof saved[key] === 'number') return restore(saved[key]);
    if (!samePage) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return undefined;
  }, [key, pathname, navType]);
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

const SHOW_AFTER = 350; // ms the pointer rests on something before its tip appears (0 when another tip was just showing)
const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), Math.max(lo, hi));

// One tooltip for the whole site, so every hint looks the same. Anything with a `title` (or `data-tip`) attribute gets it.
// While the pointer is on an element its `title` is moved to `data-tip`, so the browser's own grey tooltip never shows, and it is put back when the pointer
// leaves (screen readers still read the title). Keyboard focus shows the tip too. It is skipped when it only repeats the visible text.
export default function TooltipHost() {
  const [tip, setTip] = useState(null); // { text, rect }
  const [pos, setPos] = useState(null); // { left, top, side, ax }
  const box = useRef(null);

  useEffect(() => {
    let cur = null, timer = 0, lastShown = 0;
    const targetOf = (n) => (n instanceof Element ? n.closest('[title], [data-tip]') : null);

    // hides the tip and gives the element its title back
    const release = () => {
      clearTimeout(timer);
      if (!cur) return;
      const { el, fromTitle, text, described } = cur;
      if (el.isConnected) {
        if (fromTitle) { el.setAttribute('title', text); el.removeAttribute('data-tip'); }
        if (described === null) el.removeAttribute('aria-describedby'); else el.setAttribute('aria-describedby', described);
      }
      cur = null; setTip(null);
    };

    const arm = (el, now) => {
      if (cur?.el === el) return;
      release();
      const text = (el.getAttribute('data-tip') ?? el.getAttribute('title') ?? '').trim();
      if (!text) return;
      const fromTitle = el.hasAttribute('title');
      if (fromTitle) { el.setAttribute('data-tip', text); el.removeAttribute('title'); } // no native tooltip from here on
      cur = { el, text, fromTitle, described: el.getAttribute('aria-describedby') };
      if (text === el.textContent.trim()) return; // it only repeats what is already on screen
      const show = () => {
        if (!cur || cur.el !== el || !el.isConnected) return;
        el.setAttribute('aria-describedby', 'rz-tooltip');
        lastShown = Date.now();
        setTip({ text, rect: el.getBoundingClientRect() });
      };
      if (now || Date.now() - lastShown < 600) show(); else timer = setTimeout(show, SHOW_AFTER);
    };

    const over = (e) => { if (e.pointerType === 'touch') return; const el = targetOf(e.target); if (el) arm(el, false); };
    const out = (e) => { if (cur && !(e.relatedTarget instanceof Node && cur.el.contains(e.relatedTarget))) release(); };
    const focus = (e) => { const el = targetOf(e.target); if (el && e.target.matches?.(':focus-visible')) arm(el, true); };
    const key = (e) => { if (e.key === 'Escape') release(); };
    const opts = { capture: true, passive: true };
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerout', out);
    document.addEventListener('focusin', focus);
    document.addEventListener('focusout', release);
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', release);
    window.addEventListener('scroll', release, opts);
    window.addEventListener('blur', release);
    return () => {
      release();
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerout', out);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('focusout', release);
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', release);
      window.removeEventListener('scroll', release, opts);
      window.removeEventListener('blur', release);
    };
  }, []);

  // above the element, or below it when there is no room; kept inside the screen, with the little arrow still pointing at the element
  useLayoutEffect(() => {
    if (!tip || !box.current) { setPos(null); return; }
    const b = box.current.getBoundingClientRect(), r = tip.rect, M = 8, GAP = 10;
    const left = clamp(r.left + r.width / 2 - b.width / 2, M, window.innerWidth - b.width - M);
    let top = r.top - b.height - GAP, side = 'above';
    if (top < M) { top = r.bottom + GAP; side = 'below'; }
    setPos({ left, top, side, ax: clamp(r.left + r.width / 2 - left, 14, b.width - 14) });
  }, [tip]);

  if (!tip) return null;
  return createPortal(
    <div ref={box} id="rz-tooltip" role="tooltip" className={`${styles.tip} ${pos ? `${styles.on} ${styles[pos.side]}` : ''}`}
      style={pos ? { left: pos.left, top: pos.top, '--ax': `${pos.ax}px` } : { left: 0, top: 0, visibility: 'hidden' }}>
      {tip.text}
    </div>,
    document.body,
  );
}

// Shared behaviour for dialogs, sheets and the repo panel: Esc closes, Tab stays inside, page scroll is locked, focus returns on close.
import { useEffect } from 'react';

let locks = 0, prevOverflow = '', prevPad = '';
function lockScroll() {
  if (locks++ > 0) return;
  const b = document.body, gap = window.innerWidth - document.documentElement.clientWidth;
  prevOverflow = b.style.overflow; prevPad = b.style.paddingRight;
  b.style.overflow = 'hidden';
  if (gap > 0 && !CSS.supports('scrollbar-gutter', 'stable')) b.style.paddingRight = `${gap}px`; // keep the layout from jumping when the scrollbar disappears
}
function unlockScroll() {
  if (--locks > 0) return;
  document.body.style.overflow = prevOverflow; document.body.style.paddingRight = prevPad;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModal(ref, onClose, active = true) {
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return undefined;
    const previous = document.activeElement;
    lockScroll();
    el.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const nodes = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (!nodes.length) { e.preventDefault(); el.focus(); return; }
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      unlockScroll();
      if (previous && typeof previous.focus === 'function' && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, [ref, onClose, active]);
}

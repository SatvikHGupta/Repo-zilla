import { useEffect, useRef, useState } from 'react';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// eases a displayed number towards `value`. Starts from `start` on first mount, from the previous value afterwards.
export function useCountUp(value, { duration = 800, start = 0 } = {}) {
  const [shown, setShown] = useState(() => (reduced() ? value : start));
  const from = useRef(shown);
  useEffect(() => {
    if (reduced() || from.current === value) { from.current = value; return undefined; }
    const a = from.current, t0 = performance.now();
    let raf = 0;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - p) ** 3; // ease-out cubic
      const v = Math.round(a + (value - a) * eased);
      from.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return shown;
}

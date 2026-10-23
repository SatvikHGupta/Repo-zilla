import { useCallback, useEffect, useId, useRef, useState } from 'react';
import styles from './Popover.module.css';

// anchored dropdown panel. renderTrigger receives the props to spread on the trigger button.
export default function Popover({ renderTrigger, children, align = 'end', width = 320, label }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null), panel = useRef(null), id = useId();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (wrap.current && !wrap.current.contains(e.target)) close(); };
    const onKey = (e) => { if (e.key === 'Escape') { close(); wrap.current?.querySelector('[aria-haspopup]')?.focus(); } };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    panel.current?.focus({ preventScroll: true });
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open, close]);

  return (
    <div className={styles.wrap} ref={wrap}>
      {renderTrigger({ onClick: () => setOpen((o) => !o), 'aria-expanded': open, 'aria-haspopup': 'dialog', 'aria-controls': open ? id : undefined })}
      {open && (
        <div id={id} ref={panel} role="dialog" aria-label={label} tabIndex={-1} className={`${styles.panel} ${align === 'start' ? styles.start : styles.end}`} style={{ width }}>
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}

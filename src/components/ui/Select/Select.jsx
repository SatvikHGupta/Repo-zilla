import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Icon from '../Icon/Icon.jsx';
import styles from './Select.module.css';

// A themed dropdown: a button and a listbox, replacing the browser's own select element (its list cannot follow the theme).
// options: [{ value, label, hint?, disabled? }]. Keyboard: arrows, Home / End, Enter / Space, Escape, and typing the first letters of an option.
export default function Select({ value, onChange, options, label, prefix, align = 'end' }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef(null), list = useRef(null), btn = useRef(null), typed = useRef({ text: '', at: 0 });
  const id = useId();
  const selected = Math.max(0, options.findIndex((o) => o.value === value));

  const close = useCallback((refocus = true) => { setOpen(false); if (refocus) btn.current?.focus(); }, []);
  const openAt = (i) => { setActive(i); setOpen(true); };
  const choose = (i) => { if (options[i].disabled) return; onChange(options[i].value); close(); };
  // the next option that can be chosen, stepping one way and stopping at the ends
  const step = (from, dir) => { for (let i = from + dir; i >= 0 && i < options.length; i += dir) if (!options[i].disabled) return i; return from; };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (wrap.current && !wrap.current.contains(e.target)) close(false); };
    document.addEventListener('pointerdown', onDown);
    list.current?.focus({ preventScroll: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, close]);
  // keep the highlighted option in view when the list scrolls
  useEffect(() => { if (open) list.current?.children[active]?.scrollIntoView?.({ block: 'nearest' }); }, [open, active]);

  const onButtonKey = (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openAt(selected); }
  };
  const onListKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => step(a, 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => step(a, -1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(step(-1, 1)); }
    else if (e.key === 'End') { e.preventDefault(); setActive(step(options.length, -1)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'Tab') close(false);
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // type-ahead: letters typed in quick succession jump to the option that starts with them
      const now = Date.now();
      typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : '') + e.key.toLowerCase(), at: now };
      const hit = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(typed.current.text));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <div className={styles.wrap} ref={wrap}>
      <button ref={btn} type="button" className={styles.btn} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined} aria-label={`${label}: ${options[selected].label}`}
        onClick={() => (open ? close(false) : openAt(selected))} onKeyDown={onButtonKey}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <span className={styles.value}>{options[selected].label}</span>
        <Icon name="chevronDown" size={16} className={open ? styles.flip : ''} />
      </button>
      {open && (
        <ul id={id} ref={list} role="listbox" tabIndex={-1} aria-label={label} aria-activedescendant={`${id}-${active}`} className={`${styles.menu} ${align === 'start' ? styles.start : styles.end}`} onKeyDown={onListKey}>
          {options.map((o, i) => (
            <li key={o.value} id={`${id}-${i}`} role="option" aria-selected={i === selected} aria-disabled={o.disabled || undefined} data-active={i === active} className={styles.opt}
              onPointerEnter={() => !o.disabled && setActive(i)} onClick={() => choose(i)}>
              <span className={styles.tick} aria-hidden="true">{i === selected && <Icon name="check" size={14} strokeWidth={3} />}</span>
              <span className={styles.text}><span>{o.label}</span>{o.hint && <small>{o.hint}</small>}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

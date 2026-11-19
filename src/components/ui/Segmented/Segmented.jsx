import { useRef } from 'react';
import Icon from '../Icon/Icon.jsx';
import styles from './Segmented.module.css';

const STEP = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

// single-choice button group. options: [{ value, label, icon? }]. Behaves like a native radio group: one tab stop, arrow keys move the choice.
export default function Segmented({ value, onChange, options, label, size = 'md' }) {
  const group = useRef(null);
  const current = Math.max(0, options.findIndex((o) => o.value === value)); // with nothing selected the first option is the tab stop
  const onKeyDown = (e) => {
    let next = -1;
    if (e.key in STEP) next = (current + STEP[e.key] + options.length) % options.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(options[next].value);
    group.current?.querySelectorAll('button')[next]?.focus();
  };
  return (
    <div ref={group} className={`${styles.group} ${size === 'sm' ? styles.sm : ''}`} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((o, i) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} tabIndex={i === current ? 0 : -1} className={styles.opt} onClick={() => onChange(o.value)}>
          {o.icon && <Icon name={o.icon} size={15} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

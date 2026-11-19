import { useId, useState } from 'react';
import Icon from '../ui/Icon/Icon.jsx';
import styles from './FilterSection.module.css';

// collapsible group with a badge showing how many of its filters are active. The body animates open and stays mounted (inert while closed).
export default function FilterSection({ title, active = 0, defaultOpen = false, children }) {
  const startOpen = defaultOpen || active > 0;
  const [open, setOpen] = useState(startOpen);
  const [settled, setSettled] = useState(startOpen); // overflow is only visible once the open animation has finished
  const id = useId();
  const toggle = () => { setSettled(false); setOpen((o) => !o); };
  return (
    <section className={styles.sec}>
      <h3 className={styles.h}>
        <button type="button" className={styles.btn} aria-expanded={open} aria-controls={id} onClick={toggle}>
          <span>{title}</span>
          {active > 0 && <span className={`${styles.badge} num`}>{active}</span>}
          <Icon name="chevronDown" size={16} className={open ? styles.up : ''} />
        </button>
      </h3>
      <div id={id} className={styles.collapse} data-open={open} inert={!open} onTransitionEnd={(e) => { if (e.target === e.currentTarget && open) setSettled(true); }}>
        <div className={`${styles.inner} ${open && settled ? styles.visible : ''}`}><div className={styles.body}>{children}</div></div>
      </div>
    </section>
  );
}

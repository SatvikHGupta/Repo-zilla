import { useId } from 'react';
import styles from './Switch.module.css';

// label + optional help line. The help text is tied to the control with aria-describedby.
export default function Switch({ checked, onChange, label, help, disabled }) {
  const id = useId();
  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <label id={`${id}-l`} htmlFor={id} className={styles.label}>{label}</label>
        {help && <p id={`${id}-h`} className={styles.help}>{help}</p>}
      </div>
      <button id={id} type="button" role="switch" aria-checked={checked} aria-labelledby={`${id}-l`} aria-describedby={help ? `${id}-h` : undefined} disabled={disabled} className={styles.track} onClick={() => onChange(!checked)}>
        <span className={styles.thumb} />
      </button>
    </div>
  );
}

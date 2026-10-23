import Icon from '../ui/Icon/Icon.jsx';
import { fmtNum } from '../../lib/format.js';
import styles from './CheckRow.module.css';

// checkbox (multi) or radio (single) row with an optional global count. The native input stays in the DOM for keyboard and screen readers.
export default function CheckRow({ checked, onChange, label, count, pending = false, type = 'checkbox', name, hint, indent = false }) {
  return (
    <label className={`${styles.row} ${indent ? styles.indent : ''}`} title={hint}>
      <input className="sr-only" type={type} name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`${styles.box} ${type === 'radio' ? styles.radio : ''}`} aria-hidden="true">{checked && type === 'checkbox' && <Icon name="check" size={12} strokeWidth={3} />}</span>
      <span className={styles.label}>{label}</span>
      {count !== undefined && <span className={`${styles.count} ${pending ? styles.pending : ''} num`}>{fmtNum(count)}</span>}
    </label>
  );
}

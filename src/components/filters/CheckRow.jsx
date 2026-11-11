import Icon from '../ui/Icon/Icon.jsx';
import { fmtCompact, fmtNum } from '../../lib/format.js';
import styles from './CheckRow.module.css';

// checkbox (multi) or radio (single) row with an optional global count. The native input stays in the DOM for keyboard and screen readers.
export default function CheckRow({ checked, onChange, label, count, pending = false, type = 'checkbox', name, hint, indent = false }) {
  return (
    <label className={`${styles.row} ${indent ? styles.indent : ''}`} title={hint || label}>
      <input className="sr-only" type={type} name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`${styles.box} ${type === 'radio' ? styles.radio : ''}`} aria-hidden="true">{checked && type === 'checkbox' && <Icon name="check" size={12} strokeWidth={3} />}</span>
      <span className={styles.label}>{label}</span>
      {/* big numbers are shortened (119k) so the column stays narrow, the exact figure is in the tooltip */}
      {count !== undefined && <span className={`${styles.count} ${pending ? styles.pending : ''} num`} title={`${fmtNum(count)} repositories`}>{count >= 10000 ? fmtCompact(count) : fmtNum(count)}</span>}
    </label>
  );
}

import { SORTS } from '../../lib/filters.js';
import styles from './SortSelect.module.css';

// native select (best on phones). Sorts whose index is missing from the data are left out; in development they are listed as disabled so the gap is visible.
export default function SortSelect({ value, onChange, available }) {
  const options = SORTS.filter((s) => available(s.id) || import.meta.env.DEV);
  return (
    <label className={styles.wrap}>
      <span className={styles.label}>Sort</span>
      <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Sort results">
        {options.map((s) => <option key={s.id} value={s.id} disabled={!available(s.id)}>{s.label}{available(s.id) ? '' : ' (not built)'}</option>)}
      </select>
    </label>
  );
}

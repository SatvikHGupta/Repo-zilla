import { describeFilters, removeFilter } from '../../lib/filters.js';
import Chip from '../ui/Chip/Chip.jsx';
import styles from './ActiveChips.module.css';

// every active filter as a removable chip (a locked scope, such as a domain page's own domain, is not listed)
export default function ActiveChips({ filters, names, onChange, onClear, lockedKeys = [] }) {
  const chips = describeFilters(filters, names).filter((c) => !lockedKeys.includes(c.key));
  if (!chips.length) return null;
  return (
    <div className={styles.row} role="group" aria-label="Active filters">
      {chips.map((c) => (
        <Chip key={`${c.key}:${c.value}`} tone="accent" onRemove={() => onChange(removeFilter(filters, c))} removeLabel={`Remove filter ${c.label}`} title={c.group}>{c.label}</Chip>
      ))}
      {chips.length > 1 && <button type="button" className={styles.clear} onClick={onClear}>Clear all</button>}
    </div>
  );
}

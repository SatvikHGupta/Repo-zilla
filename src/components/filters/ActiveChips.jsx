import { describeFilters, removeFilter } from '../../lib/filters.js';
import Chip from '../ui/Chip/Chip.jsx';
import styles from './ActiveChips.module.css';

// The space for whatever is selected: every active filter as a removable chip, grouped under its kind (Domain, Language, Tag ...).
// It is always on the page, so the layout does not jump when the first filter is picked. A locked scope (a domain page's own domain) is not listed.
export default function ActiveChips({ filters, names, onChange, onClear, lockedKeys = [] }) {
  const chips = describeFilters(filters, names).filter((c) => !lockedKeys.includes(c.key));
  const groups = [];
  for (const c of chips) {
    const g = groups.find((x) => x.name === c.group);
    if (g) g.items.push(c); else groups.push({ name: c.group, items: [c] });
  }
  return (
    <div className={styles.panel} role="group" aria-label="Selected filters">
      <div className={styles.groups}>
        {groups.map((g) => (
          <div key={g.name} className={styles.group}>
            <span className={styles.label}>{g.name}</span>
            {g.items.map((c) => (
              <Chip key={`${c.key}:${c.value}`} tone="accent" onRemove={() => onChange(removeFilter(filters, c))} removeLabel={`Remove filter ${c.label}`} title={c.group}>{c.label}</Chip>
            ))}
          </div>
        ))}
        {!chips.length && <p className={styles.empty}>No filters selected. Whatever you pick in the filters shows up here.</p>}
      </div>
      {chips.length > 0 && <button type="button" className={styles.clear} onClick={onClear}>Clear filters</button>}
    </div>
  );
}

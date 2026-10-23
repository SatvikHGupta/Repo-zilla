import Chip from '../ui/Chip/Chip.jsx';
import { AUTO_NOTE, confidence } from '../../lib/autoTags.js';
import { buildSearchParams, DEFAULT_FILTERS } from '../../lib/filters.js';
import styles from './AutoTags.module.css';

const searchTo = (tag) => `/search?${buildSearchParams({ ...DEFAULT_FILTERS, tags: [tag], auto: true, autoOnly: true })}`;

// tags: [{ tag, p }]. Each chip links to a search for that auto tag and carries its confidence.
export default function AutoTags({ tags, compact = false }) {
  if (!tags.length) return null;
  return (
    <ul className={styles.list} aria-label="Auto-generated tags">
      <li className={styles.label} title={AUTO_NOTE}>auto</li>
      {tags.map(({ tag, p }) => (
        <li key={tag}>
          <Chip tone="auto" to={searchTo(tag)} title={`Auto tag, ${confidence(p)} confidence (${Math.round(p * 100)}%)`}>
            <span className={styles.tag}>{tag}</span>
            {!compact && <span className={`${styles.dot} ${styles[confidence(p)]}`} aria-hidden="true" />}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

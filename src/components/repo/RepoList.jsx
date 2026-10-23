import RepoCard from './RepoCard.jsx';
import RepoRow from './RepoRow.jsx';
import { usePrefs } from '../../store/prefs.store.js';
import styles from './RepoList.module.css';

// the hover spotlight follows the mouse: one delegated handler writes two CSS variables on the item under the pointer
function trackPointer(e) {
  if (e.pointerType !== 'mouse') return;
  const li = e.target.closest('li');
  if (!li) return;
  const r = li.getBoundingClientRect();
  li.style.setProperty('--mx', `${e.clientX - r.left}px`);
  li.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export default function RepoList({ rows, tagMode = 'real' }) {
  const layout = usePrefs((s) => s.layout);
  const density = usePrefs((s) => s.density);
  const show = usePrefs((s) => s.show);
  const compact = density === 'compact' ? styles.compact : '';
  if (layout === 'rows') {
    return (
      <div className={`${styles.table} ${compact}`}>
        <div className={styles.head} aria-hidden="true">
          <span className={styles.hRank}>#</span><span>Repository</span><span>Language</span>
          <span>{show.stats ? 'Stars / forks' : ''}</span><span>{show.activity ? 'Last commit' : ''}</span><span />
        </div>
        <ul className={styles.rows} onPointerMove={trackPointer}>{rows.map((row, i) => (row ? <RepoRow key={row.rank} row={row} tagMode={tagMode} index={i} /> : null))}</ul>
      </div>
    );
  }
  return <ul className={`${styles.grid} ${compact}`} onPointerMove={trackPointer}>{rows.map((row, i) => (row ? <RepoCard key={row.rank} row={row} tagMode={tagMode} index={i} /> : null))}</ul>;
}

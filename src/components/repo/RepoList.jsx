import RepoCard from './RepoCard.jsx';
import RepoRow from './RepoRow.jsx';
import { usePrefs } from '../../store/prefs.store.js';
import styles from './RepoList.module.css';

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
        <ul className={styles.rows}>{rows.map((row) => (row ? <RepoRow key={row.rank} row={row} tagMode={tagMode} /> : null))}</ul>
      </div>
    );
  }
  return <ul className={`${styles.grid} ${compact}`}>{rows.map((row) => (row ? <RepoCard key={row.rank} row={row} tagMode={tagMode} /> : null))}</ul>;
}

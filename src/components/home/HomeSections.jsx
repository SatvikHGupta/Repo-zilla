import { useCatalogMeta } from '../../hooks/catalogMeta.js';
import { useRepos } from '../../hooks/useCatalog.js';
import { buildSearchParams, DEFAULT_FILTERS } from '../../lib/filters.js';
import RepoList from '../repo/RepoList.jsx';
import Chip from '../ui/Chip/Chip.jsx';
import { RepoSkeleton } from '../ui/Loader/Loader.jsx';
import { ErrorState } from '../ui/State/State.jsx';
import styles from './HomeSections.module.css';

export function TrySearching() {
  const meta = useCatalogMeta();
  const langs = meta.languages.filter((l) => l.key !== 'none').slice(0, 5);
  const domains = [...meta.domains].sort((a, b) => meta.count('d:' + b.id) - meta.count('d:' + a.id)).slice(0, 3);
  return (
    <div className={styles.try}>
      <span className={styles.tryLabel}>Try</span>
      {langs.map((l) => <Chip key={l.key} to={`/search?${buildSearchParams({ ...DEFAULT_FILTERS, langs: [l.key] })}`}>{l.label}</Chip>)}
      {domains.map((d) => <Chip key={d.id} tone="accent" to={`/domains/${d.id}`}>{d.name}</Chip>)}
    </div>
  );
}

const TOP_ARGS = { q: '', all: [], not: ['f:ar', 'f:gone'], minStars: 0, offset: 0, limit: 6, prefixLast: false, rows: true };

export function TopRepos() {
  const q = useRepos(TOP_ARGS);
  if (q.isError) return <ErrorState title="Could not load the top repositories" error={q.error} onRetry={() => q.refetch()} />;
  if (!q.data) return <RepoSkeleton layout="cards" count={4} />;
  return <RepoList rows={q.data.rows} />;
}

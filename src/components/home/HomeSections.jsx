import { Link } from 'react-router-dom';
import { useCatalogMeta } from '../../hooks/catalogMeta.js';
import { useRepos } from '../../hooks/useCatalog.js';
import { useModeCounts } from '../../hooks/useModeCounts.js';
import { useTagMode } from '../../hooks/useTagMode.js';
import { buildSearchParams, DEFAULT_FILTERS } from '../../lib/filters.js';
import { fmtDate, fmtNum } from '../../lib/format.js';
import RepoList from '../repo/RepoList.jsx';
import Chip from '../ui/Chip/Chip.jsx';
import CountUp from '../ui/CountUp/CountUp.jsx';
import Icon from '../ui/Icon/Icon.jsx';
import { RepoSkeleton } from '../ui/Loader/Loader.jsx';
import { ErrorState } from '../ui/State/State.jsx';
import styles from './HomeSections.module.css';

export function StatsStrip() {
  const meta = useCatalogMeta();
  const readmes = Number.isFinite(meta.manifest.readmes?.ok) ? meta.manifest.readmes.ok : null;
  const tiles = [
    { label: 'Repositories', value: <CountUp value={meta.total} duration={1500} /> },
    readmes !== null && { label: 'With a README', value: <CountUp value={readmes} duration={1500} /> },
    { label: 'Domains', value: <CountUp value={meta.domains.length} duration={900} /> },
    { label: 'Languages', value: <CountUp value={meta.languages.filter((l) => l.key !== 'none').length} duration={900} /> },
    { label: 'Snapshot', value: fmtDate(meta.snapshot) },
  ].filter(Boolean);
  return (
    <dl className={styles.stats}>
      {tiles.map((t) => <div key={t.label} className={styles.tile}><dd className="big">{t.value}</dd><dt>{t.label}</dt></div>)}
    </dl>
  );
}

// quick links under the search box, taken from the catalog's own counts
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

export function DomainTiles({ limit }) {
  const meta = useCatalogMeta();
  const list = [...meta.domains].sort((a, b) => meta.count('d:' + b.id) - meta.count('d:' + a.id)).slice(0, limit);
  const mc = useModeCounts(list.map((d) => 'd:' + d.id), useTagMode());
  return (
    <ul className={styles.domains}>
      {list.map((d) => (
        <li key={d.id}>
          <Link className={styles.domain} to={`/domains/${d.id}`}>
            <span className={styles.domainName}>{d.name}</span>
            <span className={`${styles.domainCount} ${mc.pending('d:' + d.id) ? styles.pending : ''} num`}>{fmtNum(mc.count('d:' + d.id))}</span>
            <span className={styles.domainSubs}>{d.subdomains.length} subdomains</span>
            <Icon name="arrowRight" size={16} className={styles.go} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

const TOP_ARGS = { q: '', all: [], not: ['f:ar', 'f:gone'], minStars: 0, offset: 0, limit: 6, prefixLast: false, rows: true };
export function TopRepos() {
  const q = useRepos(TOP_ARGS);
  if (q.isError) return <ErrorState title="Could not load the top repositories" error={q.error} onRetry={() => q.refetch()} />;
  if (!q.data) return <RepoSkeleton layout="cards" count={4} />;
  return <RepoList rows={q.data.rows} />;
}

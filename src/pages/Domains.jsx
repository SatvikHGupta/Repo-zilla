import { Link } from 'react-router-dom';
import CatalogGate from '../components/layout/CatalogGate.jsx';
import Chip from '../components/ui/Chip/Chip.jsx';
import Icon from '../components/ui/Icon/Icon.jsx';
import { useCatalogMeta } from '../hooks/catalogMeta.js';
import { useModeCounts } from '../hooks/useModeCounts.js';
import { useTagMode } from '../hooks/useTagMode.js';
import { usePrefs } from '../store/prefs.store.js';
import { TAG_MODES } from '../lib/filters.js';
import Segmented from '../components/ui/Segmented/Segmented.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { buildSearchParams, DEFAULT_FILTERS } from '../lib/filters.js';
import { fmtNum } from '../lib/format.js';
import styles from './Domains.module.css';

function DomainsBody() {
  const meta = useCatalogMeta();
  const mode = useTagMode();
  const setPref = usePrefs((s) => s.setPref);
  const mc = useModeCounts(meta.allDomains.map((d) => 'd:' + d.id), mode);
  const list = [...meta.domains].sort((a, b) => meta.count('d:' + b.id) - meta.count('d:' + a.id));
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>Domains</h1>
        <p>{meta.domains.length} domains, each listing every repository tagged with it. A repository can belong to several domains, so the counts add up to more than the {fmtNum(meta.total)} repositories in the catalog{meta.hasFallback ? '; the rest have no tags and no domain' : ''}.</p>
      </header>
      <div className={styles.mode}>
        <span className={styles.modeLabel}>Count domains by</span>
        <Segmented label="Which kind of tags place a repo in a domain" value={mode} onChange={(v) => setPref('tagMode', v)} options={TAG_MODES.map((m) => ({ value: m.id, label: m.label }))} />
        <p>{mode === 'real' ? 'Only tags from the repos’ own GitHub topics.' : 'Auto tags are on: they place more repos in a domain, so the numbers go up.'}</p>
      </div>
      <ul className={styles.grid}>
        {list.map((d) => {
          const subs = [...d.subdomains].sort((a, b) => meta.count('s:' + b.id) - meta.count('s:' + a.id));
          return (
            <li key={d.id} className={styles.card}>
              <Link className={styles.top} to={`/domains/${d.id}`}>
                <span className={styles.name}>{d.name}</span>
                <span className={`${styles.count} ${mc.pending('d:' + d.id) ? styles.pending : ''} num`}>{fmtNum(mc.count('d:' + d.id))}</span>
                <Icon name="arrowRight" size={16} className={styles.go} />
              </Link>
              <div className={styles.subs}>
                {subs.slice(0, 6).map((s) => <Chip key={s.id} to={`/search?${buildSearchParams({ ...DEFAULT_FILTERS, subs: [s.id] })}`} >{s.name}</Chip>)}
                {subs.length > 6 && <Chip tone="muted" to={`/domains/${d.id}`}>+{subs.length - 6} more</Chip>}
              </div>
            </li>
          );
        })}
      </ul>
      {meta.hasFallback && (
        <Link className={styles.fallback} to={`/domains/${meta.fallback}`}>
          <span><b>Uncategorized</b> · {fmtNum(meta.count('d:' + meta.fallback))} repositories without a domain, mostly because they have no tags</span>
          <Icon name="arrowRight" size={16} />
        </Link>
      )}
    </div>
  );
}

export default function Domains() {
  useDocumentTitle('Domains');
  return <CatalogGate><DomainsBody /></CatalogGate>;
}

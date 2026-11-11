import { lazy, Suspense } from 'react';
import { useCatalogMeta } from '../../hooks/catalogMeta.js';
import { useModeCounts } from '../../hooks/useModeCounts.js';
import { useTagMode } from '../../hooks/useTagMode.js';
import { domainTagline } from '../../lib/domains.js';
import { fmtNum } from '../../lib/format.js';
import { domainHue } from '../charts/palette.js';
import styles from './DomainHero.module.css';

// the chart library is only loaded when a domain page is opened
const SubdomainDonut = lazy(() => import('./SubdomainDonut.jsx'));

// The top of a domain page: its name, one plain sentence of facts, and the subdomain chart. No trail of links above the title, no big-number tiles.
export default function DomainHero({ id }) {
  const meta = useCatalogMeta();
  const name = meta.domainName(id);
  const mode = useTagMode();
  const subList = meta.subsOf(id);
  const mc = useModeCounts(['d:' + id, ...subList.map((s) => 's:' + s.id)], mode);
  const total = mc.count('d:' + id);
  const subs = subList.map((s) => ({ ...s, count: mc.count('s:' + s.id) })).filter((s) => s.count > 0).sort((a, b) => b.count - a.count);
  const share = meta.total ? (total / meta.total) * 100 : 0;
  const tagline = domainTagline(id);
  const index = meta.domains.findIndex((d) => d.id === id); // the catalog's own order, the same colour the home chart gives it
  const hue = index >= 0 ? domainHue(index, meta.domains.length) : 220;

  return (
    <header className={`container ${styles.hero}`}>
      <div className={styles.text}>
        <h1 className={styles.title}>{name}</h1>
        {tagline && <p className={styles.tagline}>{tagline}</p>}
        <p className={styles.facts}>
          <b className="num">{fmtNum(total)}</b> repositories, <b className="num">{share >= 10 ? Math.round(share) : share.toFixed(1)}%</b> of the catalog
          {subs.length > 0 && <>, in <b className="num">{subs.length}</b> {subs.length === 1 ? 'subdomain' : 'subdomains'}</>}.
        </p>
      </div>
      <Suspense fallback={<div className={styles.placeholder} aria-hidden="true" />}>
        <SubdomainDonut domainName={name} hue={hue} subs={subs} total={total} tagMode={mode} />
      </Suspense>
    </header>
  );
}

import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import CatalogGate from '../components/layout/CatalogGate.jsx';
import QuickSearch from '../components/home/QuickSearch.jsx';
import { TopRepos, TrySearching } from '../components/home/HomeSections.jsx';
import Icon from '../components/ui/Icon/Icon.jsx';
import { useCatalogMeta } from '../hooks/catalogMeta.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { buildSearchParams, DEFAULT_FILTERS } from '../lib/filters.js';
import { fmtDate, fmtNum } from '../lib/format.js';
import styles from './Home.module.css';

// the chart library is loaded after the page, so the search box is usable straight away
const CatalogSunburst = lazy(() => import('../components/home/CatalogSunburst.jsx'));

function HomeBody() {
  const meta = useCatalogMeta();
  const readmes = Number.isFinite(meta.manifest.readmes?.ok) ? meta.manifest.readmes.ok : null;
  const languages = meta.languages.filter((l) => l.key !== 'none').length;
  return (
    <>
      <div className={styles.band}>
      <section className={`container ${styles.hero}`}>
        <h1 className={styles.title}>Every public GitHub repo with 50+ stars, in one searchable index.</h1>
        <p className={styles.lead}>{fmtNum(meta.total)} repositories with their READMEs, real tags and auto tags, searched right in your browser. Snapshot of {fmtDate(meta.snapshot)}.</p>
        <div className={styles.search}><QuickSearch /></div>
        <TrySearching />
      </section>
      </div>

      <section className={`container ${styles.section}`} aria-labelledby="browse-heading">
        <header className={styles.head}>
          <h2 id="browse-heading">Browse by domain</h2>
          <Link to="/domains" className={styles.all}>All domains <Icon name="arrowRight" size={15} /></Link>
        </header>
        <Suspense fallback={<div className={styles.chartSkeleton} aria-hidden="true" />}>
          <CatalogSunburst />
        </Suspense>
        <p className={styles.facts}>
          {fmtNum(meta.domains.length)} domains{readmes !== null && <>, {fmtNum(readmes)} repositories with a README</>}, {fmtNum(languages)} languages.
        </p>
      </section>

      <section className={`container ${styles.section}`}>
        <header className={styles.head}>
          <h2>Most starred</h2>
          {/* the list leaves out archived and removed repos, so the link opens the same list (the filter chips say so) */}
          <Link to={`/search?${buildSearchParams({ ...DEFAULT_FILTERS, hideArchived: true, hideGone: true })}`} className={styles.all}>Browse the full list <Icon name="arrowRight" size={15} /></Link>
        </header>
        <TopRepos />
      </section>

      <section className={`container ${styles.section} ${styles.know}`}>
        <h2>Good to know</h2>
        <ul>
          <li>A snapshot, not live: stars and activity are as of {fmtDate(meta.snapshot)}.</li>
          <li>Results start sorted by stars. You can also sort by forks, name, size or creation date.</li>
          <li>Search matches whole words, with prefix matching on the last word. No typo tolerance.</li>
          <li>Auto tags are model guesses for repos without tags of their own, always labelled “auto”.</li>
        </ul>
        <Link to="/about" className={styles.all}>More about the data <Icon name="arrowRight" size={15} /></Link>
      </section>
    </>
  );
}

export default function Home() {
  useDocumentTitle('');
  return <CatalogGate><HomeBody /></CatalogGate>;
}

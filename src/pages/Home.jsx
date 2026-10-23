import { Link } from 'react-router-dom';
import CatalogGate from '../components/layout/CatalogGate.jsx';
import QuickSearch from '../components/home/QuickSearch.jsx';
import { DomainTiles, StatsStrip, TopRepos, TrySearching } from '../components/home/HomeSections.jsx';
import Icon from '../components/ui/Icon/Icon.jsx';
import CountUp from '../components/ui/CountUp/CountUp.jsx';
import Reveal from '../components/ui/Reveal/Reveal.jsx';
import { useCatalogMeta } from '../hooks/catalogMeta.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { fmtDate } from '../lib/format.js';
import styles from './Home.module.css';

// the glow behind the hero follows the pointer (two CSS variables, no re-render)
function spotlight(e) {
  if (e.pointerType !== 'mouse') return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

function HomeBody() {
  const { total, snapshot } = useCatalogMeta();
  return (
    <>
      <div className={styles.heroWrap} onPointerMove={spotlight}>
      <section className={`container ${styles.hero}`}>
        <h1 className={styles.title}>Every public GitHub repo with <span>50+ stars</span>, in one searchable index.</h1>
        <p className={styles.lead}><b className="big"><CountUp value={total} duration={1400} /></b> repositories with their READMEs, real tags and auto tags, searchable in your browser. Snapshot of {fmtDate(snapshot)}.</p>
        <div className={styles.search}><QuickSearch /></div>
        <TrySearching />
      </section>
      </div>

      <Reveal as="section" className={`container ${styles.section}`}><StatsStrip /></Reveal>

      <Reveal as="section" className={`container ${styles.section}`}>
        <header className={styles.head}>
          <h2>Browse by domain</h2>
          <Link to="/domains" className={styles.all}>All domains <Icon name="arrowRight" size={15} /></Link>
        </header>
        <DomainTiles limit={9} />
      </Reveal>

      <Reveal as="section" className={`container ${styles.section}`}>
        <header className={styles.head}>
          <h2>Most starred</h2>
          <Link to="/search" className={styles.all}>Browse everything <Icon name="arrowRight" size={15} /></Link>
        </header>
        <TopRepos />
      </Reveal>

      <Reveal as="section" className={`container ${styles.section} ${styles.know}`}>
        <h2>Good to know</h2>
        <ul>
          <li>A snapshot, not live: stars and activity are as of {fmtDate(snapshot)}.</li>
          <li>Results are sorted by stars. That is the only global sort.</li>
          <li>Search matches whole words, with prefix matching on the last word. No typo tolerance.</li>
          <li>Auto tags are model guesses for repos without tags of their own, always labelled “auto”.</li>
        </ul>
        <Link to="/about" className={styles.all}>More about the data <Icon name="arrowRight" size={15} /></Link>
      </Reveal>
    </>
  );
}

export default function Home() {
  useDocumentTitle('');
  return <CatalogGate><HomeBody /></CatalogGate>;
}

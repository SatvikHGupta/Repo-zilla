import { Link } from 'react-router-dom';
import { useManifest } from '../../hooks/useCatalog.js';
import { fmtDate, fmtNum } from '../../lib/format.js';
import Mark from '../ui/Mark/Mark.jsx';
import styles from './Footer.module.css';

export default function Footer() {
  const m = useManifest().data;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.about}>
          <Link to="/" className={styles.brand} aria-label="RepoZilla home"><Mark size={26} /><span>Repo<b>Zilla</b></span></Link>
          <p>A free, read-only index of public GitHub repositories with 50 or more stars. Search runs in your browser, there are no accounts and nothing to sign up for.</p>
        </div>
        <nav className={styles.col} aria-label="Explore">
          <h2>Explore</h2>
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to="/domains">Domains</Link>
        </nav>
        <nav className={styles.col} aria-label="About RepoZilla">
          <h2>About</h2>
          <Link to="/about">About the data</Link>
          <Link to="/terms">Terms of use</Link>
          <Link to="/privacy">Privacy</Link>
        </nav>
      </div>
      <div className={`container ${styles.base}`}>
        <p>{m ? <><span className="num">{fmtNum(m.repos)}</span> repositories · snapshot of {fmtDate(m.snapshot_date)}</> : 'Catalog snapshot'}</p>
        <p>Independent project, not affiliated with GitHub.</p>
      </div>
    </footer>
  );
}

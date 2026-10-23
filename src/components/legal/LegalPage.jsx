import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import BackButton from '../ui/BackButton/BackButton.jsx';
import styles from './LegalPage.module.css';

// shared frame for About, Terms and Privacy: narrow reading column, title, optional "last updated" line
export default function LegalPage({ title, updated, intro, children }) {
  useDocumentTitle(title);
  return (
    <article className={`container ${styles.page}`}>
      <div className={styles.back}><BackButton /></div>
      <header className={styles.head}>
        <h1>{title}</h1>
        {updated && <p className={styles.updated}>Last updated {updated}</p>}
        {intro && <p className={styles.intro}>{intro}</p>}
      </header>
      <div className={styles.body}>{children}</div>
      <nav className={styles.more} aria-label="Related pages">
        <Link to="/about">About</Link><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link>
      </nav>
    </article>
  );
}

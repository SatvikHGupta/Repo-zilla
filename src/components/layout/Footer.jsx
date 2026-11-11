import { Link } from 'react-router-dom';
import { useManifest } from '../../hooks/useCatalog.js';
import { CONTACT } from '../../lib/contact.js';
import { fmtDate, fmtNum } from '../../lib/format.js';
import Icon from '../ui/Icon/Icon.jsx';
import Mark from '../ui/Mark/Mark.jsx';
import styles from './Footer.module.css';

// the link columns: a heading and the pages under it
const COLUMNS = [
  { title: 'Explore', links: [['/', 'Home'], ['/search', 'Search'], ['/domains', 'Domains']] },
  { title: 'Project', links: [['/about', 'About the data'], ['/contact', 'Contact']] },
  { title: 'Legal', links: [['/terms', 'Terms of use'], ['/privacy', 'Privacy']] },
];

// where to find the person behind the site
const SOCIAL = [
  { icon: 'github', label: 'GitHub', href: CONTACT.github.url },
  { icon: 'linkedin', label: 'LinkedIn', href: CONTACT.linkedin.url },
  { icon: 'mail', label: 'Email (on the Contact page)', to: '/contact' },
];

export default function Footer() {
  const m = useManifest().data;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.main}`}>
        <div className={styles.about}>
          <Link to="/" className={styles.brand} aria-label="RepoZilla home"><Mark size={28} /><span>Repo<b>Zilla</b></span></Link>
          <p>Every public GitHub repository with 50 or more stars, in one index you can search.</p>
          <div className={styles.social}>
            {SOCIAL.map((s) => (s.to
              ? <Link key={s.label} to={s.to} className={styles.icon} aria-label={s.label} title={s.label}><Icon name={s.icon} size={18} /></Link>
              : <a key={s.label} href={s.href} className={styles.icon} aria-label={s.label} title={s.label} target="_blank" rel="noopener noreferrer"><Icon name={s.icon} size={18} /></a>
            ))}
          </div>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} className={styles.col} aria-label={c.title}>
            <h2>{c.title}</h2>
            <ul>{c.links.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}</ul>
          </nav>
        ))}
      </div>
      <div className={styles.bar}>
        <div className={`container ${styles.barIn}`}>
          <p>An independent project by {CONTACT.name}, not affiliated with GitHub.</p>
          <p>{m ? <><span className="num">{fmtNum(m.repos)}</span> repositories, snapshot of {fmtDate(m.snapshot_date)}</> : 'Public GitHub data'}</p>
        </div>
      </div>
    </footer>
  );
}

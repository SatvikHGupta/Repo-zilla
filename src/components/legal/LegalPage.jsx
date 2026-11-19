import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import BackBar from '../ui/BackButton/BackBar.jsx';
import styles from './LegalPage.module.css';

const RELATED = [
  { to: '/about', title: 'About the data', text: 'What is in the catalog and what it cannot tell you.' },
  { to: '/terms', title: 'Terms of use', text: 'The rules for using the site and its content.' },
  { to: '/privacy', title: 'Privacy', text: 'What stays on your device and who can see what.' },
  { to: '/contact', title: 'Contact', text: 'Questions, corrections and ideas: how to reach me.' },
];

// The shared frame for About, Terms and Privacy: a header with the date and key facts, an "in short" box, a contents list that follows the
// reader down the page, numbered sections that can be linked to, and links to the other two pages.
// sections: [{ id, title, content }]   facts: [{ label, value }]   summary: [string]
export default function LegalPage({ title, updated, intro, facts, summary, sections, current }) {
  useDocumentTitle(title);
  const [active, setActive] = useState(sections[0]?.id);
  const { hash } = useLocation();

  // a link such as /terms#removal from another page lands on that section (the router does not scroll to a hash by itself)
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) el.scrollIntoView({ block: 'start' });
  }, [hash]);

  // the contents list marks the section that is at the top of the screen
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target.id, e.isIntersecting);
      const first = sections.find((s) => seen.get(s.id));
      if (first) setActive(first.id);
    }, { rootMargin: '-80px 0px -65% 0px' });
    sections.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [sections]);

  return (
    <>
      <BackBar fallback="/" maxWidth={1040} />
      <article className={`container ${styles.page}`}>
        <header className={styles.head}>
          <h1>{title}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
          {updated && <p className={styles.updated}>Last updated <time>{updated}</time></p>}
          {facts && (
            <dl className={styles.facts}>
              {facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd className="num">{f.value}</dd></div>)}
            </dl>
          )}
        </header>

        <div className={styles.layout}>
          <nav className={styles.toc} aria-label="On this page">
            <h2>On this page</h2>
            <ol>
              {sections.map((s, i) => (
                <li key={s.id}><a href={`#${s.id}`} className={active === s.id ? styles.current : undefined} aria-current={active === s.id ? 'location' : undefined}><span className="num">{i + 1}</span>{s.title}</a></li>
              ))}
            </ol>
          </nav>

          <div className={styles.main}>
            {summary && (
              <aside className={styles.summary} aria-label="In short">
                <h2>In short</h2>
                <ul>{summary.map((t) => <li key={t}>{t}</li>)}</ul>
              </aside>
            )}
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}><span className={`${styles.n} num`}>{i + 1}</span>{s.title}<a className={styles.anchor} href={`#${s.id}`} aria-label={`Link to section ${i + 1}`}>#</a></h2>
                <div className={styles.body}>{s.content}</div>
              </section>
            ))}
          </div>
        </div>

        <nav className={styles.more} aria-label="Related pages">
          {RELATED.filter((r) => r.to !== current).map((r) => (
            <Link key={r.to} to={r.to} className={styles.card}><b>{r.title}</b><span>{r.text}</span></Link>
          ))}
        </nav>
      </article>
    </>
  );
}

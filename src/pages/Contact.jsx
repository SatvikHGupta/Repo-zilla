import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BackBar from '../components/ui/BackButton/BackBar.jsx';
import { Button } from '../components/ui/Button/Button.jsx';
import Icon from '../components/ui/Icon/Icon.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { CONTACT, getEmail, mailto } from '../lib/contact.js';
import styles from './Contact.module.css';

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' };

// what people usually write about; each opens an email with the subject and a few lines to fill in (the address is added when it is clicked)
const TOPICS = [
  { icon: 'alert', title: 'Something in the data is wrong', text: 'A wrong tag, a missing repository, a broken link or a page that behaves badly.',
    mail: () => mailto('RepoZilla: data problem', 'Repository (owner/name):\n\nWhat is wrong:\n\nLink to the page:\n') },
  { icon: 'archive', title: 'Remove or correct a repository', text: 'Fastest is to change it on GitHub itself; the next snapshot follows. Write to me if that is not possible.',
    mail: () => mailto('RepoZilla: removal or correction', 'Repository (owner/name):\n\nWhat should change:\n\nWhy this cannot be done on GitHub:\n'), more: { to: '/terms#removal', label: 'How removal works' } },
  { icon: 'sparkle', title: 'An idea or some feedback', text: 'A filter you miss, a sort order, something that confused you. Short notes are welcome.',
    mail: () => mailto('RepoZilla: feedback') },
  { icon: 'user', title: 'Work together', text: 'Projects, internships or collaboration.',
    mail: () => mailto('Working together') },
];

export default function Contact() {
  useDocumentTitle('Contact');
  const [shown, setShown] = useState(false); // the address is hidden until a visitor asks for it
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  // copies the address; if the browser refuses, the address is selected-looking text on the card anyway
  const copy = async () => {
    try { await navigator.clipboard.writeText(getEmail()); } catch { return; }
    setCopied(true); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <BackBar fallback="/" maxWidth={1040} />
      <div className={`container ${styles.page}`}>
        <header className={styles.head}>
          <h1>Contact</h1>
          <p className={styles.lead}>RepoZilla is built and run by {CONTACT.name}. If something is wrong, missing or could be better, or you just want to say hello, this is how to reach me.</p>
          <p className={styles.note}><Icon name="clock" size={15} /> It is a one-person project, so replies can take a few days.</p>
        </header>

        <section className={styles.cards} aria-label="Ways to reach me">
          <article className={`${styles.card} ${styles.primary}`}>
            <span className={styles.tile}><Icon name="mail" size={22} /></span>
            <h2>Email</h2>
            {shown
              ? <p className={styles.value}><a href={mailto('RepoZilla')}>{getEmail()}</a></p>
              : <p className={`${styles.value} ${styles.masked}`} aria-hidden="true">••••••••••••@•••••.com</p>}
            <p className={styles.about}>{shown ? 'The best way for anything about the site or the data.' : 'Hidden until you ask for it, so bots cannot read it from the page.'}</p>
            <div className={styles.actions}>
              {shown ? (
                <>
                  <Button variant="primary" icon="mail" href={mailto('RepoZilla')}>Write an email</Button>
                  <Button icon={copied ? 'check' : 'copy'} onClick={copy} aria-live="polite">{copied ? 'Copied' : 'Copy address'}</Button>
                </>
              ) : <Button variant="primary" icon="mail" onClick={() => setShown(true)}>Show email address</Button>}
            </div>
          </article>
          <article className={styles.card}>
            <span className={styles.tile}><Icon name="linkedin" size={22} /></span>
            <h2>LinkedIn</h2>
            <p className={styles.value}><a href={CONTACT.linkedin.url} {...EXTERNAL}>in/{CONTACT.linkedin.handle}</a></p>
            <p className={styles.about}>For work, projects and getting in touch.</p>
            <div className={styles.actions}><Button iconRight="arrowUpRight" href={CONTACT.linkedin.url} {...EXTERNAL}>Open profile</Button></div>
          </article>
          <article className={styles.card}>
            <span className={styles.tile}><Icon name="github" size={22} /></span>
            <h2>GitHub</h2>
            <p className={styles.value}><a href={CONTACT.github.url} {...EXTERNAL}>@{CONTACT.github.handle}</a></p>
            <p className={styles.about}>My other projects and code.</p>
            <div className={styles.actions}><Button iconRight="arrowUpRight" href={CONTACT.github.url} {...EXTERNAL}>Open profile</Button></div>
          </article>
        </section>

        <section className={styles.topics} aria-labelledby="topics-h">
          <h2 id="topics-h">What to write about</h2>
          <p className={styles.sub}>Each one opens an email with the subject filled in.</p>
          <div className={styles.topicGrid}>
            {TOPICS.map((t) => (
              <article key={t.title} className={styles.topic}>
                <span className={styles.tileSm}><Icon name={t.icon} size={18} /></span>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
                <div className={styles.links}>
                  <button type="button" className={styles.go} onClick={() => { window.location.href = t.mail(); }}>Write about this <Icon name="arrowRight" size={14} /></button>
                  {t.more && <Link to={t.more.to}>{t.more.label}</Link>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className={styles.tips} aria-label="For a quick answer">
          <h2>For a quick answer</h2>
          <ul>
            <li>Name the repository (<code>owner/name</code>) or paste the link of the page you are on.</li>
            <li>Say what you expected and what you saw instead.</li>
            <li>For a bug, add your browser and what you clicked before it happened.</li>
          </ul>
        </aside>
      </div>
    </>
  );
}

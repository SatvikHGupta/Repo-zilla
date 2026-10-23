import { NavLink, Link } from 'react-router-dom';
import Mark from '../ui/Mark/Mark.jsx';
import Popover from '../ui/Popover/Popover.jsx';
import { IconButton } from '../ui/Button/Button.jsx';
import { themeStore, useTheme } from '../../theme/store.js';
import { withThemeTransition } from '../../theme/animate.js';
import AppearancePanel from './AppearancePanel.jsx';
import styles from './Navbar.module.css';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/search', label: 'Search' },
  { to: '/domains', label: 'Domains' },
];

export default function Navbar() {
  const { mode } = useTheme();
  return (
    <header className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand} aria-label="RepoZilla home">
          <Mark size={28} />
          <span className={styles.word}>Repo<b>Zilla</b></span>
        </Link>
        <nav className={styles.links} aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `${styles.link} ${isActive ? styles.on : ''}`}>{l.label}</NavLink>
          ))}
        </nav>
        <div className={styles.tools}>
          <IconButton icon={mode === 'dark' ? 'sun' : 'moon'} label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => withThemeTransition(() => themeStore.setMode(mode === 'dark' ? 'light' : 'dark'))} />
          <Popover label="Appearance" width={300} renderTrigger={(p) => <IconButton icon="palette" label="Appearance" {...p} />}>
            <AppearancePanel />
          </Popover>
        </div>
      </div>
    </header>
  );
}

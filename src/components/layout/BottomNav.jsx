import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon/Icon.jsx';
import BottomSheet from '../ui/BottomSheet/BottomSheet.jsx';
import AppearancePanel from './AppearancePanel.jsx';
import styles from './BottomNav.module.css';

const ITEMS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/search', label: 'Search', icon: 'search' },
  { to: '/domains', label: 'Domains', icon: 'layers' },
];

// phone-only tab bar (hidden by CSS on wider screens); the last tab opens Appearance in a sheet
export default function BottomNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className={styles.nav} aria-label="Primary">
        {ITEMS.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `${styles.item} ${isActive ? styles.on : ''}`}>
            <Icon name={i.icon} size={21} /><span>{i.label}</span>
          </NavLink>
        ))}
        <button type="button" className={styles.item} onClick={() => setOpen(true)} aria-haspopup="dialog"><Icon name="palette" size={21} /><span>Theme</span></button>
      </nav>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Appearance"><AppearancePanel /></BottomSheet>
    </>
  );
}

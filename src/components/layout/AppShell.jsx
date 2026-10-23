import { useEffect } from 'react';
import { useTheme } from '../../theme/store.js';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import BottomNav from './BottomNav.jsx';
import ToastHost from '../ui/Toast/Toast.jsx';
import BackToTop from '../ui/BackToTop/BackToTop.jsx';
import styles from './AppShell.module.css';

// the address-bar colour on phones follows the theme background
function useThemeColorMeta() {
  const theme = useTheme();
  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
    meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  }, [theme]);
}

// <html data-scrolled> lets the navbar gain a shadow once the page has moved
function useScrolledFlag() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { root.dataset.scrolled = window.scrollY > 6 ? '1' : '0'; }); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
}

export default function AppShell({ children }) {
  useThemeColorMeta();
  useScrolledFlag();
  return (
    <>
      <a className={styles.skip} href="#main">Skip to content</a>
      <Navbar />
      <main id="main" className={styles.main} tabIndex={-1}>{children}</main>
      <Footer />
      <BottomNav />
      <BackToTop />
      <ToastHost />
    </>
  );
}

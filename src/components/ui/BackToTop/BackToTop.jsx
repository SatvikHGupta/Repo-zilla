import { useEffect, useState } from 'react';
import Icon from '../Icon/Icon.jsx';
import styles from './BackToTop.module.css';

const SHOW_AFTER = 400; // px scrolled before the button appears

// appears after a short scroll; smooth-scrolls to the top (the global scroll-behavior does the easing)
export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setShow(window.scrollY > SHOW_AFTER)); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <button type="button" className={`${styles.btn} ${show ? styles.on : ''}`} aria-label="Back to top" inert={!show} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <Icon name="arrowUp" size={18} /><span className={styles.text}>Top</span>
    </button>
  );
}

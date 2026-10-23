import { useEffect, useState } from 'react';
import Icon from '../Icon/Icon.jsx';
import styles from './BackToTop.module.css';

// appears after a long scroll; smooth-scrolls to the top (the global scroll-behavior does the easing)
export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setShow(window.scrollY > 900)); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <button type="button" className={`${styles.btn} ${show ? styles.on : ''}`} aria-label="Back to top" inert={!show} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <Icon name="chevronUp" size={20} />
    </button>
  );
}

import { useEffect, useRef, useState } from 'react';
import styles from './Reveal.module.css';

// fades and lifts its children in once, the first time they scroll into view
export default function Reveal({ children, as: Tag = 'div', delay = 0, className = '', ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (seen) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);
  return <Tag ref={ref} className={`${styles.reveal} ${seen ? styles.in : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>{children}</Tag>;
}

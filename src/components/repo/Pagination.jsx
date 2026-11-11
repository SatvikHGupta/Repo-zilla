import { useState } from 'react';
import { fmtNum } from '../../lib/format.js';
import { pageWindow } from '../../lib/pagination.js';
import Icon from '../ui/Icon/Icon.jsx';
import styles from './Pagination.module.css';

export default function Pagination({ page, totalPages, onPage }) {
  const [draft, setDraft] = useState('');
  if (totalPages <= 1) return null;
  const go = (e) => {
    e.preventDefault();
    const n = Number(draft);
    if (Number.isInteger(n) && n >= 1 && n <= totalPages) { onPage(n); setDraft(''); }
  };
  return (
    <nav className={styles.nav} aria-label="Pagination">
      <button type="button" className={styles.step} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><Icon name="chevronLeft" size={16} /><span>Prev</span></button>
      <ol className={styles.pages}>
        {pageWindow(page, totalPages).map((p) => (typeof p === 'number'
          ? <li key={p}><button type="button" className={`${styles.page} num`} aria-current={p === page ? 'page' : undefined} onClick={() => onPage(p)} aria-label={`Page ${p}`}>{fmtNum(p)}</button></li>
          : <li key={p} className={styles.gap} aria-hidden="true">…</li>))}
      </ol>
      <p className={`${styles.compactInfo} num`}>Page {fmtNum(page)} of {fmtNum(totalPages)}</p>
      <button type="button" className={styles.step} disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page"><span>Next</span><Icon name="chevronRight" size={16} /></button>
      <form className={styles.go} onSubmit={go}>
        <label htmlFor="goto-page" className="sr-only">Go to page</label>
        <input id="goto-page" className={`${styles.input} num`} inputMode="numeric" pattern="[0-9]*" placeholder={`of ${fmtNum(totalPages)}`} value={draft} onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 6))} />
        <button type="submit" className={styles.goBtn} disabled={!draft}>Go</button>
      </form>
    </nav>
  );
}

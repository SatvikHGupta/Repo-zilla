import { useEffect, useState } from 'react';
import { useTopStars } from '../../hooks/useCatalog.js';
import { fmtCompact, fmtNum } from '../../lib/format.js';
import { niceStars, parseStarInput, posToStar, SLIDER_KEY_STEP, SLIDER_STEPS, sliderMax, sliderMin, STAR_FLOOR, starToPos } from '../../lib/starScale.js';
import Icon from '../ui/Icon/Icon.jsx';
import styles from './StarsFilter.module.css';

const PRESETS = [100, 1000, 10000, 50000];
const label = (n) => (n >= 1000 ? `${n / 1000}k` : String(n));

// stars filter: exact min / max inputs (any number, "5k" works) plus a log-scale range slider. 0 means "no bound".
export default function StarsFilter({ filters, update }) {
  const top = useTopStars().data || 0;
  const [drag, setDrag] = useState(null);      // slider positions while a handle is moving
  const [text, setText] = useState(null);      // { min, max } strings while an input is being edited
  const [invalid, setInvalid] = useState(false);
  const [held, setHeld] = useState(false);     // a pointer is on a handle
  const [viaPointer, setViaPointer] = useState(false); // the current drag was started with a pointer, so it commits as soon as the pointer is released

  const lo = drag ? drag.lo : filters.stars ? starToPos(filters.stars, top) : 0;
  const hi = drag ? drag.hi : filters.starsMax ? starToPos(filters.starsMax, top) : SLIDER_STEPS;
  const shown = text ?? { min: filters.stars ? fmtNum(filters.stars) : '', max: filters.starsMax ? fmtNum(filters.starsMax) : '' };

  const commitSlider = (nextLo, nextHi) => {
    setDrag(null);
    setViaPointer(false);
    update({ stars: sliderMin(nextLo, top), starsMax: sliderMax(nextHi, top) });
  };
  const commitText = () => {
    if (!text) return;
    const min = parseStarInput(text.min), max = parseStarInput(text.max);
    setText(null);
    if (min === null || max === null) { setInvalid(true); return; }
    setInvalid(false);
    if (min !== filters.stars || max !== filters.starsMax) update({ stars: min, starsMax: max });
  };
  const edit = (key) => (e) => setText({ ...shown, [key]: e.target.value });
  const keyed = (e) => { if (e.key === 'Enter') { e.preventDefault(); commitText(); } };
  const active = filters.stars > 0 || filters.starsMax > 0;

  const handle = (which) => (e) => {
    const v = Number(e.target.value);
    setViaPointer(held); // a change made while the pointer is down commits on release, a keyboard change after a pause
    setDrag(which === 'lo' ? { lo: Math.min(v, hi - 2 * SLIDER_KEY_STEP), hi } : { lo, hi: Math.max(v, lo + 2 * SLIDER_KEY_STEP) });
  };
  const done = () => { if (drag) commitSlider(drag.lo, drag.hi); };
  // the pointer is released wherever it ends up: on the handle, outside it, or cancelled by the browser (a touch that turns into a page scroll)
  useEffect(() => {
    if (!held) return undefined;
    const off = () => setHeld(false);
    window.addEventListener('pointerup', off);
    window.addEventListener('pointercancel', off);
    return () => { window.removeEventListener('pointerup', off); window.removeEventListener('pointercancel', off); };
  }, [held]);
  const grab = () => setHeld(true);
  // a mouse drag commits when released; with the keyboard the value commits after a short pause (holding an arrow key must not run a search per step)
  useEffect(() => {
    if (!drag || held) return undefined;
    const t = setTimeout(() => commitSlider(drag.lo, drag.hi), viaPointer ? 0 : 350);
    return () => clearTimeout(t);
  });
  const sliderProps = (which, value) => ({
    className: `${styles.range} ${which === 'lo' && lo > SLIDER_STEPS / 2 ? styles.raise : ''}`,
    type: 'range', min: 0, max: SLIDER_STEPS, step: SLIDER_KEY_STEP, value, onChange: handle(which), onPointerDown: grab, onBlur: done,
    disabled: !top,
    'aria-label': which === 'lo' ? 'Minimum stars' : 'Maximum stars',
    'aria-valuetext': `${fmtNum(which === 'lo' ? (lo <= 0 ? STAR_FLOOR : niceStars(posToStar(lo, top))) : hi >= SLIDER_STEPS ? top : niceStars(posToStar(hi, top)))} stars`,
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.inputs}>
        <label className={styles.field}><span>Minimum</span><span className={styles.box}><Icon name="star" size={14} filled /><input className="num" inputMode="numeric" autoComplete="off" placeholder={String(STAR_FLOOR)} value={shown.min} aria-invalid={invalid} onChange={edit('min')} onFocus={() => setText(shown)} onBlur={commitText} onKeyDown={keyed} /></span></label>
        <span className={styles.dash} aria-hidden="true" />
        <label className={styles.field}><span>Maximum</span><span className={styles.box}><Icon name="star" size={14} filled /><input className="num" inputMode="numeric" autoComplete="off" placeholder={top ? fmtNum(top) : 'no limit'} value={shown.max} aria-invalid={invalid} onChange={edit('max')} onFocus={() => setText(shown)} onBlur={commitText} onKeyDown={keyed} /></span></label>
      </div>
      {invalid && <p className={styles.error} role="alert">Enter a whole number, like 1500 or 5k.</p>}

      <div className={styles.slider}>
        <span className={styles.track} aria-hidden="true" />
        <span className={styles.fill} aria-hidden="true" style={{ left: `${lo / 10}%`, right: `${(SLIDER_STEPS - hi) / 10}%` }} />
        <input {...sliderProps('lo', lo)} />
        <input {...sliderProps('hi', hi)} />
      </div>
      <div className={styles.ends} aria-hidden="true"><span className="num">{STAR_FLOOR}</span><span className="num">{top ? fmtCompact(top) : ''}</span></div>

      <div className={styles.presets}>
        {PRESETS.map((n) => <button key={n} type="button" className={styles.preset} aria-pressed={filters.stars === n && !filters.starsMax} onClick={() => update({ stars: n, starsMax: 0 })}>{label(n)}+</button>)}
        {active && <button type="button" className={styles.clear} onClick={() => { setInvalid(false); update({ stars: 0, starsMax: 0 }); }}>Clear</button>}
      </div>
    </div>
  );
}

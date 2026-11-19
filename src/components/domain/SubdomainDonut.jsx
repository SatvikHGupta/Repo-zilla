import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { buildSearchParams, parseFilters } from '../../lib/filters.js';
import { fmtNum } from '../../lib/format.js';
import { Chart, prefersReducedMotion } from '../charts/chartjs.js';
import { css, subColor } from '../charts/palette.js';
import { useChartTheme } from '../charts/useChartTheme.js';
import Icon from '../ui/Icon/Icon.jsx';
import styles from './SubdomainDonut.module.css';

const pct = (n) => (n >= 10 ? String(Math.round(n)) : n.toFixed(1)) + '%';

// The subdomains of one domain as a doughnut plus a ranked list. The doughnut gives the shape at a glance; the list names every segment (a ring cannot label
// fifteen slices), gives the exact numbers and is the way in for the keyboard. Hovering one highlights the other. Selecting a subdomain filters the results below.
// subs: [{ id, name, count }], biggest first. total: the repositories of the whole domain.
export default function SubdomainDonut({ domainName, hue, subs, total, tagMode }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { mode, surface } = useChartTheme();
  const canvas = useRef(null), chartRef = useRef(null), latest = useRef({});
  const [hover, setHover] = useState(null);
  const selected = params.getAll('sub');
  const selectedKey = selected.join('|');
  const sig = subs.map((s) => `${s.id}:${s.count}`).join('|'); // what the chart is built from: a new object each render must not rebuild it

  const colors = useMemo(() => subs.map((_, i) => subColor(hue, i, subs.length, mode)), [subs.length, hue, mode]); // eslint-disable-line react-hooks/exhaustive-deps -- subs.length is what the colours depend on
  // the link for a subdomain: the filters already on the page, with this subdomain added or taken off
  const linkFor = (id) => {
    const f = parseFilters(params, { defaultTagMode: tagMode });
    const next = f.subs.includes(id) ? f.subs.filter((x) => x !== id) : [...f.subs, id];
    return `?${buildSearchParams({ ...f, subs: next, page: 1 }, { defaultTagMode: tagMode, omit: ['domains'] })}`;
  };
  // the chart's callbacks run long after the render that made them: they read the newest values from here
  useEffect(() => { latest.current = { navigate, linkFor, subs }; });

  // build the chart when the data or the mode changes
  useEffect(() => {
    if (!canvas.current || !subs.length) return undefined;
    const chart = new Chart(canvas.current, {
      type: 'doughnut',
      data: { labels: subs.map((s) => s.name), datasets: [{ data: subs.map((s) => s.count), borderWidth: 2, hoverOffset: 8, spacing: 0, backgroundColor: [] }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '66%', layout: { padding: 10 },
        animation: prefersReducedMotion() ? false : { duration: 450 },
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        interaction: { mode: 'nearest', intersect: true },
        onHover: (e, els) => { setHover(els.length ? els[0].index : null); if (e.native?.target) e.native.target.style.cursor = els.length ? 'pointer' : 'default'; },
        onClick: (e, els) => { if (els.length) latest.current.navigate(latest.current.linkFor(latest.current.subs[els[0].index].id)); },
      },
    });
    chartRef.current = chart;
    return () => { chart.destroy(); chartRef.current = null; };
  }, [sig, mode]); // eslint-disable-line react-hooks/exhaustive-deps -- the data comes from `sig`

  // the colours follow the hover and the selection: everything else steps back
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const any = hover !== null || selected.length > 0;
    const ds = chart.data.datasets[0];
    ds.backgroundColor = subs.map((s, i) => css(colors[i], !any || hover === i || selected.includes(s.id) ? 1 : 0.28));
    ds.borderColor = surface;
    ds.offset = subs.map((s) => (selected.includes(s.id) ? 10 : 0));
    chart.update('none');
  }, [hover, selectedKey, sig, mode, surface, colors]); // eslint-disable-line react-hooks/exhaustive-deps -- subs and selected are covered by sig and selectedKey

  if (!subs.length) return <p className={styles.empty}>{domainName} is not split into subdomains. Every repository in it is listed below.</p>;
  const h = hover !== null ? subs[hover] : null;
  const share = (n) => (total ? (n / total) * 100 : 0);
  const max = Math.max(1, ...subs.map((s) => s.count));
  const clearTo = `?${buildSearchParams({ ...parseFilters(params, { defaultTagMode: tagMode }), subs: [], page: 1 }, { defaultTagMode: tagMode, omit: ['domains'] })}`;

  return (
    <section className={styles.wrap} aria-label={`Subdomains of ${domainName}`}>
      <div className={styles.chart}>
        <canvas ref={canvas} role="img" aria-label={`Doughnut chart of the ${subs.length} subdomains of ${domainName}. The largest is ${subs[0].name} with ${fmtNum(subs[0].count)} repositories. The list next to it has every number.`} />
        <div className={styles.center} aria-hidden="true">
          {h ? (
            <>
              <span className={styles.centerName}>{h.name}</span>
              <b className="num">{fmtNum(h.count)}</b>
              <span className={styles.centerSub}>{pct(share(h.count))} of {domainName}</span>
            </>
          ) : (
            <>
              <b className="num">{fmtNum(total)}</b>
              <span className={styles.centerSub}>repositories</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.side}>
        <div className={styles.head}>
          <h2 className={styles.title}>{subs.length} {subs.length === 1 ? 'subdomain' : 'subdomains'}</h2>
          {selected.length > 0 && <Link className={styles.clear} to={clearTo}>Show all</Link>}
        </div>
        <p className={styles.hint}>{selected.length ? `${selected.length} chosen below. Select one again to take it off.` : 'Select a subdomain to list only its repositories.'}</p>
        <ul className={styles.list} role="list" onMouseLeave={() => setHover(null)}>
          {subs.map((s, i) => {
            const on = selected.includes(s.id);
            return (
              <li key={s.id}>
                <Link to={linkFor(s.id)} className={styles.row} style={{ '--share': s.count / max, '--c': css(colors[i]) }} aria-current={on ? 'true' : undefined}
                  onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
                  <i className={styles.dot} aria-hidden="true" />
                  <span className={styles.name}>{s.name}{on && <Icon name="check" size={14} strokeWidth={3} />}</span>
                  <span className={`${styles.count} num`}>{fmtNum(s.count)}</span>
                  <span className={`${styles.share} num`}>{pct(share(s.count))}</span>
                  <span className={styles.bar} aria-hidden="true"><i /></span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className={styles.note}>A repository can be in more than one subdomain, so the percentages add up to more than 100.</p>
      </div>
    </section>
  );
}

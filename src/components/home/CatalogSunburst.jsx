import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalogMeta } from '../../hooks/catalogMeta.js';
import { useModeCounts } from '../../hooks/useModeCounts.js';
import { useTagMode } from '../../hooks/useTagMode.js';
import { buildSearchParams, DEFAULT_FILTERS } from '../../lib/filters.js';
import { fmtNum } from '../../lib/format.js';
import { buildRings, childColor } from '../../lib/sunburst.js';
import { Chart, prefersReducedMotion } from '../charts/chartjs.js';
import { css, domainColor, subColor } from '../charts/palette.js';
import { useChartTheme } from '../charts/useChartTheme.js';
import Icon from '../ui/Icon/Icon.jsx';
import styles from './CatalogSunburst.module.css';

// every name is the same near-black; the slice colours are light enough for it (see charts/palette.js)
const INK = '#17160f';

// The name on one line if it fits inside the slice, otherwise split over two balanced lines, otherwise null (the slice is too small to carry its name).
// A slice is a strip that runs along the radius: `thick` long and `arcLen` wide. A horizontal text box of w x h fits in it when its extent along and
// across that strip are both inside, which depends on the angle of the strip.
function fitLines(ctx, name, { cos, sin, thick, arcLen, line: LINE }) {
  const PAD = 8;
  const fits = (lines) => {
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)), h = lines.length * LINE;
    return w * cos + h * sin <= thick - PAD && w * sin + h * cos <= arcLen - PAD;
  };
  if (fits([name])) return [name];
  const words = name.split(' ');
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')];
    const w = Math.max(ctx.measureText(lines[0]).width, ctx.measureText(lines[1]).width);
    if (fits(lines) && (!best || w < best.w)) best = { w, lines };
  }
  return best ? best.lines : null;
}

// Borders. The whole chart gets a rim and a ring round the hole, and every domain is outlined as one wedge (its own arc and all its subdomains) in a
// darker shade of its colour, so it reads as one group. The wedge under the pointer gets a heavier line and the others fade.
const outlinePlugin = {
  id: 'rzOutline',
  afterDatasetsDraw(chart) {
    const cfg = chart.$rz;
    if (!cfg || chart.data.datasets.length !== 2) return;
    try {
      const { ctx } = chart;
      const P = ['x', 'y', 'innerRadius', 'outerRadius', 'startAngle', 'endAngle'];
      const inner = chart.getDatasetMeta(1).data, out = chart.getDatasetMeta(0).data[0];
      if (!inner.length || !out) return;
      const { x, y, innerRadius } = inner[0].getProps(P, true), { outerRadius } = out.getProps(P, true);
      if (![x, y, innerRadius, outerRadius].every(Number.isFinite)) return;
      ctx.save(); ctx.lineJoin = 'round';
      inner.forEach((el, i) => {
        const arc = cfg.rings[1][i], g = el.getProps(P, true);
        if (!arc || !Number.isFinite(g.startAngle) || !Number.isFinite(g.endAngle)) return;
        const on = !!cfg.hover && cfg.hover.domainId === arc.domainId;
        ctx.globalAlpha = !cfg.hover || on ? 1 : 0.25;
        ctx.lineWidth = on ? 3.5 : 2;
        ctx.strokeStyle = css(cfg.line(arc.color));
        ctx.beginPath();
        ctx.arc(x, y, outerRadius, g.startAngle, g.endAngle);
        ctx.arc(x, y, innerRadius, g.endAngle, g.startAngle, true);
        ctx.closePath(); ctx.stroke();
      });
      ctx.globalAlpha = 1; ctx.lineWidth = 2; ctx.strokeStyle = cfg.rim;
      ctx.beginPath(); ctx.arc(x, y, outerRadius + 1, 0, Math.PI * 2); ctx.stroke(); // the rim
      ctx.beginPath(); ctx.arc(x, y, innerRadius - 1, 0, Math.PI * 2); ctx.stroke(); // round the hole
      ctx.restore();
    } catch { /* an outline that cannot be drawn is not worth breaking the chart for */ }
  },
};

// Writes the name of every slice that is big enough to hold it: domains on the inner ring (bold), subdomains on the outer ring (lighter, smaller).
// The rest are in the list beside the chart.
const labelPlugin = {
  id: 'rzLabels',
  afterDatasetsDraw(chart) {
    const cfg = chart.$rz;
    if (!cfg) return;
    try {
      const { ctx } = chart;
      const last = chart.data.datasets.length - 1;
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let k = 0; k <= last; k++) {
        const domainsRing = k === last, sizes = domainsRing ? [12, 10.5] : [11, 10];
        chart.getDatasetMeta(k).data.forEach((el, i) => {
          const arc = cfg.rings[k][i];
          if (!arc || arc.more) return;
          const { x, y, startAngle, endAngle, innerRadius, outerRadius } = el.getProps(['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius'], true);
          const mid = (startAngle + endAngle) / 2, r = (innerRadius + outerRadius) / 2, arcLen = (endAngle - startAngle) * r, thick = outerRadius - innerRadius;
          if (![x, y, mid, r, arcLen, thick].every(Number.isFinite) || arcLen < 22 || thick < 22) return;
          const cos = Math.abs(Math.cos(mid)), sin = Math.abs(Math.sin(mid));
          for (const size of sizes) { // the big size first, then the small one, then no name
            ctx.font = `${domainsRing ? 600 : 500} ${size}px "IBM Plex Sans Variable", system-ui, sans-serif`;
            const lines = fitLines(ctx, arc.name, { cos, sin, thick, arcLen, line: size + 2 });
            if (!lines) continue;
            ctx.globalAlpha = cfg.lit(arc, k) ? 1 : 0.3;
            ctx.fillStyle = INK;
            lines.forEach((line, n) => ctx.fillText(line, x + Math.cos(mid) * r, y + Math.sin(mid) * r + (n - (lines.length - 1) / 2) * (size + 2)));
            break;
          }
        });
      }
      ctx.restore();
    } catch { /* a label that cannot be drawn is not worth breaking the chart for */ }
  },
};

// Chart.js calls onHover again after every update (to replay the pointer), so a hover that is the same as the current one must not set the state
// again, or each update would cause the next one without end ("Maximum update depth exceeded").
const sameHover = (a, b) => (a?.domainId === b?.domainId && a?.subId === b?.subId ? a : b);

const pct = (n) => (n >= 10 ? String(Math.round(n)) : n.toFixed(1)) + '%';

// Every repository at a glance. Two rings: the domains inside, their subdomains outside, each inside the arc of its domain. Choose a domain (on the ring or
// in the list) to open it up into its subdomains, and choose a subdomain to go to that part of its domain page. The list beside the chart has every number.
export default function CatalogSunburst() {
  const meta = useCatalogMeta();
  const navigate = useNavigate();
  const tagMode = useTagMode();
  const { mode, surface } = useChartTheme();
  const canvas = useRef(null), chartRef = useRef(null), latest = useRef({});
  const [zoom, setZoom] = useState(null);   // the id of the opened domain, or null for the overview
  const [hover, setHover] = useState(null); // { domainId, subId? }

  const all = meta.domains; // the real domains, in the catalog's own order (the fallback bucket is not drawn)
  const zoomed = zoom ? all.find((d) => d.id === zoom) : null;
  const mc = useModeCounts([...all.map((d) => 'd:' + d.id), ...(zoomed ? meta.subsOf(zoom).map((s) => 's:' + s.id) : [])], tagMode);

  // the domains with their counts, biggest first; each keeps the colour of its place in the catalog's own order
  const domains = useMemo(() => all
    .map((d, index) => ({ id: d.id, name: d.name, index, count: mc.count('d:' + d.id), subs: meta.subsOf(d.id).map((s) => ({ id: s.id, name: s.name, count: meta.count('s:' + s.id) })) }))
    .sort((a, b) => b.count - a.count), [all, meta, mc]);
  const zoomSubs = useMemo(() => (zoomed ? meta.subsOf(zoom).map((s) => ({ id: s.id, name: s.name, count: mc.count('s:' + s.id) })).filter((s) => s.count > 0).sort((a, b) => b.count - a.count) : []), [zoomed, zoom, meta, mc]);
  const zoomedDomain = zoomed ? domains.find((d) => d.id === zoom) : null;
  const colorOf = (d) => domainColor(d.index, all.length, mode);

  // what each arc is: the overview has an outer ring (dataset 0, drawn on the outside) and an inner one; opened up there is one ring
  const model = useMemo(() => {
    if (zoomed) {
      const base = colorOf(zoomedDomain);
      return { rings: [zoomSubs.map((s, i) => ({ id: s.id, name: s.name, domainId: zoom, value: s.count, count: s.count, color: subColor(base.h, i, zoomSubs.length, mode), sub: true }))] };
    }
    const { inner, outer } = buildRings(domains, { minShare: 0.004 }); // slivers under 0.4% of the ring are drawn together
    const seen = new Map();
    const outerArcs = outer.map((o) => {
      const d = domains.find((x) => x.id === o.domainId), j = seen.get(o.domainId) || 0;
      seen.set(o.domainId, j + 1);
      const base = colorOf(d), muted = { ...base, s: 16, l: mode === 'light' ? base.l + 16 : base.l - 14 }; // "smaller subdomains": a quiet tint of the domain
      return { ...o, color: o.whole ? base : o.more ? muted : childColor(base, j), sub: !o.whole };
    });
    return { rings: [outerArcs, inner.map((d) => ({ id: d.id, name: d.name, domainId: d.id, value: d.count, count: d.count, color: colorOf(d), sub: false }))] };
  }, [zoomed, zoomSubs, domains, mode, zoom]); // eslint-disable-line react-hooks/exhaustive-deps -- colorOf only reads mode and the domain count
  const sig = model.rings.map((r) => r.map((a) => `${a.id}:${Math.round(a.value)}`).join(',')).join('/');

  useEffect(() => { latest.current = { navigate, tagMode, model, zoom }; });

  // a new chart when the view changes between the overview and an opened domain (they have a different number of rings), or the theme changes
  useEffect(() => {
    if (!canvas.current) return undefined;
    const chart = new Chart(canvas.current, {
      type: 'doughnut',
      plugins: [outlinePlugin, labelPlugin],
      data: { labels: [], datasets: [] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: zoom ? '62%' : '36%', layout: { padding: 8 },
        animation: prefersReducedMotion() ? false : { duration: 500 },
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        interaction: { mode: 'nearest', intersect: true },
        onHover: (e, els) => {
          const arc = els.length ? latest.current.model.rings[els[0].datasetIndex]?.[els[0].index] : null;
          const next = arc ? { domainId: arc.domainId, subId: arc.sub ? arc.id : undefined } : null;
          setHover((cur) => sameHover(cur, next));
          if (e.native?.target) e.native.target.style.cursor = arc ? 'pointer' : 'default';
        },
        onClick: (e, els) => {
          const { model: m, zoom: z, tagMode: tm } = latest.current;
          const arc = els.length ? m.rings[els[0].datasetIndex]?.[els[0].index] : null;
          if (!arc) return;
          if (!z) { setZoom(arc.domainId); setHover(null); return; }
          navigate(`/domains/${z}?${buildSearchParams({ ...DEFAULT_FILTERS, subs: [arc.id], tagMode: tm }, { defaultTagMode: tm, omit: ['domains'] })}`);
        },
      },
    });
    chartRef.current = chart;
    return () => { chart.destroy(); chartRef.current = null; };
  }, [zoom, mode]); // eslint-disable-line react-hooks/exhaustive-deps -- callbacks read the newest values from `latest`

  // the data and the highlight: updated in place, so numbers that arrive later move the arcs instead of rebuilding the chart
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const active = hover?.domainId;
    chart.data.labels = model.rings[0].map((a) => a.name);
    chart.data.datasets = model.rings.map((ring, r) => ({
      data: ring.map((a) => a.value), borderColor: surface, borderWidth: 2, borderRadius: model.rings.length === 2 ? 0 : 3, hoverOffset: 0, weight: model.rings.length === 2 ? (r === 0 ? 0.85 : 1.15) : 1,
      backgroundColor: ring.map((a) => {
        const lit = !hover || (hover.subId ? (a.sub ? a.id === hover.subId : a.domainId === hover.domainId) : a.domainId === active);
        const sibling = hover?.subId && a.domainId === hover.domainId && a.id !== hover.subId;
        return css(a.color, lit ? 1 : sibling ? 0.6 : 0.2);
      }),
    }));
    // the ring that carries names: the inner ring of the overview, or the only ring of an opened domain
    chart.$rz = {
      rings: model.rings, hover,
      lit: (a) => !hover || (hover.subId ? (zoom ? a.id === hover.subId : a.domainId === hover.domainId) : a.domainId === hover.domainId),
      line: (c) => ({ ...c, l: mode === 'light' ? Math.max(18, c.l - 28) : Math.min(90, c.l + 22) }), // the outline of a domain: its colour, darker (light mode) or lighter (dark mode)
      rim: mode === 'light' ? 'rgba(28, 27, 24, 0.55)' : 'rgba(240, 238, 230, 0.5)',
    };
    chart.update('none');
  }, [sig, hover, surface, model, zoom, mode]);

  // the text in the middle
  const focusArc = hover ? model.rings.flat().find((a) => (hover.subId ? a.id === hover.subId : a.domainId === hover.domainId && !a.sub)) : null;
  const hoverDomain = hover ? domains.find((d) => d.id === hover.domainId) : null;
  let center;
  if (zoomed) {
    center = focusArc
      ? { name: focusArc.name, big: fmtNum(focusArc.count), small: `${pct(zoomedDomain.count ? (focusArc.count / zoomedDomain.count) * 100 : 0)} of ${zoomed.name}` }
      : { name: zoomed.name, big: fmtNum(zoomedDomain.count), small: 'repositories' };
  } else if (hover && hover.subId) {
    const arc = model.rings[0].find((a) => a.id === hover.subId);
    center = { name: arc.name, big: pct(arc.share * 100), small: `of ${hoverDomain.name}` };
  } else if (hoverDomain) {
    center = { name: hoverDomain.name, big: fmtNum(hoverDomain.count), small: `${pct(meta.total ? (hoverDomain.count / meta.total) * 100 : 0)} of the catalog` };
  } else center = { big: fmtNum(meta.total), small: 'repositories' };

  const rows = zoomed ? zoomSubs : domains.filter((d) => d.count > 0);
  const max = Math.max(1, ...rows.map((r) => r.count));
  const baseCount = zoomed ? zoomedDomain.count : meta.total;
  const unplaced = meta.count('d:' + meta.fallback);
  const linkTo = (r) => (zoomed ? `/domains/${zoom}?${buildSearchParams({ ...DEFAULT_FILTERS, subs: [r.id], tagMode }, { defaultTagMode: tagMode, omit: ['domains'] })}` : `/domains/${r.id}`);
  const rowColor = (r, i) => (zoomed ? css(subColor(colorOf(zoomedDomain).h, i, zoomSubs.length, mode)) : css(colorOf(r)));

  return (
    <div className={styles.wrap} onKeyDown={(e) => { if (e.key === 'Escape' && zoom) setZoom(null); }}>
      <div className={styles.chart}>
        <canvas ref={canvas} role="img" aria-label={zoomed
          ? `Doughnut chart of the ${zoomSubs.length} subdomains of ${zoomed.name}. The list next to it has every number.`
          : `Sunburst chart of all ${fmtNum(meta.total)} repositories. The inner ring is the domains, the outer ring their subdomains. The largest domains are ${domains.slice(0, 3).map((d) => d.name).join(', ')}. The list next to it has every number.`} />
        {/* an opened domain: the middle of the ring is a button that goes back to the sunburst */}
        {zoomed && <button type="button" className={styles.centerBtn} aria-label="Back to all domains" title="Back to all domains" onClick={() => { setZoom(null); setHover(null); }} />}
        <div className={`${styles.center} ${zoomed ? styles.centerZoom : ''}`} aria-hidden="true">
          {center.name && <span className={styles.centerName}>{center.name}</span>}
          <b className="num">{center.big}</b>
          <span className={styles.centerSub}>{center.small}</span>
          {zoomed && <span className={styles.centerBack}><Icon name="arrowLeft" size={13} /> All domains</span>}
        </div>
      </div>

      <div className={styles.side}>
        <div className={styles.head}>
          {zoomed ? (
            <>
              <button type="button" className={styles.back} onClick={() => { setZoom(null); setHover(null); }}><Icon name="arrowLeft" size={15} /> All domains</button>
              <Link className={styles.open} to={`/domains/${zoom}`}>Open {zoomed.name} <Icon name="arrowRight" size={15} /></Link>
            </>
          ) : (
            <p className={styles.hint}>Select a slice to open a domain up into its subdomains.</p>
          )}
        </div>
        <ul className={styles.list} role="list" onMouseLeave={() => setHover(null)}>
          {rows.map((r, i) => (
            <li key={r.id}>
              <Link to={linkTo(r)} className={styles.row} style={{ '--share': r.count / max, '--c': rowColor(r, i) }}
                onMouseEnter={() => setHover(zoomed ? { domainId: zoom, subId: r.id } : { domainId: r.id })} onFocus={() => setHover(zoomed ? { domainId: zoom, subId: r.id } : { domainId: r.id })} onBlur={() => setHover(null)}>
                <i className={styles.dot} aria-hidden="true" />
                <span className={styles.name}>{r.name}</span>
                <span className={`${styles.count} num`}>{fmtNum(r.count)}</span>
                <span className={`${styles.share} num`}>{pct(baseCount ? (r.count / baseCount) * 100 : 0)}</span>
                <span className={styles.bar} aria-hidden="true"><i /></span>
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          {zoomed ? 'A repository can be in more than one subdomain, so the percentages add up to more than 100.' : `A repository can be in several domains. ${unplaced > 0 ? `${fmtNum(unplaced)} are not in any domain yet.` : ''}`}
        </p>
      </div>
    </div>
  );
}

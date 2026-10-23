import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCatalogMeta } from '../../hooks/catalogMeta.js';
import { useRepos } from '../../hooks/useCatalog.js';
import { useModeCounts } from '../../hooks/useModeCounts.js';
import { useTagMode } from '../../hooks/useTagMode.js';
import { buildSearchParams, DEFAULT_FILTERS } from '../../lib/filters.js';
import { domainTagline } from '../../lib/domains.js';
import { fmtCompact, fmtNum } from '../../lib/format.js';
import { hueOf, langLabel } from '../../lib/languages.js';
import { repoPath, splitName } from '../../lib/links.js';
import Avatar from '../repo/Avatar.jsx';
import CountUp from '../ui/CountUp/CountUp.jsx';
import Icon from '../ui/Icon/Icon.jsx';
import styles from './DomainHero.module.css';

const W = 620, H = 380, CX = 310, CY = 190, RX = 190, RY = 122, MAX_NODES = 8;
const short = (s, n = 16) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// subdomains as a constellation: node size = share of the domain, click to filter by that subdomain
function Constellation({ id, name, subs, total }) {
  const navigate = useNavigate();
  const shown = subs.slice(0, MAX_NODES);
  const max = Math.max(1, ...shown.map((s) => s.count));
  const open = (subId) => navigate(`?${buildSearchParams({ ...DEFAULT_FILTERS, subs: [subId] }, { omit: ['domains'] })}`);
  const nodes = shown.map((s, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(shown.length, 1) + 0.35;
    const r = 11 + 22 * Math.sqrt(s.count / max);
    return { ...s, r, x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), cos: Math.cos(a), sin: Math.sin(a) };
  });
  return (
    <svg className={styles.art} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Subdomains of ${name}`}>
      <ellipse cx={CX} cy={CY} rx={RX} ry={RY} className={styles.orbit} />
      <ellipse cx={CX} cy={CY} rx={RX * 0.55} ry={RY * 0.55} className={styles.orbit2} />
      {nodes.map((n, i) => <line key={n.id} x1={CX} y1={CY} x2={n.x} y2={n.y} className={styles.link} style={{ '--i': i }} />)}
      <circle cx={CX} cy={CY} r="34" className={styles.pulse} />
      <circle cx={CX} cy={CY} r="46" className={styles.coreGlow} />
      <circle cx={CX} cy={CY} r="34" className={styles.core} />
      <text x={CX} y={CY - 2} className={styles.coreNum} textAnchor="middle">{fmtCompact(total)}</text>
      <text x={CX} y={CY + 14} className={styles.coreLabel} textAnchor="middle">repos</text>
      {nodes.map((n, i) => {
        const side = n.cos > 0.35 ? 'start' : n.cos < -0.35 ? 'end' : 'middle';
        const tx = side === 'start' ? n.x + n.r + 8 : side === 'end' ? n.x - n.r - 8 : n.x;
        const ty = side === 'middle' ? (n.sin > 0 ? n.y + n.r + 16 : n.y - n.r - 18) : n.y - 2;
        return (
          <g key={n.id} className={styles.node} style={{ '--i': i }} role="link" tabIndex={0} aria-label={`${n.name}, ${fmtNum(n.count)} repositories. Filter by this subdomain.`}
            onClick={() => open(n.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(n.id); } }}>
            <circle cx={n.x} cy={n.y} r={n.r} />
            <text x={tx} y={ty} textAnchor={side} className={styles.nodeName}>{short(n.name)}</text>
            <text x={tx} y={ty + 14} textAnchor={side} className={styles.nodeCount}>{fmtNum(n.count)}</text>
          </g>
        );
      })}
      {!nodes.length && <text x={CX} y={CY + 78} textAnchor="middle" className={styles.nodeCount}>No subdomains</text>}
      <title>{`${name}: ${id}`}</title>
    </svg>
  );
}

const TOP = { q: '', not: [], minStars: 0, maxStars: 0, sort: 'stars', offset: 0, limit: 3, prefixLast: false, rows: true };

export default function DomainHero({ id }) {
  const meta = useCatalogMeta();
  const location = useLocation();
  const name = meta.domainName(id);
  const mode = useTagMode();
  const subList = meta.subsOf(id);
  const mc = useModeCounts(['d:' + id, ...subList.map((s) => 's:' + s.id)], mode);
  const total = mc.count('d:' + id);
  const subs = subList.map((s) => ({ ...s, count: mc.count('s:' + s.id) })).sort((a, b) => b.count - a.count);
  const top = useRepos({ ...TOP, all: [['d:' + id]], not: mode === 'real' ? ['f:da'] : [] });
  const share = meta.total ? (total / meta.total) * 100 : 0;
  const tagline = domainTagline(id);

  return (
    <header className={`container ${styles.hero}`} style={{ '--dom-h': hueOf(id) }}>
      <div className={styles.text}>
        <p className={styles.crumb}><Link to="/domains">Domains</Link> / {name}</p>
        <h1 className={styles.title}>{name}</h1>
        {tagline && <p className={styles.tagline}>{tagline}</p>}
        <dl className={styles.stats}>
          <div><dd className="big"><CountUp value={total} duration={1000} /></dd><dt>repositories</dt></div>
          <div><dd className="big"><CountUp value={subs.length} duration={700} /></dd><dt>subdomains</dt></div>
          <div><dd className="big">{share >= 10 ? Math.round(share) : share.toFixed(1)}%</dd><dt>of the catalog</dt></div>
        </dl>
        <div className={styles.top}>
          <h2>Most starred here</h2>
          <ol>
            {(top.data?.rows || []).map((row, i) => {
              if (!row) return null;
              const { owner } = splitName(row.n);
              return (
                <li key={row.rank}>
                  <Link to={repoPath(row.n)} state={{ background: location, rank: row.rank, row }} className={styles.topLink}>
                    <span className={`${styles.pos} num`}>{i + 1}</span>
                    <Avatar owner={owner} size={28} />
                    <span className={styles.topName}>{row.n}</span>
                    <span className={`${styles.topStars} num`}><Icon name="star" size={13} filled /> {fmtNum(row.s)}</span>
                    {row.l && <span className={styles.topLang}>{langLabel(row.l.toLowerCase())}</span>}
                  </Link>
                </li>
              );
            })}
            {!top.data && Array.from({ length: 3 }, (_, i) => <li key={i} className={styles.topSkeleton} aria-hidden="true" />)}
          </ol>
        </div>
      </div>
      <div className={styles.visual}><Constellation id={id} name={name} subs={subs} total={total} /></div>
    </header>
  );
}

import { Link } from 'react-router-dom';
import { useState } from 'react';
import { usePrefs } from '../../store/prefs.store.js';
import { useCatalogMeta } from '../../hooks/catalogMeta.js';
import { bandOf } from '../../lib/activity.js';
import { buildSearchParams, DEFAULT_FILTERS } from '../../lib/filters.js';
import { fmtAge, fmtCompact, fmtDate, fmtNum, fmtSize } from '../../lib/format.js';
import { hueOf, langLabel, licenseText } from '../../lib/languages.js';
import { displayHost, safeHttpUrl, splitName } from '../../lib/links.js';
import Chip from '../ui/Chip/Chip.jsx';
import Icon from '../ui/Icon/Icon.jsx';
import Avatar from './Avatar.jsx';
import ActivityBadge from './ActivityBadge.jsx';
import AutoTags from './AutoTags.jsx';
import { AUTO_NOTE } from '../../lib/autoTags.js';
import ReadmeViewer from './ReadmeViewer.jsx';
import styles from './RepoDetail.module.css';

const GH_STATUS = {
  gone: ['danger', 'This repository is no longer on GitHub. The data below is from the snapshot.'],
  unavailable: ['danger', 'GitHub has removed this repository for legal reasons. The data below is from the snapshot.'],
  moved: ['warn', 'This name now belongs to a different repository on GitHub, so the data below may describe the old one.'],
};
const searchTo = (patch) => `/search?${buildSearchParams({ ...DEFAULT_FILTERS, ...patch })}`;

// one line of the About list: a quiet label on the left, the value on the right
function Row({ label, value }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

// auto tags are guesses, so they stay behind a button until someone asks for them (the saved preference decides how a panel starts)
function AutoTagsReveal({ tags }) {
  const startOpen = usePrefs((s) => s.panelAutoTags);
  const [open, setOpen] = useState(startOpen);
  return (
    <div className={styles.auto}>
      <button type="button" className={styles.autoBtn} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="sparkle" size={14} />
        <span>{open ? 'Hide' : 'Show'} auto tags <span className="num">({tags.length})</span></span>
        <Icon name="chevronDown" size={14} className={open ? styles.flip : ''} />
      </button>
      {!open && <p className={styles.small}>This repo has no tags of its own. Auto tags are guesses made by a text model.</p>}
      {open && <><p className={styles.small}><Icon name="sparkle" size={13} /> {AUTO_NOTE}</p><AutoTags tags={tags} /></>}
    </div>
  );
}

// header block, shared by the loaded record and the placeholder shown while the full record is still loading
export function RepoHead({ fullName, description, row }) {
  const { owner, name } = splitName(fullName);
  return (
    <div className={styles.head}>
      <Avatar owner={owner} size={52} />
      <div className={styles.headText}>
        <p className={styles.owner}>{owner}</p>
        <h2 className={styles.name}>{name}</h2>
        {description ? <p className={styles.desc}>{description}</p> : !row && <p className={styles.desc}><span className={styles.none}>No description</span></p>}
      </div>
    </div>
  );
}

export default function RepoDetail({ rec }) {
  const { snapshot, domainName, subName, fallback } = useCatalogMeta();
  const gh = rec.gh_status ? GH_STATUS[rec.gh_status] : null;
  const homepage = safeHttpUrl(rec.homepage);
  const band = bandOf(rec.last_commit, snapshot);
  const age = fmtAge(rec.created_at, snapshot);
  const years = (Date.parse(snapshot) - Date.parse(rec.created_at)) / (365.25 * 86_400_000);
  const autoTags = (rec.auto_tags || []).filter((t) => t[2] !== 'l').map(([tag, p]) => ({ tag, p }));
  const domains = (rec.domains || []).filter((d) => d !== fallback);

  return (
    <div className={styles.detail}>
      <RepoHead fullName={rec.full_name} description={rec.description} />

      {gh && <p className={`${styles.banner} ${styles[gh[0]]}`} role="note"><Icon name="alert" size={16} /> {gh[1]}</p>}

      <div className={styles.flags}>
        {rec.archived && <Chip tone="warn" icon="archive">Archived</Chip>}
        {rec.template && <Chip icon="copy">Template repository</Chip>}
        {rec.owner_type === 'Organization' ? <Chip icon="building">Organization</Chip> : <Chip icon="user">User</Chip>}
        {homepage && <a className={styles.home} href={homepage} target="_blank" rel="noopener noreferrer"><Icon name="globe" size={15} /> {displayHost(homepage)} <Icon name="arrowUpRight" size={13} /></a>}
      </div>

      {/* the three numbers people look at first; the exact figure and the rank are in the tooltip */}
      <ul className={styles.hero} aria-label="Key numbers">
        <li title={`${fmtNum(rec.stars)} stars, number ${fmtNum(rec.rank + 1)} by stars in the catalog`}><Icon name="star" size={18} filled /><b className="num">{fmtCompact(rec.stars)}</b><span>Stars</span></li>
        <li title={`${fmtNum(rec.forks)} forks`}><Icon name="fork" size={18} /><b className="num">{fmtCompact(rec.forks)}</b><span>Forks</span></li>
        <li title={`${fmtNum(rec.open_issues ?? 0)} open issues and pull requests (GitHub counts both together)`}><Icon name="issue" size={18} /><b className="num">{fmtCompact(rec.open_issues ?? 0)}</b><span>Issues and PRs</span></li>
        <li title="Position when every repository is sorted by stars"><Icon name="layers" size={18} /><b className="num">#{fmtNum(rec.rank + 1)}</b><span>By stars</span></li>
      </ul>

      <dl className={styles.about}>
        <Row label="Language" value={rec.language ? <span className={styles.lang}><i style={{ '--h': hueOf(rec.language) }} />{langLabel(rec.language.toLowerCase())}</span> : <span className={styles.dim}>None</span>} />
        <Row label="License" value={licenseText(rec.license)} />
        <Row label="Created" value={<>{fmtDate(rec.created_at)}{age && <span className={styles.dim}> · {age} old</span>}</>} />
        <Row label="Last commit" value={rec.last_commit ? <span className={styles.commit}>{fmtDate(rec.last_commit)} <ActivityBadge band={band} /></span> : <span className={styles.dim}>Unknown</span>} />
        <Row label="Repo size" value={<span className="num">{fmtSize(rec.size)}</span>} />
        {/* the export only stores the branch when it is not "main", so a missing value means main */}
        <Row label="Default branch" value={<code>{rec.default_branch || 'main'}</code>} />
      </dl>

      {rec.stars > 0 && (
        <p className={styles.insight}>
          {years >= 1 && <span>About <b className="num">{fmtCompact(Math.round(rec.stars / years))}</b> stars per year</span>}
          <span><b className="num">{Math.round((rec.forks / rec.stars) * 100)}</b> forks per 100 stars</span>
        </p>
      )}

      {(domains.length > 0 || rec.subdomains?.length > 0) && (
        <section className={styles.sec}>
          <h3 className={styles.h}>Domain</h3>
          <div className={styles.chips}>
            {/* a domain placed by auto tags only holds this repo when auto tags are on, so those links open with them on */}
            {domains.map((d) => <Chip key={d} tone={rec.domain_auto ? 'auto' : 'accent'} to={rec.domain_auto ? `/domains/${d}?tags=both` : `/domains/${d}`}>{domainName(d)}</Chip>)}
            {(rec.subdomains || []).map((s) => <Chip key={s} to={searchTo({ subs: [s], tagMode: rec.domain_auto ? 'both' : 'real' })}>{subName(s)}</Chip>)}
          </div>
          {rec.domain_auto && <p className={styles.small}>The domain was inferred from auto tags only, so treat it as a weak signal.</p>}
        </section>
      )}

      {(rec.tags?.length > 0 || autoTags.length > 0) && (
        <section className={styles.sec}>
          <h3 className={styles.h}>Tags</h3>
          {rec.tags?.length > 0 && <div className={styles.chips}>{rec.tags.map((t) => <Chip key={t} mono to={searchTo({ tags: [t] })}>{t}</Chip>)}</div>}
          {autoTags.length > 0 && <AutoTagsReveal tags={autoTags} />}
        </section>
      )}

      {rec.topics?.length > 0 && (
        <section className={styles.sec}>
          <h3 className={styles.h}>GitHub topics</h3>
          <div className={styles.chips}>{rec.topics.map((t) => <Chip key={t} mono to={searchTo({ q: t })}>{t}</Chip>)}</div>
        </section>
      )}

      <ReadmeViewer rec={rec} />
      <p className={styles.foot}>Data as of the snapshot of {fmtDate(snapshot)}. <Link to="/about">What this catalog can and cannot tell you</Link></p>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { usePrefs } from '../../store/prefs.store.js';
import { useCatalogMeta } from '../../hooks/catalogMeta.js';
import { bandOf } from '../../lib/activity.js';
import { buildSearchParams, DEFAULT_FILTERS } from '../../lib/filters.js';
import { fmtAge, fmtCompact, fmtDate, fmtNum, fmtSize } from '../../lib/format.js';
import { hueOf, langLabel, licenseText } from '../../lib/languages.js';
import { displayHost, safeHttpUrl, splitName } from '../../lib/links.js';
import Chip from '../ui/Chip/Chip.jsx';
import Icon from '../ui/Icon/Icon.jsx';
import Switch from '../ui/Switch/Switch.jsx';
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

function Stat({ icon, label, value, hint }) {
  return (
    <div className={styles.stat} title={hint}>
      <dt><Icon name={icon} size={14} /> {label}</dt>
      <dd>{value}</dd>
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
        <h1 className={styles.name}>{name}</h1>
        {description ? <p className={styles.desc}>{description}</p> : !row && <p className={styles.desc}><span className={styles.none}>No description</span></p>}
      </div>
    </div>
  );
}

export default function RepoDetail({ rec }) {
  const { snapshot, domainName, subName, fallback } = useCatalogMeta();
  const showAuto = usePrefs((s) => s.panelAutoTags);
  const setPref = usePrefs((s) => s.setPref);
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

      <dl className={styles.stats}>
        <Stat icon="star" label="Stars" value={<span className="num">{fmtNum(rec.stars)}</span>} hint={`${fmtNum(rec.rank + 1)} by stars in the catalog`} />
        <Stat icon="fork" label="Forks" value={<span className="num">{fmtNum(rec.forks)}</span>} />
        <Stat icon="issue" label="Issues and PRs" value={<span className="num">{fmtNum(rec.open_issues ?? 0)}</span>} hint="GitHub's open count, which includes pull requests" />
        <Stat icon="code" label="Language" value={rec.language ? <span className={styles.lang}><i style={{ '--h': hueOf(rec.language) }} />{langLabel(rec.language.toLowerCase())}</span> : <span className={styles.dim}>None</span>} />
        <Stat icon="scale" label="License" value={licenseText(rec.license)} />
        <Stat icon="doc" label="Repo size" value={<span className="num">{fmtSize(rec.size)}</span>} />
        <Stat icon="calendar" label="Created" value={<>{fmtDate(rec.created_at)}{age && <span className={styles.dim}> · {age} old</span>}</>} />
        <Stat icon="clock" label="Last commit" value={rec.last_commit ? <span className={styles.commit}>{fmtDate(rec.last_commit)} <ActivityBadge band={band} /></span> : <span className={styles.dim}>Unknown</span>} />
        {rec.default_branch && <Stat icon="code" label="Default branch" value={<code>{rec.default_branch}</code>} />}
      </dl>

      {rec.stars > 0 && (
        <p className={styles.insight}>
          {years >= 1 && <span>About <b className="num">{fmtCompact(Math.round(rec.stars / years))}</b> stars per year</span>}
          <span><b className="num">{Math.round((rec.forks / rec.stars) * 100)}</b> forks per 100 stars</span>
        </p>
      )}

      {(domains.length > 0 || rec.subdomains?.length > 0) && (
        <section className={styles.sec}>
          <h2 className={styles.h}>Domain</h2>
          <div className={styles.chips}>
            {domains.map((d) => <Chip key={d} tone={rec.domain_auto ? 'auto' : 'accent'} to={`/domains/${d}`}>{domainName(d)}</Chip>)}
            {(rec.subdomains || []).map((s) => <Chip key={s} to={searchTo({ subs: [s] })}>{subName(s)}</Chip>)}
          </div>
          {rec.domain_auto && <p className={styles.small}>The domain was inferred from auto tags only, so treat it as a weak signal.</p>}
        </section>
      )}

      {(rec.tags?.length > 0 || autoTags.length > 0) && (
        <section className={styles.sec}>
          <h2 className={styles.h}>Tags</h2>
          {rec.tags?.length > 0 && <div className={styles.chips}>{rec.tags.map((t) => <Chip key={t} mono to={searchTo({ tags: [t] })}>{t}</Chip>)}</div>}
          {autoTags.length > 0 && (
            <div className={styles.auto}>
              <Switch label={`Show auto tags (${autoTags.length})`} help={showAuto ? AUTO_NOTE : 'This repo has no tags of its own. Turn this on to see tags generated automatically.'} checked={showAuto} onChange={(v) => setPref('panelAutoTags', v)} />
              {showAuto && <AutoTags tags={autoTags} />}
            </div>
          )}
        </section>
      )}

      {rec.topics?.length > 0 && (
        <section className={styles.sec}>
          <h2 className={styles.h}>GitHub topics</h2>
          <div className={styles.chips}>{rec.topics.map((t) => <Chip key={t} mono to={searchTo({ q: t })}>{t}</Chip>)}</div>
        </section>
      )}

      <ReadmeViewer rec={rec} />
      <p className={styles.foot}>Data as of the snapshot of {fmtDate(snapshot)}. <Link to="/about">What this catalog can and cannot tell you</Link></p>
    </div>
  );
}

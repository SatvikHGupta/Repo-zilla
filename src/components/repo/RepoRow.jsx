import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCatalogMeta } from '../../hooks/catalogMeta.js';
import { usePrefs } from '../../store/prefs.store.js';
import { bandOfMonth } from '../../lib/activity.js';
import { fmtMonth, fmtNum } from '../../lib/format.js';
import { hueOf, langLabel } from '../../lib/languages.js';
import { repoPath, splitName } from '../../lib/links.js';
import Icon from '../ui/Icon/Icon.jsx';
import Chip from '../ui/Chip/Chip.jsx';
import Avatar from './Avatar.jsx';
import OpenOnGithub from './OpenOnGithub.jsx';
import ActivityBadge from './ActivityBadge.jsx';
import RepoTags from './RepoTags.jsx';
import { cutDescription } from './describe.js';
import styles from './RepoRow.module.css';

// Row layout: one scannable table-like row. Column header comes from RepoList.
function RepoRow({ row, tagMode, index = 0 }) {
  const location = useLocation();
  const { snapshot, domainName, fallback } = useCatalogMeta();
  const show = usePrefs((s) => s.show);
  const { owner, name } = splitName(row.n);
  const gone = !!row.g;
  const desc = cutDescription(row.d);
  const hasDomain = show.domain && row.m && row.m !== fallback && !(row.da && tagMode === 'real');
  const tags = show.tags && ((tagMode !== 'auto' && row.t?.length) || (tagMode !== 'real' && row.a?.length));

  return (
    <li className={styles.row} style={{ '--i': index }}>
      <span className={`${styles.rank} num`} title="Rank by stars across the whole catalog">#{fmtNum(row.rank + 1)}</span>
      <div className={styles.main}>
        <Avatar owner={owner} size={38} />
        <div className={styles.text}>
          <h3 className={styles.title}>
            <Link className={styles.stretch} to={repoPath(row.n)} state={{ background: location, rank: row.rank, row }}>
              <span className={styles.owner}>{owner}</span><span className={styles.slash}>/</span><span className={styles.name}>{name}</span>
            </Link>
            {gone && <Chip tone="danger" icon="alert">No longer on GitHub</Chip>}
            {row.x && <Chip tone="warn" icon="archive">Archived</Chip>}
          </h3>
          {show.description && <p className={styles.desc}>{desc || <span className={styles.none}>No description</span>}</p>}
          {(tags || hasDomain) && (
            <div className={styles.tags}>
              {hasDomain && <Link to={`/domains/${row.m}`} className={styles.domain} title={row.da ? 'Domain inferred from auto tags only' : 'Domain'}><Chip tone={row.da ? 'auto' : 'accent'}>{domainName(row.m)}</Chip></Link>}
              {tags && <RepoTags row={row} tagMode={tagMode} />}
            </div>
          )}
        </div>
      </div>
      <div className={styles.facts}>
        <span className={styles.lang} title="Primary language">{row.l ? <><i className={styles.dot} style={{ '--h': hueOf(row.l) }} />{langLabel(row.l.toLowerCase())}</> : <span className={styles.dim}>-</span>}</span>
        {show.stats && (
          <span className={styles.nums}>
            <span className={`${styles.stars} num`} title={`${fmtNum(row.s)} stars`}><Icon name="star" size={14} filled />{fmtNum(row.s)}</span>
            <span className={`${styles.forks} num`} title={`${fmtNum(row.f)} forks`}><Icon name="fork" size={14} />{fmtNum(row.f)}</span>
          </span>
        )}
        {show.activity && <span className={styles.act}><span className={styles.month} title="Month of the last commit">{row.p ? fmtMonth(row.p) : '-'}</span><ActivityBadge band={bandOfMonth(row.p, snapshot)} /></span>}
      </div>
      <span className={styles.open}><OpenOnGithub fullName={row.n} gone={gone} size="sm" /></span>
    </li>
  );
}

export default memo(RepoRow);

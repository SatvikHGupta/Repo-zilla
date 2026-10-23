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
import styles from './RepoCard.module.css';

function RepoCard({ row, tagMode, index = 0 }) {
  const location = useLocation();
  const { snapshot, domainName, fallback } = useCatalogMeta();
  const show = usePrefs((s) => s.show);
  const { owner, name } = splitName(row.n);
  const gone = !!row.g;
  const band = bandOfMonth(row.p, snapshot);
  const desc = cutDescription(row.d);
  const hasDomain = show.domain && row.m && row.m !== fallback && !(row.da && tagMode === 'real');
  const tags = show.tags && ((tagMode !== 'auto' && row.t?.length) || (tagMode !== 'real' && row.a?.length));

  return (
    <li className={styles.card} style={{ '--i': index }}>
      <div className={styles.top}>
        <Avatar owner={owner} size={42} />
        <div className={styles.title}>
          <span className={styles.owner}>{owner}</span>
          <h3 className={styles.name}>
            <Link className={styles.stretch} to={repoPath(row.n)} state={{ background: location, rank: row.rank, row }}>{name}</Link>
          </h3>
        </div>
        <div className={styles.aside}>
          <span className={`${styles.rank} num`} title="Rank by stars across the whole catalog">#{fmtNum(row.rank + 1)}</span>
          <OpenOnGithub fullName={row.n} gone={gone} size="sm" />
        </div>
      </div>

      {(row.x || gone) && (
        <div className={styles.flags}>
          {gone && <Chip tone="danger" icon="alert">No longer on GitHub</Chip>}
          {row.x && <Chip tone="warn" icon="archive">Archived</Chip>}
        </div>
      )}

      {show.description && <p className={styles.desc}>{desc || <span className={styles.none}>No description</span>}</p>}
      {tags && <div className={styles.tags}><RepoTags row={row} tagMode={tagMode} /></div>}

      <div className={styles.foot}>
        {show.stats && (
          <>
            <span className={`${styles.stat} num`} title={`${fmtNum(row.s)} stars`}><Icon name="star" size={15} filled /> {fmtNum(row.s)}</span>
            <span className={`${styles.stat} num`} title={`${fmtNum(row.f)} forks`}><Icon name="fork" size={15} /> {fmtNum(row.f)}</span>
          </>
        )}
        {row.l && <span className={styles.stat} title="Primary language"><i className={styles.dot} style={{ '--h': hueOf(row.l) }} />{langLabel(row.l.toLowerCase())}</span>}
        {show.activity && (
          <span className={styles.activity}>
            {row.p && <span className={styles.stat} title="Month of the last commit">{fmtMonth(row.p)}</span>}
            <ActivityBadge band={band} />
          </span>
        )}
        {hasDomain && (
          <Link className={styles.domain} to={`/domains/${row.m}`} title={row.da ? 'Domain inferred from auto tags only' : 'Domain'}>
            <Chip tone={row.da ? 'auto' : 'accent'}>{domainName(row.m)}</Chip>
          </Link>
        )}
      </div>
    </li>
  );
}

export default memo(RepoCard);

import { useId, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCatalogMeta } from '../../hooks/catalogMeta.js';
import { ignoredWords, searchableWords, useRepos, useTagSuggest } from '../../hooks/useCatalog.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { buildSearchParams, DEFAULT_FILTERS } from '../../lib/filters.js';
import { fmtCompact, fmtNum } from '../../lib/format.js';
import { langLabel } from '../../lib/languages.js';
import { isValidRepoRef, repoPath, splitName } from '../../lib/links.js';
import Avatar from '../repo/Avatar.jsx';
import Icon from '../ui/Icon/Icon.jsx';
import styles from './QuickSearch.module.css';

const ARGS = { all: [], not: ['f:ar', 'f:gone'], minStars: 0, offset: 0, limit: 5, prefixLast: true, rows: true };

// home page search: a dropdown with the top 5 repositories and a few tags for a quick look, Enter opens the full search page
export default function QuickSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { total } = useCatalogMeta();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const debounced = useDebouncedValue(text.trim(), 160);
  const words = useMemo(() => searchableWords(debounced), [debounced]);
  const lastWord = words.length ? words[words.length - 1] : '';

  // keepPrevious only while there are words: text that is not searchable must not show the repos of an older query
  const repos = useRepos({ ...ARGS, q: debounced }, { enabled: focused && words.length > 0, keepPrevious: words.length > 0 });
  const skipped = useMemo(() => ignoredWords(debounced), [debounced]);
  // "owner/name" typed in full goes straight to that repo, whatever the word search finds
  const direct = useMemo(() => { const t = text.trim(); const { owner, name } = splitName(t); return t.includes('/') && isValidRepoRef(owner, name) ? t : null; }, [text]);
  const tags = useTagSuggest(lastWord, { mode: 'real', enabled: focused && lastWord.length > 0 });

  const open = focused && text.trim().length > 0;
  const items = useMemo(() => {
    const list = [];
    if (direct) list.push({ kind: 'direct', key: 'direct', name: direct });
    for (const row of (words.length ? repos.data?.rows : null) || []) if (row) list.push({ kind: 'repo', key: 'r' + row.rank, row });
    for (const t of (tags.data || []).slice(0, 4)) list.push({ kind: 'tag', key: 't' + t.tag, tag: t });
    if (text.trim()) list.push({ kind: 'all', key: 'all' });
    return list;
  }, [repos.data, tags.data, text, words.length, direct]);
  const idx = Math.min(active, items.length - 1);

  const submit = (q) => navigate(`/search?${buildSearchParams({ ...DEFAULT_FILTERS, q })}`);
  const choose = (it) => {
    if (!it) { if (text.trim()) submit(text.trim()); return; }
    if (it.kind === 'direct') navigate(repoPath(it.name), { state: { background: location } });
    else if (it.kind === 'repo') navigate(repoPath(it.row.n), { state: { background: location, rank: it.row.rank, row: it.row } });
    else if (it.kind === 'tag') navigate(`/search?${buildSearchParams({ ...DEFAULT_FILTERS, tags: [it.tag.tag] })}`);
    else submit(text.trim());
  };
  const onKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return; // an IME is still choosing characters: Enter belongs to it
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(idx >= 0 ? items[idx] : null); }
    else if (e.key === 'Escape') { setText(''); e.currentTarget.blur(); }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <Icon name="search" size={20} />
        <input className={styles.input} role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={open && idx >= 0 ? `${listId}-${idx}` : undefined}
          aria-label="Quick search" placeholder={`Search ${fmtNum(total)} repos: “vector database”, “rust cli”, “react table”`} value={text} maxLength={100}
          autoComplete="off" autoCapitalize="none" spellCheck="false" enterKeyHint="search"
          onChange={(e) => { setText(e.target.value); setActive(-1); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={onKeyDown} />
      </div>
      {open && (
        <ul id={listId} role="listbox" className={styles.list}>
          {items.map((it, i) => (
            <li key={it.key} id={`${listId}-${i}`} role="option" aria-selected={i === idx} className={`${styles.opt} ${i === idx ? styles.on : ''}`}
              onMouseDown={(e) => { e.preventDefault(); choose(it); }} onMouseEnter={() => setActive(i)}>
              {it.kind === 'direct' && (
                <>
                  <span className={styles.ico}><Icon name="arrowRight" size={15} /></span>
                  <span className={styles.main}><span className={styles.name}>Open <code>{it.name}</code></span><span className={styles.sub}>Go straight to this repository</span></span>
                </>
              )}
              {it.kind === 'repo' && (
                <>
                  <Avatar owner={splitName(it.row.n).owner} size={26} />
                  <span className={styles.main}><span className={styles.name}>{it.row.n}</span>{it.row.d && <span className={styles.sub}>{it.row.d}</span>}</span>
                  <span className={`${styles.meta} num`}><Icon name="star" size={13} filled /> {fmtCompact(it.row.s)}</span>
                  {it.row.l && <span className={styles.lang}>{langLabel(it.row.l.toLowerCase())}</span>}
                </>
              )}
              {it.kind === 'tag' && (
                <>
                  <span className={styles.ico}><Icon name="tag" size={15} /></span>
                  <span className={styles.main}><span className={styles.name}>Tag: <code>{it.tag.tag}</code></span></span>
                  <span className={`${styles.meta} num`}>{fmtNum(it.tag.count)} repos</span>
                </>
              )}
              {it.kind === 'all' && (
                <>
                  <span className={styles.ico}><Icon name="arrowRight" size={15} /></span>
                  <span className={styles.main}><span className={styles.name}>See all results for “{text.trim()}”</span><span className={styles.sub}>Opens the search page with every filter</span></span>
                </>
              )}
            </li>
          ))}
          {words.length > 0 && !repos.data && repos.isFetching && <li className={styles.note} role="presentation">Searching…</li>}
          {words.length === 0 && <li className={styles.note} role="presentation">Nothing searchable yet: numbers, single letters and very common words are ignored.</li>}
          {words.length > 0 && skipped.length > 0 && <li className={styles.note} role="presentation">Not searched: {skipped.map((w) => `“${w}”`).join(', ')}</li>}
          {repos.data && repos.data.total === 0 && words.length > 0 && <li className={styles.note} role="presentation">No repositories contain all of those words.</li>}
        </ul>
      )}
    </div>
  );
}

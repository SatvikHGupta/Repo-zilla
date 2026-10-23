import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCatalogMeta } from '../../hooks/catalogMeta.js';
import { BP, useMediaQuery } from '../../hooks/useMediaQuery.js';
import { useRepos } from '../../hooks/useCatalog.js';
import { buildSearchParams, clearFilters, describeFilters, parseFilters, SORTS, toQueryArgs } from '../../lib/filters.js';
import { fmtNum } from '../../lib/format.js';
import { usePrefs } from '../../store/prefs.store.js';
import ActiveChips from '../filters/ActiveChips.jsx';
import FilterPanel from '../filters/FilterPanel.jsx';
import SearchInput from '../filters/SearchInput.jsx';
import ViewOptions from '../filters/ViewOptions.jsx';
import Pagination from '../repo/Pagination.jsx';
import RepoList from '../repo/RepoList.jsx';
import { Button, IconButton } from '../ui/Button/Button.jsx';
import BottomSheet from '../ui/BottomSheet/BottomSheet.jsx';
import CountUp from '../ui/CountUp/CountUp.jsx';
import Icon from '../ui/Icon/Icon.jsx';
import { RepoSkeleton, TopProgress } from '../ui/Loader/Loader.jsx';
import Popover from '../ui/Popover/Popover.jsx';
import { EmptyState, ErrorState } from '../ui/State/State.jsx';
import SortSelect from './SortSelect.jsx';
import styles from './SearchExperience.module.css';

// The whole search experience: query box, filter rail (drawer on small screens), result list, paging. The URL is the single source of truth.
// scope.domains locks a domain (used by the domain pages): it is applied to the query but never written to or read from the URL.
export default function SearchExperience({ scope }) {
  const [params, setParams] = useSearchParams();
  const meta = useCatalogMeta();
  const pageSize = usePrefs((s) => s.pageSize);
  const layout = usePrefs((s) => s.layout);
  const setPref = usePrefs((s) => s.setPref);
  const savedMode = usePrefs((s) => s.tagMode);
  const rail = useMediaQuery(BP.rail);
  const [drawer, setDrawer] = useState(false);
  const [viewSheet, setViewSheet] = useState(false);
  const top = useRef(null);

  const locked = !!scope?.domains;
  const lockedKey = locked ? scope.domains.join(',') : '';
  const urlFilters = useMemo(() => {
    const f = parseFilters(params, { defaultTagMode: savedMode });
    return lockedKey ? { ...f, domains: lockedKey.split(',') } : f;
  }, [params, lockedKey, savedMode]);

  // The router commits URL changes a moment after the click. Until it catches up the controls and the query use the new filters
  // straight away, so checkboxes, the sort box and the results react at once. If the URL goes somewhere else (back button), this is dropped.
  const [pending, setPending] = useState(null);
  const urlSig = JSON.stringify(urlFilters);
  let filters = urlFilters;
  if (pending) {
    if (urlSig === pending.target || urlSig !== pending.from) setPending(null);
    else filters = pending.filters;
  }

  const writeUrl = useCallback((next, opts) => setParams(buildSearchParams(next, { omit: lockedKey ? ['domains'] : [], defaultTagMode: savedMode }), opts), [setParams, lockedKey, savedMode]);
  const go = useCallback((next, opts) => {
    setPending({ from: urlSig, target: JSON.stringify(next), filters: next });
    writeUrl(next, opts);
  }, [writeUrl, urlSig]);
  const update = useCallback((patch, opts) => {
    if (patch.tagMode) setPref('tagMode', patch.tagMode); // the choice is remembered for the domain pages and the next visit
    go({ ...filters, ...patch, page: 'page' in patch ? patch.page : 1 }, opts);
  }, [go, filters, setPref]);
  const commitText = useCallback((q, opts) => update({ q }, opts), [update]);
  const clearAll = () => go(clearFilters(filters, lockedKey ? { domains: filters.domains } : {}));

  // a sort the data export has no index for falls back to stars (a link may carry one)
  const sortAvailable = useCallback((id) => id === 'stars' || !!meta.manifest.sorts?.[id], [meta.manifest]);
  const sort = sortAvailable(filters.sort) ? filters.sort : 'stars';
  const args = useMemo(() => ({ ...toQueryArgs(filters, { limit: pageSize, offset: (filters.page - 1) * pageSize, licKeys: meta.licKeys }), sort }), [filters, pageSize, meta.licKeys, sort]);
  const q = useRepos(args);
  const data = q.data;
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const stale = q.isPlaceholderData;

  // a link or a shrinking result set can leave the page number past the end: step back to the last real page
  useEffect(() => {
    if (data && !stale && total > 0 && filters.page > totalPages) writeUrl({ ...filters, page: totalPages }, { replace: true });
  }, [data, stale, total, totalPages, filters, writeUrl]);

  const chips = describeFilters(filters, meta.names).filter((c) => !(locked && c.key === 'domains'));
  const start = (filters.page - 1) * pageSize + 1;
  const end = start + (data?.ranks.length ?? 0) - 1;
  const goPage = (n) => { update({ page: n }); top.current?.scrollIntoView({ block: 'start' }); };

  let body;
  if (q.isError) body = <ErrorState title="The search failed" error={q.error} onRetry={() => q.refetch()} />;
  else if (!data) body = <RepoSkeleton layout={layout} count={Math.min(pageSize, 8)} />;
  else if (data.total === 0) {
    body = (
      <EmptyState icon="search" title="No repositories match" action={chips.length || filters.q ? <Button onClick={clearAll}>Clear filters and search</Button> : null}>
        {filters.q ? 'Search matches whole words, and the last word also as a prefix. There is no typo tolerance, so check the spelling or remove a word.' : 'Try removing a filter.'}
      </EmptyState>
    );
  } else {
    body = (
      <>
        <RepoList rows={data.rows} tagMode={filters.tagMode} />
        <Pagination page={filters.page} totalPages={totalPages} onPage={goPage} />
      </>
    );
  }

  const viewButton = rail
    ? <Popover label="View options" width={340} renderTrigger={(p) => <Button size="sm" icon="sliders" {...p}>View</Button>}><ViewOptions /></Popover>
    : <Button size="sm" icon="sliders" onClick={() => setViewSheet(true)}>View</Button>;

  return (
    <div className={`container ${styles.page}`}>
      <TopProgress active={q.isFetching} />
      <h1 className="sr-only">Search repositories</h1>
      <SearchInput value={filters.q} onCommit={commitText} />

      <div className={styles.layout}>
        {rail && <aside className={styles.rail} aria-label="Filters"><FilterPanel filters={filters} update={update} scope={scope} /></aside>}

        <section className={styles.results} aria-label="Results" aria-busy={q.isFetching}>
          <div ref={top} className={styles.bar}>
            <div className={styles.count}>
              {data ? (
                <>
                  <h2 className={styles.total}><b className="big"><CountUp value={total} duration={600} start={total} /></b> {total === 1 ? 'repository' : 'repositories'}</h2>
                  {total > 0 && <p className={`${styles.range} num`}>{fmtNum(start)}-{fmtNum(end)} · {SORTS.find((x) => x.id === sort).label.toLowerCase()}</p>}
                </>
              ) : <span className={styles.total}>Searching…</span>}
            </div>
            <div className={styles.tools}>
              {!rail && <Button size="sm" variant={chips.length ? 'primary' : 'secondary'} icon="filter" onClick={() => setDrawer(true)}>Filters{chips.length > 0 && ` (${chips.length})`}</Button>}
              <SortSelect value={sort} onChange={(v) => update({ sort: v })} available={sortAvailable} />
              <div className={styles.layoutToggle} role="group" aria-label="Layout">
                <IconButton size="sm" icon="grid" label="Card layout" active={layout === 'cards'} onClick={() => setPref('layout', 'cards')} />
                <IconButton size="sm" icon="rows" label="Row layout" active={layout === 'rows'} onClick={() => setPref('layout', 'rows')} />
              </div>
              {viewButton}
            </div>
          </div>

          <ActiveChips filters={filters} names={meta.names} lockedKeys={locked ? ['domains'] : []} onChange={(f) => go(f)} onClear={clearAll} />
          {filters.tagMode !== 'real' && <p className={styles.autoLine}><Icon name="sparkle" size={14} /> Auto tags are on: tags marked “auto” are generated automatically to add more detail.</p>}
          {sort !== filters.sort && <p className={styles.autoLine}><Icon name="info" size={14} /> This sort is not available in the current data, so results are shown by stars.</p>}

          <div className={stale ? styles.stale : undefined}>{body}</div>
        </section>
      </div>

      {!rail && (
        <>
          <BottomSheet open={drawer} onClose={() => setDrawer(false)} title="Filters"
            footer={<div className={styles.sheetFoot}><Button variant="ghost" onClick={clearAll} disabled={!chips.length}>Clear all</Button><Button variant="primary" onClick={() => setDrawer(false)}>{data ? `Show ${fmtNum(total)} ${total === 1 ? 'repo' : 'repos'}` : 'Show results'}</Button></div>}>
            <FilterPanel filters={filters} update={update} scope={scope} />
          </BottomSheet>
          <BottomSheet open={viewSheet} onClose={() => setViewSheet(false)} title="View options"><ViewOptions /></BottomSheet>
        </>
      )}
    </div>
  );
}

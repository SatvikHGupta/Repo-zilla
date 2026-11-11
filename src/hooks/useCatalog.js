// React Query wrappers around the catalog worker. The snapshot never changes while the site is open, so nothing here goes stale.
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { catalog, connect } from '../data/catalog.js';
import { tokenize } from '../data/catalog_core.js';

export const useManifest = () => useQuery({ queryKey: ['manifest'], queryFn: connect, staleTime: Infinity, retry: 1 });
export const useFacetsData = (enabled) => useQuery({ queryKey: ['facets'], queryFn: () => catalog.facets(), enabled, staleTime: Infinity, retry: 1 });

// words the catalog can actually search for (stop words, numbers and single letters are ignored by the tokenizer)
export const searchableWords = (q) => tokenize(q, { max: 12 });

// the words of a query the catalog will silently skip, so the page can say so instead of searching for less than was typed
export function ignoredWords(q) {
  const pieces = String(q || '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  // a piece that tokenizes to nothing is ignored (CJK pieces become 2-character tokens, so they are kept)
  return [...new Set(pieces.filter((w) => tokenize(w, { max: 1 }).length === 0))].slice(0, 5);
}

// list / search results; the previous page stays on screen while the next one loads (keepPrevious: false for a dropdown that must not show an old query)
export const useRepos = (args, { enabled = true, keepPrevious = true } = {}) =>
  useQuery({ queryKey: ['repos', args], queryFn: () => catalog.query(args), enabled, placeholderData: keepPrevious ? keepPreviousData : undefined, staleTime: Infinity, retry: 1 });

// one repository picked at random from everything the current filters match (not only the page on screen): a random position in the result list, fetched on its own
export async function randomRepo(args, total) {
  if (!(total > 0)) return null;
  const offset = Math.floor(Math.random() * total);
  const r = await catalog.query({ ...args, limit: 1, offset });
  const row = r.rows?.find(Boolean);
  return row ? { row, rank: Number.isInteger(row.rank) ? row.rank : r.ranks?.[0] } : null;
}

// tag autocomplete from the tag dictionary (1.2 MB, fetched on first use). mode: real | auto | both (real first, then auto)
export const useTagSuggest = (prefix, { mode, enabled }) =>
  useQuery({
    queryKey: ['suggest', prefix, mode],
    enabled: enabled && prefix.length > 0,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const pull = async (auto, limit) => (await catalog.suggest(prefix, { auto, limit })).map(([tag, count]) => ({ tag, count, auto }));
      if (mode === 'auto') return pull(true, 10);
      const real = await pull(false, 8);
      if (mode !== 'both') return real;
      const seen = new Set(real.map((r) => r.tag));
      return [...real, ...(await pull(true, 8)).filter((o) => !seen.has(o.tag))].slice(0, 10);
    },
  });

// stars of the most starred repo: the top of the range slider
export const useTopStars = () =>
  useQuery({ queryKey: ['top-stars'], staleTime: Infinity, retry: 1, queryFn: async () => (await catalog.slim([0]))[0]?.s ?? 0 });

// a repo by name; a rank hint (from the list the user clicked in) saves the lookup-bucket fetch
export const useRepoDetail = (owner, name, rankHint, enabled = true) => {
  const key = `${owner}/${name}`.toLowerCase();
  return useQuery({
    queryKey: ['repo', key],
    enabled,
    staleTime: Infinity,
    gcTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      if (Number.isInteger(rankHint)) {
        const rec = await catalog.detail(rankHint);
        if (rec && rec.full_name.toLowerCase() === key) return rec;
      }
      return catalog.repo(`${owner}/${name}`);
    },
  });
};

// ---- narrowing a search by tag ----
export const RELATED_SAMPLE = 200; // tags are counted over the first 200 results (by stars), not over every match

// the tags that the given rows carry, most common first; tags already chosen are left out
export function tallyTags(rows, mode, skip = []) {
  const counts = new Map();
  for (const row of rows) {
    if (!row) continue;
    const own = [...(mode !== 'auto' && row.t ? row.t : []), ...(mode !== 'real' && row.a ? row.a : [])];
    for (const tag of new Set(own)) if (!skip.includes(tag)) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([tag, n]) => ({ tag, n }));
}

// tags that the repos matching the current filters also carry: clicking one narrows the results to repos that have all the chosen tags
export function useRelatedTags(args, { mode, selected, enabled }) {
  const base = { ...args, limit: RELATED_SAMPLE, offset: 0 };
  return useQuery({
    queryKey: ['related-tags', base, mode],
    queryFn: async () => { const r = await catalog.query(base); return { sample: r.rows.filter(Boolean).length, tags: tallyTags(r.rows, mode) }; },
    enabled,
    select: (d) => ({ sample: d.sample, tags: d.tags.filter((t) => !selected.includes(t.tag)).slice(0, 12) }),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    retry: 1,
  });
}

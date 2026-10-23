// React Query wrappers around the catalog worker. The snapshot never changes while the site is open, so nothing here goes stale.
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { catalog, connect } from '../data/catalog.js';
import { tokenize } from '../data/catalog_core.js';

export const useManifest = () => useQuery({ queryKey: ['manifest'], queryFn: connect, staleTime: Infinity, retry: 1 });
export const useFacetsData = (enabled) => useQuery({ queryKey: ['facets'], queryFn: () => catalog.facets(), enabled, staleTime: Infinity, retry: 1 });

// words the catalog can actually search for (stop words and single letters are ignored by the tokenizer)
export const searchableWords = (q) => tokenize(q, { max: 12 });

// list / search results; the previous page stays on screen while the next one loads
export const useRepos = (args, { enabled = true } = {}) =>
  useQuery({ queryKey: ['repos', args], queryFn: () => catalog.query(args), enabled, placeholderData: keepPreviousData, staleTime: Infinity, retry: 1 });

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

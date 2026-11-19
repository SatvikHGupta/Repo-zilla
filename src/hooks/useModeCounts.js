import { useQueries } from '@tanstack/react-query';
import { catalog } from '../data/catalog.js';
import { useCatalogMeta } from './catalogMeta.js';

const COUNT_ARGS = { q: '', not: ['f:da'], minStars: 0, maxStars: 0, sort: 'stars', offset: 0, limit: 0, prefixLast: false, rows: false };

// Domain and subdomain counts depend on the tag mode. With auto tags on (auto / both) they are the catalog's own facet counts.
// In real mode repos placed only by auto tags (f:da) are left out, which is counted here with the same query the results use.
export function useModeCounts(keys, mode) {
  const meta = useCatalogMeta();
  const real = mode === 'real';
  const wanted = real ? [...new Set(keys)].filter((k) => (k.startsWith('d:') || k.startsWith('s:')) && k !== 'd:' + meta.fallback) : [];
  const results = useQueries({
    queries: wanted.map((key) => ({ queryKey: ['mode-count', key], staleTime: Infinity, retry: 1, queryFn: async () => (await catalog.query({ ...COUNT_ARGS, all: [[key]] })).total })),
  });
  const byKey = new Map(wanted.map((k, i) => [k, results[i]]));
  return {
    // a count that is still loading, or failed, falls back to the catalog's own facet count
    count: (key) => (byKey.get(key)?.data !== undefined ? byKey.get(key).data : meta.count(key)),
    // only a count that is still loading is dimmed: a failed one would otherwise stay dimmed forever
    pending: (key) => byKey.get(key)?.isPending === true,
    anyPending: results.some((r) => r.isPending),
  };
}

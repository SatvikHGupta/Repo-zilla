// Everything the UI derives from manifest + facets, built once and shared through context (see CatalogGate).
import { createContext, useContext } from 'react';
import { langLabel, licKeysByGroup, LIC_GROUPS } from '../lib/languages.js';
import { ACTIVITY } from '../lib/activity.js';

export const CatalogMetaContext = createContext(null);
export function useCatalogMeta() {
  const v = useContext(CatalogMetaContext);
  if (!v) throw new Error('useCatalogMeta must be used inside <CatalogGate>');
  return v;
}

const titleCase = (s) => String(s).replace(/(^|[-\s/])(\w)/g, (_, a, b) => (a === '-' || a === '/' ? ' ' : a) + b.toUpperCase());

export function buildMeta(manifest, facets) {
  const counts = facets.counts || {};
  const fallback = facets.fallback || 'uncategorized';
  // facet keys always read s:<domain>/<sub>; accept subdomain ids written with or without the domain prefix
  const subKey = (domainId, id) => [id, `${domainId}/${id}`].find((c) => counts['s:' + c] !== undefined) || (String(id).includes('/') ? id : `${domainId}/${id}`);
  const domains = (facets.domains || []).map((d) => ({ ...d, subdomains: (d.subdomains || []).map((s) => ({ ...s, id: subKey(d.id, s.id) })) }));
  const domainMap = new Map(domains.map((d) => [d.id, d]));
  const subMap = new Map();
  for (const d of domains) for (const s of d.subdomains || []) subMap.set(s.id, s);
  const count = (key) => counts[key] ?? 0;

  const prefixed = (p) => Object.keys(counts).filter((k) => k.startsWith(p)).map((k) => ({ key: k.slice(p.length), count: counts[k] }));
  const languages = prefixed('l:').sort((a, b) => b.count - a.count).map((l) => ({ ...l, label: langLabel(l.key) }));
  const years = prefixed('y:').sort((a, b) => (a.key < b.key ? 1 : -1));
  const licKeys = licKeysByGroup(counts);
  const licGroups = LIC_GROUPS.map((g) => ({ ...g, count: licKeys[g.id].reduce((n, k) => n + count(k), 0) }));

  return {
    manifest, facets, counts, count, fallback, languages, years, licKeys, licGroups,
    total: manifest.repos, snapshot: manifest.snapshot_date,
    // domains with a real taxonomy first, the fallback bucket separately
    domains: domains.filter((d) => d.id !== fallback), hasFallback: count('d:' + fallback) > 0,
    allDomains: domains,
    domainName: (id) => domainMap.get(id)?.name || (id === fallback ? 'Uncategorized' : titleCase(id)),
    subName: (id) => subMap.get(id)?.name || titleCase(String(id).split('/').pop()),
    subsOf: (id) => domainMap.get(id)?.subdomains || [],
    names: {
      domain: (id) => domainMap.get(id)?.name || (id === fallback ? 'Uncategorized' : titleCase(id)),
      sub: (id) => subMap.get(id)?.name || titleCase(String(id).split('/').pop()),
      lang: (k) => langLabel(k),
      act: (id) => ACTIVITY[id]?.label || id,
      lic: (id) => LIC_GROUPS.find((g) => g.id === id)?.label || id,
    },
  };
}

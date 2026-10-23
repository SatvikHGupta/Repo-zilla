// Filter model for the search page: URL <-> filters, filters -> catalog query arguments, and the removable chips shown above the results.
import { LIC_GROUPS } from './languages.js';
import { ACTIVITY_ORDER } from './activity.js';

export const PAGE_SIZES = [25, 50, 100];
export const SORTS = [
  { id: 'stars', label: 'Most starred' },
  { id: 'forks-desc', label: 'Most forks' },
  { id: 'name-asc', label: 'Name A to Z' },
  { id: 'name-desc', label: 'Name Z to A' },
  { id: 'size-asc', label: 'Size: smallest first' },
  { id: 'size-desc', label: 'Size: largest first' },
  { id: 'created-desc', label: 'Created: newest first' },
  { id: 'created-asc', label: 'Created: oldest first' },
];
export const TAG_MODES = [
  { id: 'real', label: 'Real' },
  { id: 'auto', label: 'Auto' },
  { id: 'both', label: 'Both' },
];
const OWNERS = ['user', 'organization'];
const MAX_TEXT = 100, MAX_ITEMS = 16, MAX_PAGE = 100000, MAX_STARS = 10_000_000;

export const DEFAULT_FILTERS = Object.freeze({
  q: '', domains: [], subs: [], langs: [], tags: [], tagMode: 'real', stars: 0, starsMax: 0,
  acts: [], years: [], owner: '', lics: [], hideArchived: false, hideGone: false, homepage: false, noTopics: false, sort: 'stars', page: 1,
});

const cleanKey = (v) => { const s = String(v).trim().toLowerCase().slice(0, 60); return s && !/[\s\p{Cc}]/u.test(s) ? s : ''; };
const uniq = (arr) => [...new Set(arr)].slice(0, MAX_ITEMS);
const multi = (p, key, ok = cleanKey) => uniq(p.getAll(key).map(ok).filter(Boolean));
const inSet = (set) => (v) => (set.includes(cleanKey(v)) ? cleanKey(v) : '');
const count = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 && n <= MAX_STARS ? n : 0; };

// accepts URLSearchParams or a query string; anything invalid is dropped, never thrown
// defaultTagMode is the visitor's saved choice, used when the URL does not say
export function parseFilters(input, { defaultTagMode = 'real' } = {}) {
  const p = input instanceof URLSearchParams ? input : new URLSearchParams(input || '');
  const f = { ...DEFAULT_FILTERS };
  f.q = String(p.get('q') || '').trim().slice(0, MAX_TEXT);
  f.domains = multi(p, 'domain');
  f.subs = multi(p, 'sub');
  f.langs = multi(p, 'lang');
  f.tags = multi(p, 'tag');
  const mode = cleanKey(p.get('tags') || '');
  f.tagMode = TAG_MODES.some((m) => m.id === mode) ? mode : defaultTagMode;
  f.stars = count(p.get('stars'));
  f.starsMax = count(p.get('starsmax'));
  if (f.stars && f.starsMax && f.stars > f.starsMax) [f.stars, f.starsMax] = [f.starsMax, f.stars];
  f.acts = multi(p, 'act', inSet(ACTIVITY_ORDER));
  f.years = multi(p, 'year', (v) => (/^\d{4}$/.test(String(v).trim()) ? String(v).trim() : ''));
  const owner = cleanKey(p.get('owner') || '');
  f.owner = OWNERS.includes(owner) ? owner : '';
  f.lics = multi(p, 'lic', inSet(LIC_GROUPS.map((g) => g.id)));
  f.hideArchived = p.get('noarchived') === '1';
  f.hideGone = p.get('nogone') === '1';
  f.homepage = p.get('hp') === '1';
  f.noTopics = p.get('nt') === '1';
  const sort = String(p.get('sort') || '');
  f.sort = SORTS.some((s) => s.id === sort) ? sort : 'stars';
  const page = Number(p.get('page'));
  f.page = Number.isInteger(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1;
  return f;
}

// only non-default values are written, in a fixed order, so equal filters always give an equal URL
export function buildSearchParams(f, { omit = [], defaultTagMode = 'real' } = {}) {
  const p = new URLSearchParams();
  const skip = new Set(omit);
  if (f.q) p.set('q', f.q);
  if (!skip.has('domains')) for (const v of f.domains) p.append('domain', v);
  if (!skip.has('subs')) for (const v of f.subs) p.append('sub', v);
  for (const v of f.langs) p.append('lang', v);
  for (const v of f.tags) p.append('tag', v);
  // a link with tag filters always says which kind of tags it means; otherwise only a non-default mode is written
  if (f.tags.length || f.tagMode !== defaultTagMode) p.set('tags', f.tagMode);
  if (f.stars) p.set('stars', String(f.stars));
  if (f.starsMax) p.set('starsmax', String(f.starsMax));
  for (const v of f.acts) p.append('act', v);
  for (const v of f.years) p.append('year', v);
  if (f.owner) p.set('owner', f.owner);
  for (const v of f.lics) p.append('lic', v);
  if (f.hideArchived) p.set('noarchived', '1');
  if (f.hideGone) p.set('nogone', '1');
  if (f.homepage) p.set('hp', '1');
  if (f.noTopics) p.set('nt', '1');
  if (f.sort !== 'stars') p.set('sort', f.sort);
  if (f.page > 1) p.set('page', String(f.page));
  return p;
}

// filters -> arguments for catalog.query. By default nothing is hidden, so the total matches the catalog size.
export function toQueryArgs(f, { limit = 50, offset = 0, licKeys = {}, rows = true } = {}) {
  const all = [];
  if (f.domains.length) all.push(f.domains.map((d) => 'd:' + d));
  if (f.subs.length) all.push(f.subs.map((s) => 's:' + s));
  if (f.langs.length) all.push(f.langs.map((l) => 'l:' + l));
  // a tag is matched as a real tag, as an auto tag, or as either, depending on the tag mode
  for (const t of f.tags) all.push(f.tagMode === 'auto' ? ['a:' + t] : f.tagMode === 'both' ? ['t:' + t, 'a:' + t] : ['t:' + t]);
  if (f.acts.length) all.push(f.acts.map((a) => 'act:' + a));
  if (f.years.length) all.push(f.years.map((y) => 'y:' + y));
  if (f.owner) all.push(['o:' + f.owner]);
  if (f.lics.length) {
    const keys = f.lics.flatMap((g) => licKeys[g] || []);
    all.push(keys.length ? keys : ['lic:__none__']); // an empty OR group must match nothing, not everything
  }
  if (f.homepage) all.push(['f:hp']);
  if (f.noTopics) all.push(['f:nt']);
  const not = [];
  if (f.hideArchived) not.push('f:ar');
  if (f.hideGone) not.push('f:gone');
  // in real mode a domain only holds repos whose domain comes from real tags; auto tags place the other repos (f:da) when they are on
  if ((f.domains.length || f.subs.length) && f.tagMode === 'real') not.push('f:da');
  return { q: f.q, all, not, minStars: f.stars, maxStars: f.starsMax, sort: f.sort, offset, limit, prefixLast: true, rows };
}

const fmt = (n) => n.toLocaleString('en-US');
const starsLabel = (min, max) => (min && max ? `${fmt(min)} to ${fmt(max)} stars` : min ? `${fmt(min)}+ stars` : `Up to ${fmt(max)} stars`);

// chips above the results: each knows which single value to remove
export function describeFilters(f, names) {
  const chips = [];
  const add = (key, value, label, group) => chips.push({ key, value, label, group });
  for (const v of f.domains) add('domains', v, names.domain(v), 'Domain');
  for (const v of f.subs) add('subs', v, names.sub(v), 'Subdomain');
  for (const v of f.langs) add('langs', v, names.lang(v), 'Language');
  for (const v of f.tags) add('tags', v, v, f.tagMode === 'auto' ? 'Auto tag' : 'Tag');
  if (f.stars || f.starsMax) add('stars', 'range', starsLabel(f.stars, f.starsMax), 'Stars');
  for (const v of f.acts) add('acts', v, names.act(v), 'Activity');
  for (const v of f.years) add('years', v, `Created ${v}`, 'Year');
  if (f.owner) add('owner', f.owner, f.owner === 'organization' ? 'Organizations' : 'Users', 'Owner');
  for (const v of f.lics) add('lics', v, names.lic(v), 'License');
  if (f.hideArchived) add('hideArchived', true, 'Archived hidden', 'Archived');
  if (f.hideGone) add('hideGone', true, 'No longer on GitHub hidden', 'Removed');
  if (f.homepage) add('homepage', true, 'Has homepage', 'Homepage');
  if (f.noTopics) add('noTopics', true, 'No GitHub topics', 'Topics');
  return chips;
}

export function removeFilter(f, chip) {
  const next = { ...f, page: 1 };
  if (chip.key === 'stars') { next.stars = 0; next.starsMax = 0; }
  else if (Array.isArray(f[chip.key])) next[chip.key] = f[chip.key].filter((v) => v !== chip.value);
  else next[chip.key] = DEFAULT_FILTERS[chip.key];
  return next;
}

// the text, the tag mode and the sort are kept, everything else goes back to default
export const clearFilters = (f, keep = {}) => ({ ...DEFAULT_FILTERS, q: f.q, tagMode: f.tagMode, sort: f.sort, ...keep });

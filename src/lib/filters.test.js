import { describe, it, expect } from 'vitest';
import { DEFAULT_FILTERS, parseFilters, buildSearchParams, toQueryArgs, describeFilters, removeFilter, clearFilters, SORTS } from './filters.js';

const names = { domain: (v) => v, sub: (v) => v, lang: (v) => v, act: (v) => v, lic: (v) => v };

describe('parseFilters', () => {
  it('returns defaults for an empty query', () => {
    expect(parseFilters('')).toEqual(DEFAULT_FILTERS);
  });
  it('drops invalid values instead of throwing', () => {
    const f = parseFilters('stars=-7&starsmax=abc&act=nope&year=20x6&owner=alien&lic=gpl&page=-3&sort=random&tags=nope&q=' + 'x'.repeat(300));
    expect(f.stars).toBe(0);
    expect(f.starsMax).toBe(0);
    expect(f.acts).toEqual([]);
    expect(f.years).toEqual([]);
    expect(f.owner).toBe('');
    expect(f.lics).toEqual([]);
    expect(f.page).toBe(1);
    expect(f.sort).toBe('stars');
    expect(f.tagMode).toBe('real');
    expect(f.q.length).toBe(100);
  });
  it('dedupes, lower-cases and caps repeated params', () => {
    const f = parseFilters('tag=AI&tag=ai&tag=ml&' + Array.from({ length: 40 }, (_, i) => `lang=l${i}`).join('&'));
    expect(f.tags).toEqual(['ai', 'ml']);
    expect(f.langs.length).toBe(16);
  });
  it('reads any star count and swaps a reversed range', () => {
    expect(parseFilters('stars=1234&starsmax=98765')).toMatchObject({ stars: 1234, starsMax: 98765 });
    expect(parseFilters('stars=9000&starsmax=300')).toMatchObject({ stars: 300, starsMax: 9000 });
    expect(parseFilters('starsmax=500')).toMatchObject({ stars: 0, starsMax: 500 });
  });
  it('reads the tag mode and every sort', () => {
    expect(parseFilters('tags=auto').tagMode).toBe('auto');
    expect(parseFilters('tags=both').tagMode).toBe('both');
    for (const s of SORTS) expect(parseFilters('sort=' + s.id).sort).toBe(s.id);
  });
});

describe('buildSearchParams', () => {
  it('writes nothing for defaults and round-trips real filters', () => {
    expect(buildSearchParams(DEFAULT_FILTERS).toString()).toBe('');
    const f = { ...DEFAULT_FILTERS, q: 'vector db', langs: ['rust', 'go'], tags: ['ai'], tagMode: 'both', stars: 1234, starsMax: 50000, acts: ['a3'], years: ['2024'], owner: 'organization', lics: ['permissive'], hideArchived: true, hideGone: true, sort: 'name-desc', page: 3 };
    expect(parseFilters(buildSearchParams(f))).toEqual(f);
  });
  it('can omit a locked scope from the URL', () => {
    const f = { ...DEFAULT_FILTERS, domains: ['ai-ml'], subs: ['ai-ml/llm'], langs: ['python'] };
    expect(buildSearchParams(f, { omit: ['domains'] }).toString()).toBe('sub=ai-ml%2Fllm&lang=python');
  });
});

describe('toQueryArgs', () => {
  it('hides nothing by default, so the total matches the catalog size', () => {
    expect(toQueryArgs(DEFAULT_FILTERS)).toMatchObject({ q: '', all: [], not: [], minStars: 0, maxStars: 0, sort: 'stars', offset: 0, limit: 50, prefixLast: true });
  });
  it('hides archived and removed repos only when asked', () => {
    expect(toQueryArgs({ ...DEFAULT_FILTERS, hideArchived: true }).not).toEqual(['f:ar']);
    expect(toQueryArgs({ ...DEFAULT_FILTERS, hideArchived: true, hideGone: true }).not).toEqual(['f:ar', 'f:gone']);
  });
  it('matches real, auto or both kinds of tag depending on the mode', () => {
    expect(toQueryArgs({ ...DEFAULT_FILTERS, tags: ['ai'] }).all).toEqual([['t:ai']]);
    expect(toQueryArgs({ ...DEFAULT_FILTERS, tags: ['ai'], tagMode: 'auto' }).all).toEqual([['a:ai']]);
    expect(toQueryArgs({ ...DEFAULT_FILTERS, tags: ['ai'], tagMode: 'both' }).all).toEqual([['t:ai', 'a:ai']]);
  });
  it('builds OR groups for multi-select facets', () => {
    const a = toQueryArgs({ ...DEFAULT_FILTERS, langs: ['rust', 'go'], acts: ['a3', 'a12'], owner: 'user' });
    expect(a.all).toEqual([['l:rust', 'l:go'], ['act:a3', 'act:a12'], ['o:user']]);
  });
  it('passes the star range and the sort straight through', () => {
    expect(toQueryArgs({ ...DEFAULT_FILTERS, stars: 1234, starsMax: 9876, sort: 'size-desc' })).toMatchObject({ minStars: 1234, maxStars: 9876, sort: 'size-desc' });
  });
  it('expands license groups through the facet keys and never matches everything for an empty group', () => {
    const licKeys = { permissive: ['lic:mit', 'lic:isc'], copyleft: [], other: [], none: ['lic:none'] };
    expect(toQueryArgs({ ...DEFAULT_FILTERS, lics: ['permissive'] }, { licKeys }).all).toEqual([['lic:mit', 'lic:isc']]);
    expect(toQueryArgs({ ...DEFAULT_FILTERS, lics: ['copyleft'] }, { licKeys }).all).toEqual([['lic:__none__']]);
  });
  it('passes paging and count-only mode through', () => {
    expect(toQueryArgs(DEFAULT_FILTERS, { limit: 0, offset: 0, rows: false })).toMatchObject({ limit: 0, rows: false });
  });
});

describe('chips', () => {
  it('describes and removes a single value', () => {
    const f = { ...DEFAULT_FILTERS, langs: ['rust', 'go'], stars: 500, starsMax: 5000, hideGone: true, page: 4 };
    const chips = describeFilters(f, names);
    expect(chips.map((c) => c.label)).toEqual(['rust', 'go', '500 to 5,000 stars', 'No longer on GitHub hidden']);
    expect(removeFilter(f, chips[0])).toMatchObject({ langs: ['go'], page: 1 });
    expect(removeFilter(f, chips[2])).toMatchObject({ stars: 0, starsMax: 0 });
    expect(removeFilter(f, chips[3]).hideGone).toBe(false);
  });
  it('labels open-ended star ranges', () => {
    expect(describeFilters({ ...DEFAULT_FILTERS, stars: 1000 }, names)[0].label).toBe('1,000+ stars');
    expect(describeFilters({ ...DEFAULT_FILTERS, starsMax: 300 }, names)[0].label).toBe('Up to 300 stars');
  });
  it('clearFilters keeps the text, the tag mode and the sort', () => {
    expect(clearFilters({ ...DEFAULT_FILTERS, q: 'x', tagMode: 'both', sort: 'name-asc', langs: ['go'] })).toMatchObject({ q: 'x', tagMode: 'both', sort: 'name-asc', langs: [] });
  });
});

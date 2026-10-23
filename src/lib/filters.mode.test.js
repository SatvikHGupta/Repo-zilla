import { describe, it, expect } from 'vitest';
import { DEFAULT_FILTERS, parseFilters, buildSearchParams, toQueryArgs } from './filters.js';

describe('tag mode default and URL', () => {
  it('uses the saved mode when the URL has none, and the URL when it has one', () => {
    expect(parseFilters('', { defaultTagMode: 'both' }).tagMode).toBe('both');
    expect(parseFilters('tags=real', { defaultTagMode: 'both' }).tagMode).toBe('real');
    expect(parseFilters('tags=bogus', { defaultTagMode: 'auto' }).tagMode).toBe('auto');
  });
  it('writes the mode only when it differs from the saved one, or when tags are selected', () => {
    expect(buildSearchParams({ ...DEFAULT_FILTERS, tagMode: 'both' }, { defaultTagMode: 'both' }).toString()).toBe('');
    expect(buildSearchParams({ ...DEFAULT_FILTERS, tagMode: 'real' }, { defaultTagMode: 'both' }).toString()).toBe('tags=real');
    expect(buildSearchParams({ ...DEFAULT_FILTERS, tags: ['ai'], tagMode: 'real' }).toString()).toBe('tag=ai&tags=real');
  });
  it('round-trips with a saved mode', () => {
    const f = { ...DEFAULT_FILTERS, tags: ['ai'], tagMode: 'both', langs: ['go'] };
    expect(parseFilters(buildSearchParams(f, { defaultTagMode: 'real' }), { defaultTagMode: 'real' })).toEqual(f);
  });
});

describe('domains and auto tags', () => {
  it('in real mode a domain or subdomain excludes repos placed only by auto tags', () => {
    expect(toQueryArgs({ ...DEFAULT_FILTERS, domains: ['ai-ml'] }).not).toEqual(['f:da']);
    expect(toQueryArgs({ ...DEFAULT_FILTERS, subs: ['ai-ml/llm'] }).not).toEqual(['f:da']);
  });
  it('with auto tags on (auto or both) they are included', () => {
    expect(toQueryArgs({ ...DEFAULT_FILTERS, domains: ['ai-ml'], tagMode: 'both' }).not).toEqual([]);
    expect(toQueryArgs({ ...DEFAULT_FILTERS, domains: ['ai-ml'], tagMode: 'auto' }).not).toEqual([]);
  });
  it('never touches the result count when no domain is selected', () => {
    expect(toQueryArgs(DEFAULT_FILTERS).not).toEqual([]);
  });
});

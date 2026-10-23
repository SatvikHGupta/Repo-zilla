import { describe, it, expect } from 'vitest';
import { fmtCompact, fmtMonth, fmtDate, fmtSize, fmtAge, fmtNum } from './format.js';
import { safeHttpUrl, repoPath, splitName, isValidRepoRef, displayHost } from './links.js';
import { langLabel, licGroupOf, licKeysByGroup, licLabel } from './languages.js';
import { bandOf, bandOfMonth } from './activity.js';

describe('format', () => {
  it('compacts counts', () => {
    expect([999, 1000, 1234, 12345, 123456, 1500000, 12000000].map(fmtCompact)).toEqual(['999', '1k', '1.2k', '12.3k', '123k', '1.5M', '12M']);
    expect(fmtNum(838136)).toBe('838,136');
  });
  it('formats months, dates, sizes and age in UTC', () => {
    expect(fmtMonth('2026-09')).toBe('Sep 2026');
    expect(fmtMonth('2026-13')).toBe('');
    expect(fmtDate('2023-03-12T23:59:59Z')).toBe('12 Mar 2023');
    expect(fmtSize(820)).toBe('820 KB');
    expect(fmtSize(1536)).toBe('1.5 MB');
    expect(fmtSize(3 * 1048576)).toBe('3.0 GB');
    expect(fmtAge('2020-10-12T00:00:00Z', '2026-10-12T00:00:00Z')).toBe('6 years');
    expect(fmtAge('2026-09-01T00:00:00Z', '2026-10-12T00:00:00Z')).toBe('1 month');
    expect(fmtAge('2026-10-01T00:00:00Z', '2026-10-12T00:00:00Z')).toBe('under a month');
    expect(fmtAge('2023-07-20T00:00:00Z', '2026-10-12T00:00:00Z')).toBe('3y 2m');
  });
});

describe('links', () => {
  it('only lets http(s) homepages through and fixes bare hosts', () => {
    expect(safeHttpUrl('example.com/docs')).toBe('https://example.com/docs');
    expect(safeHttpUrl('http://example.com')).toBe('http://example.com/');
    for (const bad of ['javascript:alert(1)', 'data:text/html,hi', 'ftp://x.org', 'not a url', '']) expect(safeHttpUrl(bad)).toBeNull();
    expect(displayHost('https://www.example.com/x')).toBe('example.com');
  });
  it('builds and validates repo routes', () => {
    expect(splitName('a/b')).toEqual({ owner: 'a', name: 'b' });
    expect(repoPath('facebook/react')).toBe('/repo/facebook/react');
    expect(isValidRepoRef('facebook', 'react')).toBe(true);
    expect(isValidRepoRef('..', 'x')).toBe(false);
    expect(isValidRepoRef('a', 'b/c')).toBe(false);
  });
});

describe('languages and licenses', () => {
  it('labels known and unknown keys', () => {
    expect(langLabel('c++')).toBe('C++');
    expect(langLabel('jupyter notebook')).toBe('Jupyter Notebook');
    expect(langLabel('tree-sitter query')).toBe('Tree-Sitter Query');
    expect(licLabel('apache-2.0')).toBe('Apache-2.0');
  });
  it('groups licenses', () => {
    expect(licGroupOf('mit')).toBe('permissive');
    expect(licGroupOf('bsd-3-clause')).toBe('permissive');
    expect(licGroupOf('gpl-3.0')).toBe('copyleft');
    expect(licGroupOf('agpl-3.0')).toBe('copyleft');
    expect(licGroupOf('noassertion')).toBe('none');
    expect(licGroupOf('some-odd-license')).toBe('other');
    const keys = licKeysByGroup({ 'lic:mit': 5, 'lic:gpl-3.0': 2, 'lic:none': 1, 'l:go': 9 });
    expect(keys).toEqual({ permissive: ['lic:mit'], copyleft: ['lic:gpl-3.0'], other: [], none: ['lic:none'] });
  });
});

describe('activity', () => {
  const snap = '2026-10-12T00:00:00Z';
  it('uses the same bands as the facet', () => {
    expect(bandOf('2026-09-01T00:00:00Z', snap)).toBe('a3');
    expect(bandOf('2026-01-01T00:00:00Z', snap)).toBe('a12');
    expect(bandOf('2024-06-01T00:00:00Z', snap)).toBe('a36');
    expect(bandOf('2019-06-01T00:00:00Z', snap)).toBe('old');
    expect(bandOf(undefined, snap)).toBe('none');
  });
  it('approximates list rows from the commit month', () => {
    expect(bandOfMonth('2026-09', snap)).toBe('a3');
    expect(bandOfMonth('2019-06', snap)).toBe('old');
    expect(bandOfMonth(undefined, snap)).toBe('none');
  });
});

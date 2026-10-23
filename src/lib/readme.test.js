import { describe, it, expect } from 'vitest';
import { readmeKind, resolveRepoUrl, headingSlug } from './readme.js';

const ctx = { fullName: 'acme/tool', branch: 'main' };

describe('readmeKind', () => {
  it('renders markdown for README.md or a missing file name', () => {
    expect(readmeKind(undefined)).toBe('markdown');
    expect(readmeKind('README.MD')).toBe('markdown');
    expect(readmeKind('readme.markdown')).toBe('markdown');
    expect(readmeKind('README.mdx')).toBe('markdown');
  });
  it('keeps every other format as plain text', () => {
    for (const f of ['README.rst', 'README.adoc', 'README.txt', 'README', 'readme.html', 'README.org', 'README.textile']) expect(readmeKind(f)).toBe('text');
  });
});

describe('resolveRepoUrl', () => {
  it('rewrites relative links to blob and images to raw, on the default branch', () => {
    expect(resolveRepoUrl('docs/guide.md', ctx)).toBe('https://github.com/acme/tool/blob/main/docs/guide.md');
    expect(resolveRepoUrl('./img/a b.png', { ...ctx, mode: 'raw' })).toBe('https://raw.githubusercontent.com/acme/tool/main/img/a%20b.png');
    expect(resolveRepoUrl('/LICENSE', ctx)).toBe('https://github.com/acme/tool/blob/main/LICENSE');
    expect(resolveRepoUrl('x.md', { ...ctx, branch: 'master' })).toBe('https://github.com/acme/tool/blob/master/x.md');
  });
  it('keeps anchors and http(s), allows mailto for links only', () => {
    expect(resolveRepoUrl('#install', ctx)).toBe('#install');
    expect(resolveRepoUrl('https://example.com/a?b=1', ctx)).toBe('https://example.com/a?b=1');
    expect(resolveRepoUrl('//cdn.example.com/x.png', ctx)).toBe('https://cdn.example.com/x.png');
    expect(resolveRepoUrl('mailto:a@b.co', ctx)).toBe('mailto:a@b.co');
    expect(resolveRepoUrl('mailto:a@b.co', { ...ctx, mode: 'raw' })).toBeNull();
  });
  it('rejects dangerous schemes and paths that leave the repo', () => {
    for (const bad of ['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'data:text/html;base64,AAAA', 'vbscript:x', 'file:///etc/passwd']) expect(resolveRepoUrl(bad, ctx)).toBeNull();
    expect(resolveRepoUrl('../../../evil/repo', ctx)).toBeNull();
    expect(resolveRepoUrl('', ctx)).toBeNull();
  });
});

describe('headingSlug', () => {
  it('matches the GitHub style and de-duplicates', () => {
    const seen = new Map();
    expect(headingSlug('Getting Started!', seen)).toBe('getting-started');
    expect(headingSlug('Getting Started!', seen)).toBe('getting-started-1');
    expect(headingSlug('API & Usage', new Map())).toBe('api--usage');
    expect(headingSlug('日本語 Guide', new Map())).toBe('日本語-guide');
    expect(headingSlug('!!!', new Map())).toBe('section');
  });
});

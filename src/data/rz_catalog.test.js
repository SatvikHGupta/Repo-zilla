import { describe, it, expect } from 'vitest';
import zlib from 'node:zlib';
import { RzCatalog } from './rz_catalog.js';

// 25 repos, rank 0 = most starred: stars 1000, 990, ... 760
const N = 25, stars = Array.from({ length: N }, (_, i) => 1000 - i * 10);
const gzJson = (v) => zlib.gzipSync(Buffer.from(JSON.stringify(v)));
const gzOrder = (arr) => zlib.gzipSync(Buffer.from(Uint32Array.from(arr).buffer));

function makeCatalog({ marks = false, sorts = true } = {}) {
  const files = {};
  const manifest = { repos: N, block: 10, slim_block: 10, lookup_buckets: 1, partitions: 1, star_thresholds: [{ min_stars: 900, ranks: 11 }, { min_stars: 800, ranks: 21 }, { min_stars: 500, ranks: 25 }] };
  if (marks) manifest.star_marks = { every: 10, stars: [stars[0], stars[10], stars[20]] };
  const rev = Array.from({ length: N }, (_, i) => N - 1 - i);
  if (sorts) { manifest.sorts = { 'forks-desc': { file: 'sort/forks-desc.bin.gz' } }; files['sort/forks-desc.bin.gz'] = gzOrder(rev); }
  files['manifest.json'] = Buffer.from(JSON.stringify(manifest));
  for (let b = 0; b * 10 < N; b++) files[`slim/sl-${String(b).padStart(5, '0')}.json.gz`] = gzJson(stars.slice(b * 10, b * 10 + 10).map((s, i) => ({ n: `o/r${b * 10 + i}`, s })));
  const reads = [];
  const cat = new RzCatalog({ read: async (rel) => { reads.push(rel); return files[rel] || null; }, gunzip: (u8) => new Uint8Array(zlib.gunzipSync(u8)) });
  return { cat, reads };
}

describe('star ranges', () => {
  it.each([false, true])('counts repos with at least x stars (marks: %s)', async (marks) => {
    const { cat } = makeCatalog({ marks });
    await cat.init();
    expect(await cat.countAtLeast(1000)).toBe(1);   // only rank 0
    expect(await cat.countAtLeast(995)).toBe(1);
    expect(await cat.countAtLeast(900)).toBe(11);   // exact threshold
    expect(await cat.countAtLeast(851)).toBe(15);   // 1000..860 -> ranks 0..14
    expect(await cat.countAtLeast(850)).toBe(16);
    expect(await cat.countAtLeast(761)).toBe(24);
    expect(await cat.countAtLeast(760)).toBe(25);
    expect(await cat.countAtLeast(5000)).toBe(0);
    expect(await cat.countAtLeast(0)).toBe(25);
  });
  it('queries an inclusive min-max window without any posting lists', async () => {
    const { cat } = makeCatalog();
    await cat.init();
    const r = await cat.query({ minStars: 850, maxStars: 900, limit: 100 });
    expect(r.total).toBe(6);
    expect(r.ranks).toEqual([10, 11, 12, 13, 14, 15]);
    expect(r.rows.map((x) => x.s)).toEqual([900, 890, 880, 870, 860, 850]);
    expect((await cat.query({ minStars: 900, maxStars: 800 })).total).toBe(0);
    expect((await cat.query({ maxStars: 1000, limit: 3 })).ranks).toEqual([0, 1, 2]);
  });
  it('reads one slim block per boundary when marks are available', async () => {
    const { cat, reads } = makeCatalog({ marks: true });
    await cat.init();
    await cat.countAtLeast(851);
    expect(reads.filter((r) => r.startsWith('slim/')).length).toBe(1);
  });
});

describe('sorting', () => {
  it('pages the whole window straight from the index', async () => {
    const { cat } = makeCatalog();
    await cat.init();
    const r = await cat.query({ sort: 'forks-desc', offset: 2, limit: 3, rows: false });
    expect(r.ranks).toEqual([22, 21, 20]);
    expect(r.total).toBe(25);
  });
  it('sorts a filtered subset and keeps the star window', async () => {
    const { cat } = makeCatalog();
    await cat.init();
    cat.count = async (k) => (k === 'x' ? 6 : 0);
    cat.list = async (k) => (k === 'x' ? Uint32Array.from([1, 4, 7, 12, 18, 22]) : new Uint32Array(0));
    const r = await cat.query({ all: ['x'], sort: 'forks-desc', limit: 10, rows: false });
    expect(r.ranks).toEqual([22, 18, 12, 7, 4, 1]);
    const w = await cat.query({ all: ['x'], sort: 'forks-desc', minStars: 800, limit: 10, rows: false }); // ranks 0..20 only
    expect(w.ranks).toEqual([18, 12, 7, 4, 1]);
    const n = await cat.query({ all: ['x'], not: ['y'], limit: 10, rows: false });
    expect(n.ranks).toEqual([1, 4, 7, 12, 18, 22]);
  });
  it('explains a missing sort index instead of failing silently', async () => {
    const { cat } = makeCatalog({ sorts: false });
    await cat.init();
    await expect(cat.query({ sort: 'name-asc' })).rejects.toThrow(/npm run build:sorts/);
  });
  it('builds the complement for exclusion-only queries inside the window', async () => {
    const { cat } = makeCatalog();
    await cat.init();
    cat.list = async (k) => (k === 'y' ? Uint32Array.from([2, 3, 10]) : new Uint32Array(0));
    const r = await cat.query({ not: ['y'], minStars: 900, limit: 20, rows: false });
    expect(r.ranks).toEqual([0, 1, 4, 5, 6, 7, 8, 9]);
    expect(r.total).toBe(8);
  });
});

// RepoZilla's extension of the pipeline reader (Catalog): any star range, and global sorts read from optional sort indexes.
// The five kit files stay untouched; this file only subclasses Catalog and re-implements query().
import { Catalog, intersect, subtract, union } from './catalog_engine.js';
import { tokenize } from './catalog_core.js';

// the words of a query that are written in CamelCase, with the pieces the index holds for a repo name written that way ("SwiftyJSON" -> swifty, json)
const CAMEL = /[a-z0-9][A-Z]|[A-Z]{2,}[a-z]/;
const CAMEL_COMMON = 200; // a compound found in this many documents is treated as an ordinary word
function camelWords(q) {
  const words = String(q || '').split(/[^\p{L}\p{N}]+/u).filter(Boolean), out = [];
  words.forEach((w, i) => {
    if (!CAMEL.test(w)) return;
    const parts = tokenize(w, { camel: true, max: 12 });
    if (parts.length > 1) out.push({ compound: tokenize(w, { max: 1 })[0] || null, parts, last: i === words.length - 1 });
  });
  return out;
}

export const SORT_IDS = ['stars', 'forks-desc', 'name-asc', 'name-desc', 'size-asc', 'size-desc', 'created-desc', 'created-asc'];

const toU8 = (b) => (b instanceof Uint8Array ? b : new Uint8Array(b));
// first index whose value is >= v in an ascending typed array
function lowerBound(arr, v) {
  let lo = 0, hi = arr.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] < v) lo = m + 1; else hi = m; }
  return lo;
}

export class RzCatalog extends Catalog {
  constructor(opts) {
    super(opts);
    this.starCounts = new Map();
    this.sortIndexes = new Map();
  }

  async starsAt(rank) { const [row] = await this.slimRows([rank]); return row ? row.s : 0; }

  // How many repos have at least x stars. Rank order is stars desc, so they are exactly ranks 0..count-1.
  async countAtLeast(x) {
    const n = this.n;
    if (!(x > 0)) return n;
    if (this.starCounts.has(x)) return this.starCounts.get(x);
    const th = this.manifest.star_thresholds || [];
    const exact = th.find((t) => t.min_stars === x);
    if (exact) return exact.ranks;
    // the answer is in [lo, hi]: known thresholds on either side bound it, and so do the block marks written by build-sorts
    let lo = 0, hi = n;
    for (const t of th) { if (t.min_stars < x) hi = Math.min(hi, t.ranks); else if (t.min_stars > x) lo = Math.max(lo, t.ranks); }
    const marks = this.manifest.star_marks;
    if (marks && marks.every > 0 && Array.isArray(marks.stars)) {
      let m = marks.stars.findIndex((s) => s < x);
      if (m < 0) m = marks.stars.length;
      if (m < marks.stars.length) hi = Math.min(hi, m * marks.every);
      if (m > 0) lo = Math.max(lo, (m - 1) * marks.every + 1);
      lo = Math.min(lo, hi);
    }
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((await this.starsAt(mid)) >= x) lo = mid + 1; else hi = mid;
    }
    this.starCounts.set(x, lo);
    return lo;
  }

  // ranks [from, to) hold exactly the repos with minStars <= stars <= maxStars (0 = no bound)
  async starWindow(minStars, maxStars) {
    const to = minStars > 0 ? await this.countAtLeast(minStars) : this.n;
    const from = maxStars > 0 ? await this.countAtLeast(maxStars + 1) : 0;
    return [from, Math.max(from, to)];
  }

  // ascending ranks matching the text, facet groups and exclusions inside [from, to); null means "every rank in the window"
  async matching({ q, all, not, prefixLast, from, to }) {
    const camel = camelWords(q);
    // a CamelCase word that is probably a repo name is handled as a group below, so its lower-case compound is not also an AND term
    const toks = tokenize(q, { max: 12 }).filter((t) => !camel.some((c) => c.compound === t)), groups = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i], last = i === toks.length - 1 && !camel.some((c) => c.last);
      groups.push({ est: await this.count('w:' + t), get: () => this.resolveTerm(t, prefixLast && last) });
    }
    for (const c of camel) {
      const compoundHits = c.compound ? await this.count('w:' + c.compound) : 0;
      // a compound that many documents already contain ("javascript") is an ordinary word: search it as typed. A rare one ("swiftyjson") is likely a name,
      // and names are indexed split into their pieces (swifty, json), so the pieces are searched too
      if (compoundHits >= CAMEL_COMMON) { if (c.compound) groups.push({ est: compoundHits, get: () => this.resolveTerm(c.compound, prefixLast && c.last) }); continue; }
      const partCounts = await Promise.all(c.parts.map((p) => this.count('w:' + p)));
      groups.push({
        est: compoundHits + Math.min(...partCounts),
        get: async () => {
          const lists = [];
          if (c.compound) lists.push(await this.resolveTerm(c.compound, prefixLast && c.last));
          const pieces = await Promise.all(c.parts.map((p, i) => this.resolveTerm(p, prefixLast && c.last && i === c.parts.length - 1)));
          lists.push(pieces.reduce((a, b) => intersect(a, b)));
          return union(lists);
        },
      });
    }
    for (const f of all) {
      const keys = Array.isArray(f) ? f : [f];
      let est = 0;
      for (const k of keys) est += await this.count(k);
      groups.push({ est, get: async () => union(await Promise.all(keys.map((k) => this.list(k)))) });
    }
    const clip = (r) => r.subarray(lowerBound(r, from), lowerBound(r, to));
    if (groups.length) {
      groups.sort((a, b) => a.est - b.est);
      if (groups[0].est === 0 && !prefixLast) return new Uint32Array(0);
      let res = clip(await groups[0].get());
      for (let g = 1; g < groups.length && res.length; g++) res = intersect(res, await groups[g].get());
      for (const k of not) if (res.length) res = subtract(res, await this.list(k));
      return res;
    }
    if (not.length) {
      const ex = union(await Promise.all(not.map((k) => this.list(k))));
      const out = new Uint32Array(Math.max(0, to - from));
      let o = 0, j = lowerBound(ex, from);
      for (let r = from; r < to; r++) {
        while (j < ex.length && ex[j] < r) j++;
        if (j < ex.length && ex[j] === r) continue;
        out[o++] = r;
      }
      return out.subarray(0, o);
    }
    return null;
  }

  // a sort index is every rank in that sort's order; `pos` is its inverse. Loaded on first use and kept for the next queries.
  async sortIndex(id) {
    const hit = this.sortIndexes.get(id);
    if (hit) return hit;
    const entry = this.manifest.sorts && this.manifest.sorts[id];
    if (!entry) throw new Error(`The sort "${id}" is not in this data export. The monthly refresh builds the sort files; until the export has it, sort by stars.`);
    const bytes = await this.read(entry.file);
    if (!bytes) throw new Error(`Sort index ${entry.file} is listed in the manifest but missing on the data host.`);
    const raw = await this.gunzip(toU8(bytes));
    const order = new Uint32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
    if (order.length !== this.n) throw new Error(`Sort index ${entry.file} has ${order.length} entries, expected ${this.n}.`);
    const pos = new Uint32Array(this.n);
    for (let i = 0; i < order.length; i++) pos[order[i]] = i;
    if (this.sortIndexes.size >= 2) this.sortIndexes.delete(this.sortIndexes.keys().next().value);
    const idx = { order, pos };
    this.sortIndexes.set(id, idx);
    return idx;
  }

  // one page of `res` (or of the whole window when res is null) in the order of sort `id`
  async pageSorted(id, res, from, to, offset, limit) {
    const { order, pos } = await this.sortIndex(id);
    if (!res && from === 0 && to === this.n) return Array.from(order.subarray(offset, offset + limit));
    const len = res ? res.length : to - from;
    const keys = new Uint32Array(len);
    if (res) for (let i = 0; i < len; i++) keys[i] = pos[res[i]];
    else for (let i = 0; i < len; i++) keys[i] = pos[from + i];
    keys.sort();
    return Array.from(keys.subarray(offset, offset + limit), (k) => order[k]);
  }

  // q: text (AND of words, last word also as prefix with prefixLast). all: [key | [key, ...]] groups (array = OR). not: [key].
  // minStars / maxStars: any integer. sort: one of SORT_IDS, "stars" needs no index.
  async query({ q = '', all = [], not = [], minStars = 0, maxStars = 0, offset = 0, limit = 30, prefixLast = false, rows = true, sort = 'stars' } = {}) {
    const [from, to] = await this.starWindow(minStars, maxStars);
    const res = await this.matching({ q, all, not, prefixLast, from, to });
    const total = res ? res.length : Math.max(0, to - from);
    const end = Math.min(total, offset + limit);
    let ranks = [];
    if (end > offset) {
      if (sort && sort !== 'stars') ranks = await this.pageSorted(sort, res, from, to, offset, limit);
      else if (res) ranks = Array.from(res.subarray(offset, end));
      else for (let r = from + offset; r < from + end; r++) ranks.push(r);
    }
    return { total, ranks, rows: rows ? await this.slimRows(ranks) : undefined };
  }
}

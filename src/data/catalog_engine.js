// catalog_reader.js - reads catalog-data/ (from export_all.js) through ANY byte source and answers repo lookups + filtered / full-text queries over ALL repos.
// ENVIRONMENT-NEUTRAL engine: runs unchanged in Node and in the browser. Needs read(path) -> Promise<Uint8Array|Buffer|null> (null = file does not exist) and gunzip(Uint8Array) -> Uint8Array|Promise.
// Query model: every facet value and every search word is a sorted rank list; AND = intersect, NOT = subtract, OR-group = union. Rank order = stars desc, so
// results come out already sorted and ANY page depth works (offset + limit), total is exact. No result cap.
import { P, decodeList, tokenize, dictShard, lookupBucketOf, partitionOf } from "./catalog_core.js";

const TD = new TextDecoder(), toU8 = (b) => (b instanceof Uint8Array ? b : new Uint8Array(b));

class Lru { // tiny byte-bounded LRU for decoded lists / blocks (a warm serverless instance reuses it between requests)
  constructor(max) { this.max = max; this.size = 0; this.m = new Map(); }
  get(k) { const v = this.m.get(k); if (v === undefined) return undefined; this.m.delete(k); this.m.set(k, v); return v.val; }
  set(k, val, bytes) { if (this.m.has(k)) this.size -= this.m.get(k).bytes; this.m.set(k, { val, bytes }); this.size += bytes; while (this.size > this.max && this.m.size > 1) { const [ok, ov] = this.m.entries().next().value; this.m.delete(ok); this.size -= ov.bytes; } }
}

// intersect two ascending Uint32Arrays (binary-search the small one into the big one when sizes differ a lot)
export function intersect(a, b) {
  if (a.length > b.length) [a, b] = [b, a];
  const out = new Uint32Array(a.length); let o = 0;
  if (b.length > a.length * 16) { let lo = 0; for (let i = 0; i < a.length; i++) { const v = a[i]; let hi = b.length, l = lo; while (l < hi) { const m = (l + hi) >> 1; if (b[m] < v) l = m + 1; else hi = m; } lo = l; if (lo === b.length) break; if (b[lo] === v) out[o++] = v; } }
  else { let i = 0, j = 0; while (i < a.length && j < b.length) { const x = a[i], y = b[j]; if (x === y) { out[o++] = x; i++; j++; } else if (x < y) i++; else j++; } }
  return out.subarray(0, o);
}
export function subtract(a, b) { const out = new Uint32Array(a.length); let o = 0, j = 0; for (let i = 0; i < a.length; i++) { const v = a[i]; while (j < b.length && b[j] < v) j++; if (j < b.length && b[j] === v) continue; out[o++] = v; } return out.subarray(0, o); }
export function union(lists) { if (lists.length === 1) return lists[0]; let n = 0; for (const l of lists) n += l.length; const all = new Uint32Array(n); let o = 0; for (const l of lists) { all.set(l, o); o += l.length; } all.sort(); let u = 0; for (let i = 0; i < all.length; i++) if (i === 0 || all[i] !== all[i - 1]) all[u++] = all[i]; return all.subarray(0, u); }

export class Catalog {
  constructor({ read, gunzip, cacheBytes = 150 * 1048576 }) { if (typeof gunzip !== "function") throw new Error("Catalog needs a gunzip(Uint8Array) function (Node: catalog_reader.js, browser: catalog_client.js)"); this.read = read; this.gunzip = gunzip; this.cache = new Lru(cacheBytes); this.packs = new Map(); this.manifest = null; }
  async json(rel) { const k = "j:" + rel, c = this.cache.get(k); if (c) return c; const b = await this.read(rel); if (!b) return null; const raw = await this.gunzip(toU8(b)), v = JSON.parse(TD.decode(raw)); this.cache.set(k, v, raw.length * 2); return v; }
  async init() { const b = await this.read(P.manifest); if (!b) throw new Error("catalog manifest.json not found"); this.manifest = JSON.parse(TD.decode(toU8(b))); return this.manifest; }
  get n() { return this.manifest.repos; }

  // ---- repos
  async rankOfName(fullName) { const key = fullName.toLowerCase(), m = await this.json(P.lookup(lookupBucketOf(key, this.manifest.lookup_buckets))); return m && Object.hasOwn(m, key) ? m[key] : null; }
  async record(rank) { const B = this.manifest.block, blk = await this.json(P.block(Math.floor(rank / B))); const r = blk && blk[rank % B]; if (!r) return null; return { rank, ...r }; }
  async repo(fullName) { const rank = await this.rankOfName(fullName); if (rank === null) return null; const rec = await this.record(rank); if (rec && rec.has_readme) { const rb = this.manifest.readme_block || this.manifest.block, rm = await this.json(P.readme(Math.floor(rank / rb))); if (rm) rec.readme = rm[rank % rb]; } return rec; }
  // everything the side panel needs for ONE repo opened from a list (rank is known there, so no lookup bucket is fetched)
  async detail(rank) { const rec = await this.record(rank); if (rec && rec.has_readme) { const rb = this.manifest.readme_block || this.manifest.block, rm = await this.json(P.readme(Math.floor(rank / rb))); if (rm) rec.readme = rm[rank % rb]; } return rec; }
  async slimRows(ranks) { const S = this.manifest.slim_block, need = [...new Set(ranks.map((r) => Math.floor(r / S)))], blks = new Map(await Promise.all(need.map(async (b) => [b, await this.json(P.slim(b))]))); return ranks.map((r) => { const row = blks.get(Math.floor(r / S))?.[r % S]; return row ? { rank: r, ...row } : null; }); }

  // ---- posting lists
  async pack(key) { const p = partitionOf(key, this.manifest.partitions), k = "pk:" + p; let v = this.cache.get(k); if (!v) { const b = await this.read(P.pack(p)); if (!b) return null; const raw = await this.gunzip(toU8(b)), dl = new DataView(raw.buffer, raw.byteOffset, raw.byteLength).getUint32(0, true); v = { dir: JSON.parse(TD.decode(raw.subarray(4, 4 + dl))), payload: raw.subarray(4 + dl) }; this.cache.set(k, v, raw.length + 4096); } return v; }
  async count(key) { const pk = await this.pack(key); return pk && Object.hasOwn(pk.dir, key) ? pk.dir[key].c : 0; }
  async list(key) {
    const ck = "l:" + key, hit = this.cache.get(ck); if (hit) return hit;
    const pk = await this.pack(key); if (!pk || !Object.hasOwn(pk.dir, key)) return new Uint32Array(0);
    const e = pk.dir[key]; let arr;
    if (e.b) { const b = await this.read(P.big(key)); if (!b) throw new Error(`big list file missing for ${key}`); arr = decodeList(await this.gunzip(toU8(b)), e.c); }
    else arr = decodeList(pk.payload.subarray(e.o, e.o + e.l), e.c);
    this.cache.set(ck, arr, arr.length * 4 + 64); return arr;
  }

  // ---- dictionaries (autocomplete)
  async tags({ auto = false } = {}) { const d = await this.json(P.dictTags); return d ? (auto ? d.a : d.t) : []; }
  async facets() { return this.json(P.dictFacets); }
  // autocomplete over the tag dictionary (sorted by repo count): [[tag, count], ...]
  async suggestTags(prefix, { auto = false, limit = 10 } = {}) { const p = String(prefix || "").toLowerCase().trim(), all = await this.tags({ auto }), out = []; for (const e of all) { if (!p || e[0].startsWith(p)) { out.push(e); if (out.length >= limit) break; } } return out; }
  async expandPrefix(prefix, limit = 16) { const sh = dictShard(prefix); if (!sh) return []; const d = await this.json(P.dictTokens(sh)); return d ? d.filter(([t]) => t.startsWith(prefix)).slice(0, limit).map(([t]) => t) : []; }

  // ---- query
  // q: free text (AND of words; last word also matches as prefix when prefixLast). all: [key | [key, ...]] facet filters (array = OR group). not: [key]. minStars: uses rank thresholds.
  async resolveTerm(tok, prefixLast) {
    const exact = await this.list("w:" + tok);
    if (!prefixLast || tok.length < 2) return exact;
    const more = (await this.expandPrefix(tok)).filter((t) => t !== tok);
    if (!more.length) return exact;
    return union([exact, ...(await Promise.all(more.map((t) => this.list("w:" + t))))].filter((l) => l.length));
  }
  async query({ q = "", all = [], not = [], minStars = 0, offset = 0, limit = 30, prefixLast = false, rows = true } = {}) {
    const toks = tokenize(q, { max: 12 }), groups = []; // each group = async () => Uint32Array, with a size estimate for ordering
    for (let i = 0; i < toks.length; i++) { const t = toks[i], last = i === toks.length - 1; groups.push({ est: await this.count("w:" + t), get: () => this.resolveTerm(t, prefixLast && last) }); }
    for (const f of all) { const keys = Array.isArray(f) ? f : [f]; let est = 0; for (const k of keys) est += await this.count(k); groups.push({ est, get: async () => union(await Promise.all(keys.map((k) => this.list(k)))) }); }
    let limitRank = this.n; if (minStars > 0) { const th = this.manifest.star_thresholds.find((s) => s.min_stars >= minStars); if (th && th.min_stars === minStars) limitRank = th.ranks; else throw new Error(`minStars must be one of ${this.manifest.star_thresholds.map((s) => s.min_stars).join(", ")}`); }
    let res = null;
    if (groups.length) {
      groups.sort((x, y) => x.est - y.est);
      if (groups[0].est === 0 && !prefixLast) res = new Uint32Array(0);
      else { res = await groups[0].get(); for (let g = 1; g < groups.length && res.length; g++) res = intersect(res, await groups[g].get()); }
      if (limitRank < this.n) { let lo = 0, hi = res.length; while (lo < hi) { const m = (lo + hi) >> 1; if (res[m] < limitRank) lo = m + 1; else hi = m; } res = res.subarray(0, lo); }
      for (const k of not) if (res.length) res = subtract(res, await this.list(k));
    } else if (not.length) { // pure NOT: walk ranks lazily is wasteful; build complement of the union
      const ex = union(await Promise.all(not.map((k) => this.list(k)))); res = new Uint32Array(limitRank - Math.min(ex.length, limitRank)); let o = 0, j = 0; for (let r = 0; r < limitRank; r++) { while (j < ex.length && ex[j] < r) j++; if (j < ex.length && ex[j] === r) continue; res[o++] = r; }
    }
    const total = res ? res.length : limitRank;
    const page = []; const end = Math.min(total, offset + limit);
    if (res) for (let i = offset; i < end; i++) page.push(res[i]); else for (let r = offset; r < end; r++) page.push(r);
    return { total, ranks: page, rows: rows ? await this.slimRows(page) : undefined };
  }
}

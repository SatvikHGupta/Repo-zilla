// Environment-neutral helpers shared by the exporter (Node) and the readers (Node + browser): hashing, posting-list decoding, tokenizer, facet keys, paths.
// No Node APIs here (no zlib, no Buffer, no fs) so Vite can bundle it for the browser.

export const FORMAT = 1;
export const DEFAULTS = { block: 1000, slim_block: 1000, lookup_buckets: 2048, partitions: 1024, big_list: 8192, min_stars: 0, dict_min_token: 3, desc_tokens: 60, desc_slim_chars: 140 };

// ---- hashing (deterministic, no deps)
export function fnv1a(str, seed = 0x811c9dc5) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
export const hex16 = (key) => fnv1a(key).toString(16).padStart(8, "0") + fnv1a(key, 0x9747b28c).toString(16).padStart(8, "0");
export const partitionOf = (key, P) => fnv1a(key) % P;
export const lookupBucketOf = (fullNameLower, B) => fnv1a(fullNameLower, 0x1b873593) % B;

// ---- posting lists: ascending ranks -> delta varint (LEB128)
export function decodeList(buf, count) {
  const out = new Uint32Array(count); let o = 0, i = 0, prev = 0;
  while (o < count) {
    let d = 0, shift = 0, b;
    do { b = buf[i++]; d += (b & 0x7f) * 2 ** shift; shift += 7; } while (b & 0x80);
    prev += d; out[o++] = prev;
  }
  return out;
}

// ---- tokenizer: lower-case alnum words (camelCase split optional), CJK runs -> overlapping bigrams
const STOP = new Set("a an and are as at be by for from has have in is it its of on or that the this to was with you your not no but if so we i my our can will all any more new using use used based via".split(" "));
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]+/g;
export function tokenize(text, { camel = false, max = 60 } = {}) {
  if (!text) return [];
  let s = String(text).replace(/https?:\/\/\S+/gi, " ");
  if (camel) s = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  s = s.toLowerCase();
  const out = new Set();
  for (const run of s.match(CJK) || []) { if (run.length === 1) out.add(run); for (let i = 0; i + 1 < run.length; i++) out.add(run.slice(i, i + 2)); }
  for (const w of s.replace(CJK, " ").split(/[^a-z0-9\u00c0-\u024f\u0370-\u03ff\u0400-\u04ff\u0590-\u06ff\u0900-\u097f]+/)) {
    if (w.length < 2 || w.length > 40 || STOP.has(w) || /^\d+$/.test(w)) continue;
    out.add(w); if (out.size >= max * 3) break;
  }
  return [...out].slice(0, max * 3);
}
// tokens of a repo for text search: full_name parts (camel split), description (capped), topic words, language
export function searchTokens(rec, descCap = DEFAULTS.desc_tokens) {
  const set = new Set(tokenize(rec.full_name, { camel: true, max: 40 }));
  for (const t of tokenize(rec.description, { max: descCap })) set.add(t);
  for (const tp of rec.topics || []) for (const t of tokenize(String(tp).replace(/-/g, " "), { max: 10 })) set.add(t);
  if (rec.language) for (const t of tokenize(rec.language, { max: 4 })) set.add(t);
  return [...set];
}

// ---- facet keys (namespaces: d dom, s sub, t tag, a auto-tag, f flag, l lang, lic, y year, o owner type, act activity, w word)
const MONTH = 30.44 * 86_400_000;
export function activityBand(lastCommit, snapMs) {
  if (!lastCommit) return "none";
  const m = (snapMs - Date.parse(lastCommit)) / MONTH;
  return m <= 3 ? "a3" : m <= 12 ? "a12" : m <= 36 ? "a36" : "old";
}
export function facetKeys(rec, snapMs) {
  const k = [];
  for (const d of rec.domains || []) k.push("d:" + d);
  for (const s of rec.subdomains || []) k.push("s:" + s);
  for (const t of rec.tags || []) k.push("t:" + t);
  for (const a of rec.auto_tags || []) k.push("a:" + a[0]);
  if (rec.domain_auto) k.push("f:da");
  if (rec.gh_status) k.push("f:gone");
  if (rec.archived) k.push("f:ar");
  if (rec.template) k.push("f:tp");
  if (rec.homepage) k.push("f:hp");
  if (!rec.topics || !rec.topics.length) k.push("f:nt");
  k.push("l:" + (rec.language ? rec.language.toLowerCase() : "none"));
  k.push("lic:" + (rec.license ? String(rec.license).toLowerCase() : "none"));
  if (rec.created_at) k.push("y:" + String(rec.created_at).slice(0, 4));
  k.push("o:" + String(rec.owner_type || "user").toLowerCase());
  k.push("act:" + activityBand(rec.last_commit, snapMs));
  return k;
}
export const allKeys = (rec, snapMs) => { const k = facetKeys(rec, snapMs); for (const w of searchTokens(rec)) k.push("w:" + w); return k; };

// ---- compact paths
export const P = {
  manifest: "manifest.json", files: "files.json",
  block: (n) => `records/blk-${String(n).padStart(5, "0")}.json.gz`,
  slim: (n) => `slim/sl-${String(n).padStart(5, "0")}.json.gz`,
  lookup: (b) => `lookup/lk-${String(b).padStart(4, "0")}.json.gz`,
  pack: (p) => `post/pk-${String(p).padStart(4, "0")}.bin.gz`,
  big: (key) => { const h = hex16(key); return `post/b/${h.slice(0, 2)}/${h}.bin.gz`; },
  readme: (n) => `readme/rm-${String(n).padStart(5, "0")}.json.gz`,
  dictTokens: (shard) => `dict/w-${[...shard].map((c) => c.charCodeAt(0).toString(16)).join("_")}.json.gz`,
  dictTags: "dict/tags.json.gz", dictFacets: "dict/facets.json.gz",
};

// token-dictionary shard of a token or typed prefix (for prefix expansion): CJK -> hashed bucket, others -> first 2 chars (null if too short)
const CJK1 = /^[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/;
export const dictShard = (tok) => (!tok ? null : CJK1.test(tok) ? "c" + (fnv1a(tok[0]) % 64) : tok.length >= 2 ? tok.slice(0, 2) : null);

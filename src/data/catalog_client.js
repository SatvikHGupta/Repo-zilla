// Browser entry for the catalog. NO Node APIs: fetch + DecompressionStream only, so Vite bundles it as is.
// const cat = await openCatalog(import.meta.env.VITE_DATA_BASE);  then cat.query({...}), cat.detail(rank), cat.repo("owner/name"), cat.facets() ...
import { Catalog } from "./catalog_engine.js";

// gzip -> bytes with the browser's built-in DecompressionStream (Chrome 80+, Safari 16.4+, Firefox 113+ - from memory, not verified here).
// If a host already decompressed the body the gzip magic is missing and we return it untouched. Pass opts.gunzip (e.g. fflate's gunzipSync) for old browsers.
export async function gunzipBrowser(u8) {
  if (!(u8[0] === 0x1f && u8[1] === 0x8b)) return u8;
  if (typeof DecompressionStream === "undefined") throw new Error("This browser has no DecompressionStream; pass opts.gunzip (for example fflate.gunzipSync).");
  return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
}

// fetch-based byte source: dedupes identical in-flight requests, retries network errors and 5xx with backoff, 404 -> null, honours an AbortSignal (no retry on abort)
export function makeFetchReader(base, { retries = 3, retryBaseMs = 400, timeoutMs = 30000, signal } = {}) {
  const root = base.endsWith("/") ? base : base + "/", inflight = new Map();
  const once = async (rel) => {
    let last;
    for (let a = 0; a <= retries; a++) {
      if (signal?.aborted) throw new DOMException("aborted", "AbortError");
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeoutMs), onAbort = () => ctl.abort(); signal?.addEventListener("abort", onAbort);
      try {
        const res = await fetch(root + rel, { signal: ctl.signal });
        if (res.status === 404) return null;
        if (res.status >= 500 || res.status === 429) throw new Error(`HTTP ${res.status} for ${rel}`);
        if (!res.ok) { const e = new Error(`HTTP ${res.status} for ${rel}`); e.fatal = true; throw e; }
        return new Uint8Array(await res.arrayBuffer());
      } catch (e) {
        if (signal?.aborted || e.fatal) throw e; last = e;
        if (a < retries) await new Promise((r) => setTimeout(r, retryBaseMs * 2 ** a + Math.random() * retryBaseMs / 2));
      } finally { clearTimeout(t); signal?.removeEventListener("abort", onAbort); }
    }
    throw new Error(`fetch failed after ${retries + 1} tries: ${last && last.message}`);
  };
  return (rel) => { let p = inflight.get(rel); if (!p) { p = once(rel).finally(() => inflight.delete(rel)); inflight.set(rel, p); } return p; };
}

export async function openCatalog(base, opts = {}) {
  const cat = new Catalog({ read: makeFetchReader(base, opts), gunzip: opts.gunzip || gunzipBrowser, cacheBytes: opts.cacheBytes ?? 96 * 1048576 });
  await cat.init(); return cat;
}

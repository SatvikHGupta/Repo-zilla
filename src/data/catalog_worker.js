// Web Worker that owns the Catalog, so decoding and intersecting posting lists never blocks the UI thread.
// In Vite:  const worker = new Worker(new URL("./catalog_worker.js", import.meta.url), { type: "module" });  const cat = createCatalogProxy(worker);  (catalog_proxy.js)
import { openCatalog } from "./catalog_client.js";

// pure message handler (testable without a real Worker). ops: open, manifest, query, repo, detail, slim, facets, tags, suggest, expand
export function makeHandler(open = openCatalog) {
  let cat = null; const need = () => { if (!cat) throw new Error("catalog not opened yet"); return cat; };
  return async (op, args = {}) => {
    switch (op) {
      case "open": cat = await open(args.base, args.opts || {}); return cat.manifest;
      case "manifest": return need().manifest;
      case "query": return need().query(args);                                   // { total, ranks, rows } - plain, structured-clone safe
      case "repo": return need().repo(args.name);
      case "detail": return need().detail(args.rank);
      case "slim": return need().slimRows(args.ranks);
      case "facets": return need().facets();
      case "tags": return need().tags({ auto: !!args.auto });
      case "suggest": return need().suggestTags(args.prefix, { auto: !!args.auto, limit: args.limit || 10 });
      case "expand": return need().expandPrefix(args.prefix, args.limit || 16);
      default: throw new Error(`unknown op "${op}"`);
    }
  };
}

if (typeof self !== "undefined" && typeof self.postMessage === "function" && typeof window === "undefined") {
  const handle = makeHandler();
  self.onmessage = async (e) => { const { id, op, args } = e.data || {}; try { self.postMessage({ id, ok: true, result: await handle(op, args) }); } catch (err) { self.postMessage({ id, ok: false, error: String(err && err.message || err) }); } };
}

// Main-thread side of the worker: promise API + "latest wins" so a slow old search can never overwrite a newer one.
export function createCatalogProxy(worker) {
  let seq = 0; const pending = new Map(), latest = new Map();
  worker.onmessage = (e) => { const { id, ok, result, error } = e.data || {}, p = pending.get(id); if (!p) return; pending.delete(id); ok ? p.resolve(result) : p.reject(new Error(error)); };
  const call = (op, args) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); worker.postMessage({ id, op, args }); });
  return {
    open: (base, opts) => call("open", { base, opts }), manifest: () => call("manifest"),
    query: (q) => call("query", q),
    // slot = e.g. "search" | "browse". Resolves null when a newer queryLatest on the same slot was issued meanwhile (ignore null in the UI).
    async queryLatest(slot, q) { const mine = (latest.get(slot) || 0) + 1; latest.set(slot, mine); const r = await call("query", q); return latest.get(slot) === mine ? r : null; },
    repo: (name) => call("repo", { name }), detail: (rank) => call("detail", { rank }), slim: (ranks) => call("slim", { ranks }),
    facets: () => call("facets"), tags: (auto) => call("tags", { auto }), suggest: (prefix, o = {}) => call("suggest", { prefix, ...o }), expand: (prefix, limit) => call("expand", { prefix, limit }),
    terminate: () => worker.terminate && worker.terminate(),
  };
}

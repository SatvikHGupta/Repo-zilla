// The only place that creates the worker and opens the catalog. Everything else goes through hooks/useCatalog.js.
import { createCatalogProxy } from './catalog_proxy.js';

export const DATA_BASE = import.meta.env.VITE_DATA_BASE || '';
const CALL_TIMEOUT_MS = 180_000; // longer than the worker's own fetch retries, so a slow connection is reported before the call is abandoned

let worker = null, proxy = null, dead = null; // dead rejects as soon as the current worker stops

// the worker is created on first use, so a browser without module workers shows a readable error instead of a blank page
function startWorker() {
  if (typeof Worker === 'undefined') throw new Error('This browser cannot run the search worker. Please update your browser.');
  try {
    worker = new Worker(new URL('./rz_worker.js', import.meta.url), { type: 'module' });
  } catch {
    throw new Error('This browser cannot start the search worker (module workers are required). Please update your browser.');
  }
  proxy = createCatalogProxy(worker);
  dead = new Promise((_, reject) => {
    const stop = (e) => reject(new Error(`The data worker stopped${e && e.message ? ': ' + e.message : ''}. Reload the page to try again.`));
    worker.addEventListener('error', stop, { once: true });
    worker.addEventListener('messageerror', stop, { once: true });
  });
  dead.catch(() => {}); // only calls that are waiting on the worker should see this
}

// a worker that is gone must not leave the next connect() with a dead promise: the next attempt starts a fresh one
function resetWorker() {
  if (worker) worker.terminate();
  worker = proxy = dead = null;
}

// a call never waits on a worker that stopped, and never forever
function guard(call) {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('The catalog took too long to answer. Check your connection and try again.')), CALL_TIMEOUT_MS); });
  return Promise.race([call, dead, timeout]).finally(() => clearTimeout(timer));
}

// same methods as the worker proxy (open, query, detail, repo, slim, facets, tags, suggest, expand, manifest), each one guarded
export const catalog = new Proxy({}, {
  get: (_, method) => {
    if (typeof method !== 'string' || method === 'then') return undefined; // never look like a thenable
    return (...args) => {
      if (!proxy) startWorker();
      return guard(proxy[method](...args));
    };
  },
});

let opening = null;
export function connect() {
  if (!DATA_BASE) return Promise.reject(new Error('VITE_DATA_BASE is not set. Set it in .env.development / .env.production (see .env.example).'));
  if (!opening) {
    opening = Promise.resolve()
      .then(() => catalog.open(DATA_BASE))
      .catch((e) => { opening = null; resetWorker(); throw e; });
  }
  return opening;
}

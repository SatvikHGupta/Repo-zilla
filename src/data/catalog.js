// The only place that creates the worker and opens the catalog. Everything else goes through hooks/useCatalog.js.
import { createCatalogProxy } from './catalog_proxy.js';

export const DATA_BASE = import.meta.env.VITE_DATA_BASE || '';

const worker = new Worker(new URL('./rz_worker.js', import.meta.url), { type: 'module' });
export const catalog = createCatalogProxy(worker);

// a worker that fails to start never answers, so its error event must reject the pending open()
const workerFailed = new Promise((_, reject) => {
  worker.addEventListener('error', (e) => reject(new Error(`The data worker could not start${e.message ? ': ' + e.message : ''}`)), { once: true });
});
workerFailed.catch(() => {});

let opening = null;
export function connect() {
  if (!DATA_BASE) return Promise.reject(new Error('VITE_DATA_BASE is not set. Copy .env.example to .env.local and set it.'));
  if (!opening) {
    opening = Promise.race([catalog.open(DATA_BASE), workerFailed]).catch((e) => { opening = null; throw e; });
  }
  return opening;
}

// Markdown -> HTML on a worker with a time limit. A pathological README (the parser can take minutes on some inputs, or overflow its stack)
// ends as a rejected promise with code "timeout" or "failed", and the page shows the plain text instead of freezing or crashing.
const TIMEOUT_MS = 4000, CACHE_MAX = 4;

let worker = null, nextId = 1, workerWorked = false, workerUnusable = false;
const waiting = new Map(); // request id -> { markdown, resolve, reject, timer }
const cache = new Map();   // markdown -> html, so toggling Rendered / Raw or reopening a repo does not parse again

const fail = (code, message) => Object.assign(new Error(message), { code });

// ends the worker and fails everything still waiting on it (a stuck parse can only be stopped this way)
function stop(error) {
  if (worker) worker.terminate();
  worker = null;
  for (const w of waiting.values()) { clearTimeout(w.timer); w.reject(error); }
  waiting.clear();
}

// the same parse on this thread, still catching every failure (used when there is no Worker or it cannot start)
function parseHere(markdown) {
  return import('./readmeMarkdown.js').then((m) => m.markdownToHtml(markdown)).catch((e) => { throw fail('failed', String((e && e.message) || e)); });
}

function start() {
  worker = new Worker(new URL('./readmeWorker.js', import.meta.url), { type: 'module' });
  worker.onmessage = ({ data }) => {
    workerWorked = true;
    const w = waiting.get(data.id);
    if (!w) return;
    waiting.delete(data.id);
    clearTimeout(w.timer);
    if (data.error) w.reject(fail('failed', data.error)); else w.resolve(data.html);
  };
  worker.onerror = () => {
    // a worker that never answered once could not start (blocked, an old browser, a missing file): hand its requests to this thread and stop using it.
    // one that worked before and then died (out of memory) is not retried here, the page shows the text as it is
    if (workerWorked) { stop(fail('failed', 'The README formatter stopped unexpectedly.')); return; }
    const pending = [...waiting.values()];
    waiting.clear();
    for (const w of pending) clearTimeout(w.timer);
    workerUnusable = true;
    if (worker) worker.terminate();
    worker = null;
    for (const w of pending) parseHere(w.markdown).then(w.resolve, w.reject);
  };
}

export function parseMarkdown(markdown, { timeoutMs = TIMEOUT_MS } = {}) {
  if (cache.has(markdown)) return Promise.resolve(cache.get(markdown));
  const remember = (html) => {
    cache.set(markdown, html);
    if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value); // oldest first
    return html;
  };
  // no Worker (an old browser, a test) or one that cannot start: parse here
  if (typeof Worker === 'undefined' || workerUnusable) return parseHere(markdown).then(remember);
  return new Promise((resolve, reject) => {
    try { if (!worker) start(); } catch (e) { reject(fail('failed', String((e && e.message) || e))); return; }
    const id = nextId++;
    const timer = setTimeout(() => stop(fail('timeout', 'This README took too long to format.')), timeoutMs);
    waiting.set(id, { markdown, resolve: (html) => resolve(remember(html)), reject: (e) => reject(e), timer });
    worker.postMessage({ id, markdown });
  });
}

// Runs the Markdown parser off the main thread: a README that makes the parser slow or crash only costs this worker, not the page.
import { markdownToHtml } from './readmeMarkdown.js';

self.onmessage = (e) => {
  const { id, markdown } = e.data;
  try { self.postMessage({ id, html: markdownToHtml(markdown) }); }
  catch (err) { self.postMessage({ id, error: String((err && err.message) || err) }); }
};

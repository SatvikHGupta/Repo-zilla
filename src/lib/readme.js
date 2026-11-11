// README handling. Markdown only for markdown-ish files, everything is sanitized, relative links and images point at GitHub, images are opt-in.
// The Markdown -> HTML step lives in readmeMarkdown.js (it runs in a worker, see readmeRender.js); this file is the main-thread half: URL rules and the sanitizer.
import DOMPurify from 'dompurify';
import { headingSlug } from './readmeText.js';

export { headingSlug };

const MD_FILE = /\.(md|markdown|mdown|mkd|mkdn|mdx)$/i;
export const readmeKind = (file) => (!file || MD_FILE.test(file) ? 'markdown' : 'text');

// resolves a README href/src against the repo. mode "blob" for links, "raw" for images. Returns null for anything unsafe or outside the repo.
export function resolveRepoUrl(ref, { fullName, branch = 'main', mode = 'blob' }) {
  const v = String(ref ?? '').trim();
  if (!v) return null;
  if (v.startsWith('#')) return v;
  if (v.startsWith('//')) return resolveRepoUrl('https:' + v, { fullName, branch, mode });
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(v);
  if (scheme) {
    const s = scheme[1].toLowerCase();
    if (s === 'https') return v;
    if (s === 'http') return mode === 'raw' ? 'https:' + v.slice(5) : v; // an image over http would be blocked as mixed content: ask for https
    return s === 'mailto' && mode === 'blob' ? v : null;
  }
  const base = mode === 'raw' ? `https://raw.githubusercontent.com/${fullName}/${branch}/` : `https://github.com/${fullName}/blob/${branch}/`;
  try {
    const url = new URL(v.replace(/^\.?\/+/, ''), base).href;
    return url.startsWith(base) ? url : null; // a "../" chain must not leave the repository
  } catch { return null; }
}

// raw.githubusercontent.com serves .svg files as text/plain (with nosniff), which <img> refuses to draw; ?sanitize=true makes it answer image/svg+xml
export function drawableImageUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'raw.githubusercontent.com' && /\.svg$/i.test(u.pathname) && !u.searchParams.has('sanitize')) { u.searchParams.set('sanitize', 'true'); return u.href; }
  } catch { /* not a URL: leave it */ }
  return url;
}

let ctx = null; // set around each sanitize call; the hooks below read it
let hooked = false;
function installHooks() {
  if (hooked) return;
  hooked = true;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (!ctx) return;
    // a README may not borrow the app's own classes (.sr-only, .container ...): only the rz- classes the renderer itself writes survive
    if (node.hasAttribute('class')) {
      const keep = node.getAttribute('class').split(/\s+/).filter((c) => c.startsWith('rz-')).join(' ');
      if (keep) node.setAttribute('class', keep); else node.removeAttribute('class');
    }
    const tag = node.nodeName;
    if (tag === 'A') {
      // <a name="usage"> is an old-style anchor: give it the same (prefixed) id, so "#usage" links can find it
      if (node.hasAttribute('name') && !node.hasAttribute('id')) node.setAttribute('id', node.getAttribute('name'));
      const href = node.getAttribute('href');
      if (href === null) return;
      const url = resolveRepoUrl(href, { fullName: ctx.fullName, branch: ctx.branch, mode: 'blob' });
      if (!url) { node.removeAttribute('href'); return; }
      node.setAttribute('href', url);
      if (!url.startsWith('#')) { node.setAttribute('target', '_blank'); node.setAttribute('rel', 'noopener noreferrer'); }
    } else if (tag === 'IMG') {
      ctx.images++;
      // the README's own width is kept (a 120 px logo must not grow to its 512 px original), the height is dropped so the picture keeps its proportions
      const w = node.getAttribute('width');
      if (!(w && /^\d{1,4}%?$/.test(w) && parseInt(w, 10) > 0)) node.removeAttribute('width');
      node.removeAttribute('height');
      const src = ctx.showImages ? resolveRepoUrl(node.getAttribute('src'), { fullName: ctx.fullName, branch: ctx.branch, mode: 'raw' }) : null;
      if (!src) { node.removeAttribute('src'); return; } // no src: the browser shows the alt text instead (styled as a placeholder)
      node.setAttribute('src', drawableImageUrl(src));
      node.setAttribute('loading', 'lazy');
      node.setAttribute('decoding', 'async');
      node.setAttribute('referrerpolicy', 'no-referrer');
    }
  });
}

const PURIFY = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'option', 'source', 'iframe', 'object', 'embed', 'video', 'audio', 'link', 'meta', 'base'],
  FORBID_ATTR: ['style', 'srcset', 'sizes', 'action', 'formaction'],
  SANITIZE_NAMED_PROPS: true, // ids and names get a "user-content-" prefix, so README anchors can never clash with the app's own ids
};

// a link whose address was removed (an unsafe scheme, a path outside the repo) is plain text now: it must not keep looking like a link
function unwrapDeadLinks(html) {
  if (!html.includes('<a')) return html;
  const box = document.createElement('template');
  box.innerHTML = html;
  for (const a of box.content.querySelectorAll('a:not([href]):not([id]):not([name])')) a.replaceWith(...a.childNodes); // loop: one dead link at a time
  return box.innerHTML;
}

// HTML from readmeMarkdown.js -> { html, images } where html is safe to inject and images is how many <img> the README contained
export function sanitizeReadme(html, { fullName, branch, showImages }) {
  installHooks();
  ctx = { fullName, branch: branch || 'main', showImages: !!showImages, images: 0 };
  try {
    const clean = DOMPurify.sanitize(html, PURIFY);
    return { html: unwrapDeadLinks(clean), images: ctx.images };
  } finally { ctx = null; }
}

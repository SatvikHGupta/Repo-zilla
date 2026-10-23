// README handling. Markdown only for markdown-ish files, everything is sanitized, relative links and images point at GitHub, images are opt-in.
import { Marked } from 'marked';
import DOMPurify from 'dompurify';

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
    if (s === 'http' || s === 'https') return v;
    return s === 'mailto' && mode === 'blob' ? v : null;
  }
  const base = mode === 'raw' ? `https://raw.githubusercontent.com/${fullName}/${branch}/` : `https://github.com/${fullName}/blob/${branch}/`;
  try {
    const url = new URL(v.replace(/^\.?\/+/, ''), base).href;
    return url.startsWith(base) ? url : null; // a "../" chain must not leave the repository
  } catch { return null; }
}

// GitHub-style heading anchor; `seen` makes repeated headings unique (intro, intro-1, ...)
export function headingSlug(text, seen) {
  const base = String(text).toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-') || 'section';
  const n = seen.get(base) || 0;
  seen.set(base, n + 1);
  return n === 0 ? base : `${base}-${n}`;
}
const stripTags = (html) => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

let ctx = null; // set around each sanitize call; the hooks below read it
let hooked = false;
function installHooks() {
  if (hooked) return;
  hooked = true;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (!ctx) return;
    const tag = node.nodeName;
    if (tag === 'A') {
      const href = node.getAttribute('href');
      if (href === null) return;
      const url = resolveRepoUrl(href, { fullName: ctx.fullName, branch: ctx.branch, mode: 'blob' });
      if (!url) { node.removeAttribute('href'); return; }
      node.setAttribute('href', url);
      if (!url.startsWith('#')) { node.setAttribute('target', '_blank'); node.setAttribute('rel', 'noopener noreferrer'); }
    } else if (tag === 'IMG') {
      ctx.images++;
      node.removeAttribute('width');
      node.removeAttribute('height');
      const src = ctx.showImages ? resolveRepoUrl(node.getAttribute('src'), { fullName: ctx.fullName, branch: ctx.branch, mode: 'raw' }) : null;
      if (!src) { node.removeAttribute('src'); return; } // no src: the browser shows the alt text instead (styled as a placeholder)
      node.setAttribute('src', src);
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

// returns { html, images } where images is how many <img> the README contained
export function renderReadme(markdown, { fullName, branch, showImages }) {
  installHooks();
  const seen = new Map();
  const md = new Marked({
    gfm: true,
    async: false,
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        return `<h${depth} id="${headingSlug(stripTags(inner), seen)}">${inner}</h${depth}>\n`;
      },
      checkbox({ checked }) { return `<span class="rz-task" data-done="${checked ? 1 : 0}" role="img" aria-label="${checked ? 'done' : 'not done'}"></span> `; },
    },
  });
  ctx = { fullName, branch: branch || 'main', showImages: !!showImages, images: 0 };
  try {
    const html = DOMPurify.sanitize(md.parse(markdown), PURIFY);
    return { html, images: ctx.images };
  } finally { ctx = null; }
}

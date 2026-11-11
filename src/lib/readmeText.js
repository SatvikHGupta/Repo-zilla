// Text helpers shared by the Markdown renderer (which runs in a worker) and the sanitizer. No dependencies, no DOM.

// GitHub-style heading anchor; `seen` makes repeated headings unique (intro, intro-1, ...)
export function headingSlug(text, seen) {
  const base = String(text).toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-') || 'section';
  const n = seen.get(base) || 0;
  seen.set(base, n + 1);
  return n === 0 ? base : `${base}-${n}`;
}

// rendered inline HTML -> the plain text it shows, used to build heading anchors (decoded in one pass, so "&amp;lt;" stays "&lt;")
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
export const stripTags = (html) => html.replace(/<[^>]*>/g, '').replace(/&(amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m]);

// Markdown -> HTML (not yet safe: readme.js sanitizes it). Pure JavaScript with no DOM, so it can run in a worker and be stopped if it takes too long.
import { Marked } from 'marked';
import markedFootnote from 'marked-footnote';
import { EMOJI } from './emoji.js';
import { headingSlug, stripTags } from './readmeText.js';

// ":rocket:" -> the emoji, only for codes in the table; code spans and code blocks are other token types, so they are never touched
const withEmoji = (text) => text.replace(/:([a-z0-9_+-]+):/g, (all, name) => (Object.hasOwn(EMOJI, name) ? EMOJI[name] : all));

export function markdownToHtml(markdown) {
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
    walkTokens(token) { if (token.type === 'text' && typeof token.text === 'string' && token.text.includes(':')) token.text = withEmoji(token.text); },
  });
  // GitHub footnotes: [^1] and [^1]: text. The sanitizer keeps only classes that start with rz-, so the footnote classes are renamed
  md.use(markedFootnote({ sectionClass: 'rz-footnotes', headingClass: 'rz-sr' }));
  return md.parse(markdown);
}

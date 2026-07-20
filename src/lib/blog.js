import { marked } from "marked"
import sanitizeHtml from "sanitize-html"
import { parseFrontmatter, isPublished } from "./blogParse.js"
import { getPrefetchedBody, setPrefetchedBody } from "./blogPrefetchCache.js"
import blogMeta from "./blog-meta.generated.json"

// Lazy, code-split - deliberately NOT { eager: true }. Vite emits each
// post's raw markdown as its own separate chunk file, only fetched over
// the network when getPostBody() below is actually called and awaited.
// This is what keeps unpublished (and, really, all) post bodies out of the
// main JS bundle that ships to every visitor on every page load.
const lazyBodyLoaders = import.meta.glob("/src/content/blog/*.md", {
  query: "?raw",
  import: "default",
})

export { getPrefetchedBody }

export function getAllPosts() {
  return blogMeta.filter((p) => isPublished(p.date))
}

export function getPostMeta(slug) {
  const post = blogMeta.find((p) => p.slug === slug)
  if (!post || !isPublished(post.date)) return null
  return post
}

// Async on purpose - see lazyBodyLoaders above. Returns null if the slug
// doesn't exist or isn't published yet (checked again here, not just by
// callers, so this function is safe to call directly).
export async function getPostBody(slug) {
  const cached = getPrefetchedBody(slug)
  if (cached != null) return cached

  const meta = getPostMeta(slug)
  if (!meta) return null

  const loader = lazyBodyLoaders[meta.file]
  if (!loader) return null

  const raw = await loader()
  const { body } = parseFrontmatter(raw)
  return setPrefetchedBody(slug, body)
}


export function getAllSlugs() {
  return getAllPosts().map((p) => p.slug)
}

const MARKDOWN_SANITIZE_OPTIONS = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "ul", "ol", "li",
    "strong", "em", "b", "i", "code", "pre", "blockquote", "hr", "br",
    "table", "thead", "tbody", "tr", "th", "td", "del", "s", "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
    code: ["class"], // marked tags fenced code blocks as class="language-xxx"
  },
  allowedSchemes: ["http", "https", "mailto"],
  // matches the rel/target already used on every other external link in
  // this app (see e.g. RepoDetail.jsx's GitHub link)
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }, true),
  },
}

export function renderMarkdown(body) {
  const raw = marked.parse(body, { headerIds: false, mangle: false })
  // marked doesn't sanitize by default (its old `sanitize` option was
  // removed years ago for being unreliable) - content here is author-only
  // markdown today, not user input, so this isn't exploitable as written,
  // but it costs nothing to make renderMarkdown() itself safe regardless of
  // who ends up writing the input later. sanitize-html is pure JS with no
  // DOM dependency, so it works identically here whether this runs in a
  // real browser or during the Node-executed prerender build - a DOM-based
  // sanitizer (DOMPurify, isomorphic-dompurify) was tried first and broke
  // the prerender build, since that pipeline bundles this file through a
  // "client" target regardless of where it actually executes, so package
  // conditions meant for "pick the Node build here" resolve wrong.
  return sanitizeHtml(raw, MARKDOWN_SANITIZE_OPTIONS)
}

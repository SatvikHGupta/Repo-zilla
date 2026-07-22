import { marked } from "marked"
import sanitizeHtml from "sanitize-html"
import { parseFrontmatter, isPublished } from "./blogParse.js"
import { getPrefetchedBody, setPrefetchedBody } from "./blogPrefetchCache.js"
import blogMeta from "./blog-meta.generated.json"

// lazy/code-split, not eager - keeps post bodies out of the main bundle
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

// returns null if slug doesn't exist or isn't published yet
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
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }, true),
  },
}

export function renderMarkdown(body) {
  const raw = marked.parse(body, { headerIds: false, mangle: false })
  // marked doesn't sanitize by default; sanitize-html works in both browser and prerender build
  return sanitizeHtml(raw, MARKDOWN_SANITIZE_OPTIONS)
}

import { marked } from "marked"

// Loads every .md file in src/content/blog/ at build time (Vite glob import).
// Works identically in the browser and in Node during prerendering, since
// it's plain string parsing with no DOM/browser-only APIs.
const rawPosts = import.meta.glob("/src/content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
})

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }

  const [, frontmatterBlock, body] = match
  const meta = {}

  for (const line of frontmatterBlock.split("\n")) {
    const lineMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/)
    if (!lineMatch) continue
    const [, key, rawValue] = lineMatch
    let value = rawValue.trim()

    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    } else if (key === "tags") {
      value = value.split(",").map((v) => v.trim()).filter(Boolean)
    } else {
      value = value.replace(/^"(.*)"$/, "$1")
    }

    meta[key] = value
  }

  return { meta, body: body.trim() }
}

function makeExcerpt(body, length = 200) {
  // strip the leading H1 (title is shown separately) and markdown syntax,
  // then take the first real paragraph as a plain-text excerpt
  const withoutH1 = body.replace(/^#\s+.+\n+/, "")
  const firstParagraph = withoutH1.split(/\n{2,}/).find((block) => block.trim() && !block.startsWith("#")) || ""
  const plain = firstParagraph
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
  return plain.length > length ? plain.slice(0, length).trim() + "…" : plain
}

function estimateReadingTime(body) {
  const words = body.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

const allPosts = Object.values(rawPosts)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    if (!meta.slug) return null
    return {
      slug: meta.slug,
      title: meta.title || meta.slug,
      date: meta.date || "2026-07-08",
      category: meta.category || "general",
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      excerpt: makeExcerpt(body),
      readingTime: estimateReadingTime(body),
      body,
    }
  })
  .filter(Boolean)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export function getAllPosts() {
  return allPosts
}

export function getPostBySlug(slug) {
  return allPosts.find((p) => p.slug === slug) || null
}

export function getAllSlugs() {
  return allPosts.map((p) => p.slug)
}

export function renderMarkdown(body) {
  return marked.parse(body, { headerIds: false, mangle: false })
}

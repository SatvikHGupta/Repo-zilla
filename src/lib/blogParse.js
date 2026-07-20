// Pure string-parsing helpers, no browser or Node-only APIs. Safe to import
// from vite.config.js (Node, at build time) and from src/lib/blog.js
// (browser + Node during prerendering).

export function parseFrontmatter(raw) {
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

export function makeExcerpt(body, length = 200) {
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

export function estimateReadingTime(body) {
  const words = body.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

// Single source of truth for the publish gate. UTC date-string comparison -
// same absolute moment (00:00 UTC on the post's date) for every visitor
// regardless of local timezone. A post at date D is invisible everywhere
// until that instant, then visible everywhere, forever, with zero manual
// step - every caller just needs to re-run this check, which happens
// naturally on every page load / re-render.
export function isPublished(dateStr) {
  if (!dateStr) return false
  const today = new Date().toISOString().slice(0, 10)
  return dateStr <= today
}

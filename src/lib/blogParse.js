// pure string-parsing helpers, safe to import from both vite.config.js (Node) and blog.js (browser)

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
  // strip leading H1 + markdown syntax, take first real paragraph as excerpt
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

// single source of truth for the publish gate; UTC date-string comparison, same for every visitor
export function isPublished(dateStr) {
  if (!dateStr) return false
  const today = new Date().toISOString().slice(0, 10)
  return dateStr <= today
}

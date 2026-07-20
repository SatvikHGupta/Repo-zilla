import { renderMarkdown } from "./blog.js"

// matches markdown image/link targets: ![alt](url "title") / [text](url "title")
const MD_URL_RE = /(!?\[[^\]]*\]\()\s*<?([^)\s]+)>?(\s+"[^"]*")?\)/g
// matches markdown reference-style definitions: [ref]: url "title"
const MD_REF_RE = /^(\s*\[[^\]]+\]:\s*)<?([^\s>]+)>?(\s+"[^"]*")?\s*$/gm
// matches raw HTML src="..."/href="..." (READMEs commonly embed <img>/<a> directly, e.g. for centered badges/logos)
const HTML_ATTR_RE = /((?:src|href)=["'])([^"']+)(["'])/g

function isAbsolute(url) {
  return /^(https?:)?\/\//i.test(url) || /^(mailto:|data:|tel:|#)/i.test(url)
}

// READMEs almost always reference paths relative to the repo root (the
// README itself lives at the root), so this resolves against root rather
// than trying to track a "current directory" - covers the vast majority of
// real-world READMEs without the complexity of full relative-path resolution.
function resolveUrl(url, fullName, branch, isImage) {
  if (!url || isAbsolute(url)) return url
  const clean = url.replace(/^\.?\//, "")
  return isImage
    ? `https://raw.githubusercontent.com/${fullName}/${branch}/${clean}`
    : `https://github.com/${fullName}/blob/${branch}/${clean}`
}

function resolveRelativeUrls(markdown, fullName, branch) {
  return markdown
    .replace(MD_URL_RE, (match, prefix, url, title = "") => {
      const isImage = prefix.startsWith("!")
      return `${prefix}${resolveUrl(url, fullName, branch, isImage)}${title})`
    })
    .replace(MD_REF_RE, (match, prefix, url, title = "") => {
      // reference definitions don't carry an image/link distinction of
      // their own - resolve as a link (blob view), the more common case
      return `${prefix}${resolveUrl(url, fullName, branch, false)}${title}`
    })
    .replace(HTML_ATTR_RE, (match, prefix, url, suffix) => {
      const isImage = prefix.startsWith("src")
      return `${prefix}${resolveUrl(url, fullName, branch, isImage)}${suffix}`
    })
}

// renders a fetched README to sanitized HTML, with relative image/link
// paths rewritten to real absolute URLs first (branch is required for that -
// pass null/undefined to skip rewriting, e.g. for a legacy cached entry that
// predates branch tracking, so we don't guess a possibly-wrong branch).
export function renderReadme(markdown, fullName, branch) {
  const resolved = branch ? resolveRelativeUrls(markdown, fullName, branch) : markdown
  return renderMarkdown(resolved)
}

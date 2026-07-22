// shared in-memory body cache, kept import-free so prerender.jsx doesn't pull in
// blog-meta.generated.json transitively. Lets prerender pre-populate a body before the
// synchronous renderToString() runs, and lets the browser skip re-fetching on revisit.
const bodyCache = new Map()

export function getPrefetchedBody(slug) {
  return bodyCache.has(slug) ? bodyCache.get(slug) : null
}

export function setPrefetchedBody(slug, body) {
  bodyCache.set(slug, body)
  return body
}

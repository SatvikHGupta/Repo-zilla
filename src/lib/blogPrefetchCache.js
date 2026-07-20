// Shared in-memory cache for already-fetched post bodies. Deliberately its
// own file with NO other imports (especially not blog-meta.generated.json)
// so that anything importing just this cache - namely src/prerender.jsx,
// see the comment there - doesn't drag unpublished post metadata into its
// module graph. blog.js (the browser-facing module) re-exports these same
// functions so its own public API is unchanged for BlogPostPage.jsx.
//
// Two jobs:
//  1) During prerendering (src/prerender.jsx), the body for the post being
//     rendered is written here BEFORE renderToString() runs, since
//     renderToString is synchronous and won't wait for the async fetch a
//     plain useEffect would trigger. This is what lets already-published
//     posts still get full real content baked into their static HTML for
//     SEO/crawlers.
//  2) In the browser, it avoids re-fetching a body if the user navigates
//     away from a post and back within the same session.
const bodyCache = new Map()

export function getPrefetchedBody(slug) {
  return bodyCache.has(slug) ? bodyCache.get(slug) : null
}

export function setPrefetchedBody(slug, body) {
  bodyCache.set(slug, body)
  return body
}

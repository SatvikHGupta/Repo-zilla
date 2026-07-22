import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Footer from "../components/Footer.jsx"
import AdUnit from "../components/AdUnit.jsx"
import { usePageMeta } from "../hooks/usePageMeta.js"
import { getPostMeta, getPostBody, getPrefetchedBody, getAllPosts, renderMarkdown } from "../lib/blog.js"
import NotFoundPage from "./NotFoundPage.jsx"

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// strips the leading "# Title" line since the title is rendered separately
function stripLeadingH1(body) {
  return body.replace(/^#\s+.+\n+/, "")
}

export default function BlogPostPage({ slug }) {
  const post = getPostMeta(slug)

  // body loads lazily (blog.js); prerender.jsx pre-fetches it for SEO, browser fetches on mount
  const [body, setBody] = useState(() => (post ? getPrefetchedBody(slug) : null))

  useEffect(() => {
    if (!post) return
    if (getPrefetchedBody(slug) != null) return
    let cancelled = false
    getPostBody(slug).then((b) => {
      if (!cancelled) setBody(b)
    })
    return () => {
      cancelled = true
    }
  }, [slug, post])

  usePageMeta(
    post ? `${post.title} - Repo Zilla Blog` : "Post not found - Repo Zilla",
    post ? post.excerpt : undefined
  )

  if (!post) {
    return <NotFoundPage />
  }

  if (body == null) {
    return (
      <div className="static-wrap">
        <div className="static-inner blog-post-inner">
          <Link to="/blog" className="static-back">← all posts</Link>
          <span className="blog-post-cat mono">{post.category}</span>
          <h1 className="static-title blog-post-title">{post.title}</h1>
          <div className="static-meta blog-post-meta mono">
            <span>{formatDate(post.date)}</span>
            <span className="blog-card-dot">·</span>
            <span>{post.readingTime} min read</span>
          </div>
          <p className="static-content">Loading…</p>
        </div>
        <Footer />
      </div>
    )
  }

  const html = renderMarkdown(stripLeadingH1(body))

  // split rendered HTML roughly in half (top-level <h2>) to slot an ad mid-article
  const sections = html.split(/(?=<h2)/)
  const mid = Math.ceil(sections.length / 2)
  const firstHalf = sections.slice(0, mid).join("")
  const secondHalf = sections.slice(mid).join("")

  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3)

  return (
    <div className="static-wrap">
      <div className="static-inner blog-post-inner">
        <Link to="/blog" className="static-back">← all posts</Link>

        <span className="blog-post-cat mono">{post.category}</span>
        <h1 className="static-title blog-post-title">{post.title}</h1>
        <div className="static-meta blog-post-meta mono">
          <span>{formatDate(post.date)}</span>
          <span className="blog-card-dot">·</span>
          <span>{post.readingTime} min read</span>
        </div>

        {/* Auto Ads (live sitewide) picks this page up automatically.
            AdUnit below is wired for manual slots once AdSense approves
            real ad-slot IDs - inactive until a real data-ad-slot is set. */}
        <AdUnit slot="" format="auto" />

        <div className="static-content" dangerouslySetInnerHTML={{ __html: firstHalf }} />
        <AdUnit slot="" format="auto" />
        <div className="static-content" dangerouslySetInnerHTML={{ __html: secondHalf }} />

        {related.length > 0 && (
          <div className="blog-related">
            <span className="blog-related-label mono">MORE ON {post.category.toUpperCase()}</span>
            <div className="blog-related-row">
              {related.map((r) => (
                <Link key={r.slug} to={`/blog/${r.slug}`} className="blog-related-card">
                  {r.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import Footer from "../components/Footer.jsx"
import { usePageMeta } from "../hooks/usePageMeta.js"
import { getAllPosts } from "../lib/blog.js"

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function BlogPage() {
  usePageMeta(
    "Blog - Repo Zilla",
    "Data-driven writing on GitHub repos, open source trends, and the dev tools worth paying attention to in 2026, pulled straight from our catalog of 34,787 repositories."
  )

  const posts = useMemo(() => getAllPosts(), [])
  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category))
    return ["all", ...Array.from(set).sort()]
  }, [posts])

  const [activeCategory, setActiveCategory] = useState("all")

  const filtered = activeCategory === "all" ? posts : posts.filter((p) => p.category === activeCategory)

  return (
    <div className="static-wrap">
      <div className="blog-inner">
        <Link to="/" className="static-back">← home</Link>

        <h1 className="static-title">Blog</h1>
        <p className="blog-intro">
          Writing built on our own catalog of 34,787 scored GitHub repositories, plus the open source
          and dev-tool stories worth actually paying attention to. Real numbers where we have them,
          clearly labeled opinion where we don't.
        </p>

        <div className="blog-filter-row">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`blog-filter-chip mono ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              type="button"
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        <div className="blog-grid">
          {filtered.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card">
              <span className="blog-card-cat mono">{post.category}</span>
              <h2 className="blog-card-title">{post.title}</h2>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <div className="blog-card-meta mono">
                <span>{formatDate(post.date)}</span>
                <span className="blog-card-dot">·</span>
                <span>{post.readingTime} min read</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="blog-empty">No posts in this category yet.</p>
        )}
      </div>
      <Footer />
    </div>
  )
}

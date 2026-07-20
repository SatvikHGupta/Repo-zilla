import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import App from "../App.jsx"
import Footer from "../components/Footer.jsx"
import { usePageMeta } from "../hooks/usePageMeta.js"
import NotFoundPage from "./NotFoundPage.jsx"
import { getCategory } from "../data/categories.js"

export default function ExplorePage({ slug }) {
  const data = getCategory(slug)

  const [open, setOpen] = useState(false)

  // measured (not calc()/CSS-var-guessed) height of the accordion's real
  // content, so collapsing/expanding is a plain, deterministic max-height
  // transition in both directions instead of a CSS grid-row trick.
  const accordionInnerRef = useRef(null)
  const [accHeight, setAccHeight] = useState(0)

  useEffect(() => {
    function measure() {
      if (accordionInnerRef.current) setAccHeight(accordionInnerRef.current.scrollHeight)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [data])

  // App itself doesn't remount when navigating from one /explore/:slug page
  // to another (same route, same component instance) - so without this, its
  // internal repo-grid keeps whatever scroll position it had on the
  // previous category instead of starting at the top on the new one.
  const catalogueRef = useRef(null)
  useEffect(() => {
    catalogueRef.current?.querySelector(".grid-wrap")?.scrollTo(0, 0)
  }, [slug])

  usePageMeta(data?.metaTitle, data?.metaDesc)

  if (!data) {
    return <NotFoundPage />
  }

  return (
    <div className="explore-wrap">

      {/* slim context bar — single row, always visible */}
      <div className="explore-bar">
        <div className="explore-bar-inner">
          <div className="explore-bar-left">
            <Link to="/" className="explore-bar-back mono">← home</Link>
            <span className="explore-bar-sep">/</span>
            <h1 className="explore-bar-title">{data.headline}</h1>
            <span className="explore-bar-count mono">{data.count.toLocaleString()} repos</span>
          </div>
          <button
            className={`explore-bar-toggle mono ${open ? "open" : ""}`}
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
          >
            about this collection {open ? "↑" : "↓"}
          </button>
        </div>

        {/* accordion — in DOM always so Google crawls it, just visually hidden when
            closed. height is a measured pixel value (data.intro/highlights don't
            change once a category page mounts), so open AND close are both a plain
            deterministic max-height transition - no calc()/CSS-var height math. */}
        <div
          className={`explore-accordion ${open ? "open" : ""}`}
          aria-hidden={!open}
          style={{ maxHeight: open ? accHeight : 0 }}
        >
          <div className="explore-accordion-inner" ref={accordionInnerRef}>
            <p className="explore-acc-intro">{data.intro}</p>
            <div className="explore-acc-highlights">
              <span className="explore-acc-label mono">what's in this collection</span>
              <ul className="explore-acc-list">
                {data.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* catalogue renders immediately — no content wall before it */}
      <div className="explore-catalogue" ref={catalogueRef}>
        <App initialType={data.type} />
      </div>

      <Footer />
    </div>
  )
}

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer.jsx"
import { usePageMeta } from "../hooks/usePageMeta.js"
import { CATEGORIES } from "../data/categories.js"

// --- data ---
const STATS = [
  { label: "Repositories", value: 34787, suffix: "" },
  { label: "Languages", value: 90, suffix: "+" },
  { label: "Project Types", value: 15, suffix: "" },
  { label: "Top Shelf", value: 250, suffix: "" },
]

const STEPS = [
  {
    title: "Fetched from GitHub",
    body: "57 targeted search queries sweep across languages, frameworks, and topics, pulling in repos that clear real quality thresholds: stars, activity, and topic coverage.",
  },
  {
    title: "Scored and Classified",
    body: "Each repo gets a composite score built from stars, forks, recency, topic depth, and description quality. That score decides which project type and category it lands in.",
  },
  {
    title: "Tiered into Layers",
    body: "Repos settle into one of four layers, ranging from a 25k-repo general pool up to a 250-repo curated shelf holding the highest-signal projects in every category.",
  },
]

// --- counter animation ---
function useCounter(target, duration = 1400, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const pct = Math.min((ts - start) / duration, 1)
      // ease-out quad
      const ease = 1 - (1 - pct) * (1 - pct)
      setCount(Math.floor(ease * target))
      if (pct < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return count
}

function StatCounter({ label, value, suffix, active }) {
  const count = useCounter(value, 1200, active)
  return (
    <div className="hp-stat">
      <div className="hp-stat-num mono">{count.toLocaleString()}{suffix}</div>
      <div className="hp-stat-label">{label}</div>
    </div>
  )
}

// --- intersection observer hook ---
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

// --- category card ---
function CategoryCard({ slug, type, icon, count, desc, delay }) {
  const navigate = useNavigate()
  const [ref, inView] = useInView(0.1)

  return (
    <div
      ref={ref}
      className={`hp-cat-card ${inView ? "hp-in" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={() => navigate(`/explore/${slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/explore/${slug}`) }
      }}
    >
      <div className="hp-cat-icon">{icon}</div>
      <div className="hp-cat-name">{type}</div>
      <div className="hp-cat-count mono">{count.toLocaleString()} repos</div>
      <div className="hp-cat-desc">{desc}</div>
    </div>
  )
}

// --- main ---
export default function HomePage() {
  const navigate = useNavigate()
  const [statsRef, statsInView] = useInView(0.2)
  const [stepsRef, stepsInView] = useInView(0.1)
  usePageMeta("Repo Zilla - Curated GitHub Repository Catalog", "Browse 34,787 curated GitHub repositories ranked by stars, forks, and activity. Filter by language, project type, and category.")

  return (
    <div className="hp-wrap">

      {/* ---- HERO ---- */}
      <section className="hp-hero">
        <div className="hp-hero-bg" aria-hidden="true" />
        <div className="hp-hero-inner">
          <h1 className="hp-title hp-fade-in" style={{ animationDelay: "0ms" }}>
            <span className="hp-title-bracket">[</span>
            REPO
            <span className="hp-title-accent">ZILLA</span>
            <span className="hp-title-bracket">]</span>
          </h1>
          <p className="hp-subtitle hp-fade-in" style={{ animationDelay: "160ms" }}>
            An open source, independently curated and ranked catalogue of 34,787 GitHub repositories.<br />
            Scored, classified, layered, so you can find what you need without wading through noise.
          </p>
          <div className="hp-hero-actions hp-fade-in" style={{ animationDelay: "240ms" }}>
            <button className="hp-btn-primary" onClick={() => navigate("/catalogue")} type="button">
              Browse Catalogue →
            </button>
            <button className="hp-btn-ghost" onClick={() => navigate("/about")} type="button">
              How it works
            </button>
          </div>
        </div>
      </section>

      {/* ---- STATS ---- */}
      <section className="hp-stats-section" ref={statsRef}>
        {STATS.map(s => (
          <StatCounter key={s.label} {...s} active={statsInView} />
        ))}
      </section>

      {/* ---- CATEGORIES ---- */}
      <section className="hp-section">
        <div className="hp-section-header">
          <h2 className="hp-section-title">Browse by Category</h2>
          <p className="hp-section-sub">
            Every repository is classified into one of 15 project types. Click a category to jump straight to filtered results.
          </p>
        </div>
        <div className="hp-cat-grid">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.slug} {...cat} desc={cat.shortDesc} delay={i * 40} />
          ))}
        </div>
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section className="hp-section hp-how-section" ref={stepsRef}>
        <div className="hp-section-header">
          <h2 className="hp-section-title">How the Catalog is Built</h2>
          <p className="hp-section-sub">
            Repo Zilla isn't a random GitHub dump. Every repository goes through a three-stage pipeline before it appears in the catalog.
          </p>
        </div>
        <div className="hp-steps">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`hp-step ${stepsInView ? "hp-in" : ""}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="hp-step-body">
                <div className="hp-step-title">{step.title}</div>
                <div className="hp-step-desc">{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="hp-cta-section">
        <div className="hp-cta-inner">
          <h2 className="hp-cta-title">Start Exploring</h2>
          <p className="hp-cta-sub">
            Search across names, descriptions, and topics. Filter by language, type, or category.
            Pin the repos you care about. They're saved locally, no account needed.
          </p>
          <button className="hp-btn-primary hp-btn-lg" onClick={() => navigate("/catalogue")}>
            Open the Catalogue →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

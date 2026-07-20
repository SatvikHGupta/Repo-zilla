import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer.jsx"
import { usePageMeta } from "../hooks/usePageMeta.js"

const QUICK_LINKS = [
  { slug: "backend", label: "Backend" },
  { slug: "frontend", label: "Frontend" },
  { slug: "ai-ml", label: "AI/ML" },
  { slug: "devops", label: "DevOps" },
  { slug: "python", label: "Python" },
  { slug: "fullstack", label: "Fullstack" },
]

export default function NotFoundPage() {
  const navigate = useNavigate()
  usePageMeta("404 - Repo Zilla", "This page doesn't exist. Browse the Repo Zilla catalogue of 34,787 curated GitHub repositories instead.")

  return (
    <div className="static-wrap">
      <div className="nf-inner">
        <div className="nf-eyebrow mono">ERROR · NOT IN THE CATALOGUE</div>

        <h1 className="nf-code">
          <span className="nf-code-bracket">[</span>
          404
          <span className="nf-code-bracket">]</span>
        </h1>

        <p className="nf-text">
          Checked all 34,787 repos in the catalogue. This URL doesn't match any of them.
          Most likely a typo, or a link pointing at something that's since moved.
        </p>

        <div className="nf-actions">
          <button className="hp-btn-primary" onClick={() => navigate("/catalogue")}>
            Browse Catalogue →
          </button>
          <button className="hp-btn-ghost" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>

        <div className="nf-links">
          <span className="nf-links-label mono">OR JUMP TO A CATEGORY</span>
          <div className="nf-links-row">
            {QUICK_LINKS.map((link) => (
              <button
                key={link.slug}
                className="nf-chip mono"
                onClick={() => navigate(`/explore/${link.slug}`)}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

import { Link } from "react-router-dom"
import Footer from "../components/Footer.jsx"
import { usePageMeta } from "../hooks/usePageMeta.js"

export default function ContactPage() {
  usePageMeta("Contact - Repo Zilla", "Contact Repo Zilla developer Satvik Hemant Gupta on GitHub.")

  return (
    <div className="static-wrap">
      <div className="static-inner">
        <Link to="/" className="static-back mono">← back</Link>

        <h1 className="static-title">Contact</h1>

        <div className="static-content">
          <p>
            Repo Zilla is maintained by <strong>Satvik Hemant Gupta</strong>. For questions, suggestions, or issues with the catalog, the best way to reach out is through GitHub.
          </p>

          <div className="contact-card">
            <div className="contact-label mono">developer</div>
            <div className="contact-name">Satvik Hemant Gupta</div>
            <a
              className="hp-btn-primary contact-link"
              href="https://github.com/SatvikHGupta"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/SatvikHGupta ↗
            </a>
          </div>

          <p style={{ marginTop: "2rem" }}>
            If you've found a bug, a miscategorized repository, or want to suggest a missing project type or category, opening an issue on the GitHub repository is the fastest path to getting it addressed.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link to="/" className="footer-brand mono">[REPOZILLA]</Link>
        <nav className="footer-links">
          <Link to="/catalogue">Catalogue</Link>
          <Link to="/about">About</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <a
          href="https://github.com/SatvikHGupta"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-copy mono"
        >
          © {new Date().getFullYear()} Satvik Hemant Gupta
        </a>
      </div>
    </footer>
  )
}

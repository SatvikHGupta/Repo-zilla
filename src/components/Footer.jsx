import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-brand mono">[REPOZILLA]</span>
        <nav className="footer-links">
          <Link to="/catalogue">Catalogue</Link>
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <span className="footer-copy mono">© {new Date().getFullYear()} Satvik Hemant Gupta</span>
      </div>
    </footer>
  )
}

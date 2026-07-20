import { useNavigate } from "react-router-dom"

const LAYER_LABELS = {
  3: { label: "SHELF", sublabel: "active picks", color: "#f59e0b" },
  2: { label: "PINNED", sublabel: "best of best", color: "#10b981" },
  1: { label: "VERIFIED", sublabel: "quality library", color: "#d97757" },
  0: { label: "ALL", sublabel: "full pool", color: "#9090a8" },
}

export default function Navbar({ theme, toggleTheme, stats, search, setSearch, activeLayer, setActiveLayer, layerData }) {
  const navigate = useNavigate()
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="nav-logo" onClick={() => navigate("/")} title="Go to homepage" type="button">
          <span className="logo-bracket">[</span>
          <span>REPO</span>
          <span className="logo-accent">ZILLA</span>
          <span className="logo-bracket">]</span>
        </button>
        <div className="layer-tabs" role="tablist" aria-label="Repository layer">
          {[3, 2, 1, 0].map(l => {
            const count = layerData[l]?.length ?? 0
            const stillLoading = l === 0 && count === 0
            return (
              <button
                key={l}
                className={`layer-tab ${activeLayer === l ? "active" : ""}`}
                style={{ "--tab-color": LAYER_LABELS[l].color }}
                onClick={() => setActiveLayer(l)}
                role="tab"
                aria-selected={activeLayer === l}
                type="button"
              >
                <span className="tab-label">{LAYER_LABELS[l].label}</span>
                <span className="tab-count">{stillLoading ? "..." : count.toLocaleString()}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="navbar-center">
        <div className="search-wrap">
          <span className="search-icon mono" aria-hidden="true">/</span>
          <input
            className="search-input"
            type="text"
            placeholder="search repos, descriptions, topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search repositories"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search" type="button">×</button>
          )}
        </div>
      </div>
      <div className="navbar-right">
        {stats && (
          <span className="nav-total mono">{stats.total.toLocaleString()} repos</span>
        )}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          aria-pressed={theme === "light"}
          type="button"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </nav>
  )
}

import { useMemo } from "react"

const SORT_OPTIONS = [
  { value: "score", label: "Score" },
  { value: "stars", label: "Stars" },
  { value: "forks", label: "Forks" },
  { value: "recent", label: "Recent" },
]

export default function Sidebar({ stats, filters, setFilters, repos }) {
  // compute available options from current repos
  const options = useMemo(() => {
    const languages = {}
    const projectTypes = {}
    const categories = {}
    repos.forEach(r => {
      if (r.language) languages[r.language] = (languages[r.language] || 0) + 1
      if (r.project_type) projectTypes[r.project_type] = (projectTypes[r.project_type] || 0) + 1
      if (r.category) categories[r.category] = (categories[r.category] || 0) + 1
    })
    return {
      languages: Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 20),
      projectTypes: Object.entries(projectTypes).sort((a, b) => b[1] - a[1]),
      categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
    }
  }, [repos])

  function toggleFilter(key, value) {
    setFilters(prev => {
      const arr = prev[key]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      }
    })
  }

  function clearAll() {
    setFilters({
      languages: [],
      projectTypes: [],
      categories: [],
      starsMin: 0,
      starsMax: Infinity,
      sortBy: "score",
    })
  }

  const hasFilters = filters.languages.length > 0 ||
    filters.projectTypes.length > 0 ||
    filters.categories.length > 0

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title mono">FILTERS</span>
        {hasFilters && (
          <button className="clear-btn" onClick={clearAll}>clear all</button>
        )}
      </div>

      <div className="sidebar-section">
        <div className="section-label">SORT BY</div>
        <div className="sort-options">
          {SORT_OPTIONS.map(o => (
            <button
              key={o.value}
              className={`sort-btn ${filters.sortBy === o.value ? "active" : ""}`}
              onClick={() => setFilters(prev => ({ ...prev, sortBy: o.value }))}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-label">PROJECT TYPE</div>
        <div className="filter-list">
          {options.projectTypes.map(([type, count]) => (
            <button
              key={type}
              className={`filter-item ${filters.projectTypes.includes(type) ? "active" : ""}`}
              onClick={() => toggleFilter("projectTypes", type)}
            >
              <span className="filter-name">{type}</span>
              <span className="filter-count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-label">LANGUAGE</div>
        <div className="filter-list">
          {options.languages.map(([lang, count]) => (
            <button
              key={lang}
              className={`filter-item ${filters.languages.includes(lang) ? "active" : ""}`}
              onClick={() => toggleFilter("languages", lang)}
            >
              <span className="filter-name">{lang}</span>
              <span className="filter-count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-label">CATEGORY</div>
        <div className="filter-list">
          {options.categories.map(([cat, count]) => (
            <button
              key={cat}
              className={`filter-item ${filters.categories.includes(cat) ? "active" : ""}`}
              onClick={() => toggleFilter("categories", cat)}
            >
              <span className="filter-name">{cat}</span>
              <span className="filter-count">{count}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
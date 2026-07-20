import { useMemo, useState, useRef, useEffect } from "react"
import Fuse from "fuse.js"
import RepoCard from "./RepoCard.jsx"
import Pagination from "./Pagination.jsx"

const PAGE_SIZE = 50
const SEARCH_DEBOUNCE_MS = 200

export default function RepoGrid({ repos, filters, search, userPins, userShelf, togglePin, toggleShelf, onSelect, layerLoading }) {
  const [page, setPage] = useState(1)
  const gridTopRef = useRef(null)

  // debounce the search term before it drives the (potentially expensive,
  // up to ~25k-row) Fuse.js query - the input itself stays instant, only
  // the actual filtering waits a beat for typing to pause.
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  // fuse search instance
  const fuse = useMemo(() => new Fuse(repos, {
    keys: ["name", "full_name", "description", "topics", "language", "category"],
    threshold: 0.3,
    includeScore: true,
  }), [repos])

  // filtered + sorted repos
  const filtered = useMemo(() => {
    let result = repos

    // search
    if (debouncedSearch.trim()) {
      result = fuse.search(debouncedSearch).map(r => r.item)
    }

    // filters
    if (filters.languages.length > 0)
      result = result.filter(r => filters.languages.includes(r.language))
    if (filters.projectTypes.length > 0)
      result = result.filter(r => filters.projectTypes.includes(r.project_type))
    if (filters.categories.length > 0)
      result = result.filter(r => filters.categories.includes(r.category))
    if (filters.starsMin > 0)
      result = result.filter(r => r.stars >= filters.starsMin)
    if (filters.starsMax !== Infinity)
      result = result.filter(r => r.stars <= filters.starsMax)

    // sort
    if (!debouncedSearch.trim()) {
      result = [...result].sort((a, b) => {
        if (filters.sortBy === "stars") return b.stars - a.stars
        if (filters.sortBy === "forks") return b.forks - a.forks
        if (filters.sortBy === "recent") return new Date(b.last_commit) - new Date(a.last_commit)
        return b.score - a.score
      })
    }

    return result
  }, [repos, debouncedSearch, filters, fuse])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // reset to page 1 whenever the result set changes (filters, search, or layer switch).
  // this is React's documented pattern for "adjusting state when a prop changes" -
  // a conditional set during render, not an effect (effects + setState cause an extra
  // wasted render and trip the new react-hooks/set-state-in-effect lint rule).
  const [prevFiltered, setPrevFiltered] = useState(filtered)
  if (filtered !== prevFiltered) {
    setPrevFiltered(filtered)
    setPage(1)
  }

  // if the filtered set shrinks (e.g. a stricter filter), clamp the displayed page
  // without needing another effect - just derive it at render time.
  const safePage = Math.min(page, totalPages)

  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handlePageChange(next) {
    setPage(next)
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="grid-wrap">
      <div className="grid-header" ref={gridTopRef}>
        <span className="grid-count mono">
          {filtered.length.toLocaleString()} repos
          {search && ` matching "${search}"`}
        </span>
      </div>
      <div className="repo-grid">
        {paginated.map(repo => (
          <RepoCard
            key={repo.full_name}
            repo={repo}
            isPinned={userPins[repo.full_name] || repo.layer >= 2}
            isShelf={userShelf[repo.full_name] || repo.layer === 3}
            togglePin={togglePin}
            toggleShelf={toggleShelf}
            onSelect={onSelect}
          />
        ))}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
      {filtered.length === 0 && layerLoading && (
        <div className="empty-state">
          <div className="empty-icon mono">…</div>
          <div className="empty-text">loading the full catalogue (only happens once)</div>
        </div>
      )}
      {filtered.length === 0 && !layerLoading && (
        <div className="empty-state">
          <div className="empty-icon">∅</div>
          <div className="empty-text">no repos match your filters</div>
        </div>
      )}
    </div>
  )
}

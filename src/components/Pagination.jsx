import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons.jsx"

export default function Pagination({ page, totalPages, onPageChange }) {
  const [gotoValue, setGotoValue] = useState("")

  // clear goto box on external page change; conditional set during render (see RepoGrid.jsx)
  const [prevPage, setPrevPage] = useState(page)
  if (page !== prevPage) {
    setPrevPage(page)
    setGotoValue("")
  }

  function clamp(n) {
    return Math.min(Math.max(1, n), totalPages)
  }

  function submitGoto() {
    const n = parseInt(gotoValue, 10)
    if (!Number.isNaN(n)) onPageChange(clamp(n))
    setGotoValue("")
  }

  function handleGotoChange(e) {
    // type=text now (no native spinner ever, in any browser) so we filter digits ourselves
    const digitsOnly = e.target.value.replace(/[^0-9]/g, "")
    setGotoValue(digitsOnly)
  }

  function handleGotoKey(e) {
    if (e.key === "Enter") submitGoto()
  }

  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(clamp(page - 1))}
        disabled={page <= 1}
        title="previous page"
      >
        <ChevronLeftIcon /> prev
      </button>

      <span className="page-indicator mono">{page} / {totalPages}</span>

      <button
        className="page-btn"
        onClick={() => onPageChange(clamp(page + 1))}
        disabled={page >= totalPages}
        title="next page"
      >
        next <ChevronRightIcon />
      </button>

      <div className="page-goto">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="go to"
          value={gotoValue}
          onChange={handleGotoChange}
          onKeyDown={handleGotoKey}
          className="goto-input mono"
        />
        <button className="goto-btn" onClick={submitGoto} disabled={!gotoValue}>go</button>
      </div>
    </div>
  )
}

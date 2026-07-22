import { useState, useEffect, useRef, useMemo } from "react"
import { getCachedReadme, setCachedReadme, getSummary } from "../db.js"
import { renderReadme } from "../lib/readme.js"
import { StarIcon, ForkIcon } from "./Icons.jsx"

const README_FETCH_TIMEOUT_MS = 6000

function fetchWithTimeout(url, signal, ms) {
  const controller = new AbortController()
  const onAbort = () => controller.abort()
  signal.addEventListener("abort", onAbort)
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal }).finally(() => {
    clearTimeout(timer)
    signal.removeEventListener("abort", onAbort)
  })
}

export default function RepoDetail({ repo, userPins, userShelf, togglePin, toggleShelf, onClose }) {
  const [readme, setReadme] = useState("")
  const [readmeBranch, setReadmeBranch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [summaryState, setSummaryState] = useState(null)
  const [tab, setTab] = useState("readme")
  const panelRef = useRef(null)
  const closeBtnRef = useRef(null)
  const triggerElRef = useRef(null)

  const isPinned = userPins[repo.full_name] || repo.layer >= 2
  const isShelf = userShelf[repo.full_name] || repo.layer === 3

  // reset to readme tab on repo change; derived during render to avoid an extra effect-triggered render
  const [prevRepo, setPrevRepo] = useState(repo)
  if (repo !== prevRepo) {
    setPrevRepo(repo)
    if (tab !== "readme") setTab("readme")
  }

  useEffect(() => {
    const abortController = new AbortController()
    let ignore = false

    async function loadReadme() {
      setLoading(true)
      const cached = await getCachedReadme(repo.full_name)
      if (cached) {
        // legacy cache entries (pre-branch-tracking) are a bare string -
        // treat those as "branch unknown" rather than guessing wrong
        const { content, branch } = typeof cached === "string"
          ? { content: cached, branch: null }
          : cached
        if (!ignore) {
          setReadme(content)
          setReadmeBranch(branch)
          setLoading(false)
        }
        return
      }
      const branches = ["main", "master", "dev", "develop"]
      let content = null
      let resolvedBranch = null
      outer: for (const branch of branches) {
        for (const filename of ["README.md", "readme.md"]) {
          try {
            const res = await fetchWithTimeout(
              `https://raw.githubusercontent.com/${repo.full_name}/${branch}/${filename}`,
              abortController.signal,
              README_FETCH_TIMEOUT_MS
            )
            if (res.ok) { content = await res.text(); resolvedBranch = branch; break outer }
          } catch {
            // this branch/filename doesn't exist (or timed out) - try the next one
          }
        }
      }
      if (ignore) return
      if (content) {
        await setCachedReadme(repo.full_name, content, resolvedBranch)
        if (!ignore) {
          setReadme(content)
          setReadmeBranch(resolvedBranch)
        }
      } else if (!ignore) {
        setReadme(`# ${repo.name}\n\n${repo.description || "No README available."}`)
        setReadmeBranch(null)
      }
      if (!ignore) setLoading(false)
    }

    async function loadSummary() {
      const saved = await getSummary(repo.full_name)
      if (!ignore && saved) setSummaryState(saved)
    }

    loadReadme()
    loadSummary()

    return () => {
      ignore = true
      abortController.abort()
    }
  }, [repo])

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // lock page scroll while panel is open, so it doesn't double up with the panel's own scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // focus trap: move focus in on open, cycle Tab within panel, restore focus on close
  useEffect(() => {
    triggerElRef.current = document.activeElement
    closeBtnRef.current?.focus()

    function onKeyDown(e) {
      if (e.key !== "Tab" || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      if (triggerElRef.current instanceof HTMLElement) triggerElRef.current.focus()
    }
  }, [])

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  const readmeHtml = useMemo(
    () => renderReadme(readme, repo.full_name, readmeBranch),
    [readme, repo.full_name, readmeBranch]
  )

  return (
    // click-outside-to-close is a mouse-only convenience; dialog is already keyboard-accessible
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="detail-backdrop"
      onClick={handleBackdrop}
    >
      <div
        className="detail-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-panel-name"
      >
        <div className="detail-header">
          <div className="detail-title-row">
            <span className="detail-name mono" id="detail-panel-name">{repo.full_name}</span>
            <div className="detail-header-actions">
              <button
                className={`action-btn ${isShelf ? "active-yellow" : ""}`}
                onClick={() => toggleShelf(repo.full_name)}
                title="toggle shelf"
                aria-label={isShelf ? "Remove from shelf" : "Add to shelf"}
                aria-pressed={isShelf}
                type="button"
              >◈</button>
              <button
                className={`action-btn ${isPinned ? "active-accent" : ""}`}
                onClick={() => togglePin(repo.full_name)}
                title="toggle pin"
                aria-label={isPinned ? "Unpin repository" : "Pin repository"}
                aria-pressed={isPinned}
                type="button"
              >⊕</button>
              <a
                href={`https://github.com/${repo.full_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn"
                title="open on GitHub"
                aria-label={`Open ${repo.full_name} on GitHub`}
              >↗</a>
              <button
                className="action-btn detail-close"
                onClick={onClose}
                title="close"
                aria-label="Close"
                ref={closeBtnRef}
                type="button"
              >✕</button>
            </div>
          </div>
          {repo.description && <p className="detail-desc">{repo.description}</p>}
          <div className="detail-meta">
            {repo.language && <span className="meta-pill">{repo.language}</span>}
            {repo.project_type && <span className="meta-pill accent">{repo.project_type}</span>}
            {repo.category && <span className="meta-pill">{repo.category}</span>}
            <span className="meta-pill"><StarIcon size={11} /> {repo.stars?.toLocaleString()}</span>
            <span className="meta-pill"><ForkIcon size={11} /> {repo.forks?.toLocaleString()}</span>
          </div>
          {repo.topics?.length > 0 && (
            <div className="detail-topics">
              {repo.topics.map(t => <span key={t} className="topic-tag">#{t}</span>)}
            </div>
          )}
        </div>

        <div className="detail-tabs">
          <button className={`detail-tab ${tab === "readme" ? "active" : ""}`} onClick={() => setTab("readme")} type="button">README</button>
          <button className={`detail-tab ${tab === "info" ? "active" : ""}`} onClick={() => setTab("info")} type="button">INFO</button>
        </div>

        <div className="detail-body">
          {tab === "readme" && (
            loading
              ? <div className="detail-loading mono">fetching readme...</div>
              : <div className="detail-readme" dangerouslySetInnerHTML={{ __html: readmeHtml }} />
          )}
          {tab === "info" && (
            <div className="detail-info">
              <div className="info-row"><span className="info-key mono">full_name</span><span>{repo.full_name}</span></div>
              <div className="info-row"><span className="info-key mono">stars</span><span>{repo.stars?.toLocaleString()}</span></div>
              <div className="info-row"><span className="info-key mono">forks</span><span>{repo.forks?.toLocaleString()}</span></div>
              <div className="info-row"><span className="info-key mono">language</span><span>{repo.language || "—"}</span></div>
              <div className="info-row"><span className="info-key mono">type</span><span>{repo.project_type || "—"}</span></div>
              <div className="info-row"><span className="info-key mono">category</span><span>{repo.category || "—"}</span></div>
              <div className="info-row"><span className="info-key mono">layer</span><span>L{repo.layer}</span></div>
              <div className="info-row"><span className="info-key mono">score</span><span>{repo.score}</span></div>
              <div className="info-row"><span className="info-key mono">last_commit</span><span>{repo.last_commit}</span></div>
              {summaryState && (
                <div className="info-summary">
                  <div className="info-key mono" style={{ marginBottom: 8 }}>summary</div>
                  <p>{summaryState}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

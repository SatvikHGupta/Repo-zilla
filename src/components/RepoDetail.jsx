import { useState, useEffect } from "react"
import { getCachedReadme, setCachedReadme, getSummary } from "../db.js"
import { StarIcon, ForkIcon } from "./Icons.jsx"

export default function RepoDetail({ repo, userPins, userShelf, togglePin, toggleShelf, onClose }) {
  const [readme, setReadme] = useState("")
  const [loading, setLoading] = useState(true)
  const [summaryState, setSummaryState] = useState(null)
  const [tab, setTab] = useState("readme")

  const isPinned = userPins[repo.full_name] || repo.layer >= 2
  const isShelf = userShelf[repo.full_name] || repo.layer === 3

  useEffect(() => {
    async function loadReadme() {
      setLoading(true)
      const cached = await getCachedReadme(repo.full_name)
      if (cached) {
        setReadme(cached)
        setLoading(false)
        return
      }
      const branches = ["main", "master", "dev", "develop"]
      let content = null
      for (const branch of branches) {
        try {
          const res = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/${branch}/README.md`)
          if (res.ok) { content = await res.text(); break }
          const res2 = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/${branch}/readme.md`)
          if (res2.ok) { content = await res2.text(); break }
        } catch {
          // this branch doesn't exist for this repo - try the next one
        }
      }
      if (content) {
        await setCachedReadme(repo.full_name, content)
        setReadme(content)
      } else {
        setReadme(`# ${repo.name}\n\n${repo.description || "No README available."}`)
      }
      setLoading(false)
    }

    async function loadSummary() {
      const saved = await getSummary(repo.full_name)
      if (saved) setSummaryState(saved)
    }

    loadReadme()
    loadSummary()
  }, [repo])

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="detail-backdrop" onClick={handleBackdrop}>
      <div className="detail-panel">
        <div className="detail-header">
          <div className="detail-title-row">
            <span className="detail-name mono">{repo.full_name}</span>
            <div className="detail-header-actions">
              <button className={`action-btn ${isShelf ? "active-yellow" : ""}`} onClick={() => toggleShelf(repo.full_name)} title="toggle shelf">◈</button>
              <button className={`action-btn ${isPinned ? "active-accent" : ""}`} onClick={() => togglePin(repo.full_name)} title="toggle pin">⊕</button>
              <a href={`https://github.com/${repo.full_name}`} target="_blank" rel="noopener noreferrer" className="action-btn" title="open on GitHub">↗</a>
              <button className="action-btn detail-close" onClick={onClose} title="close">✕</button>
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
          <button className={`detail-tab ${tab === "readme" ? "active" : ""}`} onClick={() => setTab("readme")}>README</button>
          <button className={`detail-tab ${tab === "info" ? "active" : ""}`} onClick={() => setTab("info")}>INFO</button>
        </div>

        <div className="detail-body">
          {tab === "readme" && (
            loading
              ? <div className="detail-loading mono">fetching readme...</div>
              : <pre className="detail-readme">{readme}</pre>
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

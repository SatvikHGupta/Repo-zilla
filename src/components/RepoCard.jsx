import { StarIcon, ForkIcon, ClockIcon } from "./Icons.jsx"

const LANG_COLORS = {
  JavaScript: "#f7df1e", TypeScript: "#3178c6", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
  C: "#555555", Shell: "#89e051", Dockerfile: "#384d54", Dart: "#00B4AB",
  Ruby: "#701516", PHP: "#4F5D95", HTML: "#e34c26", CSS: "#563d7c",
  Unknown: "#666666",
}

const TYPE_COLORS = {
  Frontend: "#06b6d4", Backend: "#10b981", Fullstack: "#7c6aff",
  "AI/ML": "#f59e0b", DevOps: "#ef4444", Database: "#8b5cf6",
  "Auth/Security": "#ec4899", Mobile: "#14b8a6", "CLI/Tools": "#6366f1",
  "Learning/Docs": "#84cc16", "UI/CSS": "#f97316", Boilerplate: "#94a3b8",
  Other: "#64748b",
}

function formatStars(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k"
  return n.toString()
}

function timeAgo(dateStr) {
  const months = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24 * 30))
  if (months < 1) return "this month"
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}yr ago`
}

// trimmed down from 5 topic tags -> 2. full details live in the slider on click, this is just a glance.
const VISIBLE_TOPICS = 2

export default function RepoCard({ repo, isPinned, isShelf, togglePin, toggleShelf, onSelect }) {
  const langColor = LANG_COLORS[repo.language] || "#666"
  const typeColor = TYPE_COLORS[repo.project_type] || "#666"

  return (
    <div className={`repo-card ${isPinned ? "is-pinned" : ""} ${isShelf ? "is-shelf" : ""}`}>
      <div className="card-top">
        <div className="card-badges">
          <span className="badge lang-badge" style={{ "--lang-color": langColor }}>
            <span className="lang-dot" />
            {repo.language || "Unknown"}
          </span>
          <span className="badge type-badge" style={{ background: typeColor + "22", color: typeColor, border: `1px solid ${typeColor}44` }}>
            {repo.project_type}
          </span>
        </div>
        <div className="card-actions">
          <button
            className={`action-btn ${isShelf ? "active-yellow" : ""}`}
            onClick={e => { e.stopPropagation(); toggleShelf(repo.full_name) }}
            title="add to shelf"
          >◈</button>
          <button
            className={`action-btn ${isPinned ? "active-accent" : ""}`}
            onClick={e => { e.stopPropagation(); togglePin(repo.full_name) }}
            title="pin repo"
          >⊕</button>
        </div>
      </div>

      <div className="card-main" onClick={() => onSelect(repo)}>
        <div className="card-name mono">{repo.full_name}</div>
        {repo.description && (
          <div className="card-desc card-desc-clamped">{repo.description}</div>
        )}
        {repo.topics?.length > 0 && (
          <div className="card-topics">
            {repo.topics.slice(0, VISIBLE_TOPICS).map(t => (
              <span key={t} className="topic-tag">#{t}</span>
            ))}
            {repo.topics.length > VISIBLE_TOPICS && (
              <span className="topic-more">+{repo.topics.length - VISIBLE_TOPICS}</span>
            )}
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="card-stats">
          <span className="stat"><StarIcon /> {formatStars(repo.stars)}</span>
          <span className="stat"><ForkIcon /> {formatStars(repo.forks)}</span>
          <span className="stat"><ClockIcon /> {timeAgo(repo.last_commit)}</span>
        </div>
        <div className="card-layer-badge" style={{
          background: repo.layer === 3 ? "#f59e0b22" : repo.layer === 2 ? "#10b98122" : "#7c6aff22",
          color: repo.layer === 3 ? "#f59e0b" : repo.layer === 2 ? "#10b981" : "#7c6aff",
        }}>
          L{repo.layer}
        </div>
      </div>
    </div>
  )
}

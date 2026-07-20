export default function LoadingScreen({ message, percent, stats }) {
  return (
    <div className="loading-screen">
      <div className="loading-inner">
        <div className="loading-logo">
          <span className="logo-bracket">[</span>
          <span className="logo-text">REPO</span>
          <span className="logo-accent">ZILLA</span>
          <span className="logo-bracket">]</span>
        </div>
        {stats && (
          <div className="loading-stats">
            <div className="stat-pill">{stats.total.toLocaleString()} repos</div>
            <div className="stat-pill">{stats.layers[1].toLocaleString()} verified</div>
            <div className="stat-pill">{stats.layers[2].toLocaleString()} pinned</div>
            <div className="stat-pill">{stats.layers[3].toLocaleString()} shelf</div>
          </div>
        )}
        <div className="loading-bar-wrap">
          <div className="loading-bar" style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
        <div className="loading-msg mono">{message}</div>
      </div>
    </div>
  )
}
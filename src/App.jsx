import { useState, useEffect, useCallback, useRef } from "react"
import { cacheLayer, getCachedLayer, getUserData, setUserData } from "./db.js"
import LoadingScreen from "./components/LoadingScreen.jsx"
import Navbar from "./components/Navbar.jsx"
import Sidebar from "./components/Sidebar.jsx"
import RepoGrid from "./components/RepoGrid.jsx"
import RepoDetail from "./components/RepoDetail.jsx"

const LAYER_FILES = {
  0: "/data/layer0.json",
  1: "/data/layer1.json",
  2: "/data/layer2.json",
  3: "/data/layer3.json",
}

export default function App({ initialType }) {
  const [theme, setTheme] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("theme") || "dark" : "dark"))
  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState("initializing...")
  const [loadingPct, setLoadingPct] = useState(0)
  const [stats, setStats] = useState(null)
  // all loaded repos per layer
  const [layerData, setLayerData] = useState({ 0: [], 1: [], 2: [], 3: [] })
  const [activeLayer, setActiveLayer] = useState(1)
  const [selectedRepo, setSelectedRepo] = useState(null)
  // user overrides stored in IndexedDB
  const [userPins, setUserPins] = useState({})
  const [userShelf, setUserShelf] = useState({})
  const [userTags, setUserTags] = useState({})
  // filters - initialType prop takes priority (from explore pages), then URL param fallback
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState(() => {
    const type = initialType
      || (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("type")
        : null)
    return {
      languages: [],
      projectTypes: type ? [type] : [],
      categories: [],
      starsMin: 0,
      starsMax: Infinity,
      sortBy: "score",
    }
  })

  // theme toggle
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  // load stats + layer 1 on mount, cache everything
  useEffect(() => {
    async function init() {
      try {
        // load stats
        setLoadingMsg("loading catalogue stats...")
        setLoadingPct(5)
        const statsRes = await fetch("/data/stats.json")
        const statsData = await statsRes.json()
        setStats(statsData)

        // load user data from IndexedDB
        setLoadingMsg("restoring your saved data...")
        setLoadingPct(15)
        const pins = await getUserData("pins")
        const shelf = await getUserData("shelf")
        const tags = await getUserData("tags")
        setUserPins(pins || {})
        setUserShelf(shelf || {})
        setUserTags(tags || {})

        // load layer 3 first (smallest, fastest)
        setLoadingMsg("loading active shelf...")
        setLoadingPct(25)
        await loadLayer(3, setLayerData)

        // load layer 2
        setLoadingMsg("loading pinned repos...")
        setLoadingPct(40)
        await loadLayer(2, setLayerData)

        // load layer 1 (default view)
        setLoadingMsg("loading verified library (7k repos)...")
        setLoadingPct(60)
        await loadLayer(1, setLayerData)

        setLoadingPct(90)
        setLoadingMsg("almost there...")

        // layer 0 (~18MB "ALL" catalogue) loads on demand, not here
        setLoadingPct(100)
        setLoadingMsg("ready.")
        setTimeout(() => setLoading(false), 400)

      } catch (err) {
        console.error("init error:", err)
        setLoadingMsg("something went wrong - refresh to retry")
      }
    }
    init()
  }, [])

  async function loadLayer(layer, setLayerData) {
    // check cache first
    const cached = await getCachedLayer(layer)
    if (cached && cached.length > 0) {
      setLayerData(prev => ({ ...prev, [layer]: cached }))
      return cached
    }
    // fetch from public/data
    const res = await fetch(LAYER_FILES[layer])
    const data = await res.json()
    await cacheLayer(layer, data)
    setLayerData(prev => ({ ...prev, [layer]: data }))
    return data
  }

  // fetches layer 0 only on first switch to that tab; ref just guards against double-fetch
  const layer0RequestedRef = useRef(false)
  useEffect(() => {
    if (activeLayer !== 0 || layerData[0].length > 0 || layer0RequestedRef.current) return
    layer0RequestedRef.current = true
    loadLayer(0, setLayerData)
  }, [activeLayer, layerData])
  const layer0Loading = activeLayer === 0 && layerData[0].length === 0

  // pin toggle
  const togglePin = useCallback(async (fullName) => {
    setUserPins(prev => {
      const next = { ...prev, [fullName]: !prev[fullName] }
      setUserData("pins", next)
      return next
    })
  }, [])

  // shelf toggle
  const toggleShelf = useCallback(async (fullName) => {
    setUserShelf(prev => {
      const next = { ...prev, [fullName]: !prev[fullName] }
      setUserData("shelf", next)
      return next
    })
  }, [])

  // get active repos based on layer + user overrides
  const activeRepos = layerData[activeLayer] || []

  if (loading) {
    return <LoadingScreen message={loadingMsg} percent={loadingPct} stats={stats} />
  }

  return (
    <div className="app-layout">
      <Navbar
        theme={theme}
        toggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")}
        stats={stats}
        search={search}
        setSearch={setSearch}
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        layerData={layerData}
      />
      <div className="main-content">
        <Sidebar
          stats={stats}
          filters={filters}
          setFilters={setFilters}
          activeLayer={activeLayer}
          repos={activeRepos}
        />
        <RepoGrid
          repos={activeRepos}
          filters={filters}
          search={search}
          userPins={userPins}
          userShelf={userShelf}
          userTags={userTags}
          togglePin={togglePin}
          toggleShelf={toggleShelf}
          onSelect={setSelectedRepo}
          activeLayer={activeLayer}
          layerLoading={layer0Loading}
        />
      </div>
      {selectedRepo && (
        <RepoDetail
          repo={selectedRepo}
          userPins={userPins}
          userShelf={userShelf}
          userTags={userTags}
          togglePin={togglePin}
          toggleShelf={toggleShelf}
          onClose={() => setSelectedRepo(null)}
        />
      )}
    </div>
  )
}
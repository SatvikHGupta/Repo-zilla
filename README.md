# Repo Zilla

> A curated, scored catalogue of 34,787 GitHub repositories - browse by tier, filter, search, and keep your own pins locally.

**Live:** https://repo-zilla.vercel.app/

---

## What this is

A client-side SPA for browsing a pre-scored catalogue of open source repos. No backend, no auth, no API calls on the critical path - everything ships as static JSON and gets cached in IndexedDB after first load, so repeat visits are instant.

See the [About page](https://repo-zilla.vercel.app/about) for how the scoring works.

---

## Project structure

```
public/
  data/
    stats.json      # totals per layer, language/type breakdowns
    layer0.json      # full pool - ~26k repos (post-verification)
    layer1.json      # verified - 7,000 repos
    layer2.json      # pinned - 1,750 repos
    layer3.json      # shelf - 250 repos
  icon.svg
  icon.png
  robots.txt
  sitemap.xml
  ads.txt

src/
  components/
    LoadingScreen.jsx   # progressive load UI with percentage
    Navbar.jsx           # layer tabs, search, theme toggle
    Sidebar.jsx           # language/type/category filters, sort
    RepoGrid.jsx          # card grid, Fuse.js fuzzy search
    RepoCard.jsx           # individual card, pin/shelf actions
    RepoDetail.jsx         # slide-in panel - README fetch + info tab
    AdUnit.jsx              # manual AdSense slot (currently unused - site runs on Auto Ads)
    Footer.jsx
  pages/                     # HomePage, ExplorePage, AboutPage, PrivacyPage, ContactPage, etc.
  hooks/
    usePageMeta.js             # per-page title/meta tag hook
  db.js                        # IndexedDB wrapper (idb) - layers, pins/shelf, README cache
  App.jsx                       # root state - layers, filters, routing
  main.jsx
  index.css                      # CSS custom properties, theming, all component styles
```

### The four layers

| Layer | Label    | Size        | What it is                          |
|-------|----------|-------------|--------------------------------------|
| 0     | ALL      | ~26k repos  | Full pool, post-verification         |
| 1     | VERIFIED | 7,000 repos | Cleared every quality check          |
| 2     | PINNED   | 1,750 repos | Highest scorers across all categories|
| 3     | SHELF    | 250 repos   | Curated top picks per category       |

Layers 3 and 2 load first (small, instant), then layer 1 (the default view), then layer 0 loads silently in the background.

### Caching

Every layer file is cached in IndexedDB after first fetch - later visits skip the network. Per-repo READMEs are cached the same way. User state (pins, shelf, tags) persists across sessions in IndexedDB; theme preference persists in localStorage.

---

## Data files

`public/data/*.json` are already included in this repo and tracked in git - the app works out of the box, no generation step required. If you want to regenerate them from the GitHub API yourself, the expected shapes are:

**`stats.json`**
```json
{
  "total": 34787,
  "layers": { "0": 25787, "1": 7000, "2": 1750, "3": 250 }
}
```

**`layer{0-3}.json`** - array of repo objects:
```json
[
  {
    "full_name": "owner/repo",
    "name": "repo",
    "description": "...",
    "stars": 45000,
    "forks": 3200,
    "language": "TypeScript",
    "topics": ["react", "frontend"],
    "project_type": "Frontend",
    "category": "UI Framework",
    "last_commit": "2024-11-01T00:00:00Z",
    "score": 9.4,
    "layer": 1
  }
]
```

---

## Stack

- **React 19** + **Vite 8** - dev server + optimized static build, prerendered per-route
- **Fuse.js** - client-side fuzzy search (name, description, topics, language, category)
- **idb** - typed IndexedDB wrapper for layer caching + user state
- **Space Mono + Space Grotesk** - typography
- No CSS framework - hand-written CSS custom properties, full dark/light theming

---

## Getting started

```bash
npm install
npm run dev        # local dev server
npm run build       # production build -> dist/
npm run preview      # serve the production build locally
```

Data and icons are already in `public/` - nothing else to configure to run locally.

---

## Deployment

`npm run build` outputs a static `dist/` directory. Deploy anywhere that serves static files:

- **Vercel** - connect the repo, output directory `dist` (this is what's live)
- **Netlify** - drag `dist/` into the dashboard, or connect the repo with build command `npm run build`
- **GitHub Pages** - push `dist/` to a `gh-pages` branch

`public/data/` is ~24MB total. Fine as-is on Vercel/Netlify's CDN; if you're self-hosting, put it behind a CDN or enable compression.

---

## Features

- Layer navigation - SHELF / PINNED / VERIFIED / ALL, instant tab switching, live counts
- Fuzzy search across name, description, topics, language, category
- Filter by language / project type / category, sort by score / stars / forks / recency
- Pin and shelf - personal overrides, persisted in IndexedDB, survive refresh
- Repo detail panel - fetches README straight from `raw.githubusercontent.com`, tries `main` / `master` / `dev` / `develop`, falls back to the repo description if none exist
- Dark / light theme, persisted in localStorage
- Fully offline-capable after first load - all layer data and viewed READMEs are cached

---

## Ads

The site runs Google AdSense via Auto Ads (script tag in `index.html`). `AdUnit.jsx` exists for manual slot placement but isn't wired into any page yet.

---

## License

See [LICENSE](LICENSE).

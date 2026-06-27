# Repo Zilla

> Catalogue for the top ~33,000 GitHub repositories - curated personally by stars, forks, and activity.

**Live:** [https://repo-zilla.vercel.app/]

---

## Overview

Repo Zilla is a client-side SPA for browsing a hand-curated catalogue of GitHub's most valuable open source repositories. All data is pre-processed and served as static JSON - there is no backend, no API calls on the critical path, and no auth.

The catalogue is organised into four quality layers with IndexedDB caching so repeat visits are instant.

---

## Architecture

```
public/
  data/
    stats.json       # catalogue metadata (total counts per layer)
    layer0.json      # full pool - all ~33k repos
    layer1.json      # verified quality library - ~7k repos
    layer2.json      # pinned - best of the best
    layer3.json      # shelf - active picks
  icon.svg           # app icon (SVG)
  icon.png           # app icon (512x512 PNG)

src/
  components/
    LoadingScreen.jsx  # progressive load UI with percentage
    Navbar.jsx         # layer tabs, search bar, theme toggle
    Sidebar.jsx        # filter panel (language, type, category, sort)
    RepoGrid.jsx       # card grid with Fuse.js fuzzy search
    RepoCard.jsx       # individual repo card with pin/shelf actions
    RepoDetail.jsx     # slide-in panel with README fetch + info tab
  db.js               # IndexedDB wrapper via idb (layers, user data, readmes)
  App.jsx             # root state - layers, filters, user overrides
  main.jsx
  index.css           # CSS custom properties, full theming, component styles
```

### Data Layer Model

| Layer | Label    | Description                      | Approximate Size |
|-------|----------|----------------------------------|-----------------|
| 3     | SHELF    | Active personal picks            | Small            |
| 2     | PINNED   | Best of the best                 | Medium           |
| 1     | VERIFIED | Quality library - default view   | ~7k repos        |
| 0     | ALL      | Full pool, background-loaded     | ~33k repos       |

Layers 3 and 2 load first, then layer 1 (the default view), then layer 0 silently in the background so the UI becomes interactive fast regardless of the full dataset size.

### Caching Strategy

All layer JSON is cached in IndexedDB after first fetch - subsequent loads skip the network entirely. Per-repo README fetches are also cached. User state (pins, shelf, tags) persists in IndexedDB across sessions.

---

## Data Files

The `public/data/` directory is not included in the repository. You must generate and place these files yourself before running or deploying.

### Expected Formats

**`stats.json`**
```json
{
  "total": 33000,
  "layers": { "0": 33000, "1": 7000, "2": 500, "3": 50 }
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

The `scripts/` directory contains the data pipeline used to generate these files from the GitHub API.

---

## Stack

- **React 19** + **Vite 8** - fast dev server and optimised production builds
- **Fuse.js** - client-side fuzzy search across name, description, topics, language, category
- **idb** - typed IndexedDB wrapper for layer caching and user state persistence
- **Space Mono + Syne** - typography
- No CSS framework - hand-written CSS custom properties with full dark/light theming

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Add your data files to public/data/
#    Required: stats.json, layer0.json, layer1.json, layer2.json, layer3.json

# 3. Add icons to public/
#    Required: icon.svg, icon.png (512x512)

# 4. Dev server
npm run dev

# 5. Production build
npm run build
npm run preview
```

---

## Deployment

The production build outputs a fully static `dist/` directory. Deploy to any static host:

- **Vercel** - `vercel --prod` or connect the repo, set output directory to `dist`
- **Netlify** - drag `dist/` into the dashboard or connect repo with build command `npm run build`
- **GitHub Pages** - push `dist/` to `gh-pages` branch

> Data files in `public/data/` are large (layer0 alone is ~30MB uncompressed). Consider hosting behind a CDN or enabling Vite's compression plugin if load time is a concern.

---

## Scripts

The `scripts/` directory contains the data pipeline. It runs separately from the app and is not part of the Vite build.

| Script               | Purpose                                                    |
|---------------------|------------------------------------------------------------|
| `fetch.js`          | Fetch repos from GitHub API with checkpoint/resume support |
| `score.js`          | Score and rank repos; assign quality layers                |
| `prepare_data.js`   | Split scored data into layer JSON files + stats.json       |
| `fetch_readmes.js`  | Pre-fetch READMEs (optional - app fetches lazily on demand)|
| `peak.js`           | Inspect checkpoint state during pipeline runs              |

---

## Features

- **Layer navigation** - switch between SHELF / PINNED / VERIFIED / ALL with instant tab switching and live counts
- **Fuzzy search** - Fuse.js search across name, description, topics, language, category
- **Filter panel** - filter by programming language, project type, category; sort by score / stars / forks / recency
- **Pin and shelf** - per-user overrides persisted in IndexedDB, survive browser refresh
- **Repo detail panel** - slide-in drawer fetching README from `raw.githubusercontent.com`, tries `main` / `master` / `dev` / `develop` branches, falls back to description
- **Dark / light theme** - toggle with preference persisted in localStorage
- **Offline-friendly** - all layer data and READMEs cached in IndexedDB after first load

---

## License

See [LICENSE](MIT License).

# RepoZilla site

A free, read-only catalog and search of public GitHub repositories with 50+ stars. React + Vite single-page app, no backend: everything is read from static catalog files and searched in the browser (a Web Worker owns the catalog).

## Run it

```powershell
npm install
npm run dev
```

`npm run dev` reads the catalog from the local export in `./cloudflare-data` (served at `/local-data` by a dev-only middleware in `vite/localData.js`). The folder is git-ignored and never part of a build. Missing files answer `404`, which is what the catalog reader expects.

To try the live data host instead, put this line in `.env.development.local` (git-ignored) and restart `npm run dev`:

```
VITE_DATA_BASE=https://repozilla-data.pages.dev
```

It has to be `.env.development.local`: a plain `.env.local` is read with a lower priority than `.env.development`, so it would not change anything. Without a file, set it for one PowerShell window only: `$env:VITE_DATA_BASE = "https://repozilla-data.pages.dev"; npm run dev`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server, local data |
| `npm run build` | production build into `dist/`, data URL from `.env.production` |
| `npm run preview` | serve `dist/` locally |
| `npm run lint` | ESLint (the pipeline's `src/data/catalog_*.js` kit files are excluded) |
| `npm test` | Vitest unit tests (filters, README handling, formatting, theme, dev middleware, sort and star-range engine) |

Node 22.12+ (Vite 8 and Vitest 5 requirements).

## Data (not part of this repository)

The repository holds only the working site. The catalog (about 2 GB, 13,000 files) lives on Cloudflare Pages and is read in the browser from the stable URL `https://repozilla-data.pages.dev` (`VITE_DATA_BASE` in `.env.production`, baked in at build time). A monthly job on the owner's PC (`refresh.js` in the separate `repozilla-fetch` folder) crawls GitHub, builds the catalog and the sort indexes, and uploads it to the same Cloudflare project, so the site shows new data without a rebuild or a redeploy. Nothing in the data pipeline is stored on GitHub.

- `npm run build` fails unless `VITE_DATA_BASE` is a plain https origin (`vite/dataBaseCheck.js`), so a broken data URL can never be deployed. A hashed one-snapshot URL such as `https://34738650.repozilla-data.pages.dev` is refused too (set `ALLOW_PINNED_DATA_URL=1` to override on purpose).
- Every data file except `manifest.json` is requested as `<file>?v=<snapshot hash>` (`src/data/rz_reader.js`), and the manifest is served with `Cache-Control: no-cache`, so a new snapshot never mixes with cached files of an older one.
- Deep links (`/repo/owner/name`) work on Vercel through `vercel.json` (all paths rewrite to `index.html`).

`src/data/rz_catalog.js` extends the pipeline reader (star windows, global sorts) without touching the kit files `src/data/catalog_*.js`, which are copied verbatim from the pipeline and are not linted here. The sort indexes (`sort/*.bin.gz`) are built by the refresh job; when the manifest has none, the dropdown only offers "Most starred".

## What is in git

`.gitignore` lists the allowed files and ignores everything else: `package.json`, `package-lock.json`, `index.html`, `vite.config.js`, `eslint.config.js`, `vercel.json`, `README.md`, `.env.development`, `.env.production`, `.env.example`, and the folders `src/`, `public/`, `vite/`. The local data export (`cloudflare-data/`, `cloudflare-data.prev/`), `.wrangler/`, `node_modules/`, `dist/` and the deployment records stay on the PC.

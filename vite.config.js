import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseFrontmatter, makeExcerpt, estimateReadingTime, isPublished } from './src/lib/blogParse.js'
import { CATEGORIES } from './src/data/categories.js'

// Vercel (and most static hosts) auto-serve a root-level 404.html with a
// real HTTP 404 status for any unmatched path. The prerender plugin only
// writes routes to their own folder (dist/404/index.html), so this copies
// it to dist/404.html after the build.
function copy404Plugin() {
  return {
    name: 'copy-404-to-root',
    closeBundle() {
      const src = resolve(__dirname, 'dist/404/index.html')
      const dest = resolve(__dirname, 'dist/404.html')
      if (existsSync(src)) copyFileSync(src, dest)
    },
  }
}

// reads every .md file in src/content/blog/ and pulls its `slug:` field, so
// adding a new blog post never requires touching this config file — drop
// the .md file in, it's prerendered automatically on the next build.
function getBlogSlugs() {
  const dir = resolve(__dirname, 'src/content/blog')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const content = readFileSync(resolve(dir, f), 'utf-8')
      const match = content.match(/^slug:\s*(.+)$/m)
      return match ? match[1].trim().replace(/^"(.*)"$/, '$1') : null
    })
    .filter(Boolean)
}

const blogRoutes = getBlogSlugs().map((slug) => `/blog/${slug}`)

// Generates src/lib/blog-meta.generated.json - title/date/category/tags/
// excerpt/readingTime for every post, and NOTHING else. Deliberately never
// touches the full markdown body: the body stays out of this file so it can
// stay out of the eagerly-loaded browser bundle too (see blog.js, which
// loads bodies lazily/code-split instead of eagerly). Runs on buildStart so
// it's always fresh for both `vite dev` and `vite build`. The generated
// file is committed so a fresh checkout always has a valid one to import
// even before the first build runs.
function generateBlogMetaPlugin() {
  return {
    name: 'generate-blog-meta',
    buildStart() {
      const dir = resolve(__dirname, 'src/content/blog')
      const entries = existsSync(dir)
        ? readdirSync(dir)
            .filter((f) => f.endsWith('.md'))
            .map((f) => {
              const raw = readFileSync(resolve(dir, f), 'utf-8')
              const { meta, body } = parseFrontmatter(raw)
              if (!meta.slug) return null
              return {
                slug: meta.slug,
                title: meta.title || meta.slug,
                date: meta.date || '2026-07-08',
                category: meta.category || 'general',
                tags: Array.isArray(meta.tags) ? meta.tags : [],
                excerpt: makeExcerpt(body),
                readingTime: estimateReadingTime(body),
                // exact key import.meta.glob() uses in blog.js, so a slug
                // can be mapped back to its lazy body loader
                file: `/src/content/blog/${f}`,
              }
            })
            .filter(Boolean)
            // Filter HERE, at generation time - not just when blog.js reads
            // this file back. This file is what src/lib/blog.js imports
            // (and, transitively, whatever bundle ends up importing THAT),
            // so any post that shouldn't be public yet must never be
            // written into it in the first place. See the long comment in
            // src/prerender.jsx for the full story of why "filter on read"
            // isn't good enough here.
            //
            // Real consequence of this: a post becomes visible starting
            // from the first BUILD that runs on or after its publish date,
            // not the instant a visitor's clock crosses that date within an
            // already-deployed session. If you want same-day publishing
            // without remembering to redeploy, wire a scheduled rebuild
            // (Vercel Cron Job -> Deploy Hook) to run daily; without one,
            // "live" means "live as of your next deploy on/after the date."
            .filter((e) => isPublished(e.date))
        : []

      entries.sort((a, b) => (a.date < b.date ? 1 : -1))

      const dest = resolve(__dirname, 'src/lib/blog-meta.generated.json')
      writeFileSync(dest, JSON.stringify(entries, null, 2) + '\n')
    },
  }
}

const STATIC_ROUTES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/catalogue', changefreq: 'weekly', priority: '0.8' },
  ...CATEGORIES.map((cat) => ({
    loc: `/explore/${cat.slug}`,
    changefreq: 'weekly',
    // larger categories get a slightly higher priority, same tiering the
    // old hand-written list used (backend..python at 0.9, the rest at 0.8)
    priority: cat.count >= 1800 ? '0.9' : '0.8',
  })),
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/about', changefreq: 'monthly', priority: '0.7' },
  { loc: '/privacy', changefreq: 'monthly', priority: '0.5' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
]

// generates dist/sitemap.xml from the static route list above plus every
// blog post's real slug + publish date — new posts appear here automatically
function generateSitemapPlugin() {
  return {
    name: 'generate-sitemap',
    closeBundle() {
      const dir = resolve(__dirname, 'src/content/blog')
      const blogEntries = existsSync(dir)
        ? readdirSync(dir)
            .filter((f) => f.endsWith('.md'))
            .map((f) => {
              const content = readFileSync(resolve(dir, f), 'utf-8')
              const slugMatch = content.match(/^slug:\s*(.+)$/m)
              const dateMatch = content.match(/^date:\s*(.+)$/m)
              const slug = slugMatch ? slugMatch[1].trim().replace(/^"(.*)"$/, '$1') : null
              const date = dateMatch ? dateMatch[1].trim().replace(/^"(.*)"$/, '$1') : null
              if (!slug || !isPublished(date)) return null
              return { loc: `/blog/${slug}`, changefreq: 'monthly', priority: '0.7', lastmod: date }
            })
            .filter(Boolean)
        : []

      const allEntries = [...STATIC_ROUTES, ...blogEntries]
      const xml =
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        allEntries
          .map(
            (e) =>
              `  <url>\n    <loc>https://repo-zilla.vercel.app${e.loc}</loc>\n` +
              (e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : '') +
              `    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>\n`
          )
          .join('') +
        '</urlset>\n'

      const dest = resolve(__dirname, 'dist/sitemap.xml')
      writeFileSync(dest, xml)
    },
  }
}

export default defineConfig({
  plugins: [
    generateBlogMetaPlugin(),
    react(),
    vitePrerenderPlugin({
      renderTarget: '#root',
      additionalPrerenderRoutes: [
        '/404',
        '/about',
        '/privacy',
        '/contact',
        ...CATEGORIES.map((cat) => `/explore/${cat.slug}`),
        '/blog',
        ...blogRoutes,
      ],
    }),
    copy404Plugin(),
    generateSitemapPlugin(),
  ],
})

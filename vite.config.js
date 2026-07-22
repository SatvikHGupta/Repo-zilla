import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseFrontmatter, makeExcerpt, estimateReadingTime, isPublished } from './src/lib/blogParse.js'
import { CATEGORIES } from './src/data/categories.js'

// Vercel needs dist/404.html for real 404 status; prerender only writes dist/404/index.html
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

// new .md file in src/content/blog/ is auto-prerendered, no config changes needed
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

// generates blog-meta.generated.json (metadata only, no body - keeps bodies lazy-loaded in blog.js)
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
                file: `/src/content/blog/${f}`, // key blog.js's import.meta.glob() uses
              }
            })
            .filter(Boolean)
            // filtered here (not just on read) so unpublished posts never enter blog.js's bundle
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
    priority: cat.count >= 1800 ? '0.9' : '0.8', // larger categories rank slightly higher
  })),
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
  { loc: '/about', changefreq: 'monthly', priority: '0.7' },
  { loc: '/privacy', changefreq: 'monthly', priority: '0.5' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
]

// generates dist/sitemap.xml: static routes + every published blog post
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

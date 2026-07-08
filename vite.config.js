import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

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

const STATIC_ROUTES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/catalogue', changefreq: 'weekly', priority: '0.8' },
  { loc: '/explore/backend', changefreq: 'weekly', priority: '0.9' },
  { loc: '/explore/ai-ml', changefreq: 'weekly', priority: '0.9' },
  { loc: '/explore/frontend', changefreq: 'weekly', priority: '0.9' },
  { loc: '/explore/devops', changefreq: 'weekly', priority: '0.9' },
  { loc: '/explore/js-general', changefreq: 'weekly', priority: '0.9' },
  { loc: '/explore/python', changefreq: 'weekly', priority: '0.9' },
  { loc: '/explore/systems', changefreq: 'weekly', priority: '0.8' },
  { loc: '/explore/mobile', changefreq: 'weekly', priority: '0.8' },
  { loc: '/explore/database', changefreq: 'weekly', priority: '0.8' },
  { loc: '/explore/learning', changefreq: 'weekly', priority: '0.8' },
  { loc: '/explore/auth-security', changefreq: 'weekly', priority: '0.8' },
  { loc: '/explore/ui-css', changefreq: 'weekly', priority: '0.8' },
  { loc: '/explore/fullstack', changefreq: 'weekly', priority: '0.8' },
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
              return slug ? { loc: `/blog/${slug}`, changefreq: 'monthly', priority: '0.7', lastmod: date } : null
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
    react(),
    vitePrerenderPlugin({
      renderTarget: '#root',
      additionalPrerenderRoutes: [
        '/404',
        '/about',
        '/privacy',
        '/contact',
        '/explore/backend',
        '/explore/ai-ml',
        '/explore/frontend',
        '/explore/devops',
        '/explore/js-general',
        '/explore/python',
        '/explore/systems',
        '/explore/mobile',
        '/explore/database',
        '/explore/learning',
        '/explore/auth-security',
        '/explore/ui-css',
        '/explore/fullstack',
        '/blog',
        ...blogRoutes,
      ],
    }),
    copy404Plugin(),
    generateSitemapPlugin(),
  ],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'
import { copyFileSync, existsSync } from 'node:fs'
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
      ],
    }),
    copy404Plugin(),
  ],
})

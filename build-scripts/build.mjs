// Wrapper around `vite build` that force-exits once the build actually finishes.
// Some plugin/dependency in this project's build chain leaves a background
// handle open (worker thread / keep-alive socket) after vite's build() promise
// resolves, so the plain `vite` CLI never exits on its own — it just hangs
// until Vercel's 45-minute build timeout kills it. By the time build()
// resolves, all output (dist/, prerendered pages) is already fully written
// to disk, so forcing exit here is safe.
import { build } from 'vite'

await build()
console.log('Build finished — exiting explicitly.')
process.exit(0)

import { build } from 'vite'

// vite build (with vite-prerender-plugin) leaves a background handle open
// after finishing all real work (a worker thread + idle keep-alive sockets),
// which keeps Node's event loop alive indefinitely. All output is already
// fully written to disk by the time build() resolves, so it's safe to force
// the process to exit here rather than let it hang until a host's build
// timeout kills it.
async function run() {
  try {
    await build()
    console.log('\nBuild finished, exiting.')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()

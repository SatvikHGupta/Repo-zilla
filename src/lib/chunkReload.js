// After a new deploy the hashed files of the old build are gone, so a tab that was opened before it fails when it lazy-loads a page or the repo panel.
// Vite reports that as "vite:preloadError": reload once to pick up the new build. The flag stops a loop if the failure is something else.
const FLAG = 'rz-chunk-reload', WINDOW_MS = 15_000;

export function installChunkReload(win = window) {
  const onError = (event) => {
    let last = 0;
    try { last = Number(win.sessionStorage.getItem(FLAG)) || 0; } catch { /* storage blocked: fall through and reload once */ }
    if (Date.now() - last < WINDOW_MS) return; // reloaded a moment ago and it still fails: let the error boundary show it
    try { win.sessionStorage.setItem(FLAG, String(Date.now())); } catch { /* ignore */ }
    event.preventDefault();
    win.location.reload();
  };
  win.addEventListener('vite:preloadError', onError);
  return () => win.removeEventListener('vite:preloadError', onError);
}

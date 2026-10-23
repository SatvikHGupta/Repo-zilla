// Production build guard: the site must read its data from the Cloudflare data host, never from local files.
// Author: Satvik Hemant Gupta
// Fails `npm run build` (so Vercel never ships a broken site) unless VITE_DATA_BASE is a plain https origin.
// A hashed one-snapshot URL (https://34738650.repozilla-data.pages.dev) is refused too: it never gets new data. Use the stable URL.
export function checkDataBase(url, { allowPinned = false } = {}) {
  const v = String(url || '').trim();
  if (!v) return 'VITE_DATA_BASE is not set. Put it in .env.production or in the Vercel Environment Variables (https://repozilla-data.pages.dev).';
  if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(v)) return `VITE_DATA_BASE must be a plain https origin with no path and no trailing slash, got "${v}".`;
  if (!allowPinned && /^https:\/\/[0-9a-f]{8}\./i.test(v)) return `VITE_DATA_BASE "${v}" is a one-snapshot URL and would never see new data. Use the stable URL (https://repozilla-data.pages.dev).`;
  return null;
}

export default function dataBaseCheck() {
  return {
    name: 'rz-data-base-check',
    apply: 'build',
    configResolved(config) {
      const problem = checkDataBase(config.env.VITE_DATA_BASE, { allowPinned: process.env.ALLOW_PINNED_DATA_URL === '1' });
      if (problem) throw new Error(`[data-base-check] ${problem}`);
    },
  };
}

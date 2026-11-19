// Production build guard: the site must read its data from the Cloudflare data host, never from local files.
// Author: Satvik Hemant Gupta
// Fails `npm run build` (so Vercel never ships a broken site) unless VITE_DATA_BASE is a plain https origin.
// A hashed one-snapshot URL (https://34738650.repozilla-data.pages.dev) is refused too: it never gets new data. Use the stable URL.
import fs from 'node:fs';
import path from 'node:path';

export function checkDataBase(url, { allowPinned = false } = {}) {
  const v = String(url || '').trim();
  if (!v) return 'VITE_DATA_BASE is not set. Put it in .env.production or in the Vercel Environment Variables (https://repozilla-data.pages.dev).';
  if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(v)) return `VITE_DATA_BASE must be a plain https origin with no path and no trailing slash, got "${v}".`;
  if (!allowPinned && /^https:\/\/[0-9a-f]{8}\./i.test(v)) return `VITE_DATA_BASE "${v}" is a one-snapshot URL and would never see new data. Use the stable URL (https://repozilla-data.pages.dev).`;
  return null;
}

// The Content-Security-Policy in vercel.json only lets the page fetch from the hosts it lists. If VITE_DATA_BASE moves to another host and the policy is
// not updated, the browser would block every data request and the site would look empty, so the build fails instead.
export function checkCsp(dataBase, vercelConfig) {
  const headers = (vercelConfig?.headers || []).flatMap((h) => h.headers || []);
  const csp = headers.find((h) => String(h.key).toLowerCase() === 'content-security-policy');
  if (!csp) return null; // no policy, nothing to block
  const connect = String(csp.value).split(';').map((d) => d.trim()).find((d) => d.startsWith('connect-src '));
  if (!connect) return null; // falls back to default-src, which has no data host: report it
  const allowed = connect.split(/\s+/).slice(1);
  const host = new URL(dataBase).hostname;
  const ok = allowed.some((a) => a === dataBase || (a.startsWith('https://*.') && host.endsWith(a.slice('https://*'.length))));
  return ok ? null : `vercel.json: the Content-Security-Policy connect-src does not list ${dataBase}, so the browser would block the catalog. Add it to connect-src (now: ${allowed.join(' ')}).`;
}

export default function dataBaseCheck() {
  return {
    name: 'rz-data-base-check',
    apply: 'build',
    configResolved(config) {
      let problem = checkDataBase(config.env.VITE_DATA_BASE, { allowPinned: process.env.ALLOW_PINNED_DATA_URL === '1' });
      if (!problem) {
        const file = path.join(config.root, 'vercel.json');
        if (fs.existsSync(file)) problem = checkCsp(config.env.VITE_DATA_BASE, JSON.parse(fs.readFileSync(file, 'utf8')));
      }
      if (problem) throw new Error(`[data-base-check] ${problem}`);
    },
  };
}

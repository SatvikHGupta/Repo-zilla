import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
// Link previews need absolute addresses (a chat app or a search engine cannot resolve "/og-image.png" on its own), so the picture, the canonical address and
// the large Twitter card are added at build time from VITE_SITE_URL, the address the site is served from. Without it the page still works, with a text-only preview.

// VITE_SITE_URL if it is set. On Vercel the production address is available to the build as VERCEL_PROJECT_PRODUCTION_URL (host only), so previews work there with no setup.
export function resolveSiteUrl(viteEnv, processEnv) {
  const own = (viteEnv.VITE_SITE_URL || '').trim();
  if (own) return own;
  const vercel = (processEnv.VERCEL_PROJECT_PRODUCTION_URL || '').trim();
  return vercel ? `https://${vercel}` : '';
}

// an https origin and nothing else: https://repozilla.vercel.app
export function checkSiteUrl(url) {
  let u;
  try { u = new URL(url); } catch { return `VITE_SITE_URL "${url}" is not a URL`; }
  if (u.protocol !== 'https:') return `VITE_SITE_URL must be an https address, got ${url}`;
  if (u.origin !== url) return `VITE_SITE_URL must be only the origin, without a path or a trailing slash. Did you mean ${u.origin}?`;
  return null;
}

// the <head> lines that need the site address
export function siteTags(site) {
  const image = `${site}/og-image.png`;
  return [
    `<link rel="canonical" href="${site}/" />`,
    `<meta property="og:url" content="${site}/" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:image:type" content="image/png" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="RepoZilla: a ring chart of every domain in the catalog, and the sentence Every popular public GitHub repo, in one searchable index." />',
    `<meta name="twitter:image" content="${image}" />`,
  ];
}

export function addSiteTags(html, site) {
  const withCard = html.replace('<meta name="twitter:card" content="summary" />', '<meta name="twitter:card" content="summary_large_image" />');
  return withCard.replace('</head>', `    ${siteTags(site).join('\n    ')}\n  </head>`);
}

// Head lines that make the first load faster: the main typeface is fetched at once (otherwise it is found only after the CSS is parsed, and the text
// flashes), and the connection to the data host is opened while the app is still loading.
export function speedTags({ fonts = [], dataOrigin = '' }) {
  const tags = fonts.map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin />`);
  if (dataOrigin) tags.push(`<link rel="preconnect" href="${dataOrigin}" crossorigin />`);
  return tags;
}

// The pages worth indexing. Search, repository and domain-detail pages are left out on purpose (see public/robots.txt).
export const SITEMAP_PATHS = ['/', '/domains', '/about', '/contact', '/terms', '/privacy'];

export function sitemapXml(site) {
  const urls = SITEMAP_PATHS.map((p) => `  <url><loc>${site}${p === '/' ? '/' : p}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// robots.txt gets the sitemap line once the site address is known (the line needs an absolute address); it is never added twice
export function robotsWithSitemap(robots, site) {
  if (/^Sitemap:/im.test(robots)) return robots;
  return `${robots.replace(/\s*$/, '\n')}\nSitemap: ${site}/sitemap.xml\n`;
}

export default function sitePlugin() {
  let site = '';
  let dataOrigin = '';
  let outDir = '';
  let build = false;
  return {
    name: 'rz-site-meta',
    apply: 'build',
    configResolved(config) {
      try { const u = new URL(config.env.VITE_DATA_BASE || ''); if (u.protocol === 'https:') dataOrigin = u.origin; } catch { /* no data host set: nothing to connect to early */ }
      site = resolveSiteUrl(config.env, process.env);
      build = config.command === 'build';
      outDir = resolve(config.root, config.build.outDir);
      if (!site) { config.logger.warn('[site-meta] VITE_SITE_URL is not set: link previews will have no picture. Set it in .env.production to the address the site is served from (on Vercel it is found by itself).'); return; }
      const problem = checkSiteUrl(site);
      if (problem) throw new Error(`[site-meta] ${problem}`);
    },
    // after the build: sitemap.xml, and the Sitemap line in robots.txt (only when the site address is known)
    closeBundle() {
      if (!build || !site || checkSiteUrl(site)) return;
      writeFileSync(resolve(outDir, 'sitemap.xml'), sitemapXml(site));
      const robots = resolve(outDir, 'robots.txt');
      if (existsSync(robots)) writeFileSync(robots, robotsWithSitemap(readFileSync(robots, 'utf8'), site));
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const out = site ? addSiteTags(html, site) : html;
        // only the Latin part of the sans typeface (the other scripts are fetched only if a page needs them)
        const fonts = Object.keys(ctx.bundle || {}).filter((f) => /ibm-plex-sans-latin-wght-normal-.*\.woff2$/.test(f)).map((f) => `/${f}`);
        const tags = speedTags({ fonts, dataOrigin });
        return tags.length ? out.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`) : out;
      },
    },
  };
}

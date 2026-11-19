// Dev only: serves ./cloudflare-data at /local-data so `npm run dev` reads the real export from disk. Never part of the build output.
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.json': 'application/json; charset=utf-8', '.gz': 'application/octet-stream', '.bin': 'application/octet-stream' };

// maps a URL path to a file inside root, or null when it would escape root
export function resolveLocalPath(root, urlPath) {
  let rel;
  try { rel = decodeURIComponent(String(urlPath).split('?')[0]); } catch { return null; }
  if (rel.includes('\0')) return null;
  const abs = path.resolve(root, '.' + (rel.startsWith('/') ? rel : '/' + rel));
  return abs === root || abs.startsWith(root + path.sep) ? abs : null;
}

const statOrNull = (file) => { try { return fs.statSync(file); } catch { return null; } };

export default function localData({ dir = 'cloudflare-data', mount = '/local-data' } = {}) {
  let root = '';
  return {
    name: 'rz-local-data',
    apply: 'serve',
    configResolved(config) { root = path.resolve(config.root, dir); },
    configureServer(server) {
      if (!fs.existsSync(root)) server.config.logger.warn(`[local-data] ${root} not found, /local-data will 404`);
      server.middlewares.use(mount, (req, res) => {
        const send = (code, body) => { res.statusCode = code; res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Content-Type', 'text/plain; charset=utf-8'); res.end(body); };
        if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, 'method not allowed');
        const file = resolveLocalPath(root, req.url || '/');
        const stat = file ? statOrNull(file) : null;
        // answer 404 here: letting it fall through would return index.html with 200 and the catalog reader would try to parse it
        if (!file || !stat || !stat.isFile()) return send(404, 'not found');
        res.statusCode = 200;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
        res.setHeader('Content-Length', stat.size);
        if (req.method === 'HEAD') return res.end();
        fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
      });
    },
  };
}

// Generates theme.css and theme-init.js (the pre-paint script) from the registry, both with a hashed URL, and fails loudly on unreadable colours.
// The script is a file rather than inline code so the Content-Security-Policy can say script-src 'self' with no exceptions.
import { createHash } from 'node:crypto';
import { MODES, ACCENTS, DEFAULTS, KEYS } from '../src/theme/registry.js';
import { validate, buildCss, initScript } from '../src/theme/core.js';

export default function themePlugin() {
  validate(MODES, ACCENTS);
  const css = buildCss(MODES, ACCENTS, DEFAULTS);
  const hash = createHash('sha256').update(css).digest('hex').slice(0, 8);
  const script = initScript({ modes: MODES.map((m) => m.id), accents: ACCENTS.map((a) => a.id), def: DEFAULTS, keys: KEYS });
  const scriptHash = createHash('sha256').update(script).digest('hex').slice(0, 8);
  const serve = (body, type) => (req, res) => { res.setHeader('Content-Type', type); res.setHeader('Cache-Control', 'no-cache'); res.end(body); };
  return {
    name: 'rz-theme',
    configureServer(server) { server.middlewares.use('/theme.css', serve(css, 'text/css; charset=utf-8')); server.middlewares.use('/theme-init.js', serve(script, 'text/javascript; charset=utf-8')); },
    configurePreviewServer(server) { server.middlewares.use('/theme.css', serve(css, 'text/css; charset=utf-8')); server.middlewares.use('/theme-init.js', serve(script, 'text/javascript; charset=utf-8')); },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'theme.css', source: css });
      this.emitFile({ type: 'asset', fileName: 'theme-init.js', source: script });
    },
    transformIndexHtml() {
      return [
        // a plain blocking script (not a module): it must run before the first paint
        { tag: 'script', attrs: { src: `/theme-init.js?v=${scriptHash}` }, injectTo: 'head-prepend' },
        { tag: 'link', attrs: { rel: 'stylesheet', href: `/theme.css?v=${hash}` }, injectTo: 'head' },
      ];
    },
  };
}

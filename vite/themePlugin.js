// Generates theme.css from the registry (hashed URL), injects the pre-paint script, and fails loudly on unreadable colours.
import { createHash } from 'node:crypto';
import { MODES, ACCENTS, DEFAULTS, KEYS } from '../src/theme/registry.js';
import { validate, buildCss, initScript } from '../src/theme/core.js';

export default function themePlugin() {
  validate(MODES, ACCENTS);
  const css = buildCss(MODES, ACCENTS, DEFAULTS);
  const hash = createHash('sha256').update(css).digest('hex').slice(0, 8);
  const script = initScript({ modes: MODES.map((m) => m.id), accents: ACCENTS.map((a) => a.id), def: DEFAULTS, keys: KEYS });
  const serve = (req, res) => { res.setHeader('Content-Type', 'text/css; charset=utf-8'); res.setHeader('Cache-Control', 'no-cache'); res.end(css); };
  return {
    name: 'rz-theme',
    configureServer(server) { server.middlewares.use('/theme.css', serve); },
    configurePreviewServer(server) { server.middlewares.use('/theme.css', serve); },
    generateBundle() { this.emitFile({ type: 'asset', fileName: 'theme.css', source: css }); },
    transformIndexHtml() {
      return [
        { tag: 'script', children: script, injectTo: 'head-prepend' },
        { tag: 'link', attrs: { rel: 'stylesheet', href: `/theme.css?v=${hash}` }, injectTo: 'head' },
      ];
    },
  };
}

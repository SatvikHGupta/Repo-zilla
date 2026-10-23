import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// a source file that ended up empty compiles and lints fine but breaks at runtime (a lazy import gets no default export)
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

describe('source files', () => {
  it('has no empty files', () => {
    const empty = walk('src').filter((f) => /\.(jsx?|css|svg)$/.test(f) && fs.statSync(f).size === 0);
    expect(empty).toEqual([]);
  });
  it('gives every lazily imported component a default export', () => {
    const lazy = ['src/components/repo/RepoPanel.jsx', 'src/pages/About.jsx', 'src/pages/Terms.jsx', 'src/pages/Privacy.jsx'];
    for (const f of lazy) expect(fs.readFileSync(f, 'utf8'), f).toMatch(/export default/);
  });
});

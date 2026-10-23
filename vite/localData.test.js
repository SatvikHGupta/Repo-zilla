import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { resolveLocalPath } from './localData.js';

const root = path.resolve('/tmp/data-root');
describe('resolveLocalPath', () => {
  it('maps normal paths into the root', () => {
    expect(resolveLocalPath(root, '/manifest.json')).toBe(path.join(root, 'manifest.json'));
    expect(resolveLocalPath(root, '/post/pk-0001.bin.gz?x=1')).toBe(path.join(root, 'post', 'pk-0001.bin.gz'));
  });
  it('refuses traversal, encoded traversal and null bytes', () => {
    for (const bad of ['/../secret', '/a/../../secret', '/%2e%2e/secret', '/..%2fsecret', '/x%00y', '/%E0%A4%A']) expect(resolveLocalPath(root, bad)).toBeNull();
  });
});

// Cache-safe reads behind a STABLE data URL: every file except manifest.json is fetched as <file>?v=<hash of this snapshot>.
// Author: Satvik Hemant Gupta
// manifest.json is served with Cache-Control: no-cache, so a new monthly snapshot is picked up on the next visit; its
// files.files_json_sha256 changes with the data, so the ?v= URLs change too and no cached file of an older snapshot is reused.
export function versioned(read) {
  let v = '';
  const f = (rel) => read(v && rel !== 'manifest.json' ? `${rel}?v=${v}` : rel);
  f.setVersion = (manifest) => { v = String(manifest?.files?.files_json_sha256 || '').slice(0, 12); };
  return f;
}

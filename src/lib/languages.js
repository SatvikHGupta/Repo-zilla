// Display names for facet keys (the catalog stores them lower-cased) plus the license grouping used by the filter.
const LANGS = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python', java: 'Java', c: 'C', 'c++': 'C++', 'c#': 'C#', go: 'Go', rust: 'Rust', php: 'PHP', ruby: 'Ruby',
  swift: 'Swift', kotlin: 'Kotlin', 'objective-c': 'Objective-C', 'objective-c++': 'Objective-C++', shell: 'Shell', html: 'HTML', css: 'CSS', scss: 'SCSS', sass: 'Sass', less: 'Less',
  dart: 'Dart', lua: 'Lua', r: 'R', scala: 'Scala', perl: 'Perl', haskell: 'Haskell', elixir: 'Elixir', erlang: 'Erlang', clojure: 'Clojure', 'jupyter notebook': 'Jupyter Notebook',
  vue: 'Vue', svelte: 'Svelte', astro: 'Astro', powershell: 'PowerShell', 'vim script': 'Vim Script', 'vim l': 'Vim Script', 'emacs lisp': 'Emacs Lisp', tex: 'TeX', dockerfile: 'Dockerfile',
  makefile: 'Makefile', cmake: 'CMake', matlab: 'MATLAB', 'f#': 'F#', 'common lisp': 'Common Lisp', zig: 'Zig', nim: 'Nim', julia: 'Julia', groovy: 'Groovy', assembly: 'Assembly',
  coffeescript: 'CoffeeScript', hcl: 'HCL', nix: 'Nix', solidity: 'Solidity', ocaml: 'OCaml', verilog: 'Verilog', vhdl: 'VHDL', gdscript: 'GDScript', glsl: 'GLSL', mdx: 'MDX',
  'visual basic .net': 'Visual Basic .NET', 'vba': 'VBA', 'batchfile': 'Batchfile', 'v': 'V', 'wgsl': 'WGSL', 'racket': 'Racket', 'scheme': 'Scheme', 'fortran': 'Fortran', 'cuda': 'CUDA',
  none: 'No language',
};
export const langLabel = (key) => LANGS[key] || String(key).replace(/(^|[\s-])(\w)/g, (_, a, b) => a + b.toUpperCase());

// deterministic hue per language so dots stay stable across pages; lightness comes from the theme (--hue-l)
export function hueOf(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 360;
}

const LICS = {
  mit: 'MIT', 'apache-2.0': 'Apache-2.0', 'gpl-3.0': 'GPL-3.0', 'gpl-2.0': 'GPL-2.0', 'agpl-3.0': 'AGPL-3.0', 'lgpl-3.0': 'LGPL-3.0', 'lgpl-2.1': 'LGPL-2.1',
  'bsd-3-clause': 'BSD-3-Clause', 'bsd-2-clause': 'BSD-2-Clause', isc: 'ISC', 'mpl-2.0': 'MPL-2.0', unlicense: 'Unlicense', 'cc0-1.0': 'CC0-1.0', 'epl-2.0': 'EPL-2.0',
  'epl-1.0': 'EPL-1.0', 'bsl-1.0': 'BSL-1.0', '0bsd': '0BSD', 'cc-by-4.0': 'CC-BY-4.0', 'cc-by-sa-4.0': 'CC-BY-SA-4.0', wtfpl: 'WTFPL', zlib: 'zlib', 'artistic-2.0': 'Artistic-2.0',
  'ofl-1.1': 'OFL-1.1', 'eupl-1.2': 'EUPL-1.2', postgresql: 'PostgreSQL', noassertion: 'Other (unspecified)', other: 'Other', none: 'No license',
};
export const licLabel = (key) => LICS[key] || String(key).toUpperCase();
// raw GitHub license text for display: known ids get the friendly name, anything else is shown as GitHub reported it
export const licenseText = (raw) => (raw ? LICS[String(raw).toLowerCase()] || String(raw) : 'No license');

export const LIC_GROUPS = [
  { id: 'permissive', label: 'Permissive', hint: 'MIT, Apache, BSD, ISC and similar' },
  { id: 'copyleft', label: 'Copyleft', hint: 'GPL, AGPL, LGPL, MPL and similar' },
  { id: 'other', label: 'Other licenses', hint: 'Named licenses that are neither of the above' },
  { id: 'none', label: 'No license', hint: 'No license, or GitHub could not tell' },
];
const PERMISSIVE = /^(mit|mit-0|apache-2\.0|bsd-[0-9a-z-]+|isc|unlicense|0bsd|cc0-1\.0|zlib|bsl-1\.0|wtfpl|postgresql|artistic-2\.0|ncsa|upl-1\.0|blueoak-1\.0\.0|cc-by-4\.0|afl-3\.0|ecl-2\.0|ofl-1\.1|vim)$/;
const COPYLEFT = /^(agpl|gpl|lgpl|mpl|epl|eupl|osl|cc-by-sa|cecill|cddl|ms-rl|gfdl|lppl|apsl|cpal)/;
export function licGroupOf(key) {
  if (key === 'none' || key === 'noassertion' || key === 'other') return 'none';
  if (PERMISSIVE.test(key)) return 'permissive';
  if (COPYLEFT.test(key)) return 'copyleft';
  return 'other';
}
// facets().counts -> { permissive: ["lic:mit", ...], ... } so a group filter is an OR over real facet keys
export function licKeysByGroup(counts = {}) {
  const out = { permissive: [], copyleft: [], other: [], none: [] };
  for (const k of Object.keys(counts)) if (k.startsWith('lic:')) out[licGroupOf(k.slice(4))].push(k);
  return out;
}

// Theme engine (see THEME-ENGINE.md): a few colours in, validated + derived tokens, one stylesheet, no flash. Pure, no DOM needed except createStore.

// ---------- colour maths ----------
export function parse(value) {
  const v = String(value).trim();
  let m = /^#([0-9a-f]{6})$/i.exec(v);
  if (m) { const n = parseInt(m[1], 16); return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: 1 }; }
  m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(v);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  return null;
}
const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
const toHex = ({ r, g, b }) => '#' + [r, g, b].map((x) => clamp(x).toString(16).padStart(2, '0')).join('');
const triplet = (c) => `${c.r}, ${c.g}, ${c.b}`;
const rgba = (c, a) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;

function luminance({ r, g, b }) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a, b) {
  const x = luminance(parse(a)), y = luminance(parse(b));
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function mix(a, b, t) {
  const x = parse(a), y = parse(b);
  return toHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });
}
// text colour for a filled button: whichever of white / near-black reads better
export const readableOn = (bg) => (contrast('#ffffff', bg) >= contrast('#0b0b10', bg) ? '#ffffff' : '#0b0b10');

// ---------- validation ----------
const MODE_KEYS = ['bg', 'surface', 'text', 'textMuted', 'success', 'warning', 'danger', 'codeBg'];
const ACCENT_KEYS = ['primary', 'hover', 'link'];

// throws one readable error listing every problem
export function validate(modes, accents) {
  const errors = [];
  const need = (label, fg, bg, min) => {
    const r = contrast(fg, bg);
    if (r < min) errors.push(`${label}: contrast ${r.toFixed(2)}, needs ${min}`);
  };
  const ids = new Set();
  for (const m of modes) {
    if (ids.has(m.id)) errors.push(`duplicate mode id ${m.id}`);
    ids.add(m.id);
    const c = m.colors;
    let ok = true;
    for (const k of MODE_KEYS) if (!c[k] || !parse(c[k])) { errors.push(`mode ${m.id}: ${k} is not a colour`); ok = false; }
    for (const k of Object.keys(c)) if (!MODE_KEYS.includes(k) && k !== 'border') errors.push(`mode ${m.id}: unknown key ${k}`);
    if (!ok) continue;
    need(`mode ${m.id} text on bg`, c.text, c.bg, 4.5);
    need(`mode ${m.id} text on surface`, c.text, c.surface, 4.5);
    need(`mode ${m.id} textMuted on surface`, c.textMuted, c.surface, 4.5);
    need(`mode ${m.id} textMuted on bg`, c.textMuted, c.bg, 4.5);
    for (const k of ['success', 'warning', 'danger']) need(`mode ${m.id} ${k} on surface`, c[k], c.surface, 4.5);
    need(`mode ${m.id} text on code background`, c.text, c.codeBg, 4.5);
  }
  const aids = new Set();
  for (const a of accents) {
    if (aids.has(a.id)) errors.push(`duplicate accent id ${a.id}`);
    aids.add(a.id);
    for (const m of modes) {
      const x = a[m.id];
      if (!x || !ACCENT_KEYS.every((k) => x[k] && parse(x[k]))) { errors.push(`accent ${a.id} on ${m.id}: missing or invalid colours`); continue; }
      for (const k of Object.keys(x)) if (!ACCENT_KEYS.includes(k)) errors.push(`accent ${a.id} on ${m.id}: unknown key ${k}`);
      const tag = `accent ${a.id} on ${m.id}`;
      need(`${tag}: primary on bg`, x.primary, m.colors.bg, 3);
      need(`${tag}: primary on surface`, x.primary, m.colors.surface, 3);
      need(`${tag}: link on bg`, x.link, m.colors.bg, 4.5);
      need(`${tag}: link on surface`, x.link, m.colors.surface, 4.5);
      need(`${tag}: button label`, readableOn(x.primary), x.primary, 4.5);
    }
    if (a.partner !== undefined && !parse(a.partner)) errors.push(`accent ${a.id}: partner is not a colour`);
  }
  if (errors.length) throw new Error('Invalid theme registry:\n - ' + errors.join('\n - '));
}

// ---------- token derivation ----------
export function modeTokens(m) {
  const c = m.colors, dark = m.id === 'dark', text = parse(c.text);
  const shadow = dark ? '0, 0, 0' : triplet(text);
  return {
    bg: c.bg,
    surface: c.surface,
    'surface-hover': mix(c.surface, c.text, 0.05),
    'surface-raised': mix(c.surface, c.text, 0.035),
    'surface-sunken': mix(c.bg, '#000000', dark ? 0.35 : 0.03),
    text: c.text,
    'text-muted': c.textMuted,
    'text-faint': mix(c.textMuted, c.bg, 0.4),
    border: c.border ?? rgba(text, 0.1),
    'border-strong': rgba(text, 0.22),
    success: c.success,
    'success-bg': rgba(parse(c.success), 0.14),
    warning: c.warning,
    'warning-bg': rgba(parse(c.warning), 0.14),
    danger: c.danger,
    'danger-bg': rgba(parse(c.danger), 0.14),
    'code-bg': c.codeBg,
    scrim: dark ? 'rgba(4, 4, 6, 0.62)' : 'rgba(24, 22, 16, 0.38)',
    'shadow-sm': `0 1px 2px rgba(${shadow}, ${dark ? 0.35 : 0.08})`,
    'shadow-md': `0 6px 20px rgba(${shadow}, ${dark ? 0.4 : 0.1})`,
    'shadow-lg': `0 18px 50px rgba(${shadow}, ${dark ? 0.55 : 0.16})`,
    'hue-l': dark ? '68%' : '38%',
    'accent-gradient': 'linear-gradient(135deg, var(--accent), var(--accent-2))',
    'bg-glow': 'radial-gradient(60% 50% at 0% 0%, rgba(var(--accent-rgb), 0.12), transparent 70%), radial-gradient(50% 45% at 100% 0%, rgba(var(--accent-2-rgb), 0.07), transparent 70%)',
    'color-scheme': m.id,
  };
}
export function accentTokens(m, a) {
  const x = a[m.id], p = parse(x.primary), partner = parse(a.partner ?? x.link);
  return {
    accent: x.primary,
    'accent-hover': x.hover,
    'accent-link': x.link,
    'accent-rgb': triplet(p),
    'accent-fg': readableOn(x.primary),
    'accent-subtle': rgba(p, 0.12),
    'accent-glow': rgba(p, 0.3),
    'accent-2': toHex(partner),
    'accent-2-rgb': triplet(partner),
  };
}
export const partnerTokens = (a) => {
  const p = parse(a.partner ?? a.dark.link);
  return { 'accent-2': toHex(p), 'accent-2-rgb': triplet(p) };
};

// ---------- CSS generation ----------
const decls = (t) => Object.entries(t).map(([k, v]) => `  --${k}: ${v};`).join('\n');
export function buildCss(modes, accents, def) {
  const out = [];
  for (const m of modes) {
    const sel = m.id === def.mode ? `:root,\nhtml[data-mode='${m.id}']` : `html[data-mode='${m.id}']`;
    out.push(`${sel} {\n${decls(modeTokens(m))}\n}`);
  }
  for (const m of modes) for (const a of accents) {
    const pair = `html[data-mode='${m.id}'][data-accent='${a.id}']`;
    const sel = m.id === def.mode && a.id === def.accent ? `:root,\n${pair}` : pair;
    out.push(`${sel} {\n${decls(accentTokens(m, a))}\n}`);
  }
  // partner overrides come last: same specificity as the pair blocks, so they win when data-partner is set
  for (const a of accents) out.push(`html[data-accent][data-partner='${a.id}'] {\n${decls(partnerTokens(a))}\n}`);
  return out.join('\n\n') + '\n';
}

// ---------- pre-paint script (inline in <head>, before any content) ----------
export function initScript({ modes, accents, def, keys }) {
  const j = JSON.stringify;
  return `(function(){var d=document.documentElement,M=${j(modes)},A=${j(accents)},K=${j(keys)},s,m=null,a=null,p=null;`
    + `try{s=window.localStorage;m=s.getItem(K.mode);a=s.getItem(K.accent);p=s.getItem(K.partner)}catch(e){}`
    + `var rm=M.indexOf(m)>-1?m:${j(def.mode)},ra=A.indexOf(a)>-1?a:${j(def.accent)},rp=A.indexOf(p)>-1?p:null;`
    + `d.setAttribute('data-mode',rm);d.setAttribute('data-accent',ra);`
    + `if(rp)d.setAttribute('data-partner',rp);else d.removeAttribute('data-partner')})()`;
}

// ---------- runtime store (framework-agnostic) ----------
export function createStore({ doc, storage, modes, accents, def, keys }) {
  const subs = new Set();
  const read = (k) => { try { return storage.getItem(k); } catch { return null; } };
  const write = (k, v) => { try { if (v === null) storage.removeItem(k); else storage.setItem(k, v); } catch { /* blocked storage: the attribute still applies for this session */ } };
  const attr = (n) => doc.documentElement.getAttribute(n);
  const set = (name, key, value) => {
    if (value === null) doc.documentElement.removeAttribute(name); else doc.documentElement.setAttribute(name, value);
    write(key, value);
    subs.forEach((f) => f());
    return true;
  };
  return {
    get: () => ({ mode: attr('data-mode') ?? def.mode, accent: attr('data-accent') ?? def.accent, partner: attr('data-partner') }),
    subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
    notify: () => subs.forEach((f) => f()),
    setMode: (id) => modes.includes(id) && set('data-mode', keys.mode, id),
    setAccent: (id) => accents.includes(id) && set('data-accent', keys.accent, id),
    setPartner: (id) => (id === null || accents.includes(id)) && set('data-partner', keys.partner, id),
    stored: () => ({ mode: read(keys.mode), accent: read(keys.accent), partner: read(keys.partner) }),
  };
}

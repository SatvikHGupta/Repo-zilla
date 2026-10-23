import { describe, it, expect } from 'vitest';
import { MODES, ACCENTS, DEFAULTS, KEYS } from './registry.js';
import { validate, buildCss, initScript, contrast, createStore } from './core.js';

describe('theme registry', () => {
  it('passes every contrast rule', () => { expect(() => validate(MODES, ACCENTS)).not.toThrow(); });
  it('names the colour and ratio when an accent is unreadable', () => {
    const bad = [{ id: 'bad', dark: { primary: '#101010', hover: '#101010', link: '#101010' }, light: { primary: '#fafafa', hover: '#fafafa', link: '#fafafa' } }];
    expect(() => validate(MODES, bad)).toThrow(/accent bad on dark: link on surface: contrast/);
  });
  it('rejects unknown keys and duplicate ids', () => {
    const typo = [{ ...ACCENTS[0], dark: { ...ACCENTS[0].dark, primarry: '#fff' } }];
    expect(() => validate(MODES, typo)).toThrow(/unknown key primarry/);
    expect(() => validate(MODES, [ACCENTS[0], ACCENTS[0]])).toThrow(/duplicate accent id/);
  });
  it('emits one block per mode, per pair and per partner, defaults on :root', () => {
    const css = buildCss(MODES, ACCENTS, DEFAULTS);
    expect((css.match(/ \{$/gm) || []).length).toBe(MODES.length + MODES.length * ACCENTS.length + ACCENTS.length);
    expect(css).toContain(`:root,\nhtml[data-mode='${DEFAULTS.mode}'] {`);
    expect(css.trimEnd().endsWith('}')).toBe(true);
    expect(css.lastIndexOf("data-partner='")).toBeGreaterThan(css.lastIndexOf("data-accent='"));
  });
  it('computes readable button labels for every accent and mode', () => {
    for (const m of MODES) for (const a of ACCENTS) {
      const p = a[m.id].primary, fg = contrast('#ffffff', p) >= contrast('#0b0b10', p) ? '#ffffff' : '#0b0b10';
      expect(contrast(fg, p)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('init script and store', () => {
  const run = (stored) => {
    const attrs = {};
    const doc = { documentElement: { setAttribute: (k, v) => { attrs[k] = v; }, removeAttribute: (k) => { delete attrs[k]; }, getAttribute: (k) => attrs[k] ?? null } };
    const script = initScript({ modes: MODES.map((m) => m.id), accents: ACCENTS.map((a) => a.id), def: DEFAULTS, keys: KEYS });
    new Function('document', 'window', script)(doc, { localStorage: { getItem: (k) => stored[k] ?? null } });
    return attrs;
  };
  it('applies saved values and repairs garbage', () => {
    expect(run({ [KEYS.mode]: 'light', [KEYS.accent]: 'teal', [KEYS.partner]: 'rose' })).toEqual({ 'data-mode': 'light', 'data-accent': 'teal', 'data-partner': 'rose' });
    expect(run({ [KEYS.mode]: '<script>', [KEYS.accent]: 'nope', [KEYS.partner]: 'x' })).toEqual({ 'data-mode': DEFAULTS.mode, 'data-accent': DEFAULTS.accent });
  });
  it('still applies the theme when storage throws', () => {
    const attrs = {};
    const doc = { documentElement: { setAttribute: (k, v) => { attrs[k] = v; }, removeAttribute: (k) => { delete attrs[k]; }, getAttribute: (k) => attrs[k] ?? null } };
    const store = createStore({ doc, storage: { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } }, modes: ['dark', 'light'], accents: ['amber'], def: DEFAULTS, keys: KEYS });
    expect(store.setMode('light')).toBe(true);
    expect(store.get().mode).toBe('light');
    expect(store.setMode('neon')).toBe(false);
    expect(store.stored().mode).toBeNull();
  });
});

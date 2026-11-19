// Colours for the charts. Chart.js paints on a canvas, which cannot read CSS variables, so every colour is worked out here as hsl.
// One rule keeps it calm: neighbours differ in lightness as well as hue, so two next to each other never blur into one.

// { h, s, l } -> a CSS colour, with an optional opacity
export const css = ({ h, s, l }, alpha = 1) => `hsl(${Math.round(h)} ${s}% ${l}% / ${alpha})`;

const lightness = (index, mode) => (mode === 'light' ? (index % 2 ? 56 : 65) : (index % 2 ? 56 : 66));

// a domain's colour: the hue steps evenly round the wheel in the catalog's own order, so a domain keeps its colour on every page
export function domainColor(index, count, mode) {
  return { h: (index * 360) / Math.max(1, count) + 345, s: mode === 'light' ? 66 : 60, l: lightness(index, mode) };
}
export const domainHue = (index, count) => Math.round(((index * 360) / Math.max(1, count) + 345) % 360);

// the colours of the n subdomains of one domain: a band of hues around the domain's own (about 100 degrees wide), alternating in lightness
export function subColor(baseHue, index, count, mode) {
  const step = Math.min(16, 100 / Math.max(1, count));
  return { h: (baseHue + (index - (count - 1) / 2) * step + 360) % 360, s: mode === 'light' ? 64 : 62, l: lightness(index, mode) };
}

// the grey of "uncategorized"
export const NEUTRAL = (mode) => ({ h: 220, s: 8, l: mode === 'light' ? 58 : 52 });

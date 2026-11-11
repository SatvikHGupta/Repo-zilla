// Star counts span 50 to hundreds of thousands, so the range slider works on a log scale with 1000 steps.
export const STAR_FLOOR = 50;
export const SLIDER_STEPS = 1000;

export function starToPos(stars, top) {
  if (!(top > STAR_FLOOR) || !(stars > STAR_FLOOR)) return 0;
  const p = Math.log(stars / STAR_FLOOR) / Math.log(top / STAR_FLOOR);
  return Math.max(0, Math.min(SLIDER_STEPS, Math.round(p * SLIDER_STEPS)));
}
export function posToStar(pos, top) {
  if (!(top > STAR_FLOOR)) return STAR_FLOOR;
  const p = Math.max(0, Math.min(SLIDER_STEPS, pos)) / SLIDER_STEPS;
  return Math.round(STAR_FLOOR * (top / STAR_FLOOR) ** p);
}
// rounds a slider value to three significant digits from 1,000 up (12,345 -> 12,300), exact below. The rounding error stays under
// 0.5%, far less than one slider step (about 4.7%), so one step always moves the value.
export function niceStars(v) {
  if (v < 1000) return Math.round(v);
  const mag = 10 ** (Math.floor(Math.log10(v)) - 2);
  return Math.round(v / mag) * mag;
}

// what a slider handle position means for the filter. 0 = no bound (everything has 50+ stars, so the bottom of the range is "no minimum").
export const sliderMin = (pos, top) => { if (pos <= 0) return 0; const v = niceStars(posToStar(pos, top)); return v <= STAR_FLOOR ? 0 : v; };
export const sliderMax = (pos, top) => (pos >= SLIDER_STEPS ? 0 : niceStars(posToStar(pos, top)));
export const SLIDER_KEY_STEP = 5;

// "1,200", "5k", "1.5k", "2m" -> number. Empty means "no bound" (0). Anything else is invalid (null).
export function parseStarInput(text) {
  const s = String(text ?? '').trim().toLowerCase().replace(/[,\s_]/g, '');
  if (s === '') return 0;
  const m = /^(\d+(?:\.\d+)?)([km]?)$/.exec(s);
  if (!m) return null;
  const v = Math.round(Number(m[1]) * (m[2] === 'k' ? 1e3 : m[2] === 'm' ? 1e6 : 1));
  return Number.isFinite(v) && v <= 10_000_000 ? v : null;
}

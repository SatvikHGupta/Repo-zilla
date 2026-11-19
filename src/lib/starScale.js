// Star counts span the catalog's star floor (from the manifest, for example 50 or 10) to hundreds of thousands, so the range slider works on a log scale
// with 1000 steps. Every function takes the floor as its last argument: it is not a constant, it changes when the catalog is rebuilt.
export const DEFAULT_STAR_FLOOR = 50; // only for a manifest that does not say (see useStarFloor)
export const SLIDER_STEPS = 1000;

export function starToPos(stars, top, floor) {
  if (!(top > floor) || !(stars > floor)) return 0;
  const p = Math.log(stars / floor) / Math.log(top / floor);
  return Math.max(0, Math.min(SLIDER_STEPS, Math.round(p * SLIDER_STEPS)));
}
export function posToStar(pos, top, floor) {
  if (!(top > floor)) return floor;
  const p = Math.max(0, Math.min(SLIDER_STEPS, pos)) / SLIDER_STEPS;
  return Math.round(floor * (top / floor) ** p);
}
// rounds a slider value to three significant digits from 1,000 up (12,345 -> 12,300), exact below. The rounding error stays under
// 0.5%, far less than one slider step (about 4.7%), so one step always moves the value.
export function niceStars(v) {
  if (v < 1000) return Math.round(v);
  const mag = 10 ** (Math.floor(Math.log10(v)) - 2);
  return Math.round(v / mag) * mag;
}

// what a slider handle position means for the filter. 0 = no bound (everything has at least `floor` stars, so the bottom of the range is "no minimum").
export const sliderMin = (pos, top, floor) => { if (pos <= 0) return 0; const v = niceStars(posToStar(pos, top, floor)); return v <= floor ? 0 : v; };
export const sliderMax = (pos, top, floor) => (pos >= SLIDER_STEPS ? 0 : niceStars(posToStar(pos, top, floor)));
export const SLIDER_KEY_STEP = 5;

// Where a handle really ends up after it was moved from `from` to `to`. Stars are whole numbers, and near a low floor (10 stars, top 400k) one star is
// wider than a slider step, so a step could land on the same count again and the handle would never get past it. A move must change the value:
// when the count did not change, take the next whole number in the direction of the move.
export function settledPos(from, to, top, floor) {
  if (to === from || !(top > floor)) return to;
  const now = niceStars(posToStar(from, top, floor));
  let stars = niceStars(posToStar(to, top, floor));
  if (to > from && stars <= now) stars = now + 1;
  if (to < from && stars >= now) stars = now - 1;
  return starToPos(Math.max(floor, Math.min(top, stars)), top, floor);
}

// "1,200", "5k", "1.5k", "2m" -> number. Empty means "no bound" (0). Anything else is invalid (null).
export function parseStarInput(text) {
  const s = String(text ?? '').trim().toLowerCase().replace(/[,\s_]/g, '');
  if (s === '') return 0;
  const m = /^(\d+(?:\.\d+)?)([km]?)$/.exec(s);
  if (!m) return null;
  const v = Math.round(Number(m[1]) * (m[2] === 'k' ? 1e3 : m[2] === 'm' ? 1e6 : 1));
  return Number.isFinite(v) && v <= 10_000_000 ? v : null;
}

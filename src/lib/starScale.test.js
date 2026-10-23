import { describe, it, expect } from 'vitest';
import { starToPos, posToStar, niceStars, parseStarInput, sliderMin, sliderMax, SLIDER_STEPS, SLIDER_KEY_STEP } from './starScale.js';

describe('star slider scale', () => {
  const top = 552994;
  it('maps the ends of the range to the ends of the slider', () => {
    expect(starToPos(50, top)).toBe(0);
    expect(starToPos(top, top)).toBe(SLIDER_STEPS);
    expect(posToStar(0, top)).toBe(50);
    expect(posToStar(SLIDER_STEPS, top)).toBe(top);
  });
  it('round-trips within one slider step and stays monotonic', () => {
    let prev = 0;
    for (const v of [60, 100, 999, 5000, 42000, 300000]) {
      const p = starToPos(v, top);
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
      expect(Math.abs(Math.log(posToStar(p, top) / v))).toBeLessThan(0.01);
    }
  });
  it('clamps values outside the range', () => {
    expect(starToPos(10, top)).toBe(0);
    expect(starToPos(top * 10, top)).toBe(SLIDER_STEPS);
    expect(posToStar(-5, top)).toBe(50);
    expect(posToStar(5000, top)).toBe(top);
  });
  it('rounds to three significant digits from 1,000 up', () => {
    expect([83, 199, 234, 1234, 12345, 987654].map(niceStars)).toEqual([83, 199, 234, 1230, 12300, 988000]);
  });
});

describe('parseStarInput', () => {
  it('reads plain numbers, separators and k/m suffixes', () => {
    expect(parseStarInput('1200')).toBe(1200);
    expect(parseStarInput('1,200')).toBe(1200);
    expect(parseStarInput(' 5k ')).toBe(5000);
    expect(parseStarInput('1.5K')).toBe(1500);
    expect(parseStarInput('2m')).toBe(2_000_000);
  });
  it('treats empty as no bound and rejects garbage', () => {
    expect(parseStarInput('')).toBe(0);
    expect(parseStarInput(null)).toBe(0);
    for (const bad of ['abc', '-5', '1e3', '12k3', '99999999999']) expect(parseStarInput(bad)).toBeNull();
  });
});

describe('slider keyboard steps', () => {
  const top = 552994;
  // the filter stores a rounded value and the handle is drawn from it again: every step must still move forward
  it('always moves forward when the handle is rebuilt from the stored value', () => {
    let pos = 0, last = 0;
    for (let i = 0; i < 400 && pos < 960; i++) {
      const next = Math.round(pos / SLIDER_KEY_STEP) * SLIDER_KEY_STEP + SLIDER_KEY_STEP; // the browser snaps the drawn value to the step grid, then adds one step
      const stars = sliderMin(next, top);
      const drawn = stars ? starToPos(stars, top) : 0;
      expect(drawn).toBeGreaterThan(pos);
      expect(drawn).toBeGreaterThanOrEqual(last);
      last = drawn; pos = drawn;
    }
    expect(pos).toBeGreaterThanOrEqual(960);
  });
  it('treats the bottom of the range as no minimum and the top as no maximum', () => {
    expect(sliderMin(0, top)).toBe(0);
    expect(sliderMin(1, top)).toBe(0);
    expect(sliderMax(SLIDER_STEPS, top)).toBe(0);
    expect(sliderMax(SLIDER_STEPS - 5, top)).toBeLessThan(top);
  });
});

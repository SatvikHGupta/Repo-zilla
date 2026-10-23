import { describe, it, expect } from 'vitest';
import { pageWindow } from './pagination.js';

describe('pageWindow', () => {
  it('lists every page when there are few', () => { expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]); });
  it('keeps first, last and the neighbours of the current page', () => {
    expect(pageWindow(6, 40)).toEqual([1, 'gap5', 5, 6, 7, 'gap40', 40]);
  });
  it('shows a run at either end', () => {
    expect(pageWindow(1, 40)).toEqual([1, 2, 3, 4, 'gap40', 40]);
    expect(pageWindow(40, 40)).toEqual([1, 'gap37', 37, 38, 39, 40]);
  });
  it('never repeats or leaves the range', () => {
    for (const [p, t] of [[1, 8], [8, 8], [4, 9], [100000, 100000]]) {
      const nums = pageWindow(p, t).filter((x) => typeof x === 'number');
      expect(new Set(nums).size).toBe(nums.length);
      expect(nums.every((n) => n >= 1 && n <= t)).toBe(true);
    }
  });
});

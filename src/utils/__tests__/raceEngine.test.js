import { describe, it, expect } from 'vitest';
import { computeFinishOrder } from '../raceEngine.js';

describe('computeFinishOrder', () => {
  it('returns an array with all input indices exactly once', () => {
    const order = computeFinishOrder([{ condition: 90 }, { condition: 10 }]);
    expect(order).toHaveLength(2);
    expect(order).toContain(0);
    expect(order).toContain(1);
    expect(new Set(order).size).toBe(2);
  });

  it('returns empty array for empty input', () => {
    expect(computeFinishOrder([])).toEqual([]);
  });

  it('returns all indices exactly once for 10 horses', () => {
    const horses = Array.from({ length: 10 }, (_, i) => ({ condition: (i + 1) * 10 }));
    const order = computeFinishOrder(horses);
    expect(order).toHaveLength(10);
    expect(new Set(order).size).toBe(10);
    for (let i = 0; i < 10; i++) {
      expect(order).toContain(i);
    }
  });

  it('statistically favors higher-condition horses (>60% win rate for 95 vs 5)', () => {
    let wins = 0;
    for (let i = 0; i < 200; i++) {
      const order = computeFinishOrder([{ condition: 95 }, { condition: 5 }]);
      if (order[0] === 0) wins++;
    }
    expect(wins).toBeGreaterThan(120);
  });
});

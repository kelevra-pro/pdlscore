import { describe, expect, it } from 'vitest';
import { generateSchedule, isValidPoints, isValidScore } from './schedule';

describe('generateSchedule', () => {
	const games = generateSchedule();

	it('produces 3 games', () => {
		expect(games).toHaveLength(3);
		expect(games.map((g) => g.idx)).toEqual([0, 1, 2]);
	});

	it('matches the plan table', () => {
		expect(games.map((g) => [g.pair1, g.pair2])).toEqual([
			[[0, 1], [2, 3]],
			[[0, 2], [1, 3]],
			[[0, 3], [1, 2]]
		]);
	});

	it('every player plays every game', () => {
		for (const g of games) {
			expect([...g.pair1, ...g.pair2].sort()).toEqual([0, 1, 2, 3]);
		}
	});

	it('every player partners every other player exactly once', () => {
		const counts = new Map<string, number>();
		for (const g of games) {
			for (const [a, b] of [g.pair1, g.pair2]) {
				const key = [a, b].sort().join('-');
				counts.set(key, (counts.get(key) ?? 0) + 1);
			}
		}
		expect(counts.size).toBe(6);
		for (const c of counts.values()) expect(c).toBe(1);
	});
});

describe('validation', () => {
	it('accepts only allowed points', () => {
		expect([16, 21, 24, 32].every(isValidPoints)).toBe(true);
		expect(isValidPoints(20)).toBe(false);
	});

	it('requires scores summing to N', () => {
		expect(isValidScore(20, 12, 32)).toBe(true);
		expect(isValidScore(16, 16, 32)).toBe(true);
		expect(isValidScore(0, 21, 21)).toBe(true);
		expect(isValidScore(20, 11, 32)).toBe(false);
		expect(isValidScore(-1, 33, 32)).toBe(false);
		expect(isValidScore(1.5, 30.5, 32)).toBe(false);
	});
});

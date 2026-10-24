import { describe, expect, it } from 'vitest';
import {
	PLAYER_COUNTS,
	gameCount,
	generateSchedule,
	isValidPlayerCount,
	isValidPoints,
	isValidScore
} from './schedule';

const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

describe('generateSchedule', () => {
	it('defaults to 4 players and matches the plan table', () => {
		const games = generateSchedule();
		expect(games.map((g) => g.idx)).toEqual([0, 1, 2]);
		expect(games.map((g) => [g.pair1, g.pair2])).toEqual([
			[[0, 1], [2, 3]],
			[[0, 2], [1, 3]],
			[[0, 3], [1, 2]]
		]);
		expect(games.every((g) => g.court === 0)).toBe(true);
	});

	it('rejects unsupported player counts', () => {
		expect(() => generateSchedule(6)).toThrow();
		expect(isValidPlayerCount(8)).toBe(true);
		expect(isValidPlayerCount(5)).toBe(false);
	});

	describe.each(PLAYER_COUNTS)('%i players', (n) => {
		const games = generateSchedule(n);
		const players = Array.from({ length: n }, (_, i) => i);

		it('has n-1 rounds of n/4 games with sequential idx', () => {
			expect(games).toHaveLength(gameCount(n));
			expect(games.map((g) => g.idx)).toEqual(games.map((_, i) => i));
			for (let r = 0; r < n - 1; r++) {
				const round = games.filter((g) => g.round === r);
				expect(round.map((g) => g.court)).toEqual(Array.from({ length: n / 4 }, (_, c) => c));
			}
		});

		it('every player plays exactly once per round', () => {
			for (let r = 0; r < n - 1; r++) {
				const seen = games
					.filter((g) => g.round === r)
					.flatMap((g) => [...g.pair1, ...g.pair2])
					.sort((a, b) => a - b);
				expect(seen).toEqual(players);
			}
		});

		it('every player partners every other player exactly once', () => {
			const counts = new Map<string, number>();
			for (const g of games) {
				for (const [a, b] of [g.pair1, g.pair2]) {
					counts.set(key(a, b), (counts.get(key(a, b)) ?? 0) + 1);
				}
			}
			expect(counts.size).toBe((n * (n - 1)) / 2);
			for (const c of counts.values()) expect(c).toBe(1);
		});

		it('every player faces every other player exactly twice', () => {
			const counts = new Map<string, number>();
			for (const g of games) {
				for (const a of g.pair1) {
					for (const b of g.pair2) counts.set(key(a, b), (counts.get(key(a, b)) ?? 0) + 1);
				}
			}
			expect(counts.size).toBe((n * (n - 1)) / 2);
			for (const c of counts.values()) expect(c).toBe(2);
		});
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

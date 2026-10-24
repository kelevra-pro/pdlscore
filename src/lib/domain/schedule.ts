/** Allowed tournament sizes: multiples of 4, so every round fills every court. */
export const PLAYER_COUNTS = [4, 8, 12, 16] as const;
export const DEFAULT_PLAYER_COUNT = 4;
export const POINTS_OPTIONS = [16, 21, 24, 32] as const;
export const DEFAULT_POINTS = 32;

/** Pair of player indexes (0..playerCount-1). */
export type Pair = readonly [number, number];

export interface ScheduledGame {
	idx: number;
	/** 0-based round; all games of a round are played at the same time. */
	round: number;
	/** 0-based court within the round. */
	court: number;
	pair1: Pair;
	pair2: Pair;
}

type BaseGame = readonly [Pair, Pair];

/**
 * Cyclic whist designs. Player 0 is fixed, players 1..n-1 stand for residues 0..n-2.
 * Round r is the base round with r added (mod n-1) to every residue. Result:
 * everyone partners everyone exactly once and faces everyone exactly twice.
 * Values here are player indexes (residue + 1).
 */
const BASE_ROUNDS: Record<number, readonly BaseGame[]> = {
	4: [[[0, 1], [2, 3]]],
	8: [
		[[0, 1], [2, 4]],
		[[3, 7], [5, 6]]
	],
	12: [
		[[0, 1], [2, 4]],
		[[3, 10], [7, 8]],
		[[5, 11], [6, 9]]
	],
	16: [
		[[0, 1], [2, 3]],
		[[4, 7], [10, 12]],
		[[5, 14], [9, 13]],
		[[6, 11], [8, 15]]
	]
};

export function isValidPlayerCount(n: number): boolean {
	return (PLAYER_COUNTS as readonly number[]).includes(n);
}

/** Number of games: n-1 rounds of n/4 games. */
export function gameCount(playerCount: number): number {
	return ((playerCount - 1) * playerCount) / 4;
}

/**
 * Americano schedule for n players on n/4 courts, n-1 rounds.
 * For 4 players (1 court): 1+2 vs 3+4, 1+3 vs 2+4, 1+4 vs 2+3.
 */
export function generateSchedule(playerCount: number = DEFAULT_PLAYER_COUNT): ScheduledGame[] {
	const base = BASE_ROUNDS[playerCount];
	if (!base) throw new Error(`Unsupported player count: ${playerCount}`);
	const m = playerCount - 1;
	const shift = (p: number, r: number) => (p === 0 ? 0 : 1 + ((p - 1 + r) % m));
	const pair = ([a, b]: Pair, r: number): Pair => {
		const x = shift(a, r);
		const y = shift(b, r);
		return x < y ? [x, y] : [y, x];
	};

	const games: ScheduledGame[] = [];
	for (let round = 0; round < m; round++) {
		base.forEach(([p1, p2], court) => {
			games.push({ idx: games.length, round, court, pair1: pair(p1, round), pair2: pair(p2, round) });
		});
	}
	return games;
}

export function isValidPoints(n: number): boolean {
	return (POINTS_OPTIONS as readonly number[]).includes(n);
}

/** A score is valid when both sides are non-negative integers summing to N. */
export function isValidScore(score1: number, score2: number, pointsPerGame: number): boolean {
	return (
		Number.isInteger(score1) &&
		Number.isInteger(score2) &&
		score1 >= 0 &&
		score2 >= 0 &&
		score1 + score2 === pointsPerGame
	);
}

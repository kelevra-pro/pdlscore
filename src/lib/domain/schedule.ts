export const PLAYER_COUNT = 4;
export const POINTS_OPTIONS = [16, 21, 24, 32] as const;
export const DEFAULT_POINTS = 32;

/** Pair of player indexes (0..3). */
export type Pair = readonly [number, number];

export interface ScheduledGame {
	idx: number;
	pair1: Pair;
	pair2: Pair;
}

const PAIRINGS: readonly (readonly [Pair, Pair])[] = [
	[
		[0, 1],
		[2, 3]
	],
	[
		[0, 2],
		[1, 3]
	],
	[
		[0, 3],
		[1, 2]
	]
];

/** Americano schedule for 4 players on 1 court: everyone partners everyone once. */
export function generateSchedule(): ScheduledGame[] {
	return PAIRINGS.map(([pair1, pair2], idx) => ({ idx, pair1, pair2 }));
}

export const GAME_COUNT = PAIRINGS.length;

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

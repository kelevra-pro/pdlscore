import type { Pair } from './schedule';

export interface GameResult {
	pair1: Pair;
	pair2: Pair;
	/** null = not played yet */
	score1: number | null;
	score2: number | null;
}

export interface StandingRow {
	place: number;
	player: number;
	name: string;
	points: number;
	played: number;
	wins: number;
	diff: number;
}

function compare(a: StandingRow, b: StandingRow): number {
	return b.points - a.points || b.wins - a.wins || b.diff - a.diff;
}

/** Standings from (possibly partially) played games. */
export function computeStandings(names: readonly string[], games: readonly GameResult[]): StandingRow[] {
	const rows: StandingRow[] = names.map((name, player) => ({
		place: 0,
		player,
		name,
		points: 0,
		played: 0,
		wins: 0,
		diff: 0
	}));

	for (const g of games) {
		if (g.score1 === null || g.score2 === null) continue;
		const sides: [Pair, number, number][] = [
			[g.pair1, g.score1, g.score2],
			[g.pair2, g.score2, g.score1]
		];
		for (const [pair, scored, conceded] of sides) {
			for (const p of pair) {
				const row = rows[p];
				row.points += scored;
				row.played += 1;
				row.diff += scored - conceded;
				if (scored > conceded) row.wins += 1;
			}
		}
	}

	return rankStandings(rows);
}

/**
 * Sorts rows (points desc, wins desc, diff desc) and assigns places.
 * Fully tied rows share a place and keep the original player order.
 */
export function rankStandings(rows: readonly Omit<StandingRow, 'place'>[]): StandingRow[] {
	const sorted: StandingRow[] = rows
		.map((r) => ({ ...r, place: 0 }))
		.sort((a, b) => compare(a, b) || a.player - b.player);
	sorted.forEach((row, i) => {
		row.place = i > 0 && compare(sorted[i - 1], row) === 0 ? sorted[i - 1].place : i + 1;
	});
	return sorted;
}

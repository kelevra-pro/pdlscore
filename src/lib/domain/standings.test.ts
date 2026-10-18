import { describe, expect, it } from 'vitest';
import { generateSchedule } from './schedule';
import { computeStandings, rankStandings, type GameResult, type StandingRow } from './standings';

const names = ['Anna', 'Boris', 'Clara', 'Dima'];

function results(scores: ([number, number] | null)[]): GameResult[] {
	return generateSchedule().map((g, i) => ({
		pair1: g.pair1,
		pair2: g.pair2,
		score1: scores[i]?.[0] ?? null,
		score2: scores[i]?.[1] ?? null
	}));
}

function byName(rows: StandingRow[]): Record<string, StandingRow> {
	return Object.fromEntries(rows.map((r) => [r.name, r]));
}

describe('computeStandings', () => {
	it('is all zeros when nothing is played', () => {
		const rows = computeStandings(names, results([null, null, null]));
		expect(rows.map((r) => r.name)).toEqual(names);
		for (const r of rows) {
			expect(r).toMatchObject({ place: 1, points: 0, played: 0, wins: 0, diff: 0 });
		}
	});

	it('counts a partially played tournament', () => {
		// G1: Anna+Boris 20 : 12 Clara+Dima
		const rows = computeStandings(names, results([[20, 12], null, null]));
		const t = byName(rows);
		expect(t.Anna).toMatchObject({ points: 20, played: 1, wins: 1, diff: 8 });
		expect(t.Boris).toMatchObject({ points: 20, played: 1, wins: 1, diff: 8 });
		expect(t.Clara).toMatchObject({ points: 12, played: 1, wins: 0, diff: -8 });
		expect(t.Dima).toMatchObject({ points: 12, played: 1, wins: 0, diff: -8 });
		expect(rows.map((r) => [r.place, r.name])).toEqual([
			[1, 'Anna'],
			[1, 'Boris'],
			[3, 'Clara'],
			[3, 'Dima']
		]);
	});

	it('skips unplayed games in the middle', () => {
		const t = byName(computeStandings(names, results([null, [10, 22], null])));
		expect(t.Anna).toMatchObject({ points: 10, played: 1, wins: 0, diff: -12 });
		expect(t.Boris).toMatchObject({ points: 22, played: 1, wins: 1, diff: 12 });
	});

	it('counts a full tournament and sorts it', () => {
		// G1: A+B 20:12 C+D; G2: A+C 10:22 B+D; G3: A+D 17:15 B+C
		const rows = computeStandings(names, results([[20, 12], [10, 22], [17, 15]]));
		const t = byName(rows);
		expect(t.Anna).toMatchObject({ points: 47, played: 3, wins: 2, diff: -2 });
		expect(t.Boris).toMatchObject({ points: 57, played: 3, wins: 2, diff: 18 });
		expect(t.Clara).toMatchObject({ points: 37, played: 3, wins: 0, diff: -22 });
		expect(t.Dima).toMatchObject({ points: 51, played: 3, wins: 2, diff: 6 });
		expect(rows.map((r) => [r.place, r.name])).toEqual([
			[1, 'Boris'],
			[2, 'Dima'],
			[3, 'Anna'],
			[4, 'Clara']
		]);
		expect(rows.reduce((s, r) => s + r.points, 0)).toBe(3 * 32 * 2);
	});

	it('treats 16:16 as a draw: points but no wins', () => {
		const rows = computeStandings(names, results([[16, 16], null, null]));
		for (const r of rows) {
			expect(r).toMatchObject({ place: 1, points: 16, played: 1, wins: 0, diff: 0 });
		}
	});

	it('handles a draw within a full tournament', () => {
		// G1: A+B 30:2; G2: A+C 2:30 B+D; G3: A+D 16:16 B+C
		const rows = computeStandings(names, results([[30, 2], [2, 30], [16, 16]]));
		const t = byName(rows);
		expect(t.Anna).toMatchObject({ points: 48, wins: 1, diff: 0 });
		expect(t.Boris).toMatchObject({ points: 76, wins: 2, diff: 56 });
		expect(t.Clara).toMatchObject({ points: 20, wins: 0, diff: -56 });
		expect(t.Dima).toMatchObject({ points: 48, wins: 1, diff: 0 });
		expect(rows.map((r) => [r.place, r.name])).toEqual([
			[1, 'Boris'],
			[2, 'Anna'],
			[2, 'Dima'],
			[4, 'Clara']
		]);
	});
});

describe('rankStandings', () => {
	const row = (player: number, points: number, wins: number, diff: number) => ({
		player,
		name: names[player],
		points,
		played: 3,
		wins,
		diff
	});

	it('sorts by points desc first', () => {
		const rows = rankStandings([row(0, 40, 3, 20), row(1, 50, 0, -5)]);
		expect(rows.map((r) => r.name)).toEqual(['Boris', 'Anna']);
	});

	it('breaks equal points by wins desc', () => {
		const rows = rankStandings([row(0, 48, 1, 10), row(1, 48, 2, 0)]);
		expect(rows.map((r) => [r.place, r.name])).toEqual([
			[1, 'Boris'],
			[2, 'Anna']
		]);
	});

	it('breaks equal points and wins by diff desc', () => {
		const rows = rankStandings([row(0, 48, 2, -4), row(1, 48, 2, 4)]);
		expect(rows.map((r) => [r.place, r.name])).toEqual([
			[1, 'Boris'],
			[2, 'Anna']
		]);
	});

	it('shares a place on a full tie', () => {
		const rows = rankStandings([row(0, 48, 2, 4), row(1, 48, 2, 4), row(2, 40, 1, 0)]);
		expect(rows.map((r) => [r.place, r.name])).toEqual([
			[1, 'Anna'],
			[1, 'Boris'],
			[3, 'Clara']
		]);
	});
});

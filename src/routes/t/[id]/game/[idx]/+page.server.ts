import { error, fail, redirect } from '@sveltejs/kit';
import { isValidScore } from '#lib/domain/schedule.ts';
import { saveScore } from '#lib/server/db.ts';
import { loadTournament } from '#lib/server/tournament.ts';
import type { Actions, PageServerLoad } from './$types';

function loadGame(id: string, idxParam: string) {
	const { tournament, games } = loadTournament(id);
	const game = games.find((g) => String(g.idx) === idxParam);
	if (!game) error(404, 'Игра не найдена');
	return { tournament, game };
}

/** Parses a query value as a score in 0..N, or null. */
function parseScore(value: string | null, n: number): number | null {
	if (value === null || !/^\d+$/.test(value)) return null;
	const x = Number(value);
	return x <= n ? x : null;
}

export const load: PageServerLoad = ({ params, url }) => {
	const { tournament, game } = loadGame(params.id, params.idx);
	const n = tournament.pointsPerGame;

	// Without JS the number buttons are links (?s1=x or ?s2=x); the other side is N - x.
	let score1 = game.score1;
	const s1 = parseScore(url.searchParams.get('s1'), n);
	const s2 = parseScore(url.searchParams.get('s2'), n);
	if (s1 !== null) score1 = s1;
	else if (s2 !== null) score1 = n - s2;

	return { tournament, game, score1 };
};

export const actions: Actions = {
	default: async ({ params, request }) => {
		const { tournament, game } = loadGame(params.id, params.idx);
		const form = await request.formData();
		const score1 = Number(form.get('score1'));
		const score2 = Number(form.get('score2'));

		if (!form.get('score1') || !isValidScore(score1, score2, tournament.pointsPerGame)) {
			return fail(400, { error: 'Выберите счёт' });
		}

		saveScore(tournament.id, game.idx, score1, score2);
		redirect(303, `/t/${tournament.id}`);
	}
};

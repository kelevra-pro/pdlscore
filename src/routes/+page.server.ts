import { fail, redirect } from '@sveltejs/kit';
import {
	DEFAULT_PLAYER_COUNT,
	DEFAULT_POINTS,
	isValidPlayerCount,
	isValidPoints
} from '#lib/domain/schedule.ts';
import { createTournament } from '#lib/server/db.ts';
import type { Actions, PageServerLoad } from './$types';

const MAX_NAME_LENGTH = 30;

function parseCount(value: string | null): number {
	const n = Number(value);
	return isValidPlayerCount(n) ? n : DEFAULT_PLAYER_COUNT;
}

// Without JS the player count buttons are links (?players=8).
export const load: PageServerLoad = ({ url }) => ({
	count: parseCount(url.searchParams.get('players'))
});

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const count = parseCount(String(form.get('count') ?? ''));
		const players = Array.from({ length: count }, (_, i) =>
			String(form.get(`player${i}`) ?? '').trim()
		);
		const points = Number(form.get('points') ?? DEFAULT_POINTS);
		const back = { count, players, points };

		if (players.some((p) => p.length === 0)) {
			return fail(400, { ...back, error: `Введите имена всех ${count} игроков` });
		}
		if (players.some((p) => p.length > MAX_NAME_LENGTH)) {
			return fail(400, { ...back, error: `Имя не длиннее ${MAX_NAME_LENGTH} символов` });
		}
		if (new Set(players.map((p) => p.toLowerCase())).size !== count) {
			return fail(400, { ...back, error: 'Имена должны быть разными' });
		}
		if (!isValidPoints(points)) {
			return fail(400, { ...back, error: 'Недопустимое число очков' });
		}

		const id = createTournament(players, points);
		redirect(303, `/t/${id}`);
	}
};

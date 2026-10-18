import { fail, redirect } from '@sveltejs/kit';
import { DEFAULT_POINTS, PLAYER_COUNT, isValidPoints } from '#lib/domain/schedule.ts';
import { createTournament } from '#lib/server/db.ts';
import type { Actions } from './$types';

const MAX_NAME_LENGTH = 30;

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const players = Array.from({ length: PLAYER_COUNT }, (_, i) =>
			String(form.get(`player${i}`) ?? '').trim()
		);
		const points = Number(form.get('points') ?? DEFAULT_POINTS);

		if (players.some((p) => p.length === 0)) {
			return fail(400, { players, points, error: 'Введите имена всех 4 игроков' });
		}
		if (players.some((p) => p.length > MAX_NAME_LENGTH)) {
			return fail(400, { players, points, error: `Имя не длиннее ${MAX_NAME_LENGTH} символов` });
		}
		if (new Set(players.map((p) => p.toLowerCase())).size !== PLAYER_COUNT) {
			return fail(400, { players, points, error: 'Имена должны быть разными' });
		}
		if (!isValidPoints(points)) {
			return fail(400, { players, points, error: 'Недопустимое число очков' });
		}

		const id = createTournament(players, points);
		redirect(303, `/t/${id}`);
	}
};

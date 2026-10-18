import { computeStandings } from '#lib/domain/standings.ts';
import { loadTournament } from '#lib/server/tournament.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const { tournament, games } = loadTournament(params.id);
	return {
		tournament,
		games,
		standings: computeStandings(tournament.players, games)
	};
};

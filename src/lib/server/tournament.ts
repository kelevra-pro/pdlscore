import { error } from '@sveltejs/kit';
import { generateSchedule, type ScheduledGame } from '#lib/domain/schedule.ts';
import { getGames, getTournament, type Tournament } from './db';

export interface GameView extends ScheduledGame {
	score1: number | null;
	score2: number | null;
}

export function loadTournament(id: string): { tournament: Tournament; games: GameView[] } {
	const tournament = getTournament(id);
	if (!tournament) error(404, 'Турнир не найден');
	const rows = getGames(id);
	const games = generateSchedule(tournament.players.length).map((g) => {
		const row = rows.find((r) => r.idx === g.idx);
		return { ...g, score1: row?.score1 ?? null, score2: row?.score2 ?? null };
	});
	return { tournament, games };
}

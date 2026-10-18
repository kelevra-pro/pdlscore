import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { GAME_COUNT } from '#lib/domain/schedule.ts';

const DB_PATH = resolve(process.env.DATABASE_PATH ?? 'data/app.db');

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS tournament (
  id TEXT PRIMARY KEY,
  players TEXT NOT NULL,
  points_per_game INTEGER NOT NULL DEFAULT 32,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS game (
  tournament_id TEXT NOT NULL REFERENCES tournament(id),
  idx INTEGER NOT NULL,
  score1 INTEGER,
  score2 INTEGER,
  PRIMARY KEY (tournament_id, idx)
);
`);

export interface Tournament {
	id: string;
	players: string[];
	pointsPerGame: number;
}

export interface GameRow {
	idx: number;
	score1: number | null;
	score2: number | null;
}

const ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

function newId(length = 8): string {
	const bytes = randomBytes(length);
	let id = '';
	for (const b of bytes) id += ID_ALPHABET[b % ID_ALPHABET.length];
	return id;
}

const insertTournament = db.prepare(
	'INSERT INTO tournament (id, players, points_per_game) VALUES (?, ?, ?)'
);
const insertGame = db.prepare('INSERT INTO game (tournament_id, idx) VALUES (?, ?)');
const selectTournament = db.prepare<[string], { id: string; players: string; points_per_game: number }>(
	'SELECT id, players, points_per_game FROM tournament WHERE id = ?'
);
const selectGames = db.prepare<[string], GameRow>(
	'SELECT idx, score1, score2 FROM game WHERE tournament_id = ? ORDER BY idx'
);
const updateGame = db.prepare(
	'UPDATE game SET score1 = ?, score2 = ? WHERE tournament_id = ? AND idx = ?'
);

export const createTournament = db.transaction((players: string[], pointsPerGame: number): string => {
	let id = newId();
	while (selectTournament.get(id)) id = newId();
	insertTournament.run(id, JSON.stringify(players), pointsPerGame);
	for (let idx = 0; idx < GAME_COUNT; idx++) insertGame.run(id, idx);
	return id;
});

export function getTournament(id: string): Tournament | null {
	const row = selectTournament.get(id);
	if (!row) return null;
	return { id: row.id, players: JSON.parse(row.players), pointsPerGame: row.points_per_game };
}

export function getGames(tournamentId: string): GameRow[] {
	return selectGames.all(tournamentId);
}

export function saveScore(tournamentId: string, idx: number, score1: number, score2: number): void {
	updateGame.run(score1, score2, tournamentId, idx);
}

<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const names = $derived(data.tournament.players);
	const playedCount = $derived(data.games.filter((g) => g.score1 !== null).length);
	const finished = $derived(playedCount === data.games.length);
	const pairName = (pair: readonly number[]) => pair.map((p) => names[p]).join(' + ');
</script>

<svelte:head>
	<title>{names.join(', ')} — pdlscore</title>
</svelte:head>

<h1>Americano до {data.tournament.pointsPerGame}</h1>
<p class="muted">
	{finished ? 'Турнир завершён' : `Сыграно ${playedCount} из ${data.games.length}`} · ссылку можно
	отправить игрокам
</p>

<section class="games">
	{#each data.games as game (game.idx)}
		{@const played = game.score1 !== null && game.score2 !== null}
		<article class="card game">
			<div class="title muted">Игра {game.idx + 1}</div>
			<div class="row" class:win={played && game.score1! > game.score2!}>
				<span class="pair">{pairName(game.pair1)}</span>
				<span class="score">{played ? game.score1 : '–'}</span>
			</div>
			<div class="row" class:win={played && game.score2! > game.score1!}>
				<span class="pair">{pairName(game.pair2)}</span>
				<span class="score">{played ? game.score2 : '–'}</span>
			</div>
			<a
				class="btn {played ? 'secondary' : ''} block"
				href="/t/{data.tournament.id}/game/{game.idx}"
			>
				{played ? 'Изменить' : 'Ввести счёт'}
			</a>
		</article>
	{/each}
</section>

<section class="card">
	<h2>{finished ? 'Итоговая таблица' : 'Таблица'}</h2>
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th class="num" title="Место">#</th>
					<th class="name">Игрок</th>
					<th class="num" title="Очки">Очки</th>
					<th class="num" title="Сыграно игр">И</th>
					<th class="num" title="Победы">В</th>
					<th class="num" title="Разница">+/−</th>
				</tr>
			</thead>
			<tbody>
				{#each data.standings as row (row.player)}
					<tr>
						<td class="num">{row.place}</td>
						<td class="name">{row.name}</td>
						<td class="num strong">{row.points}</td>
						<td class="num">{row.played}</td>
						<td class="num">{row.wins}</td>
						<td class="num">{row.diff > 0 ? `+${row.diff}` : row.diff}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="legend muted">И — игры, В — победы, +/− — набрано минус пропущено</p>
</section>

<style>
	.games {
		display: grid;
		gap: 12px;
		margin-bottom: 16px;
	}

	.title {
		font-size: 0.85rem;
		margin-bottom: 6px;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 6px 0;
	}

	.row.win {
		font-weight: 700;
	}

	.pair {
		overflow-wrap: anywhere;
	}

	.score {
		font-size: 1.4rem;
		font-variant-numeric: tabular-nums;
		min-width: 2ch;
		text-align: right;
	}

	.game .btn {
		margin-top: 10px;
	}

	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}

	th,
	td {
		padding: 10px 6px;
		border-bottom: 1px solid var(--line);
	}

	th {
		font-size: 0.85rem;
		color: var(--muted);
		font-weight: 600;
	}

	tbody tr:last-child td {
		border-bottom: 0;
	}

	.num {
		text-align: right;
		white-space: nowrap;
	}

	.name {
		text-align: left;
		width: 100%;
		overflow-wrap: anywhere;
	}

	.strong {
		font-weight: 700;
	}

	.legend {
		font-size: 0.8rem;
		margin: 8px 0 0;
	}
</style>

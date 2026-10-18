<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const n = $derived(data.tournament.pointsPerGame);
	const names = $derived(data.tournament.players);
	const options = $derived(Array.from({ length: n + 1 }, (_, i) => i));
	const pairName = (pair: readonly number[]) => pair.map((p) => names[p]).join(' + ');

	// Writable derived: resets when the page data changes, otherwise follows clicks.
	let score1 = $derived(data.score1);
	const score2 = $derived(score1 === null ? null : n - score1);

	let submitting = $state(false);

	function pick(event: MouseEvent, side: 1 | 2, value: number) {
		event.preventDefault();
		score1 = side === 1 ? value : n - value;
	}

	const backHref = $derived(`/t/${data.tournament.id}`);
</script>

<svelte:head>
	<title>Игра {data.game.idx + 1} — pdlscore</title>
</svelte:head>

<a class="back" href={backHref}>← К турниру</a>
<h1>Игра {data.game.idx + 1} · до {n}</h1>

<div class="summary card" aria-live="polite">
	<span>{pairName(data.game.pair1)}</span>
	<strong>{score1 ?? '–'} : {score2 ?? '–'}</strong>
	<span>{pairName(data.game.pair2)}</span>
</div>

<div class="columns">
	{#each [1, 2] as const as side (side)}
		{@const selected = side === 1 ? score1 : score2}
		<section>
			<h2>{pairName(side === 1 ? data.game.pair1 : data.game.pair2)}</h2>
			<div class="grid">
				{#each options as value (value)}
					<a
						class="num"
						class:selected={selected === value}
						href="?s{side}={value}"
						data-sveltekit-replacestate
						data-sveltekit-noscroll
						aria-current={selected === value ? 'true' : undefined}
						onclick={(e) => pick(e, side, value)}>{value}</a
					>
				{/each}
			</div>
		</section>
	{/each}
</div>

<form
	method="POST"
	class="save"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}}
>
	{#if form?.error}
		<p class="error" role="alert">{form.error}</p>
	{/if}
	<input type="hidden" name="score1" value={score1 ?? ''} />
	<input type="hidden" name="score2" value={score2 ?? ''} />
	<button class="btn block" type="submit" disabled={score1 === null || submitting}>
		Сохранить
	</button>
	<a class="btn secondary block" href={backHref}>Отмена</a>
</form>

<style>
	.back {
		display: inline-block;
		margin-bottom: 8px;
		text-decoration: none;
	}

	.summary {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
		text-align: center;
	}

	.summary span {
		overflow-wrap: anywhere;
	}

	.summary strong {
		font-size: 1.8rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	h2 {
		font-size: 0.95rem;
		text-align: center;
		overflow-wrap: anywhere;
		min-height: 2.4em;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
	}

	@media (min-width: 480px) {
		.grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.num {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--card);
		color: var(--text);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}

	.num.selected {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-text);
	}

	.save {
		position: sticky;
		bottom: 0;
		display: grid;
		gap: 8px;
		margin: 16px -16px 0;
		padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
		background: var(--bg);
		border-top: 1px solid var(--line);
	}

	.save .error {
		margin: 0;
	}
</style>

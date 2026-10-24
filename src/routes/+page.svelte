<script lang="ts">
	import { enhance } from '$app/forms';
	import { DEFAULT_POINTS, PLAYER_COUNTS, POINTS_OPTIONS, gameCount } from '#lib/domain/schedule.ts';
	import { plural } from '#lib/plural.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let submitting = $state(false);
	const points = $derived(form?.points ?? DEFAULT_POINTS);
	// Writable derived: follows the URL (?players=8) and a failed submit, and clicks with JS.
	let count = $derived(form?.count ?? data.count);
	const courts = $derived(count / 4);

	function pickCount(event: MouseEvent, value: number) {
		event.preventDefault();
		count = value;
	}
</script>

<h1>Новый Americano</h1>
<p class="muted">
	{count}
	{plural(count, ['игрок', 'игрока', 'игроков'])}, {courts}
	{plural(courts, ['корт', 'корта', 'кортов'])}, {gameCount(count)}
	{plural(gameCount(count), ['игра', 'игры', 'игр'])} — каждый сыграет в паре с каждым.
</p>

<form
	method="POST"
	class="card"
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

	<fieldset>
		<legend>Количество игроков</legend>
		<div class="segmented">
			{#each PLAYER_COUNTS as option (option)}
				<a
					href="?players={option}"
					class:selected={option === count}
					aria-current={option === count ? 'true' : undefined}
					data-sveltekit-replacestate
					data-sveltekit-noscroll
					onclick={(e) => pickCount(e, option)}><span>{option}</span></a
				>
			{/each}
		</div>
	</fieldset>

	<input type="hidden" name="count" value={count} />

	<fieldset>
		<legend>Игроки</legend>
		{#each { length: count }, i (i)}
			<label class="player">
				<span>P{i + 1}</span>
				<input
					name="player{i}"
					value={form?.players?.[i] ?? ''}
					placeholder="Имя игрока {i + 1}"
					maxlength="30"
					autocomplete="off"
					required
				/>
			</label>
		{/each}
	</fieldset>

	<fieldset>
		<legend>Очки за игру</legend>
		<div class="segmented">
			{#each POINTS_OPTIONS as option (option)}
				<label>
					<input type="radio" name="points" value={option} checked={option === points} />
					<span>{option}</span>
				</label>
			{/each}
		</div>
	</fieldset>

	<button class="btn block" type="submit" disabled={submitting}>Начать</button>
</form>

<style>
	fieldset {
		border: 0;
		margin: 0 0 20px;
		padding: 0;
	}

	legend {
		font-weight: 600;
		margin-bottom: 8px;
		padding: 0;
	}

	.player {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 8px;
	}

	.player span {
		width: 32px;
		color: var(--muted);
		font-weight: 600;
	}

	.player input {
		flex: 1;
		min-width: 0;
		min-height: 48px;
		padding: 0 12px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--text);
		font: inherit;
	}

	.player input:focus {
		outline: 2px solid var(--accent);
		outline-offset: -1px;
	}

	.segmented {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}

	.segmented input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.segmented span {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		font-weight: 600;
		cursor: pointer;
	}

	.segmented a {
		color: inherit;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}

	.segmented input:checked + span,
	.segmented a.selected span {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-text);
	}

	.segmented a:focus-visible {
		outline: none;
	}

	.segmented input:focus-visible + span,
	.segmented a:focus-visible span {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
</style>

<script lang="ts">
	import { defaultSettings, loadSettings } from '$lib/settings'
	import { Button, Column, DataTable, Grid, NumberInput, Row, TextInput } from 'carbon-components-svelte'
	import { settings } from '$lib/settings'
	import { onMount } from 'svelte'
	import { roundNumberToString } from '$lib/helpers'

	interface Estimate {
		id: string
		wins: number
		losses: number
		pl: number
		plPercentage: number
	}

	let mounted = false
	let potentialDailyDrawdown: number
	let netPremiumPerDay: number
	let potentialDailyROI: number
	let winsForBreakeven: number
	let estimates: Estimate[] = []

	onMount(async () => {
		loadSettings()
		mounted = true
	})

	const reset = () => {
		for (const [k, v] of Object.entries(defaultSettings)) {
			$settings[k] = v
		}
	}

	$: if ($settings) {
		potentialDailyDrawdown = ($settings.buyingPower * $settings.maxDailyDrawdown) / 100
		netPremiumPerDay = (potentialDailyDrawdown / ($settings.stopLoss - 200)) * 200
		potentialDailyROI = (netPremiumPerDay / $settings.buyingPower) * 100
		winsForBreakeven = 0

		let newEstimates: Estimate[] = []
		for (let day = 0; day <= $settings.days; day++) {
			let pl = day * netPremiumPerDay - ($settings.days - day) * potentialDailyDrawdown
			newEstimates.push({
				id: day.toString(),
				wins: day,
				losses: $settings.days - day,
				pl: pl,
				plPercentage: (pl / $settings.buyingPower) * 100,
			})

			if (pl > 0 && winsForBreakeven == 0) {
				winsForBreakeven = day
			}
		}

		estimates = newEstimates
	}
</script>

{#if mounted}
	<Grid padding fullWidth noGutter>
		<Row>
			<Column sm={4} md={4} lg={4} xlg={2}>
				<NumberInput step={1000} label="Buying power" bind:value={$settings.buyingPower} />
			</Column>

			<Column sm={4} md={4} lg={4} xlg={2}>
				<TextInput labelText="Max daily drawdown (% of BP)" bind:value={$settings.maxDailyDrawdown} />
			</Column>

			<Column sm={4} md={4} lg={4} xlg={2}>
				<TextInput labelText="Stop loss %, incl. slippage" bind:value={$settings.stopLoss} />
			</Column>

			<Column sm={4} md={4} lg={4} xlg={2}>
				<NumberInput step={1} min={1} max={252} label="Days" bind:value={$settings.days} />
			</Column>

			<Column sm={4} md={4} lg={4} xlg={2}>
				<div class="reset">
					<Button size="field" kind="tertiary" on:click={reset}>Reset to defaults</Button>
				</div>
			</Column>
		</Row>

		<Row>
			<Column sm={4} md={4} lg={4} xlg={4}>
				<strong>Daily net premium:</strong>
				${roundNumberToString(netPremiumPerDay)}
			</Column>

			<Column sm={4} md={4} lg={4} xlg={4}>
				<strong>Potential daily ROI:</strong>
				{roundNumberToString(potentialDailyROI)}%
			</Column>

			<Column sm={4} md={4} lg={4} xlg={4}>
				<strong>Potential daily drawdown:</strong>
				${roundNumberToString(potentialDailyDrawdown)}
			</Column>

			<Column sm={4} md={4} lg={4} xlg={4}>
				<strong>Wins for breakeven:</strong>
				{winsForBreakeven} / {$settings.days}
			</Column>
		</Row>

		<Row>
			<Column sm={8} md={6} lg={8} xlg={8}>
				<DataTable
					size="short"
					headers={[
						{ key: 'wins', value: 'Wins' },
						{ key: 'losses', value: 'Losses' },
						{ key: 'pl', value: 'P/L ($)' },
						{ key: 'plPercentage', value: 'P/L (% of buying power)' },
					]}
					rows={estimates}
				>
					<svelte:fragment slot="cell" let:cell>
						{#if cell.key === 'wins' || cell.key === 'losses'}
							<div class="center">{cell.value}</div>
						{:else if cell.key === 'pl'}
							<div class="right">{roundNumberToString(cell.value)}</div>
						{:else if cell.key === 'plPercentage'}
							<div class="right">{roundNumberToString(cell.value)}%</div>
						{:else}
							{cell.value}
						{/if}
					</svelte:fragment></DataTable
				>
			</Column>
		</Row>
	</Grid>

	<div class="notes">
		<h2>Assumptions</h2>

		<p>You enter both sides.</p>
		<p>Only one side reaches the stop loss.</p>
		<p>You use the same buying power every day and you get the same credit for each side (${roundNumberToString(netPremiumPerDay / 2)} per side).</p>
		<br />
		<p>Getting different premiums for each side or getting different premiums each day will completely screw up the estimates. You may have losing days when you get higher premiums then winning days when you get lower premiums. Minor differences should be ok.</p>
		<br />
		<p>Use <a href="https://spreads.credit/" target="_blank">spreads.credit</a> to get find in real time the credit spreads that give you the premium you're targeting.</p>
	</div>
{/if}

<style>
	:global(.bx--inline-notification) {
		max-width: none;
	}

	:global(.bx--number input[type='number']) {
		font-size: var(--cds-body-short-01-font-size, 0.875rem);
	}

	.notes {
		margin-top: 2rem;
	}

	.notes h2 {
		margin-bottom: 1rem;
	}

	.center {
		text-align: center;
	}

	.right {
		text-align: right;
	}

	.reset {
		margin-top: 24px;
	}

	:global(.bx--data-table th) {
		text-align: center;
	}
</style>
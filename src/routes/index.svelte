<script lang="ts">
	import { defaultSettings, loadSettings } from '$lib/settings'
	import { Button, Column, DataTable, Grid, NumberInput, Row, TextInput } from 'carbon-components-svelte'
	import { settings } from '$lib/settings'
	import { onMount } from 'svelte'
	import { roundNumberToString } from '$lib/helpers'
	import type { DataTableRow } from 'carbon-components-svelte/types/DataTable/DataTable.svelte'

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
	let selectedRowIDs: string[] = []

	onMount(async () => {
		loadSettings()
		if ($settings.highlight) {
			selectedRowIDs = [$settings.highlight]
		}
		mounted = true
	})

	const reset = () => {
		for (const [k, v] of Object.entries(defaultSettings)) {
			$settings[k] = v
		}
	}

	const clickRow = (e: CustomEvent<DataTableRow>) => {
		if ($settings.highlight == e.detail.id) {
			$settings.highlight = null
			selectedRowIDs = []
		} else {
			$settings.highlight = e.detail.id
			selectedRowIDs = [e.detail.id]
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
				<NumberInput invalid={$settings.buyingPower < 1000} invalidText="must be higher at least 1000" min={1000} step={1000} label="Buying power" bind:value={$settings.buyingPower} />
			</Column>

			<Column sm={4} md={4} lg={4} xlg={2}>
				<TextInput labelText="Max daily drawdown (% of BP)" bind:value={$settings.maxDailyDrawdown} />
			</Column>

			<Column sm={4} md={4} lg={4} xlg={2}>
				<NumberInput invalid={$settings.stopLoss < 201} invalidText="must be higher at least 201%" min={201} step={10} label="Stop loss %, incl. slippage" bind:value={$settings.stopLoss} />
			</Column>

			<Column sm={4} md={4} lg={4} xlg={2}>
				<NumberInput invalid={$settings.days < 2} invalidText="must be at least 2" step={1} min={2} max={252} label="Days" bind:value={$settings.days} />
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
				${roundNumberToString(netPremiumPerDay)} (${roundNumberToString(netPremiumPerDay / 2)} per side)
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
					selectedRowIds={selectedRowIDs}
					on:click:row={clickRow}
					size="short"
					headers={[
						{ key: 'wins', value: 'No. of win days' },
						{ key: 'losses', value: 'No. of lose days' },
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

		<p>The calculations above are accurate if the following rules are followed:</p>
		<p>- You enter both sides.</p>
		<p>- Only one side reaches the stop loss. Being stopped on both sides is quite rare (but does ocassionaly happen).</p>
		<p>- You use the same buying power every day and you get the receive the same net credit for each side (${roundNumberToString(netPremiumPerDay / 2)} per side).</p>
		<br />
		<p>Receving a different credit for each side or receiving a different credit each day will completely screw up the estimates. You may have losing days when you receive a greater credit then have winning days when you receive lower credit. Minor differences should be ok.</p>
		<br />
		<p>Use <a href="https://spreads.credit/" target="_blank">spreads.credit</a> to get find in real time the credit spreads that give you the net credit you're targeting.</p>
		<br />
		<p>Source code for this application: <a href="https://github.com/weaseldotro/0DTEProfitCalculator" target="_blank">https://github.com/weaseldotro/0DTEProfitCalculator</a></p>
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

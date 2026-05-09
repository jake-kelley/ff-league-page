<script>
    import Button, { Label } from '@smui/button';
	import Roster from './Roster.svelte';
	import PowerRankings from './PowerRankings.svelte';
	import { computeRosterValues } from './rosterValues';

	export let rosters, leagueTeamManagers, startersAndReserve, leagueData, players, valueData, tradedPicks;

	const rosterPositions = leagueData.roster_positions;


	const numDivisions = leagueData.settings.divisions || 1;

	const divisions = [];

	for(let i = 0; i < numDivisions; i++) {
		divisions.push({
			name: leagueData.metadata ? leagueData.metadata[`division_${i + 1}`] : null,
			rosters: [],
		})
	}

	const rosterArray = [];
	for(const rosterID in rosters) {
        const roster = rosters[rosterID];
        const division = !roster.settings.division || roster.settings.division > numDivisions ? 0 : roster.settings.division - 1;
		divisions[division].rosters.push(roster);
		rosterArray.push(roster);
	}

	const rankings = computeRosterValues({
		rosters: rosterArray,
		valueData,
		tradedPicks,
		leagueData,
	});
	const valueByRoster = Object.fromEntries(rankings.map((r) => [r.rosterId, r]));

	let expanded = false;
</script>

<style>
	.division {
		display: flex;
		justify-content: space-around;
		flex-wrap: wrap;
		margin: 10px auto 20px;
		width: 95%;
	}

	.banner {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 140px;
		width: 400px;
		border-radius: 40px;
		margin: 10px auto;
		background-repeat: no-repeat;
		background-size: auto 140px;
	}

	.banner-D-1 {
		background-image: url("/division-1-banner.png");
		background-position: left; 
	}

	.banner-D-2 {
		background-image: url("/division-2-banner.png");
		background-position: right; 
	}

	.banner-D-3 {
		background-image: url("/division-3-banner.png");
		background-position: left; 
	}

	h2 {
		text-align: center;
		font-size: 3em;
	}

	@media (max-width: 460px) {
		.banner {
			height: 110px;
			width: 315px;
			background-repeat: no-repeat;
			background-size: auto 110px;
		}

		h2 {
			font-size: 2.5em;
		}
	}

	@media (max-width: 360px) {
		.banner {
			height: 90px;
			width: 258px;
			background-repeat: no-repeat;
			background-size: auto 90px;
		}

		h2 {
			font-size: 2em;
		}
	}

	@media (max-width: 768px) {
		.banner {
			height: 64px;
			background-size: auto 64px;
			margin: 4px auto 2px;
			border-radius: 24px;
		}
		h2 {
			font-size: 1.6em;
		}
	}

	.banner h2 {
		text-shadow: var(--fff) 0px 0px 3px, var(--fff) 0px 0px 3px, var(--fff) 0px 0px 3px,
            		 var(--fff) 0px 0px 3px, var(--fff) 0px 0px 3px, var(--fff) 0px 0px 3px;
		-webkit-font-smoothing: antialiased;
	}

	.minExp {
		display: block;
		text-align: center;
		margin: 10px 0;
		cursor: pointer;
	}

	.loading {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
	}

	.expandButton {
		margin: 5em auto 2em;
    	text-align: center;
	}

	@media (max-width: 768px) {
		.division {
			margin: 2px auto 6px;
		}
		.expandButton {
			margin: 0.6em auto 0.6em;
		}
	}
</style>

<PowerRankings {rankings} {leagueTeamManagers} />

<div class="expandButton">
	<Button onclick={() => {expanded = !expanded}} variant="outlined">
		<Label>{expanded ? "Minimize" : "Expand"} All Benches</Label>
	</Button>
</div>

{#each divisions as division, ix}
	{#if division.name}
		<div class="banner banner-D-{ix + 1}">
			<h2>{division.name}</h2>
		</div>
	{/if}
	<div class="division">
		{#each division.rosters as roster}
			<Roster division={ix + 1} {expanded} {rosterPositions} {roster} {leagueTeamManagers} {players} {startersAndReserve} rosterValue={valueByRoster[roster.roster_id]} />
		{/each}
	</div>
{/each}

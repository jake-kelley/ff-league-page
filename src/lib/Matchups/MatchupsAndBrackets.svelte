
<script>
	import LinearProgress from '@smui/linear-progress';
	import MatchupWeeks from './MatchupWeeks.svelte';
	import Brackets from './Brackets.svelte';
	import HistoricalSeasonGrid from './HistoricalSeasonGrid.svelte';
    import Button, { Group, Label } from '@smui/button';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { loadPlayers } from '$lib/utils/helper';

	export let queryWeek, leagueTeamManagersData, matchupsData, bracketsData, playersData, leagueChainData;

    let players, matchupWeeks, year, week, regularSeasonLength, brackets, leagueTeamManagers, leagueChain = [];

    let loading = true;
    let selectedSeason;

    onMount(async () => {
        brackets = await bracketsData;
        const matchupsInfo = await matchupsData;
        leagueTeamManagers = await leagueTeamManagersData;
        matchupWeeks = matchupsInfo.matchupWeeks;
        year = matchupsInfo.year;
        week = matchupsInfo.week;
        regularSeasonLength = matchupsInfo.regularSeasonLength;
        const playersInfo = await playersData;
        players = playersInfo.players;
        leagueChain = (await leagueChainData) ?? [];
        selectedSeason = parseInt(year, 10);
        loading = false;

        if(playersInfo.stale) {
            const newPlayersInfo = await loadPlayers(null, true);
            players = newPlayersInfo.players;
        }
    });

    $: selectedEntry = leagueChain.find((e) => e.season === selectedSeason);
    $: isCurrent = selectedSeason === parseInt(year, 10);

    const changeSelection = (s) => {
        if(s == 'regular') {
            queryWeek = 1;
            goto(`/matchups?week=1`, {noscroll: true});
        } else if(selection == 'regular') {
            queryWeek = 99;
            goto(`/matchups?week=99`, {noscroll: true});
        }
        selection = s;
    }

    let selection = 'regular';
</script>

<style>
    .message {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }

    .buttonHolder {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 3em 0;
    }
    .seasonPicker {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin: 2em auto 0.5em;
        flex-wrap: wrap;
        font-size: 0.9em;
    }
    .seasonPicker label {
        color: #888;
        font-weight: 500;
    }
    .seasonPicker select {
        padding: 6px 32px 6px 12px;
        font-size: 0.95em;
        border: 1px solid var(--ccc);
        border-radius: 6px;
        background: var(--fff);
        color: inherit;
        cursor: pointer;
        font-weight: 600;
    }
</style>



{#if loading}
    <!-- promise is pending -->
    <div class="message">
        <p>Loading league matchups...</p>
        <LinearProgress indeterminate />
    </div>
{:else}
    {#if leagueChain.length > 1}
        <div class="seasonPicker">
            <label for="season-select">Season:</label>
            <select id="season-select" bind:value={selectedSeason}>
                {#each leagueChain as entry (entry.leagueId)}
                    <option value={entry.season}>{entry.season}{entry.season === parseInt(year, 10) ? ' (current)' : ''}</option>
                {/each}
            </select>
        </div>
    {/if}

    {#if !isCurrent && selectedEntry}
        <HistoricalSeasonGrid
            leagueId={selectedEntry.leagueId}
            season={selectedEntry.season}
            regularSeasonLength={selectedEntry.regularSeasonLength}
            {leagueTeamManagers}
        />
    {:else if matchupWeeks.length}
        <div class="buttonHolder">
            <Group variant="outlined">
                <!-- Regular Season -->
                <Button class="selectionButtons" onclick={() => changeSelection('regular')} variant="{selection == 'regular' ? "raised" : "outlined"}">
                    <Label>Regular Season</Label>
                </Button>
                <!-- Championship Bracket -->
                <Button class="selectionButtons" onclick={() => changeSelection('champions')} variant="{selection == 'champions' || selection == 'losers' ? "raised" : "outlined"}">
                    <Label>Playoffs</Label>
                </Button>
            </Group>
            {#if selection == 'champions' || selection == 'losers'}
                <Group variant="outlined">
                    <!-- Championship Bracket -->
                    <Button class="selectionButtons" onclick={() => changeSelection('champions')} variant="{selection == 'champions' ? "raised" : "outlined"}">
                        <Label>Champions' Bracket</Label>
                    </Button>
                    <!-- Losers Bracket -->
                    <Button class="selectionButtons" onclick={() => changeSelection('losers')} variant="{selection == 'losers' ? "raised" : "outlined"}">
                        <Label>Losers' Bracket</Label>
                    </Button>
                </Group>
            {/if}
        </div>
        {#if selection == 'regular'}
            <MatchupWeeks {players} {queryWeek} {matchupWeeks} {regularSeasonLength} {year} {week} bind:selection={selection} {leagueTeamManagers} />
        {/if}
    {:else}
        <div class="message">
            <p>No upcoming matchups...</p>
        </div>
    {/if}
    <!-- {promise has processed -->
    {#if isCurrent && brackets.champs.bracket[0][0][0].points && (selection == 'champions' || selection == 'losers')}
        <Brackets {queryWeek} {leagueTeamManagers} {players} {brackets} bind:selection={selection} />
    {/if}
{/if}
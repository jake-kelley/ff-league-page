<script>
	import LinearProgress from '@smui/linear-progress';
	import { getNflState, leagueName, getAwards, getLeagueTeamManagers, getLeagueRecords, getBrackets, homepageText, managers, gotoManager, enableBlog, waitForAll } from '$lib/utils/helper';
	import { Transactions, PowerRankings, HomePost} from '$lib/components';
	import { getAvatarFromTeamManagers, getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

    const nflState = getNflState();
    const podiumsData = getAwards();
    const leagueTeamManagersData = getLeagueTeamManagers();
    const recordsData = getLeagueRecords();

    // Sum every starters_points entry across every championship-week object.
    const totalBracketPoints = (team) => {
        if (!team || !team.points) return null;
        let total = 0;
        for (const week of Object.values(team.points)) {
            if (Array.isArray(week)) {
                for (const p of week) if (typeof p === 'number') total += p;
            }
        }
        return total > 0 ? Math.round(total * 10) / 10 : null;
    };

    // Pull the championship-week matchup (last round of the winners bracket).
    const getFinalMatch = (brackets) => {
        const rounds = brackets?.champs?.bracket;
        if (!Array.isArray(rounds) || rounds.length === 0) return null;
        const lastRound = rounds[rounds.length - 1];
        if (!Array.isArray(lastRound) || lastRound.length === 0) return null;
        const real = lastRound.find((m) => !m.bye) ?? lastRound[0];
        if (!Array.isArray(real) || real.length < 2) return null;
        return real;
    };

    // From regular-season seasonWeekRecords, find the top single-week score for `year`.
    const getTopWeek = (records, year) => {
        const yearRecord = records?.regularSeasonData?.seasonWeekRecords?.find?.(
            (r) => r.year == year
        );
        const top = yearRecord?.seasonPointsHighs?.[0];
        if (!top || top.fpts == null) return null;
        return { rosterID: top.rosterID, fpts: top.fpts, week: top.week };
    };

    // Lazy-load brackets for the podium's leagueID once we know it. Returns null on failure.
    const championshipFor = async (podium) => {
        if (!podium?.leagueID) return null;
        try {
            const brackets = await getBrackets(podium.leagueID);
            const match = getFinalMatch(brackets);
            if (!match) return null;
            const [a, b] = match;
            const champTeam = a.roster_id == podium.champion ? a : b;
            const otherTeam = a.roster_id == podium.champion ? b : a;
            const champPts = totalBracketPoints(champTeam);
            const otherPts = totalBracketPoints(otherTeam);
            if (champPts == null && otherPts == null) return null;
            return { champPts, otherPts };
        } catch {
            return null;
        }
    };

    const formatScore = (n) => (n == null ? '—' : n.toFixed(1));
</script>

<style>
    #home {
        display: flex;
        gap: 26px;
        max-width: 1400px;
        margin: 0 auto;
        padding: 30px 26px 80px;
        align-items: flex-start;
        position: relative;
        z-index: 1;
    }

    #main {
        flex: 1 1 auto;
        min-width: 0;
    }

    .centerPanel {
        max-width: 980px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 22px;
    }

    .leagueSummary {
        flex: 0 0 28%;
        min-width: 260px;
        max-width: 380px;
        position: sticky;
        top: 24px;
    }

    .summaryCard {
        background: var(--f8f8f8);
        border: 1px solid var(--accentBorder);
        border-radius: 12px;
        padding: 20px 22px;
        box-shadow: 0 8px 24px var(--boxShadowOne);
    }

    .summaryCard h6 {
        margin: 0 0 14px;
        color: var(--accent);
        text-align: left;
        font-size: 0.95em;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border-bottom: 1px solid var(--accentBorder);
        padding-bottom: 10px;
    }

    .summaryCard :global(p),
    .summaryCard :global(li) {
        color: var(--g333);
        line-height: 1.5;
    }

    .summaryCard :global(a) {
        color: var(--accent);
    }

    .leagueNameLine {
        margin: 0 0 12px;
        font-weight: 600;
        color: var(--g111);
        font-size: 1.05em;
    }

    .summaryLinks {
        list-style: none;
        padding: 0;
        margin: 14px 0 0;
        border-top: 1px solid var(--accentBorder);
        padding-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .summaryLinks a {
        display: block;
        padding: 8px 10px;
        border-radius: 8px;
        color: var(--accent);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.92em;
        border: 1px solid var(--accentBorder);
        background: var(--accentSoft);
        transition: background 0.12s, color 0.12s;
    }

    .summaryLinks a:hover {
        background: var(--accent);
        color: #062420;
    }

    .homeBanner {
        background-color: var(--blueOne);
        color: #062420;
        padding: 0.65em 0;
        font-weight: 600;
        font-size: 1.25em;
        letter-spacing: 0.01em;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 8px 24px rgba(29, 233, 215, 0.15);
    }

    .panelCard {
        background: var(--f8f8f8);
        border: 1px solid var(--ebebeb);
        border-radius: 12px;
        padding: 24px 26px;
        box-shadow: 0 8px 24px var(--boxShadowOne);
    }

    .panelHeading {
        margin: 0 0 16px;
        color: var(--accent);
        font-size: 0.95em;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-align: left;
        border-bottom: 1px solid var(--accentBorder);
        padding-bottom: 10px;
    }

    /* champ styling */
    #currentChamp {
        padding: 8px 0 4px;
        background: transparent;
        box-shadow: none;
        border: none;
        text-align: center;
    }

    #champ {
        position: relative;
        width: 150px;
        height: 150px;
        margin: 0 auto;
        cursor: pointer;
    }

    .first {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        border-radius: 100%;
        border: 1px solid var(--ccc);
        left: 50%;
        top: 43%;
    }

    .laurel {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 135px;
        height: auto;
        left: 50%;
        top: 50%;
    }

    h4 {
        text-align: center;
        font-size: 1.6em;
        margin: 6px 10px;
        font-style: italic;
    }

    .label {
        display: table;
        text-align: center;
        line-height: 1.1em;
        font-size: 1.5em;
        margin: 6px auto 10px;
        cursor: pointer;
    }

    .center {
        text-align: center;
    }

    .champLayout {
        display: flex;
        gap: 24px;
        align-items: stretch;
        text-align: left;
    }

    .champCol {
        flex: 0 0 420px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
    }

    .highlights {
        flex: 1 1 auto;
        min-width: 0;
        text-align: left;
        border-left: 1px solid var(--ebebeb);
        padding-left: 22px;
        align-self: stretch;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .highlightsHeading {
        margin: 0 0 10px;
        color: var(--accent);
        font-size: 0.78em;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-align: left;
    }

    .highlightsList {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .hiRow {
        display: grid;
        grid-template-columns: 24px 110px 1fr;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 0.88em;
        color: var(--g333);
        line-height: 1.3;
    }

    .hiRow.clickable {
        cursor: pointer;
        transition: background 0.12s;
    }

    .hiRow.clickable:hover {
        background: var(--accentSoft);
    }

    .hiIcon {
        text-align: center;
        font-size: 1em;
        line-height: 1;
    }

    .hiLabel {
        color: var(--g999);
        font-size: 0.85em;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-weight: 600;
    }

    .hiValue {
        color: var(--g111);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .hiValue strong {
        color: var(--accent);
        font-weight: 700;
    }

    :global(.curOwner) {
        font-size: 0.75em;
        color: var(--bbb);
        font-style: italic;
    }

    @media (max-width: 950px) {
        #home {
            flex-direction: column;
            padding: 18px 14px 60px;
            gap: 18px;
        }

        .leagueSummary {
            flex: 1 1 auto;
            max-width: 100%;
            min-width: 0;
            width: 100%;
            position: static;
        }

        .centerPanel {
            max-width: 100%;
        }
    }

    @media (max-width: 640px) {
        .champLayout {
            flex-direction: column;
            gap: 16px;
        }
        .champCol {
            flex: 1 1 auto;
        }
        .highlights {
            border-left: none;
            border-top: 1px solid var(--ebebeb);
            padding-left: 0;
            padding-top: 14px;
        }
    }
</style>

<div id="home">
    <div id="main">
        <div class="centerPanel">
            <div class="homeBanner">
                {#await nflState}
                    <div class="center">Retrieving NFL state...</div>
                    <LinearProgress indeterminate />
                {:then nflStateData}
                    <div class="center">NFL {nflStateData.season}
                        {#if nflStateData.season_type == 'pre'}
                            Preseason
                        {:else if nflStateData.season_type == 'post'}
                            Postseason
                        {:else}
                            Season - {nflStateData.week > 0 ? `Week ${nflStateData.week}` : "Preseason"}
                        {/if}
                    </div>
                {:catch error}
                    <div class="center">Something went wrong: {error.message}</div>
                {/await}
            </div>

            <div class="panelCard">
                <div id="currentChamp">
                    {#await waitForAll(podiumsData, leagueTeamManagersData)}
                        <p class="center">Retrieving awards...</p>
                        <LinearProgress indeterminate />
                    {:then [podiums, leagueTeamManagers]}
                        {#if podiums[0]}
                            <div class="champLayout">
                                <div class="champCol">
                                    <h4>{podiums[0].year} Fantasy Champ</h4>
                                    <div id="champ" onclick={() => {if(managers.length) gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(podiums[0].champion)})}} >
                                        <img src="{getAvatarFromTeamManagers(leagueTeamManagers, podiums[0].champion, podiums[0].year)}" class="first" alt="champion" />
                                        <img src="/laurel.png" class="laurel" alt="laurel" />
                                    </div>
                                    <span class="label" onclick={() => gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(podiums[0].champion)})} >{getTeamFromTeamManagers(leagueTeamManagers, podiums[0].champion, podiums[0].year).name}</span>
                                </div>

                                <div class="highlights">
                                <h6 class="highlightsHeading">Season Highlights</h6>
                                <ul class="highlightsList">
                                    {#await championshipFor(podiums[0])}
                                        <li class="hiRow"><span class="hiIcon">🏆</span><span class="hiLabel">Championship</span><span class="hiValue">Loading…</span></li>
                                    {:then finalMatch}
                                        {#if finalMatch}
                                            <li class="hiRow">
                                                <span class="hiIcon">🏆</span>
                                                <span class="hiLabel">Championship</span>
                                                <span class="hiValue">
                                                    <strong>{formatScore(finalMatch.champPts)}</strong> – {formatScore(finalMatch.otherPts)}
                                                </span>
                                            </li>
                                        {/if}
                                    {:catch}{/await}

                                    {#if podiums[0].second != null}
                                        {@const secondName = getTeamFromTeamManagers(leagueTeamManagers, podiums[0].second, podiums[0].year)?.name}
                                        <li class="hiRow clickable" onclick={() => gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(podiums[0].second)})}>
                                            <span class="hiIcon">🥈</span><span class="hiLabel">Runner-up</span><span class="hiValue">{secondName ?? '—'}</span>
                                        </li>
                                    {/if}
                                    {#if podiums[0].third != null}
                                        {@const thirdName = getTeamFromTeamManagers(leagueTeamManagers, podiums[0].third, podiums[0].year)?.name}
                                        <li class="hiRow clickable" onclick={() => gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(podiums[0].third)})}>
                                            <span class="hiIcon">🥉</span><span class="hiLabel">Third place</span><span class="hiValue">{thirdName ?? '—'}</span>
                                        </li>
                                    {/if}

                                    {#each podiums[0].divisions ?? [] as div, ix (ix)}
                                        {#if div?.rosterID}
                                            {@const divName = getTeamFromTeamManagers(leagueTeamManagers, div.rosterID, podiums[0].year)?.name}
                                            <li class="hiRow clickable" onclick={() => gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(div.rosterID)})}>
                                                <span class="hiIcon">🏅</span><span class="hiLabel">{div.name || `Division ${ix + 1}`}</span><span class="hiValue">{divName ?? '—'}</span>
                                            </li>
                                        {/if}
                                    {/each}

                                    {#if podiums[0].toilet != null}
                                        {@const toiletName = getTeamFromTeamManagers(leagueTeamManagers, podiums[0].toilet, podiums[0].year)?.name}
                                        <li class="hiRow clickable" onclick={() => gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(podiums[0].toilet)})}>
                                            <span class="hiIcon">🚽</span><span class="hiLabel">Toilet Bowl</span><span class="hiValue">{toiletName ?? '—'}</span>
                                        </li>
                                    {/if}

                                    {#await recordsData}{:then records}
                                        {@const top = getTopWeek(records, podiums[0].year)}
                                        {#if top}
                                            {@const topName = getTeamFromTeamManagers(leagueTeamManagers, top.rosterID, podiums[0].year)?.name}
                                            <li class="hiRow clickable" onclick={() => gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(top.rosterID)})}>
                                                <span class="hiIcon">🔥</span><span class="hiLabel">High week</span><span class="hiValue">{topName ?? '—'} · <strong>{formatScore(top.fpts)}</strong> · Wk {top.week}</span>
                                            </li>
                                        {/if}
                                    {:catch}{/await}
                                </ul>
                                </div>
                            </div>
                        {:else}
                            <p class="center">No former champs.</p>
                        {/if}
                    {:catch error}
                        <p class="center">Something went wrong: {error.message}</p>
                    {/await}
                </div>
            </div>

            <div class="panelCard">
                <h6 class="panelHeading">Recent Activity</h6>
                <Transactions />
            </div>

            <PowerRankings />

            {#if enableBlog}
                <HomePost />
            {/if}
        </div>
    </div>

    <aside class="leagueSummary">
        <div class="summaryCard">
            <h6>League Summary</h6>
            <p class="leagueNameLine">{leagueName}</p>
            {@html homepageText }
            <ul class="summaryLinks">
                <li><a href="/dynasty-knowledge-base?article=constitution">📜 Constitution</a></li>
                <li><a href="/dynasty-knowledge-base?article=dynasty-101">🎓 Dynasty 101</a></li>
            </ul>
        </div>
    </aside>
</div>

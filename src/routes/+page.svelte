<script>
	import LinearProgress from '@smui/linear-progress';
	import { getNflState, leagueName, getAwards, getLeagueTeamManagers, homepageText, managers, gotoManager, enableBlog, waitForAll } from '$lib/utils/helper';
	import { Transactions, PowerRankings, HomePost} from '$lib/components';
	import { getAvatarFromTeamManagers, getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

    const nflState = getNflState();
    const podiumsData = getAwards();
    const leagueTeamManagersData = getLeagueTeamManagers();
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
                            <h4>{podiums[0].year} Fantasy Champ</h4>
                            <div id="champ" onclick={() => {if(managers.length) gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(podiums[0].champion)})}} >
                                <img src="{getAvatarFromTeamManagers(leagueTeamManagers, podiums[0].champion, podiums[0].year)}" class="first" alt="champion" />
                                <img src="/laurel.png" class="laurel" alt="laurel" />
                            </div>
                            <span class="label" onclick={() => gotoManager({year: podiums[0].year, leagueTeamManagers, rosterID: parseInt(podiums[0].champion)})} >{getTeamFromTeamManagers(leagueTeamManagers, podiums[0].champion, podiums[0].year).name}</span>
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

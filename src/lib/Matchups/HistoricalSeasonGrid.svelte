<script>
    import LinearProgress from '@smui/linear-progress';
    import { getHistoricalSeasonMatchups } from '$lib/utils/helperFunctions/historicalMatchups';
    import { gotoManager } from '$lib/utils/helper';

    export let leagueId, season, regularSeasonLength, leagueTeamManagers;

    let weeks = null;
    let loading = true;
    let error = null;

    const buildGrid = (weeksData) => {
        if (!weeksData || !leagueTeamManagers) return null;
        const seasonMap =
            leagueTeamManagers.teamManagersMap[season] ??
            leagueTeamManagers.teamManagersMap[leagueTeamManagers.currentSeason];
        if (!seasonMap) return null;

        const stats = Object.entries(seasonMap).map(([rid, entry]) => ({
            rosterId: parseInt(rid, 10),
            name: entry.team?.name ?? `Roster ${rid}`,
            avatar: entry.team?.avatar ?? 'https://sleepercdn.com/images/v2/icons/player_default.webp',
            weeks: {},
            record: { w: 0, l: 0, t: 0 },
            pf: 0,
            pa: 0,
            high: 0,
        }));
        const byRoster = Object.fromEntries(stats.map((s) => [s.rosterId, s]));

        for (const w of weeksData) {
            for (const id in w.matchups) {
                const teams = w.matchups[id];
                if (teams.length !== 2) continue;
                const [a, b] = teams;
                const sa = byRoster[a.rosterId];
                const sb = byRoster[b.rosterId];
                if (!sa || !sb) continue;
                const tie = a.points === b.points;
                const aWin = a.points > b.points;
                sa.weeks[w.week] = {
                    points: a.points,
                    opp: sb.name,
                    oppPoints: b.points,
                    oppRosterId: sb.rosterId,
                    result: tie ? 't' : aWin ? 'w' : 'l',
                };
                sb.weeks[w.week] = {
                    points: b.points,
                    opp: sa.name,
                    oppPoints: a.points,
                    oppRosterId: sa.rosterId,
                    result: tie ? 't' : aWin ? 'l' : 'w',
                };
                sa.pf += a.points;
                sa.pa += b.points;
                sb.pf += b.points;
                sb.pa += a.points;
                sa.high = Math.max(sa.high, a.points);
                sb.high = Math.max(sb.high, b.points);
                if (tie) {
                    sa.record.t++;
                    sb.record.t++;
                } else if (aWin) {
                    sa.record.w++;
                    sb.record.l++;
                } else {
                    sb.record.w++;
                    sa.record.l++;
                }
            }
        }

        stats.sort((a, b) => {
            const aGames = a.record.w + a.record.l + a.record.t;
            const bGames = b.record.w + b.record.l + b.record.t;
            const aPct = aGames ? (a.record.w + 0.5 * a.record.t) / aGames : 0;
            const bPct = bGames ? (b.record.w + 0.5 * b.record.t) / bGames : 0;
            if (aPct !== bPct) return bPct - aPct;
            return b.pf - a.pf;
        });

        const allWeeks = weeksData.map((w) => w.week).sort((a, b) => a - b);
        return { rosters: stats, weeks: allWeeks };
    };

    let lastLeagueId = null;
    $: if (leagueId && leagueId !== lastLeagueId) {
        lastLeagueId = leagueId;
        loading = true;
        weeks = null;
        error = null;
        getHistoricalSeasonMatchups(leagueId, regularSeasonLength)
            .then((w) => {
                weeks = w;
                loading = false;
            })
            .catch((err) => {
                error = err.message ?? String(err);
                loading = false;
            });
    }

    $: grid = buildGrid(weeks);

    const fmt = (n) => (n === undefined ? '—' : n.toFixed(1));
    const fmtSum = (n) => Math.round(n).toLocaleString();
</script>

<style>
    .wrap {
        margin: 1.5em auto 3em;
        width: 96%;
        max-width: 1200px;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 0.6em;
        flex-wrap: wrap;
        gap: 8px;
    }
    h2 {
        margin: 0;
        font-size: 1.2em;
        color: #00316b;
    }
    .meta {
        color: #888;
        font-size: 0.85em;
    }
    .scroll {
        overflow-x: auto;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
    }
    table {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
        font-size: 0.85em;
        font-variant-numeric: tabular-nums;
        color: #333;
    }
    th, td {
        padding: 6px 8px;
        text-align: center;
        border-bottom: 1px solid #eee;
        white-space: nowrap;
    }
    thead th {
        position: sticky;
        top: 0;
        background: linear-gradient(180deg, #f5f9ff 0%, #e8f0fb 100%);
        color: #00316b;
        font-weight: 600;
        font-size: 0.8em;
        z-index: 2;
    }
    .team-cell, thead .team-col {
        position: sticky;
        left: 0;
        background: #fff;
        text-align: left;
        z-index: 1;
        min-width: 160px;
        cursor: pointer;
    }
    thead .team-col {
        background: linear-gradient(180deg, #f5f9ff 0%, #e8f0fb 100%);
        z-index: 3;
    }
    .team-cell:hover { background: #f3f6fb; }
    .team-cell .row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .team-cell img {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        flex-shrink: 0;
    }
    .team-cell .name {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 140px;
    }
    td.w, td.l, td.t {
        padding: 4px 6px;
        line-height: 1.15em;
    }
    td.w {
        background: #e6f4ea;
        color: #1b5e20;
        font-weight: 600;
    }
    td.l {
        background: #fce8e8;
        color: #8e2424;
    }
    td.t {
        background: #fff7d0;
        color: #5a4a00;
    }
    .cell-score {
        font-weight: 700;
        font-size: 1em;
        font-variant-numeric: tabular-nums;
    }
    .cell-opp {
        font-size: 0.72em;
        font-weight: 500;
        opacity: 0.78;
        max-width: 78px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 1px auto 0;
    }
    .cell-opp .arrow {
        opacity: 0.55;
        margin-right: 1px;
    }
    .summary {
        background: #fafbfd;
        font-weight: 600;
        color: #00316b;
    }
    .rank {
        color: #999;
        font-weight: 500;
        margin-right: 4px;
    }
    .top1 { color: #b8860b; font-weight: 700; }

    .empty {
        text-align: center;
        padding: 30px;
        color: #888;
    }

    @media (max-width: 700px) {
        table { font-size: 0.78em; }
        th, td { padding: 4px 5px; }
        .team-cell { min-width: 130px; }
        .team-cell img { width: 18px; height: 18px; }
        .team-cell .name { max-width: 100px; font-size: 0.95em; }
        td.w, td.l, td.t { padding: 3px 5px; }
        .cell-opp { max-width: 64px; font-size: 0.66em; }
    }
</style>

<div class="wrap">
    <div class="header">
        <h2>📊 {season} Regular Season</h2>
        <span class="meta">
            {#if grid}
                {grid.weeks.length} weeks · {grid.rosters.length} teams · sorted by record then PF
            {/if}
        </span>
    </div>

    {#if loading}
        <p class="empty">Loading {season} matchups...</p>
        <LinearProgress indeterminate />
    {:else if error}
        <p class="empty">Couldn't load: {error}</p>
    {:else if !grid}
        <p class="empty">No matchup data available for {season}.</p>
    {:else if grid.rosters.length === 0}
        <p class="empty">No teams found for {season}.</p>
    {:else}
        <div class="scroll">
            <table>
                <thead>
                    <tr>
                        <th class="team-col">Manager</th>
                        {#each grid.weeks as w (w)}
                            <th>W{w}</th>
                        {/each}
                        <th>Record</th>
                        <th>PF</th>
                        <th>PA</th>
                        <th>Avg</th>
                        <th>High</th>
                    </tr>
                </thead>
                <tbody>
                    {#each grid.rosters as r, idx (r.rosterId)}
                        {@const games = r.record.w + r.record.l + r.record.t}
                        {@const avg = games ? r.pf / games : 0}
                        <tr>
                            <td
                                class="team-cell"
                                onclick={() => gotoManager({ leagueTeamManagers, rosterID: r.rosterId, year: season })}
                            >
                                <div class="row">
                                    <span class="rank {idx === 0 ? 'top1' : ''}">{idx + 1}</span>
                                    <img src={r.avatar} alt="" />
                                    <span class="name">{r.name}</span>
                                </div>
                            </td>
                            {#each grid.weeks as w (w)}
                                {@const cell = r.weeks[w]}
                                {#if cell}
                                    <td class={cell.result} title="vs {cell.opp} — {fmt(cell.points)} to {fmt(cell.oppPoints)}">
                                        <div class="cell-score">{fmt(cell.points)}</div>
                                        <div class="cell-opp"><span class="arrow">vs</span> {cell.opp}</div>
                                    </td>
                                {:else}
                                    <td>—</td>
                                {/if}
                            {/each}
                            <td class="summary">{r.record.w}-{r.record.l}{r.record.t ? `-${r.record.t}` : ''}</td>
                            <td class="summary">{fmtSum(r.pf)}</td>
                            <td class="summary">{fmtSum(r.pa)}</td>
                            <td class="summary">{fmt(avg)}</td>
                            <td class="summary">{fmt(r.high)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

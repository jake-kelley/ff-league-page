<script>
    import { gotoManager } from '$lib/utils/helper';

    export let rankings, leagueTeamManagers;

    const POS_META = [
        { key: 'QB',    label: 'QB',    color: '#1976d2' },
        { key: 'RB',    label: 'RB',    color: '#43a047' },
        { key: 'WR',    label: 'WR',    color: '#26a69a' },
        { key: 'TE',    label: 'TE',    color: '#ef6c00' },
        { key: 'PICKS', label: 'Picks', color: '#7e57c2' },
        { key: 'OTHER', label: 'Other', color: '#9e9e9e' },
    ];

    $: ranked = [...rankings].sort((a, b) => b.total - a.total);
    $: maxTotal = ranked[0]?.total ?? 1;

    const teamFor = (rosterId) => {
        const season = leagueTeamManagers.currentSeason;
        return leagueTeamManagers.teamManagersMap[season]?.[rosterId]?.team;
    };

    const fmt = (n) => {
        if (!n) return '0';
        if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
        return n.toLocaleString();
    };
</script>

<style>
    .panel {
        background: #fff;
        color: #333;
        border-radius: 12px;
        padding: 1.4em 1.6em 1.6em;
        margin: 1.5em auto;
        max-width: 980px;
        width: 95%;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    }
    .panel h2 {
        margin: 0 0 0.2em;
        font-size: 1.4em;
        background: linear-gradient(90deg, #1976d2 0%, #00316b 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .panel .sub {
        color: #888;
        font-size: 0.85em;
        margin: 0 0 1.2em;
    }
    .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 1em;
        font-size: 0.82em;
        color: #555;
    }
    .legend .swatch {
        display: inline-block;
        width: 11px;
        height: 11px;
        border-radius: 3px;
        margin-right: 4px;
        vertical-align: middle;
    }
    .row {
        display: grid;
        grid-template-columns: 36px minmax(0, 1.5fr) minmax(0, 3fr) auto;
        align-items: center;
        gap: 14px;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background 0.1s;
    }
    .row:hover { background: #fafbfd; }
    .row:last-child { border-bottom: 0; }

    .rank {
        font-size: 1.4em;
        font-weight: 700;
        color: #00316b;
        text-align: center;
        font-variant-numeric: tabular-nums;
    }
    .rank.top {
        color: #b8860b;
    }
    .team {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
    }
    .team img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        flex-shrink: 0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .team .name {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .bar-wrap {
        min-width: 0;
    }
    .bar {
        display: flex;
        height: 18px;
        background: #f3f3f3;
        border-radius: 4px;
        overflow: hidden;
    }
    .bar > span {
        height: 100%;
        display: block;
    }
    .breakdown-labels {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 12px;
        margin-top: 4px;
        font-size: 0.78em;
        color: #555;
    }
    .breakdown-labels span {
        white-space: nowrap;
    }
    .breakdown-labels .swatch {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 2px;
        margin-right: 4px;
        vertical-align: middle;
    }
    .total {
        font-weight: 700;
        font-size: 1.1em;
        font-variant-numeric: tabular-nums;
        color: #00316b;
        text-align: right;
        white-space: nowrap;
    }

    @media (max-width: 700px) {
        .row {
            grid-template-columns: 30px minmax(0, 1fr) auto;
            grid-template-rows: auto auto;
            gap: 8px 12px;
        }
        .bar-wrap {
            grid-column: 1 / -1;
        }
        .panel {
            padding: 1.2em 1em 1.4em;
        }
    }
</style>

<section class="panel">
    <h2>📊 Power Rankings</h2>
    <p class="sub">Total roster value (FantasyCalc — 1QB, 10-team, 1.0 PPR dynasty), including future rookie picks.</p>

    <div class="legend">
        {#each POS_META as p (p.key)}
            <span><span class="swatch" style="background: {p.color}"></span>{p.label}</span>
        {/each}
    </div>

    {#each ranked as r, idx (r.rosterId)}
        {@const team = teamFor(r.rosterId)}
        <div class="row" onclick={() => gotoManager({ leagueTeamManagers, rosterID: r.rosterId })}>
            <div class="rank {idx === 0 ? 'top' : ''}">{idx + 1}</div>
            <div class="team">
                <img alt="" src={team?.avatar ?? 'https://sleepercdn.com/images/v2/icons/player_default.webp'} />
                <span class="name">{team?.name ?? `Roster ${r.rosterId}`}</span>
            </div>
            <div class="bar-wrap">
                <div class="bar" aria-hidden="true">
                    {#each POS_META as p (p.key)}
                        {#if r.breakdown[p.key] > 0}
                            <span style="background: {p.color}; width: {(r.breakdown[p.key] / maxTotal) * 100}%"></span>
                        {/if}
                    {/each}
                </div>
                <div class="breakdown-labels">
                    {#each POS_META as p (p.key)}
                        {#if r.breakdown[p.key] > 0}
                            <span><span class="swatch" style="background: {p.color}"></span>{p.label} {fmt(r.breakdown[p.key])}</span>
                        {/if}
                    {/each}
                </div>
            </div>
            <div class="total">{fmt(r.total)}</div>
        </div>
    {/each}
</section>

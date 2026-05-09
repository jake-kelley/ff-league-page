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

    let includePicks = false;

    const effectiveTotal = (r, withPicks) =>
        withPicks ? r.total : r.total - (r.breakdown.PICKS || 0);

    $: ranked = [...rankings]
        .map((r) => ({ ...r, effective: effectiveTotal(r, includePicks) }))
        .sort((a, b) => b.effective - a.effective);
    $: visibleMeta = includePicks ? POS_META : POS_META.filter((p) => p.key !== 'PICKS');
    $: maxTotal = ranked[0]?.effective ?? 1;
    $: leagueAvg = ranked.length
        ? Math.round(ranked.reduce((s, r) => s + r.effective, 0) / ranked.length)
        : 0;
    $: avgPct = maxTotal > 0 ? (leagueAvg / maxTotal) * 100 : 0;

    const deltaPct = (total, avg) => {
        if (!avg) return 0;
        return Math.round(((total - avg) / avg) * 100);
    };

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
        position: relative;
        display: flex;
        height: 18px;
        background: #f3f3f3;
        border-radius: 4px;
        overflow: hidden;
    }
    .bar > span:not(.avg-line) {
        height: 100%;
        display: block;
    }
    .avg-line {
        position: absolute;
        top: -3px;
        bottom: -3px;
        width: 2px;
        background: #c62828;
        z-index: 2;
        pointer-events: none;
    }
    .avg-line::after {
        content: '';
        position: absolute;
        top: -4px;
        left: -3px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #c62828;
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
    .delta {
        display: block;
        font-size: 0.75em;
        font-weight: 600;
        margin-top: 2px;
        font-variant-numeric: tabular-nums;
    }
    .delta.pos { color: #2e7d32; }
    .delta.neg { color: #c62828; }
    .delta.zero { color: #888; }

    .stats {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        margin: 0 0 1em;
        padding: 0.6em 0.9em;
        background: linear-gradient(135deg, #fff5f0 0%, #ffe4d4 100%);
        border-left: 4px solid #c62828;
        border-radius: 8px;
        font-size: 0.9em;
    }
    .stats .label { color: #6a3010; font-weight: 500; margin-right: 4px; }
    .stats .value {
        color: #00316b;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
    }
    .stats .marker {
        display: inline-block;
        width: 14px;
        height: 2px;
        background: #c62828;
        position: relative;
        margin-right: 6px;
        vertical-align: middle;
    }
    .stats .marker::after {
        content: '';
        position: absolute;
        top: -3px;
        left: 3px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #c62828;
    }

    .picks-toggle {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 0.8em;
        padding: 6px 12px;
        background: #f3f3f3;
        border-radius: 999px;
        cursor: pointer;
        font-size: 0.85em;
        color: #333;
        user-select: none;
        transition: background 0.12s;
    }
    .picks-toggle:hover {
        background: #e8eef7;
    }
    .picks-toggle input {
        accent-color: #1976d2;
        cursor: pointer;
        margin: 0;
    }

    @media (max-width: 768px) {
        .panel {
            padding: 0.8em 0.9em 1em;
            margin: 0.8em auto;
            border-radius: 10px;
        }
        .panel h2 {
            font-size: 1.05em;
        }
        .panel .sub {
            font-size: 0.72em;
            margin-bottom: 0.7em;
        }
        .stats {
            padding: 0.35em 0.7em;
            font-size: 0.78em;
            margin-bottom: 0.6em;
        }
        .legend {
            font-size: 0.7em;
            gap: 8px;
            margin-bottom: 0.5em;
        }
        .picks-toggle {
            font-size: 0.78em;
            padding: 4px 10px;
            margin-bottom: 0.6em;
        }
        .row {
            grid-template-columns: 24px minmax(0, 1fr) auto;
            grid-template-rows: auto auto;
            gap: 2px 8px;
            padding: 6px 0;
        }
        .rank {
            font-size: 1.05em;
        }
        .team {
            gap: 6px;
        }
        .team img {
            width: 22px;
            height: 22px;
        }
        .team .name {
            font-size: 0.82em;
        }
        .bar-wrap {
            grid-column: 1 / -1;
        }
        .bar {
            height: 10px;
        }
        .avg-line::after {
            width: 6px;
            height: 6px;
            top: -3px;
            left: -2px;
        }
        .breakdown-labels {
            display: none;
        }
        .total {
            font-size: 0.88em;
            line-height: 1.1em;
        }
        .delta {
            font-size: 0.66em;
            margin-top: 1px;
        }
    }
</style>

<section class="panel">
    <h2>📊 Value Rankings</h2>
    <p class="sub">Total roster value (FantasyCalc — 1QB, 10-team, 1.0 PPR dynasty){includePicks ? ', including future rookie picks' : ', players only'}.</p>

    <label class="picks-toggle">
        <input type="checkbox" bind:checked={includePicks} />
        <span>Include rookie picks in totals</span>
    </label>

    <div class="stats">
        <span><span class="marker"></span><span class="label">League average:</span><span class="value">{fmt(leagueAvg)}</span></span>
    </div>

    <div class="legend">
        {#each visibleMeta as p (p.key)}
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
                    {#each visibleMeta as p (p.key)}
                        {#if r.breakdown[p.key] > 0}
                            <span style="background: {p.color}; width: {(r.breakdown[p.key] / maxTotal) * 100}%"></span>
                        {/if}
                    {/each}
                    {#if leagueAvg > 0}
                        <span class="avg-line" title="League avg: {fmt(leagueAvg)}" style="left: {avgPct}%"></span>
                    {/if}
                </div>
                <div class="breakdown-labels">
                    {#each visibleMeta as p (p.key)}
                        {#if r.breakdown[p.key] > 0}
                            <span><span class="swatch" style="background: {p.color}"></span>{p.label} {fmt(r.breakdown[p.key])}</span>
                        {/if}
                    {/each}
                </div>
            </div>
            <div class="total">
                {fmt(r.effective)}
                {#if leagueAvg > 0}
                    {@const d = deltaPct(r.effective, leagueAvg)}
                    <span class="delta {d > 0 ? 'pos' : d < 0 ? 'neg' : 'zero'}">
                        {d > 0 ? '+' : ''}{d}% vs avg
                    </span>
                {/if}
            </div>
        </div>
    {/each}
</section>

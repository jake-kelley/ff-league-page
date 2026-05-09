<script>
    import LinearProgress from '@smui/linear-progress';

    let { valueData } = $props();

    let players = $state([]);
    let fetchedAt = $state(null);
    let loadError = $state(null);

    valueData
        .then((d) => {
            players = d.players ?? [];
            fetchedAt = d.fetchedAt ?? null;
        })
        .catch((err) => {
            loadError = err.message ?? String(err);
        });

    const POSITION_FILTERS = [
        { key: 'QB', label: 'QB', match: (p) => p === 'QB' },
        { key: 'RB', label: 'RB', match: (p) => p === 'RB' },
        { key: 'WR', label: 'WR', match: (p) => p === 'WR' },
        { key: 'TE', label: 'TE', match: (p) => p === 'TE' },
        { key: 'PICK', label: 'Draft Pick', match: (p) => p === 'PICK' || p === 'RDP' },
    ];

    let search = $state('');
    let activePositions = $state(new Set(POSITION_FILTERS.map((f) => f.key)));

    const togglePosition = (key) => {
        const next = new Set(activePositions);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        activePositions = next;
    };

    const matchesPositionFilter = (pos) => {
        for (const filter of POSITION_FILTERS) {
            if (activePositions.has(filter.key) && filter.match(pos)) return true;
        }
        return false;
    };

    const filtered = $derived.by(() => {
        const q = search.trim().toLowerCase();
        return players
            .filter((p) => matchesPositionFilter(p.position))
            .filter((p) => !q || p.name.toLowerCase().includes(q))
            .slice()
            .sort((a, b) => b.value - a.value);
    });

    const fmtDate = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleString();
    };

    const fmtTrend = (t) => {
        if (t === null || t === undefined) return '—';
        const sign = t > 0 ? '+' : '';
        return `${sign}${t}`;
    };

    const PLAYER_FALLBACK = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
    const isPick = (pos) => pos === 'PICK' || pos === 'RDP';
    const playerThumb = (sleeperId) =>
        sleeperId ? `https://sleepercdn.com/content/nfl/players/thumb/${sleeperId}.jpg` : PLAYER_FALLBACK;
</script>

<style>
    .wrapper {
        max-width: 1100px;
        margin: 30px auto 60px;
        padding: 0 20px;
    }
    h2 {
        margin: 0 0 6px;
    }
    .meta {
        color: #888;
        font-size: 0.85em;
        margin-bottom: 20px;
    }
    .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        align-items: center;
        margin-bottom: 18px;
    }
    .search {
        flex: 1 1 280px;
        padding: 10px 12px;
        border: 1px solid var(--ccc);
        border-radius: 6px;
        font-size: 1em;
        background: var(--fff);
        color: inherit;
    }
    .pos-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
    .pos-chip {
        padding: 6px 12px;
        border: 1px solid var(--ccc);
        border-radius: 999px;
        background: var(--fff);
        cursor: pointer;
        font-size: 0.85em;
        user-select: none;
        color: inherit;
    }
    .pos-chip.active {
        background: #00316b;
        color: #fff;
        border-color: #00316b;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        background: var(--fff);
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }
    th, td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid var(--eee);
        font-size: 0.92em;
    }
    th {
        background: var(--f3f3f3);
        font-weight: 600;
    }
    .num {
        text-align: right;
        font-variant-numeric: tabular-nums;
    }
    .pos-pill {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.75em;
        font-weight: 600;
        background: #e8eef7;
        color: #00316b;
    }
    .player-cell {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .thumb {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #e8eef7;
        object-fit: cover;
        flex-shrink: 0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .thumb.pick {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1em;
    }
    .empty {
        text-align: center;
        padding: 30px;
        color: #888;
    }
</style>

<div class="wrapper">
    <h2>Player & Pick Values</h2>
    <p class="meta">
        Dynasty values from <a href="https://fantasycalc.com" target="_blank" rel="noreferrer">FantasyCalc</a> (1QB, 10-team, 1.0 PPR).
        {#if fetchedAt}Last refreshed {fmtDate(fetchedAt)}.{/if}
    </p>

    {#if loadError}
        <p style="color: #c33;">Couldn't load values: {loadError}</p>
    {:else if players.length === 0}
        <p>Loading values...</p>
        <LinearProgress indeterminate />
    {:else}
        <div class="controls">
            <input
                class="search"
                type="search"
                placeholder="Search players by name..."
                bind:value={search}
            />
            <div class="pos-filters" role="group" aria-label="Filter by position">
                {#each POSITION_FILTERS as filter (filter.key)}
                    <label class="pos-chip {activePositions.has(filter.key) ? 'active' : ''}">
                        <input
                            type="checkbox"
                            checked={activePositions.has(filter.key)}
                            onchange={() => togglePosition(filter.key)}
                            style="display:none"
                        />
                        {filter.label}
                    </label>
                {/each}
            </div>
        </div>

        {#if filtered.length === 0}
            <div class="empty">No players match those filters.</div>
        {:else}
            <table>
                <thead>
                    <tr>
                        <th class="num">Rank</th>
                        <th>Player</th>
                        <th>Pos</th>
                        <th>Team</th>
                        <th class="num">Age</th>
                        <th class="num">Value</th>
                        <th class="num">30d Trend</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filtered as p (p.id)}
                        <tr>
                            <td class="num">{p.overallRank ?? '—'}</td>
                            <td>
                                <div class="player-cell">
                                    {#if isPick(p.position)}
                                        <div class="thumb pick">📅</div>
                                    {:else}
                                        <img
                                            class="thumb"
                                            src={playerThumb(p.sleeperId)}
                                            onerror={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLAYER_FALLBACK; }}
                                            alt=""
                                        />
                                    {/if}
                                    <span>{p.name}</span>
                                </div>
                            </td>
                            <td><span class="pos-pill">{p.position}</span></td>
                            <td>{p.team || '—'}</td>
                            <td class="num">{p.age ?? '—'}</td>
                            <td class="num">{p.value.toLocaleString()}</td>
                            <td class="num">{fmtTrend(p.trend30Day)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    {/if}
</div>

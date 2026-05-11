<script>
    import { gotoManager } from '$lib/utils/helper';

    export let totals, leagueTeamManagers;

    const currentSeason = leagueTeamManagers.currentSeason;
    const seasonMap = leagueTeamManagers.teamManagersMap[currentSeason] ?? {};

    const rows = Object.entries(seasonMap)
        .map(([rosterID, entry]) => {
            let trades = 0;
            let waivers = 0;
            for (const mid of entry.managers ?? []) {
                trades += totals?.allTime?.[mid]?.trade ?? 0;
                waivers += totals?.allTime?.[mid]?.waiver ?? 0;
            }
            return {
                rosterID: parseInt(rosterID, 10),
                name: entry.team?.name ?? `Roster ${rosterID}`,
                avatar: entry.team?.avatar ?? 'https://sleepercdn.com/images/v2/icons/player_default.webp',
                trades,
                waivers,
                total: trades + waivers,
            };
        })
        .sort((a, b) => b.total - a.total);
</script>

<style>
    .activity {
        background: var(--fff);
        border-radius: 10px;
        padding: 0.8em 1em 1em;
        margin: 0 auto 1.2em;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
    }
    .activity h3 {
        margin: 0 0 0.6em;
        font-size: 0.95em;
        color: #1de9d7;
        font-weight: 600;
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 6px 10px;
    }
    .cell {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 6px;
        border-radius: 6px;
        cursor: pointer;
        min-width: 0;
        transition: background 0.1s;
    }
    .cell:hover {
        background: #f3f6fb;
    }
    .cell img {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        flex-shrink: 0;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .info {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1px;
    }
    .name {
        font-size: 0.78em;
        font-weight: 600;
        color: var(--g333);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .stats {
        font-size: 0.72em;
        color: var(--g555);
        font-variant-numeric: tabular-nums;
        display: flex;
        gap: 8px;
    }
    .stats .t { color: #1de9d7; font-weight: 600; }
    .stats .w { color: #43a047; font-weight: 600; }

    @media (max-width: 768px) {
        .activity {
            padding: 0.6em 0.7em 0.7em;
        }
        .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 4px 8px;
        }
        .cell img {
            width: 20px;
            height: 20px;
        }
        .name { font-size: 0.72em; }
        .stats { font-size: 0.66em; gap: 6px; }
    }
</style>

<section class="activity">
    <h3>📊 Manager Activity (all-time)</h3>
    <div class="grid">
        {#each rows as row (row.rosterID)}
            <div
                class="cell"
                role="button"
                tabindex="0"
                onclick={() => gotoManager({ leagueTeamManagers, rosterID: row.rosterID })}
                onkeydown={(e) => { if (e.key === 'Enter') gotoManager({ leagueTeamManagers, rosterID: row.rosterID }); }}
            >
                <img alt="" src={row.avatar} />
                <div class="info">
                    <span class="name">{row.name}</span>
                    <span class="stats">
                        <span class="t">🔁 {row.trades}</span>
                        <span class="w">📥 {row.waivers}</span>
                    </span>
                </div>
            </div>
        {/each}
    </div>
</section>

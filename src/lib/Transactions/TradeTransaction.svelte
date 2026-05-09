<script context="module">
	import { leagueID } from '$lib/utils/leagueInfo';

	let slotMapPromise = null;

	// Returns Map<year, Map<rosterId, slot>>. Resolves slots via two paths:
	//   1) slot_to_roster_id on the draft (only set once order is finalized)
	//   2) draft_order (user_id -> slot) + leagueTeamManagers (rosterId -> user_ids)
	// The second path covers pre_draft state where slot_to_roster_id is empty
	// but the order has been assigned.
	export const getDraftSlots = (leagueTeamManagers) => {
		if (slotMapPromise) return slotMapPromise;
		slotMapPromise = (async () => {
			const result = new Map();
			try {
				const draftsRes = await fetch(`https://api.sleeper.app/v1/league/${leagueID}/drafts`);
				if (!draftsRes.ok) return result;
				const drafts = await draftsRes.json();
				for (const d of drafts) {
					const year = parseInt(d.season, 10);
					const yMap = new Map();

					if (d.slot_to_roster_id) {
						for (const [slot, rosterId] of Object.entries(d.slot_to_roster_id)) {
							if (rosterId === null || rosterId === undefined) continue;
							yMap.set(parseInt(rosterId, 10), parseInt(slot, 10));
						}
					}

					if (yMap.size === 0 && d.draft_order && leagueTeamManagers) {
						const seasonMap =
							leagueTeamManagers.teamManagersMap[year] ??
							leagueTeamManagers.teamManagersMap[leagueTeamManagers.currentSeason];
						if (seasonMap) {
							for (const [rosterIdStr, entry] of Object.entries(seasonMap)) {
								const rosterId = parseInt(rosterIdStr, 10);
								for (const userId of entry.managers ?? []) {
									const slot = d.draft_order[userId];
									if (slot) {
										yMap.set(rosterId, parseInt(slot, 10));
										break;
									}
								}
							}
						}
					}

					if (yMap.size) result.set(year, yMap);
				}
			} catch (err) {
				console.error('Failed to load draft slots', err);
			}
			return result;
		})();
		return slotMapPromise;
	};
</script>

<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { gotoManager } from '$lib/utils/helper';
	import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import TransactionMove from './TransactionMove.svelte';

	export let transaction, players, leagueTeamManagers;

	let slotMap = null;
	onMount(async () => {
		slotMap = await getDraftSlots(leagueTeamManagers);
	});

	const findOriginRoster = (move) => {
		for (let i = 0; i < move.length; i++) {
			if (move[i] === 'origin') return transaction.rosters[i];
		}
		return null;
	};

	const enrichMove = (move, currentSlotMap) => {
		const origin = findOriginRoster(move);
		return move.map((cell) => {
			if (!cell || cell === 'origin' || !cell.pick) return cell;
			const year = parseInt(cell.pick.season, 10);
			const owner = cell.pick.original_owner ?? origin;
			const slot = currentSlotMap?.get(year)?.get(owner);
			return slot ? { ...cell, pick: { ...cell.pick, slot } } : cell;
		});
	};

	$: enrichedMoves = transaction.moves.map((move) => enrichMove(move, slotMap));

	const buildTradeCalcUrl = (slotMap) => {
		const sides = transaction.rosters.map(() => []);
		for (const move of transaction.moves) {
			const origin = findOriginRoster(move);
			for (let i = 0; i < move.length; i++) {
				const cell = move[i];
				if (!cell || cell === 'origin') continue;
				if (cell.player) {
					sides[i].push(`p:${cell.player}`);
				} else if (cell.pick) {
					const year = parseInt(cell.pick.season, 10);
					const round = cell.pick.round;
					const owner = cell.pick.original_owner ?? origin;
					const slot = slotMap?.get(year)?.get(owner);
					sides[i].push(slot ? `pick:${year}-${round}-${slot}` : `pick:${year}-${round}`);
				}
			}
		}
		if (sides.length < 2) return null;
		const params = new URLSearchParams();
		if (sides[0].length) params.set('a', sides[0].join(','));
		if (sides[1].length) params.set('b', sides[1].join(','));
		const qs = params.toString();
		return qs ? `/trade-calculator?${qs}` : null;
	};

	const openInCalc = async () => {
		const resolved = slotMap ?? await getDraftSlots(leagueTeamManagers);
		const url = buildTradeCalcUrl(resolved);
		if (url) goto(url);
	};

	const teamHeaderClick = (e, owner) => {
		e.stopPropagation();
		gotoManager({ year: transaction.season, leagueTeamManagers, rosterID: owner });
	};
</script>

<style>
    .tradeTransaction {
        display: flex;
        position: relative;
        flex-direction: column;
        margin-bottom: 1em;
        cursor: pointer;
        transition: transform 0.1s, box-shadow 0.1s;
    }
    .tradeTransaction:hover {
        transform: translateY(-1px);
    }
    .tradeTransaction:hover tbody {
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.12);
    }
    .calc-hint {
        text-align: center;
        font-size: 0.7em;
        color: #1976d2;
        font-weight: 600;
        padding: 0.4em 0 0;
        opacity: 0;
        transition: opacity 0.15s;
    }
    .tradeTransaction:hover .calc-hint {
        opacity: 1;
    }
    
    .name {
        position: relative;
        text-align: center;
    }

    .avatar {
        border-radius: 50%;
        height: 40px;
        width: 40px;
        border: 2px solid var(--blueOne);
        background-color: var(--fff);
    }

    .ownerName {
        display: inline-block;
        font-weight: normal;
        line-height: 1em;
        margin: 0.2em;
    }

    .currentOwner {
        font-style: italic;
        color: var(--aaa);
        font-size: 0.7em;
    }

    .clickable {
        cursor: pointer;
    }

    .date {
        color: var(--g999);
        font-style: italic;
        font-size: 0.7em;
        text-align: center;
        padding: 0.7em 0 1em;
        background-color: var(--fff);
        border-radius: 0 0 0 40px;
        border-left: 2px solid var(--blueOne);
        border-right: 1px solid var(--ddd);
        margin-bottom: 3em;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        /*
            the height setting is ignored, but
            allows the holder class div to have
            a height of 100%
        */
        height: 1px;
    }

    tbody {
        background-color: var(--fff);
        border-top: 2px solid var(--blueOne);
        border-left: 2px solid var(--blueOne);
        border-right: 1px solid var(--ddd);
    }

    .holder {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 100%;
    }

    @media (max-width: 420px) {
        .ownerName {
            font-size: 0.8em;
        }
    }
</style>

<div
    class="tradeTransaction"
    role="button"
    tabindex="0"
    onclick={openInCalc}
    onkeydown={(e) => { if (e.key === 'Enter') openInCalc(e); }}
    title="Open in Trade Calculator"
>
    <table>
        <thead>
            <tr>
                {#each transaction.rosters as owner}
                    <th class="name clickable" style="width: {1 / transaction.rosters.length * 100}%;" onclick={(e) => teamHeaderClick(e, owner)}>
                        <div class="holder">
                            <img class="avatar" src="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).avatar}" alt="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name} avatar"/>
                            <span class="ownerName">
                                {getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name}
                                {#if getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name != getTeamFromTeamManagers(leagueTeamManagers, owner).name}
                                    <br />
                                    <span class="currentOwner">({getTeamFromTeamManagers(leagueTeamManagers, owner).name})</span>
                                {/if}
                            </span>
                        </div>
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each enrichedMoves as move}
                <TransactionMove {players} {move} type={transaction.type} {leagueTeamManagers} season={transaction.season} />
            {/each}
        </tbody>
    </table>
    <span class="date">
        {transaction.date}
    </span>
    <span class="calc-hint">📊 Click to analyze in Trade Calculator</span>
</div>

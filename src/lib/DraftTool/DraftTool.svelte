<script>
    import { onMount, onDestroy } from 'svelte';
    import { csvToAssets, formatPickLabel } from './csv.js';

    let state = $state(null);
    let loadError = $state('');
    let actionError = $state('');
    let pollTimer;
    let tickTimer;
    let now = $state(Date.now());

    let clientId = $state('');
    let displayName = $state('');

    // UI filters
    let searchTerm = $state('');
    const POSITION_FILTERS = ['QB', 'RB', 'WR', 'TE', 'PICK'];
    let activePositions = $state(new Set(POSITION_FILTERS));

    // Swap mode
    let swapFrom = $state(null);

    // Config form
    let showConfig = $state(false);
    let cfgTeamCount = $state(10);
    let cfgRounds = $state(4);
    let cfgSeconds = $state(60);
    let cfgTeamNames = $state([]);
    let csvFileName = $state('');
    let csvAssetsPreview = $state(null);
    let csvError = $state('');

    onMount(() => {
        let stored = localStorage.getItem('draft_tool_client_id');
        if (!stored) {
            stored = crypto.randomUUID();
            localStorage.setItem('draft_tool_client_id', stored);
        }
        clientId = stored;
        displayName = localStorage.getItem('draft_tool_display_name') || '';
        fetchState();
        pollTimer = setInterval(fetchState, 1500);
        tickTimer = setInterval(() => (now = Date.now()), 250);
    });

    onDestroy(() => {
        if (pollTimer) clearInterval(pollTimer);
        if (tickTimer) clearInterval(tickTimer);
    });

    const fetchState = async () => {
        try {
            const res = await fetch('/api/draft-tool', { headers: { 'cache-control': 'no-store' } });
            if (!res.ok) throw new Error(`Server ${res.status}`);
            const next = await res.json();
            state = next;
            loadError = '';
        } catch (e) {
            loadError = e.message || 'failed to load';
        }
    };

    const doAction = async (action, payload = {}) => {
        actionError = '';
        try {
            const res = await fetch('/api/draft-tool/action', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ action, clientId, ...payload }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Server ${res.status}`);
            }
            const next = await res.json();
            state = next;
        } catch (e) {
            actionError = e.message || 'action failed';
        }
    };

    // ---------- Derived ----------
    const myTeamIndex = $derived.by(() => {
        if (!state) return -1;
        return state.teams.findIndex((t) => t.claimedBy === clientId);
    });

    const currentSlot = $derived.by(() => {
        if (!state) return null;
        if (state.currentPick > state.picks.length) return null;
        return state.picks[state.currentPick - 1];
    });

    const isMyTurn = $derived.by(() => {
        if (!state || !currentSlot) return false;
        const team = state.teams[currentSlot.teamIndex];
        return team?.claimedBy === clientId;
    });

    const remainingSeconds = $derived.by(() => {
        if (!state?.started || !state.pickStartedAt) return null;
        const elapsed = (now - state.pickStartedAt) / 1000;
        return Math.max(0, Math.ceil(state.secondsPerPick - elapsed));
    });

    const draftedAssetIds = $derived.by(() => {
        if (!state) return new Set();
        return new Set(state.picks.map((p) => p.selectedAssetId).filter(Boolean));
    });

    const filteredAssets = $derived.by(() => {
        if (!state) return [];
        const q = searchTerm.trim().toLowerCase();
        return state.assets
            .filter((a) => !draftedAssetIds.has(a.id))
            .filter((a) => {
                if (a.asset_type === 'pick') return activePositions.has('PICK');
                return activePositions.has(a.position);
            })
            .filter((a) => {
                if (!q) return true;
                const label = a.asset_type === 'pick' ? formatPickLabel(a) : a.player_name;
                return label.toLowerCase().includes(q) || (a.nfl_team || '').toLowerCase().includes(q);
            })
            .slice()
            .sort((a, b) => b.fc_value - a.fc_value);
    });

    // Board: row = round, column = original pickInRound (1..N).
    // Each cell shows the (possibly swapped) team owner. This preserves the snake-draft visualization
    // even after picks are swapped between teams.
    const boardCells = $derived.by(() => {
        if (!state) return [];
        const cells = Array.from({ length: state.rounds }, () => Array(state.teamCount).fill(null));
        for (const p of state.picks) {
            cells[p.round - 1][p.pickInRound - 1] = p;
        }
        return cells;
    });

    const assetById = $derived.by(() => {
        if (!state) return new Map();
        const m = new Map();
        for (const a of state.assets) m.set(a.id, a);
        return m;
    });

    // Recent picks (newest first)
    const recentPicks = $derived.by(() => {
        if (!state) return [];
        return state.picks
            .filter((p) => p.selectedAssetId)
            .slice()
            .sort((a, b) => (b.selectedAt || 0) - (a.selectedAt || 0))
            .slice(0, 12);
    });

    // ---------- Actions ----------
    const togglePosition = (key) => {
        const next = new Set(activePositions);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        activePositions = next;
    };

    const claimTeam = async (teamIndex) => {
        const trimmedName = (displayName || '').trim();
        if (trimmedName) localStorage.setItem('draft_tool_display_name', trimmedName);
        await doAction('claim', { teamIndex, displayName: trimmedName || undefined });
    };

    const releaseTeam = async (teamIndex) => {
        await doAction('release', { teamIndex });
    };

    const pickAsset = async (assetId) => {
        await doAction('pick', { assetId });
    };

    const undo = async () => {
        await doAction('undo', {});
    };

    const startDraft = async () => {
        await doAction('start', {});
    };

    const pauseDraft = async () => {
        await doAction('pause', {});
    };

    const clearDraft = async () => {
        if (!confirm('Clear all picks and stop the draft? Teams, rounds, and asset pool stay.')) return;
        await doAction('clear', {});
    };

    const resetDraft = async () => {
        if (!confirm('Reset all settings to defaults? This wipes teams, rounds, and the asset pool.')) return;
        await doAction('reset', {});
    };

    const handleSwapClick = (overall) => {
        if (swapFrom == null) {
            swapFrom = overall;
            return;
        }
        if (swapFrom === overall) {
            swapFrom = null;
            return;
        }
        const a = swapFrom;
        swapFrom = null;
        doAction('swap', { overallA: a, overallB: overall });
    };

    // ---------- Config form ----------
    const openConfig = () => {
        if (!state) return;
        cfgTeamCount = state.teamCount;
        cfgRounds = state.rounds;
        cfgSeconds = state.secondsPerPick;
        cfgTeamNames = state.teams.map((t) => t.name);
        csvFileName = '';
        csvAssetsPreview = null;
        csvError = '';
        showConfig = true;
    };

    const closeConfig = () => {
        showConfig = false;
    };

    // Keep cfgTeamNames length in sync with cfgTeamCount whenever the count changes.
    $effect(() => {
        if (!showConfig) return;
        const n = Math.max(2, Math.min(32, parseInt(cfgTeamCount) || 0));
        if (cfgTeamNames.length === n) return;
        const names = [...cfgTeamNames];
        while (names.length < n) names.push(`Team ${names.length + 1}`);
        names.length = n;
        cfgTeamNames = names;
    });

    const handleCSV = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        csvFileName = file.name;
        csvError = '';
        try {
            const text = await file.text();
            csvAssetsPreview = csvToAssets(text);
        } catch (e) {
            csvAssetsPreview = null;
            csvError = e.message || 'failed to parse CSV';
        }
    };

    const applyConfig = async () => {
        await doAction('configure', {
            teamCount: cfgTeamCount,
            rounds: cfgRounds,
            secondsPerPick: cfgSeconds,
            teamNames: cfgTeamNames,
            assets: csvAssetsPreview ?? undefined,
        });
        showConfig = false;
    };

    const onClickOverlay = (e) => {
        if (e.target === e.currentTarget) closeConfig();
    };

    // ---------- Display helpers ----------
    const labelFor = (assetId) => {
        if (!assetId) return '';
        const a = assetById.get(assetId);
        if (!a) return '';
        return a.asset_type === 'pick' ? formatPickLabel(a) : a.player_name;
    };

    const subLabelFor = (assetId) => {
        const a = assetById.get(assetId);
        if (!a) return '';
        if (a.asset_type === 'pick') return 'Draft Pick';
        return `${a.position}${a.nfl_team ? ' · ' + a.nfl_team : ''}`;
    };

    const posClass = (a) => {
        if (!a) return '';
        if (a.asset_type === 'pick') return 'PICK';
        return a.position;
    };

    const overallLabel = (slot) => `${slot.round}.${String(slot.pickInRound).padStart(2, '0')}`;
</script>

<style>
    .wrap {
        max-width: 1400px;
        margin: 24px auto 60px;
        padding: 0 18px;
        color: var(--g111);
    }
    h2 { margin: 0 0 6px; color: var(--accent); }
    .subtitle { color: var(--g999); font-size: 0.9em; margin: 0 0 18px; }

    .controlBar {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        margin-bottom: 14px;
    }
    .controlBar .spacer { flex: 1; }

    .btn {
        background: var(--accentSoft);
        color: var(--accent);
        border: 1px solid var(--accentBorder);
        border-radius: 999px;
        padding: 6px 14px;
        font-size: 0.85em;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
    }
    .btn:hover:not(:disabled) { background: var(--accent); color: #062420; }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn.danger { color: #ff7a7a; border-color: rgba(255,122,122,0.35); background: rgba(255,122,122,0.08); }
    .btn.danger:hover:not(:disabled) { background: #ff7a7a; color: #2a0a0a; }
    .btn.warn { color: #ffcc7a; border-color: rgba(255,204,122,0.35); background: rgba(255,204,122,0.08); }
    .btn.warn:hover:not(:disabled) { background: #ffcc7a; color: #2a1f0a; }

    .nameInput {
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px solid var(--ccc);
        background: var(--f8f8f8);
        color: var(--g111);
        font-size: 0.9em;
        max-width: 180px;
    }

    .err { color: #ff7a7a; font-size: 0.85em; margin: 4px 0; }

    .layout {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 18px;
        align-items: start;
    }

    @media (max-width: 1100px) {
        .layout { grid-template-columns: 1fr; }
    }

    /* Status header */
    .status {
        background: linear-gradient(135deg, var(--f8f8f8) 0%, var(--headerPrimary) 100%);
        border: 1px solid var(--accentBorder);
        border-radius: 12px;
        padding: 14px 18px;
        margin-bottom: 14px;
        display: flex;
        gap: 18px;
        align-items: center;
        flex-wrap: wrap;
    }
    .statusBlock { display: flex; flex-direction: column; gap: 2px; }
    .statusLabel { font-size: 0.7em; letter-spacing: 0.08em; text-transform: uppercase; color: var(--g999); }
    .statusValue { font-size: 1.05em; color: var(--g000); font-weight: 600; }
    .clock { font-size: 1.4em; font-weight: 700; font-variant-numeric: tabular-nums; }
    .clock.warning { color: #ffcc7a; }
    .clock.danger { color: #ff7a7a; }
    .myTurn { color: var(--accent); animation: pulse 1.5s infinite; }
    @keyframes pulse { 50% { opacity: 0.6; } }

    /* Board */
    .board {
        overflow-x: auto;
        background: var(--f8f8f8);
        border: 1px solid var(--ebebeb);
        border-radius: 12px;
        padding: 10px;
    }
    .boardGrid {
        display: grid;
        gap: 6px;
        min-width: 100%;
    }
    .teamHeader {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 8px 6px;
        background: var(--headerPrimary);
        border-radius: 8px;
        border: 1px solid var(--ebebeb);
        font-size: 0.78em;
        min-width: 110px;
        text-align: center;
    }
    .teamHeader.claimedSelf { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
    .teamName { font-weight: 600; color: var(--g000); overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .teamMeta { color: var(--g999); font-size: 0.95em; }
    .teamActions { display: flex; gap: 4px; margin-top: 2px; }
    .teamActions button { font-size: 0.7em; padding: 2px 8px; }

    .roundLabel {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: var(--accent);
        font-size: 0.8em;
        padding: 8px 6px;
        background: var(--f3f3f3);
        border-radius: 8px;
        min-width: 50px;
    }
    .colHeader {
        text-align: center;
        font-size: 0.7em;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--g999);
        padding: 4px 0 2px;
    }
    .slotTeam {
        font-size: 0.7em;
        color: var(--accent);
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .slot.mine { box-shadow: inset 0 0 0 1px rgba(29, 233, 215, 0.6); }

    .slot {
        position: relative;
        background: var(--f3f3f3);
        border: 1px solid var(--ebebeb);
        border-radius: 8px;
        padding: 8px 6px;
        min-height: 62px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        cursor: pointer;
        transition: all 0.12s;
        min-width: 110px;
    }
    .slot:hover { border-color: var(--accent); }
    .slot.current {
        border-color: var(--accent);
        box-shadow: 0 0 0 2px var(--accentBorder);
        background: var(--matchupSelected);
    }
    .slot.completed { background: var(--f8f8f8); }
    .slot.swapSelected { border-color: #ffcc7a; box-shadow: 0 0 0 2px rgba(255,204,122,0.35); }

    .slotMeta { font-size: 0.7em; color: var(--g999); display: flex; justify-content: space-between; }
    .slotName { font-size: 0.85em; font-weight: 600; color: var(--g000); overflow: hidden; text-overflow: ellipsis; }
    .slotSub { font-size: 0.7em; color: var(--g555); }
    .slotEmpty { color: var(--g555); font-style: italic; font-size: 0.8em; align-self: center; margin: auto; }

    .posPill {
        display: inline-block;
        font-size: 0.65em;
        padding: 1px 6px;
        border-radius: 3px;
        font-weight: 700;
        letter-spacing: 0.04em;
    }
    .posPill.QB { background: rgba(255,42,109,0.15); color: var(--QB); }
    .posPill.RB { background: rgba(0,206,184,0.15); color: var(--RB); }
    .posPill.WR { background: rgba(88,167,255,0.15); color: var(--WR); }
    .posPill.TE { background: rgba(255,174,88,0.15); color: var(--TE); }
    .posPill.PICK { background: rgba(115,182,71,0.15); color: var(--PICKSfade); }

    /* Right column */
    .sidebar {
        position: sticky;
        top: 12px;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
    .panel {
        background: var(--f8f8f8);
        border: 1px solid var(--ebebeb);
        border-radius: 12px;
        padding: 12px 14px;
    }
    .panelTitle { margin: 0 0 10px; color: var(--accent); font-size: 0.78em; letter-spacing: 0.1em; text-transform: uppercase; }

    .posFilters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .posChip {
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.75em;
        font-weight: 600;
        border: 1px solid var(--ccc);
        background: transparent;
        color: var(--g555);
        cursor: pointer;
        user-select: none;
    }
    .posChip.active { background: var(--accent); color: #062420; border-color: var(--accent); }

    .search {
        width: 100%;
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid var(--ccc);
        background: var(--f3f3f3);
        color: var(--g111);
        margin-bottom: 10px;
        box-sizing: border-box;
        font-size: 0.9em;
    }

    .assetList { max-height: 60vh; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; padding-right: 2px; }
    .assetRow {
        display: grid;
        grid-template-columns: 38px 1fr auto;
        gap: 8px;
        align-items: center;
        padding: 6px 8px;
        background: var(--f3f3f3);
        border: 1px solid var(--ebebeb);
        border-radius: 6px;
        font-size: 0.85em;
    }
    .assetRow .value { font-variant-numeric: tabular-nums; color: var(--accent); font-weight: 700; font-size: 0.95em; text-align: right; }
    .assetRow .nameCol { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .assetRow .nameLine { font-weight: 600; color: var(--g000); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .assetRow .subLine { font-size: 0.75em; color: var(--g555); }
    .assetRow button {
        font-size: 0.7em;
        padding: 4px 8px;
        background: var(--accent);
        color: #062420;
        border: 0;
        border-radius: 4px;
        font-weight: 700;
        cursor: pointer;
    }
    .assetRow button:disabled { background: var(--ddd); color: var(--g555); cursor: not-allowed; }

    .recentList { display: flex; flex-direction: column; gap: 4px; }
    .recentRow {
        display: grid;
        grid-template-columns: 46px 1fr 60px;
        gap: 8px;
        font-size: 0.8em;
        padding: 4px 6px;
        align-items: center;
    }
    .recentRow .pickNo { color: var(--g999); font-variant-numeric: tabular-nums; }
    .recentRow .who { color: var(--g000); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .recentRow .team { color: var(--g555); font-size: 0.75em; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Modal */
    .overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.6);
        display: flex; align-items: center; justify-content: center; padding: 1em; z-index: 100;
    }
    .modal {
        background: var(--f8f8f8);
        border: 1px solid var(--ebebeb);
        border-radius: 12px;
        padding: 20px;
        max-width: 720px;
        width: 100%;
        max-height: 88vh;
        overflow-y: auto;
        color: var(--g111);
    }
    .modal h3 { margin: 0 0 12px; color: var(--accent); }
    .formRow { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
    .formRow label { display: flex; flex-direction: column; gap: 4px; font-size: 0.8em; color: var(--g555); }
    .formRow input { padding: 6px 10px; border-radius: 6px; border: 1px solid var(--ccc); background: var(--f3f3f3); color: var(--g111); font-size: 0.9em; }
    .teamNamesGrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 8px 0 14px; }
    .teamNamesGrid label { display: flex; flex-direction: column; gap: 2px; font-size: 0.75em; color: var(--g999); }
    .csvHelper { font-size: 0.75em; color: var(--g999); margin-bottom: 8px; }
    .csvPreview { font-size: 0.8em; color: var(--g333); margin: 6px 0 12px; padding: 8px 10px; background: var(--f3f3f3); border-radius: 6px; border: 1px solid var(--ebebeb); }
    .modalActions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }

    .infoLine { font-size: 0.78em; color: var(--g999); margin: 4px 0 8px; }
    .swapHint { font-size: 0.78em; color: #ffcc7a; }
</style>

<div class="wrap">
    <h2>⚙️ Draft Tool</h2>
    <p class="subtitle">Interactive snake draft with live sync. Anyone viewing the page can claim a team and pick when it's their turn.</p>

    {#if loadError}
        <div class="err">Couldn't reach the draft server: {loadError}</div>
    {/if}
    {#if actionError}
        <div class="err">{actionError}</div>
    {/if}

    {#if !state}
        <div class="infoLine">Loading draft state…</div>
    {:else}
        <!-- Status row -->
        <div class="status">
            <div class="statusBlock">
                <span class="statusLabel">Round</span>
                <span class="statusValue">{currentSlot ? currentSlot.round : '—'} / {state.rounds}</span>
            </div>
            <div class="statusBlock">
                <span class="statusLabel">Pick</span>
                <span class="statusValue">{currentSlot ? currentSlot.overall : '—'} / {state.picks.length}</span>
            </div>
            <div class="statusBlock">
                <span class="statusLabel">On the clock</span>
                <span class="statusValue {isMyTurn ? 'myTurn' : ''}">
                    {currentSlot ? state.teams[currentSlot.teamIndex].name : 'Draft complete'}
                    {#if isMyTurn}— Your pick{/if}
                </span>
            </div>
            <div class="statusBlock">
                <span class="statusLabel">Timer</span>
                <span class="clock {remainingSeconds != null && remainingSeconds <= 10 ? 'danger' : (remainingSeconds != null && remainingSeconds <= 20 ? 'warning' : '')}">
                    {#if !state.started}
                        {state.currentPick > state.picks.length ? 'Done' : 'Paused'}
                    {:else if remainingSeconds == null}
                        --:--
                    {:else}
                        {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
                    {/if}
                </span>
            </div>

            <div class="spacer"></div>

            <input
                class="nameInput"
                type="text"
                placeholder="Your display name"
                bind:value={displayName}
                onchange={() => localStorage.setItem('draft_tool_display_name', (displayName || '').trim())}
            />
            {#if state.started}
                <button class="btn warn" onclick={pauseDraft}>⏸ Pause</button>
            {:else if state.currentPick <= state.picks.length}
                <button class="btn" onclick={startDraft} disabled={state.assets.length === 0}>▶ Start</button>
            {/if}
            <button class="btn" onclick={undo} disabled={state.currentPick <= 1}>↶ Undo</button>
            <button class="btn" onclick={openConfig}>⚙ Configure</button>
            <button class="btn warn" onclick={clearDraft}>Clear</button>
            <button class="btn danger" onclick={resetDraft}>Reset</button>
        </div>

        {#if swapFrom != null}
            <div class="swapHint">Swap mode: click another pick to swap teams (or click the same pick to cancel).</div>
        {/if}

        <div class="layout">
            <!-- Draft board -->
            <div>
                <!-- Team claim strip -->
                <div class="board" style="margin-bottom: 10px;">
                    <div class="boardGrid" style="grid-template-columns: 50px repeat({state.teamCount}, minmax(110px, 1fr));">
                        <div></div>
                        {#each state.teams as team, ti (ti)}
                            <div class="teamHeader {team.claimedBy === clientId ? 'claimedSelf' : ''}">
                                <div class="teamName" title={team.name}>{team.name}</div>
                                <div class="teamMeta">
                                    {#if team.claimedBy === clientId}
                                        <em>You</em>
                                    {:else if team.claimedBy}
                                        <em>Claimed</em>
                                    {:else}
                                        <em>Open</em>
                                    {/if}
                                </div>
                                <div class="teamActions">
                                    {#if team.claimedBy === clientId}
                                        <button class="btn" onclick={() => releaseTeam(ti)}>Release</button>
                                    {:else if !team.claimedBy}
                                        <button class="btn" onclick={() => claimTeam(ti)}>Claim</button>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Snake-order draft grid: row = round, column = pickInRound -->
                <div class="board">
                    <div class="boardGrid" style="grid-template-columns: 50px repeat({state.teamCount}, minmax(110px, 1fr));">
                        <!-- column headers showing pick-in-round -->
                        <div></div>
                        {#each Array(state.teamCount) as _, ci (ci)}
                            <div class="colHeader">Pick {ci + 1}</div>
                        {/each}

                        {#each boardCells as row, ri (ri)}
                            <div class="roundLabel">R{ri + 1}</div>
                            {#each row as slot, ci (ci)}
                                {#if slot}
                                    {@const team = state.teams[slot.teamIndex]}
                                    {@const a = slot.selectedAssetId ? assetById.get(slot.selectedAssetId) : null}
                                    <div
                                        class="slot {slot.overall === state.currentPick ? 'current' : ''} {slot.selectedAssetId ? 'completed' : ''} {swapFrom === slot.overall ? 'swapSelected' : ''} {team?.claimedBy === clientId ? 'mine' : ''}"
                                        onclick={() => handleSwapClick(slot.overall)}
                                        role="button"
                                        tabindex="0"
                                        title="Click to swap with another pick"
                                    >
                                        <div class="slotMeta">
                                            <span>#{slot.overall} ({overallLabel(slot)})</span>
                                        </div>
                                        <div class="slotTeam" title={team?.name}>{team?.name ?? '—'}</div>
                                        {#if slot.selectedAssetId}
                                            <div class="slotName">{labelFor(slot.selectedAssetId)}</div>
                                            {#if a}
                                                <div class="slotSub">
                                                    <span class="posPill {posClass(a)}">{a.asset_type === 'pick' ? 'PICK' : a.position}</span>
                                                    {a.asset_type === 'pick' ? '' : (a.nfl_team || '')}
                                                </div>
                                            {/if}
                                        {:else if slot.overall === state.currentPick}
                                            <div class="slotEmpty">On the clock…</div>
                                        {:else}
                                            <div class="slotEmpty">—</div>
                                        {/if}
                                    </div>
                                {:else}
                                    <div class="slot"></div>
                                {/if}
                            {/each}
                        {/each}
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="sidebar">
                <div class="panel">
                    <h6 class="panelTitle">Available — {filteredAssets.length}</h6>
                    <div class="posFilters">
                        {#each POSITION_FILTERS as f (f)}
                            <button class="posChip {activePositions.has(f) ? 'active' : ''}" onclick={() => togglePosition(f)}>
                                {f === 'PICK' ? 'Draft Pick' : f}
                            </button>
                        {/each}
                    </div>
                    <input class="search" type="search" placeholder="Search…" bind:value={searchTerm} />
                    {#if state.assets.length === 0}
                        <div class="infoLine">No assets loaded. Click Configure to upload a CSV.</div>
                    {:else}
                        <div class="assetList">
                            {#each filteredAssets as a (a.id)}
                                <div class="assetRow">
                                    <span class="posPill {posClass(a)}">{a.asset_type === 'pick' ? 'PICK' : a.position}</span>
                                    <div class="nameCol">
                                        <span class="nameLine" title={a.asset_type === 'pick' ? formatPickLabel(a) : a.player_name}>
                                            {a.asset_type === 'pick' ? formatPickLabel(a) : a.player_name}
                                        </span>
                                        <span class="subLine">
                                            {#if a.asset_type === 'pick'}
                                                Rookie pick
                                            {:else}
                                                {a.nfl_team || '—'}
                                            {/if}
                                        </span>
                                    </div>
                                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:3px;">
                                        <span class="value">{a.fc_value.toLocaleString()}</span>
                                        <button onclick={() => pickAsset(a.id)} disabled={!isMyTurn || !state.started}>Draft</button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>

                <div class="panel">
                    <h6 class="panelTitle">Recent Picks</h6>
                    {#if recentPicks.length === 0}
                        <div class="infoLine">No picks yet.</div>
                    {:else}
                        <div class="recentList">
                            {#each recentPicks as p (p.overall)}
                                <div class="recentRow">
                                    <span class="pickNo">{overallLabel(p)}</span>
                                    <span class="who">{labelFor(p.selectedAssetId)}</span>
                                    <span class="team" title={state.teams[p.teamIndex]?.name}>{state.teams[p.teamIndex]?.name}</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>

{#if showConfig}
    <div class="overlay" onclick={onClickOverlay} role="dialog">
        <div class="modal">
            <h3>⚙ Configure Draft</h3>
            <div class="formRow">
                <label>
                    Teams (2–32)
                    <input type="number" min="2" max="32" bind:value={cfgTeamCount} />
                </label>
                <label>
                    Rounds (1–40)
                    <input type="number" min="1" max="40" bind:value={cfgRounds} />
                </label>
                <label>
                    Seconds per pick
                    <input type="number" min="5" max="3600" bind:value={cfgSeconds} />
                </label>
            </div>

            <div class="csvHelper">
                Upload a CSV with columns:
                <code>asset_type, player_name, position, nfl_team, fc_value, pick_year, pick_round, pick_spot</code>.
                Picks use <code>asset_type=pick</code> and the pick_* columns; players leave them blank.
            </div>
            <input type="file" accept=".csv,text/csv" onchange={handleCSV} />
            {#if csvFileName}
                <div class="csvPreview">
                    <strong>{csvFileName}</strong>
                    {#if csvError}
                        <div class="err">{csvError}</div>
                    {:else if csvAssetsPreview}
                        — parsed {csvAssetsPreview.length} assets
                        ({csvAssetsPreview.filter((a) => a.asset_type === 'player').length} players,
                        {csvAssetsPreview.filter((a) => a.asset_type === 'pick').length} picks).
                    {/if}
                </div>
            {/if}
            {#if state && !csvAssetsPreview && state.assets.length > 0}
                <div class="csvHelper"><em>(Keeping existing {state.assets.length} assets — upload to replace.)</em></div>
            {/if}

            <h6 style="margin: 8px 0 4px; color: var(--accent); font-size: 0.78em; letter-spacing: 0.08em; text-transform: uppercase;">Team Names</h6>
            <div class="teamNamesGrid">
                {#each Array(cfgTeamCount) as _, i (i)}
                    <label>
                        Team {i + 1}
                        <input type="text" bind:value={cfgTeamNames[i]} placeholder={`Team ${i + 1}`} />
                    </label>
                {/each}
            </div>

            <div class="modalActions">
                <button class="btn" onclick={closeConfig}>Cancel</button>
                <button class="btn" onclick={applyConfig}>Apply</button>
            </div>
        </div>
    </div>
{/if}

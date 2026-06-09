import { kvGet, kvSet, kvDel } from './contentStore';

const KEY = 'draft:current';

const DEFAULT_TEAM_COUNT = 10;
const DEFAULT_ROUNDS = 4;
const DEFAULT_SECONDS_PER_PICK = 60;
const DEFAULT_REVERSAL_ROUND = 0; // 0 = plain snake; 3 = third-round reversal

const defaultTeams = (n) => Array.from({ length: n }, (_, i) => ({
    name: `Team ${i + 1}`,
    claimedBy: null,
    claimedAt: null,
}));

// Normalize a requested reversal round: 0 disables it; values below 2 are meaningless
// (there is no earlier round to flip against), so they collapse to 0.
const normalizeReversalRound = (value) => {
    const n = Math.floor(Number(value) || 0);
    return n >= 2 ? n : 0;
};

// Whether round `r` runs in reversed (N..1) order.
// Plain snake reverses even rounds. A reversal round R flips the parity from R onward,
// so round R repeats round R-1's order instead of swinging back — this is the extra
// reversal that "third-round reversal" (R = 3) inserts to even out the talent spread.
const isRoundReversed = (r, reversalRound) => {
    const evenReversed = r % 2 === 0;
    if (!reversalRound || r < reversalRound) return evenReversed;
    return !evenReversed;
};

// Snake order: round r, if r odd → 1..N; if r even → N..1 (subject to reversalRound).
const buildSnakePicks = (teamCount, rounds, reversalRound = 0) => {
    const picks = [];
    let overall = 1;
    for (let r = 1; r <= rounds; r++) {
        const order = [];
        for (let t = 0; t < teamCount; t++) order.push(t);
        if (isRoundReversed(r, reversalRound)) order.reverse();
        for (let p = 0; p < teamCount; p++) {
            picks.push({
                overall,
                round: r,
                pickInRound: p + 1,
                teamIndex: order[p],
                selectedAssetId: null,
                selectedAt: null,
                selectedByClientId: null,
            });
            overall++;
        }
    }
    return picks;
};

export const defaultState = () => ({
    version: 0,
    teamCount: DEFAULT_TEAM_COUNT,
    rounds: DEFAULT_ROUNDS,
    secondsPerPick: DEFAULT_SECONDS_PER_PICK,
    reversalRound: DEFAULT_REVERSAL_ROUND,
    teams: defaultTeams(DEFAULT_TEAM_COUNT),
    assets: [],
    picks: buildSnakePicks(DEFAULT_TEAM_COUNT, DEFAULT_ROUNDS, DEFAULT_REVERSAL_ROUND),
    currentPick: 1,
    started: false,
    pickStartedAt: null,
    updatedAt: Date.now(),
});

export const getState = async () => {
    const v = await kvGet(KEY);
    if (!v) {
        const fresh = defaultState();
        await kvSet(KEY, fresh);
        return fresh;
    }
    // Upstash stores as JSON; in-memory fallback stores the object directly.
    return typeof v === 'string' ? JSON.parse(v) : v;
};

const saveState = async (state) => {
    state.version = (state.version ?? 0) + 1;
    state.updatedAt = Date.now();
    await kvSet(KEY, state);
    return state;
};

export const resetState = async () => {
    await kvDel(KEY);
    const fresh = defaultState();
    await kvSet(KEY, fresh);
    return fresh;
};

// Wipe selections but keep team/round/asset config.
export const clearDraft = async () => {
    const state = await getState();
    state.picks = buildSnakePicks(state.teamCount, state.rounds, state.reversalRound ?? 0);
    state.currentPick = 1;
    state.started = false;
    state.pickStartedAt = null;
    return await saveState(state);
};

export const configure = async ({ teamCount, rounds, secondsPerPick, reversalRound, teamNames, assets }) => {
    const state = await getState();
    const tc = Math.max(2, Math.min(32, Number(teamCount) || state.teamCount));
    const rd = Math.max(1, Math.min(40, Number(rounds) || state.rounds));
    const sp = Math.max(5, Math.min(3600, Number(secondsPerPick) || state.secondsPerPick));
    const rr = normalizeReversalRound(
        reversalRound === undefined ? state.reversalRound : reversalRound
    );

    const sameStructure = tc === state.teamCount && rd === state.rounds && rr === (state.reversalRound ?? 0);

    state.teamCount = tc;
    state.rounds = rd;
    state.secondsPerPick = sp;
    state.reversalRound = rr;

    if (Array.isArray(teamNames) && teamNames.length === tc) {
        const oldTeams = state.teams || [];
        state.teams = teamNames.map((name, i) => ({
            name: String(name || `Team ${i + 1}`).slice(0, 60),
            claimedBy: oldTeams[i]?.claimedBy ?? null,
            claimedAt: oldTeams[i]?.claimedAt ?? null,
        }));
    } else if (!sameStructure || !Array.isArray(state.teams) || state.teams.length !== tc) {
        state.teams = defaultTeams(tc);
    }

    if (Array.isArray(assets)) {
        state.assets = assets.map((a, i) => ({
            id: a.id || `asset_${i}_${Date.now()}`,
            asset_type: a.asset_type || (a.pick_year ? 'pick' : 'player'),
            player_name: a.player_name ?? '',
            position: (a.position ?? '').toUpperCase(),
            nfl_team: a.nfl_team ?? '',
            fc_value: Number(a.fc_value) || 0,
            pick_year: a.pick_year ?? null,
            pick_round: a.pick_round ?? null,
            pick_spot: a.pick_spot ?? null,
        }));
    }

    if (!sameStructure || !Array.isArray(state.picks) || state.picks.length !== tc * rd) {
        state.picks = buildSnakePicks(tc, rd, rr);
        state.currentPick = 1;
        state.started = false;
        state.pickStartedAt = null;
    }

    return await saveState(state);
};

export const claimTeam = async ({ clientId, teamIndex, displayName }) => {
    if (!clientId) throw new Error('clientId required');
    const state = await getState();
    if (teamIndex < 0 || teamIndex >= state.teams.length) throw new Error('invalid team');
    // Release any other team this client has claimed.
    for (let i = 0; i < state.teams.length; i++) {
        if (state.teams[i].claimedBy === clientId) {
            state.teams[i].claimedBy = null;
            state.teams[i].claimedAt = null;
        }
    }
    const t = state.teams[teamIndex];
    t.claimedBy = clientId;
    t.claimedAt = Date.now();
    if (displayName && typeof displayName === 'string' && displayName.trim()) {
        t.name = displayName.trim().slice(0, 60);
    }
    return await saveState(state);
};

export const releaseTeam = async ({ clientId, teamIndex }) => {
    const state = await getState();
    if (teamIndex < 0 || teamIndex >= state.teams.length) throw new Error('invalid team');
    const t = state.teams[teamIndex];
    if (t.claimedBy && t.claimedBy !== clientId) throw new Error('not your team');
    t.claimedBy = null;
    t.claimedAt = null;
    return await saveState(state);
};

export const renameTeam = async ({ clientId, teamIndex, name }) => {
    const state = await getState();
    if (teamIndex < 0 || teamIndex >= state.teams.length) throw new Error('invalid team');
    const t = state.teams[teamIndex];
    if (t.claimedBy && t.claimedBy !== clientId) throw new Error('not your team');
    t.name = String(name || `Team ${teamIndex + 1}`).slice(0, 60);
    return await saveState(state);
};

export const startDraft = async () => {
    const state = await getState();
    if (!state.assets.length) throw new Error('no assets loaded');
    if (state.currentPick > state.picks.length) throw new Error('draft is complete');
    state.started = true;
    state.pickStartedAt = Date.now();
    return await saveState(state);
};

export const pauseDraft = async () => {
    const state = await getState();
    state.started = false;
    state.pickStartedAt = null;
    return await saveState(state);
};

export const pickAsset = async ({ clientId, assetId }) => {
    const state = await getState();
    if (!state.started) throw new Error('draft not started');
    if (state.currentPick > state.picks.length) throw new Error('draft is complete');
    const slot = state.picks[state.currentPick - 1];
    const team = state.teams[slot.teamIndex];
    if (team.claimedBy && team.claimedBy !== clientId) {
        throw new Error('not your pick');
    }
    const asset = state.assets.find((a) => a.id === assetId);
    if (!asset) throw new Error('unknown asset');
    if (state.picks.some((p) => p.selectedAssetId === assetId)) {
        throw new Error('already drafted');
    }
    slot.selectedAssetId = assetId;
    slot.selectedAt = Date.now();
    slot.selectedByClientId = clientId || null;
    state.currentPick = state.currentPick + 1;
    state.pickStartedAt = state.currentPick <= state.picks.length ? Date.now() : null;
    if (state.currentPick > state.picks.length) state.started = false;
    return await saveState(state);
};

// Auto-pick for the team on the clock once its timer has expired. Safe to call from any
// client: the server re-checks the deadline and that `expectedPick` is still on the clock,
// so concurrent firings collapse into a single selection.
//   - preferredAssetId: used if still available (e.g. the on-clock manager's queue top);
//     otherwise the highest-value remaining asset is taken.
//   - graceMs: clients may fire slightly early due to clock skew; we allow a small slack.
export const autoPick = async ({ expectedPick, preferredAssetId, graceMs = 750 }) => {
    const state = await getState();
    if (!state.started) throw new Error('draft not started');
    if (state.currentPick > state.picks.length) throw new Error('draft is complete');
    if (expectedPick != null && state.currentPick !== Number(expectedPick)) {
        // Someone else already advanced the clock; treat as a no-op.
        return state;
    }
    if (!state.pickStartedAt) throw new Error('no active pick clock');
    const elapsed = Date.now() - state.pickStartedAt;
    if (elapsed < state.secondsPerPick * 1000 - graceMs) {
        throw new Error('pick clock has not expired');
    }

    const drafted = new Set(state.picks.map((p) => p.selectedAssetId).filter(Boolean));
    let asset = null;
    if (preferredAssetId && !drafted.has(preferredAssetId)) {
        asset = state.assets.find((a) => a.id === preferredAssetId) || null;
    }
    if (!asset) {
        asset = state.assets
            .filter((a) => !drafted.has(a.id))
            .sort((a, b) => (Number(b.fc_value) || 0) - (Number(a.fc_value) || 0))[0] || null;
    }
    if (!asset) throw new Error('no assets remaining');

    const slot = state.picks[state.currentPick - 1];
    slot.selectedAssetId = asset.id;
    slot.selectedAt = Date.now();
    slot.selectedByClientId = 'auto';
    state.currentPick = state.currentPick + 1;
    state.pickStartedAt = state.currentPick <= state.picks.length ? Date.now() : null;
    if (state.currentPick > state.picks.length) state.started = false;
    return await saveState(state);
};

export const undoLastPick = async ({ clientId }) => {
    const state = await getState();
    const lastPickIdx = state.currentPick - 2; // most recent completed slot
    if (lastPickIdx < 0) throw new Error('nothing to undo');
    const slot = state.picks[lastPickIdx];
    if (!slot.selectedAssetId) throw new Error('nothing to undo');
    const team = state.teams[slot.teamIndex];
    if (team.claimedBy && team.claimedBy !== clientId && slot.selectedByClientId && slot.selectedByClientId !== clientId) {
        // Allow undo if user owns the team OR was the one who made the pick.
        throw new Error('not your pick to undo');
    }
    slot.selectedAssetId = null;
    slot.selectedAt = null;
    slot.selectedByClientId = null;
    state.currentPick = lastPickIdx + 1;
    state.pickStartedAt = state.started ? Date.now() : null;
    if (!state.started) state.pickStartedAt = null;
    return await saveState(state);
};

export const swapPicks = async ({ overallA, overallB }) => {
    const state = await getState();
    const a = state.picks[overallA - 1];
    const b = state.picks[overallB - 1];
    if (!a || !b) throw new Error('invalid pick');
    const t = a.teamIndex;
    a.teamIndex = b.teamIndex;
    b.teamIndex = t;
    return await saveState(state);
};

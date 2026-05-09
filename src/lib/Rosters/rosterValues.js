// Compute a roster's total FantasyCalc value, broken down by position + picks.
// `valueData` shape: { players: [{ sleeperId, position, value, name, ... }], ... }
// `tradedPicks` shape: Sleeper API output [{ season, round, roster_id, owner_id, ... }]

const POSITION_KEYS = ['QB', 'RB', 'WR', 'TE'];

const buildPlayerValueMap = (valueData) => {
    const map = new Map();
    if (!valueData?.players) return map;
    for (const p of valueData.players) {
        if (p.sleeperId) map.set(String(p.sleeperId), p);
    }
    return map;
};

// Group FantasyCalc pick values by `${year}-${round}` and average within group.
// Pick names look like "2026 1st", "2026 Mid 2nd", "Late 1st 2027" etc.
const buildPickValueMap = (valueData) => {
    const buckets = {};
    if (!valueData?.players) return {};
    for (const p of valueData.players) {
        if (p.position !== 'PICK' && p.position !== 'RDP') continue;
        const m = p.name.match(/(\d{4}).*?(\d)(?:st|nd|rd|th)/i) ||
                  p.name.match(/(\d)(?:st|nd|rd|th).*?(\d{4})/i);
        if (!m) continue;
        const a = parseInt(m[1], 10);
        const b = parseInt(m[2], 10);
        const year = a >= 2000 ? a : b;
        const round = a >= 2000 ? b : a;
        if (!year || !round) continue;
        const key = `${year}-${round}`;
        if (!buckets[key]) buckets[key] = [];
        buckets[key].push(p.value);
    }
    const avg = {};
    for (const [k, arr] of Object.entries(buckets)) {
        avg[k] = Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
    }
    return avg;
};

// Compute final pick ownership: { rosterId: [{ season, round }] }
const computePickOwnership = (rosters, tradedPicks, draftRounds, pickYears) => {
    const owned = {};
    for (const r of rosters) {
        owned[r.roster_id] = [];
        for (const season of pickYears) {
            for (let round = 1; round <= draftRounds; round++) {
                owned[r.roster_id].push({ season, round, original: r.roster_id });
            }
        }
    }
    if (!tradedPicks || tradedPicks.length === 0) return owned;
    // Build final-state map: key (season, round, original) -> ownerRosterId
    const final = new Map();
    for (const tp of tradedPicks) {
        const key = `${tp.season}-${tp.round}-${tp.roster_id}`;
        final.set(key, tp.owner_id);
    }
    // Re-allocate
    for (const [key, newOwner] of final.entries()) {
        const [seasonStr, roundStr, originalStr] = key.split('-');
        const season = parseInt(seasonStr, 10);
        const round = parseInt(roundStr, 10);
        const original = parseInt(originalStr, 10);
        // Remove from original owner's bucket if present
        if (owned[original]) {
            owned[original] = owned[original].filter(
                (p) => !(p.season === season && p.round === round && p.original === original)
            );
        }
        // Add to new owner's bucket
        if (owned[newOwner]) {
            owned[newOwner].push({ season, round, original });
        }
    }
    return owned;
};

export const computeRosterValues = ({ rosters, valueData, tradedPicks, leagueData }) => {
    const playerMap = buildPlayerValueMap(valueData);
    const pickValueMap = buildPickValueMap(valueData);
    const draftRounds = leagueData?.settings?.draft_rounds ?? 4;
    const pickYears = [
        ...new Set(
            Object.keys(pickValueMap).map((k) => parseInt(k.split('-')[0], 10))
        ),
    ].sort((a, b) => a - b);
    const ownership = computePickOwnership(rosters, tradedPicks ?? [], draftRounds, pickYears);

    return rosters.map((roster) => {
        const breakdown = { QB: 0, RB: 0, WR: 0, TE: 0, OTHER: 0, PICKS: 0 };
        const allPlayers = roster.players ?? [];
        for (const id of allPlayers) {
            const v = playerMap.get(String(id));
            if (!v) continue;
            const pos = (v.position || '').toUpperCase();
            if (POSITION_KEYS.includes(pos)) breakdown[pos] += v.value;
            else breakdown.OTHER += v.value;
        }
        const myPicks = ownership[roster.roster_id] ?? [];
        for (const pk of myPicks) {
            const key = `${pk.season}-${pk.round}`;
            breakdown.PICKS += pickValueMap[key] ?? 0;
        }
        const total = Object.values(breakdown).reduce((s, x) => s + x, 0);
        return {
            rosterId: roster.roster_id,
            total,
            breakdown,
            pickCount: myPicks.length,
        };
    });
};

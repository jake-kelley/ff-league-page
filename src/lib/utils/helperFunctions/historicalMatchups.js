import { leagueID } from '$lib/utils/leagueInfo';
import { getLeagueData } from './leagueData';
import { waitForAll } from './multiPromise';

let chainPromise = null;
const seasonMatchupsCache = new Map();

// Walk previous_league_id back to the founding league.
// Returns [{ leagueId, season, regularSeasonLength }, ...] newest -> oldest.
export const getLeagueChain = () => {
    if (chainPromise) return chainPromise;
    chainPromise = (async () => {
        const chain = [];
        let currentLeagueID = leagueID;
        while (currentLeagueID && currentLeagueID != 0) {
            const leagueData = await getLeagueData(currentLeagueID).catch(() => null);
            if (!leagueData) break;
            const playoffStart = leagueData?.settings?.playoff_week_start ?? 15;
            chain.push({
                leagueId: String(currentLeagueID),
                season: parseInt(leagueData.season, 10),
                regularSeasonLength: playoffStart - 1,
            });
            currentLeagueID = leagueData.previous_league_id;
        }
        return chain;
    })();
    return chainPromise;
};

export const getHistoricalSeasonMatchups = (leagueId, regularSeasonLength) => {
    if (seasonMatchupsCache.has(leagueId)) return seasonMatchupsCache.get(leagueId);
    const promise = (async () => {
        const requests = [];
        for (let i = 1; i <= regularSeasonLength; i++) {
            requests.push(
                fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${i}`)
                    .then((r) => (r.ok ? r.json() : []))
                    .then((data) => ({ week: i, raw: data }))
                    .catch(() => ({ week: i, raw: [] }))
            );
        }
        const all = await waitForAll(...requests);
        const weeks = [];
        for (const { week, raw } of all) {
            if (!raw || raw.length === 0) continue;
            const grouped = {};
            for (const m of raw) {
                const id = m.matchup_id;
                if (id === null || id === undefined) continue;
                if (!grouped[id]) grouped[id] = [];
                const points = typeof m.points === 'number'
                    ? m.points
                    : (m.starters_points ?? []).reduce((s, n) => s + (n || 0), 0);
                grouped[id].push({ rosterId: m.roster_id, points });
            }
            weeks.push({ week, matchups: grouped });
        }
        return weeks;
    })();
    seasonMatchupsCache.set(leagueId, promise);
    return promise;
};

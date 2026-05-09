import {
    getLeagueData,
    getLeagueRosters,
    getLeagueTeamManagers,
    loadPlayers,
    waitForAll,
    getPlayerPickValues,
    leagueID,
} from '$lib/utils/helper';

const fetchTradedPicks = async (fetch) => {
    try {
        const fetcher = fetch ?? globalThis.fetch;
        const res = await fetcher(`https://api.sleeper.app/v1/league/${leagueID}/traded_picks`);
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
};

export async function load({ fetch }) {
    const rostersInfo = waitForAll(
        getLeagueData(),
        getLeagueRosters(),
        getLeagueTeamManagers(),
        loadPlayers(fetch),
        getPlayerPickValues(fetch),
        fetchTradedPicks(fetch),
    );

    return {
        rostersInfo,
    };
}

import { getBrackets, getLeagueMatchups, getLeagueTeamManagers, loadPlayers } from '$lib/utils/helper';
import { getLeagueChain } from '$lib/utils/helperFunctions/historicalMatchups';

export async function load({ url, fetch }) {
    const queryWeek = url?.searchParams?.get('week');
    return {
        queryWeek: isNaN(queryWeek) ? null : queryWeek,
        matchupsData: getLeagueMatchups(),
        bracketsData: getBrackets(),
        leagueTeamManagersData: getLeagueTeamManagers(),
        playersData: loadPlayers(fetch),
        leagueChainData: getLeagueChain(),
    };
}
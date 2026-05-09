import {leagueID} from '$lib/utils/leagueInfo';

export const tabs = [
    {
        icon: 'home',
        label: 'Home',
        dest: '/',
        key: 'home',
    },
    {
        icon: 'sports',
        label: 'Matchups',
        dest: '/matchups',
        key: 'matchups',
    },
    {
        icon: 'swap_horiz',
        label: 'Trades & Waivers',
        dest: '/transactions',
        key: 'transactions',
    },
    {
        icon: 'trending_up',
        label: 'Player & Pick Values',
        dest: '/player-pick-values',
        key: 'player_pick_values',
    },
    {
        icon: 'calculate',
        label: 'Trade Calculator',
        dest: '/trade-calculator',
        key: 'trade_calculator',
    },
    // Stashed — re-enable when the assistant is reliable.
    // {
    //     icon: 'forum',
    //     label: 'Assistant',
    //     dest: '/assistant',
    //     key: 'assistant',
    // },
    {
        icon: 'article',
        label: 'Blog',
        dest: '/blog',
        key: 'blog',
    },
    {
        icon: 'view_comfy',
        label: 'League Info',
        nest: true,
        key: 'league_info',
        children: [
            {
                icon: 'storage',
                label: 'Rosters',
                dest: '/rosters',
            },
            {
                icon: 'groups',
                label: 'Managers',
                dest: '/managers',
            },
            {
                icon: 'local_fire_department',
                label: 'Rivalry',
                dest: '/rivalry',
            },
            {
                icon: 'leaderboard',
                label: 'Standings',
                dest: '/standings',
            },
            {
                icon: 'view_comfy',
                label: 'Drafts',
                dest: '/drafts',
            },
            {
                icon: 'emoji_events',
                label: 'Trophy Room',
                dest: '/awards',
            },
            {
                icon: 'military_tech',
                label: 'Records',
                dest: '/records',
            },
            {
                icon: 'history_edu',
                label: 'Constitution',
                dest: '/constitution',
            },
            {
                icon: 'school',
                label: 'Dynasty 101',
                dest: '/dynasty-101',
            },
            {
                icon: 'menu_book',
                label: 'Dynasty KB',
                dest: '/dynasty-knowledge-base',
            },
            {
                icon: 'sports_football',
                label: 'Go to Sleeper',
                dest: `https://sleeper.com/leagues/${leagueID}`,
            },
        ]
    },
    {
        icon: 'lightbulb',
        label: 'Resources & News',
        dest: '/resources',
        key: 'resources',
    },
];
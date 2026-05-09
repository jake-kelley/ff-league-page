export const getPlayerPickValues = async (fetch) => {
    const fetcher = fetch ?? globalThis.fetch;
    const res = await fetcher('/api/fetch_player_pick_values');
    if (!res.ok) {
        throw new Error(`Failed to load player & pick values (${res.status})`);
    }
    return res.json();
};

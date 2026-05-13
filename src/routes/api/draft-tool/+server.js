import { json } from '@sveltejs/kit';
import { getState } from '$lib/server/draftStore';

export const GET = async () => {
    const state = await getState();
    return json(state, {
        headers: { 'cache-control': 'no-store' },
    });
};

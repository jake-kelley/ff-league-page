import { kvGet } from '$lib/server/contentStore';

export const load = async () => {
    const override = await kvGet('content:constitution');
    return { override };
};

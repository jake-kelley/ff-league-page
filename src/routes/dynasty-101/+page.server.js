import { kvGet } from '$lib/server/contentStore';

export const load = async () => {
    const override = await kvGet('content:dynasty-101');
    return { override };
};

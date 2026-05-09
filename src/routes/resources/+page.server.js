import { kvGet } from '$lib/server/contentStore';

export const load = async () => {
    const resourcesOverride = await kvGet('content:resources');
    return { resourcesOverride };
};

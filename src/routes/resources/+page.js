import { getNews } from '$lib/utils/helper';
import { kvGet } from '$lib/server/contentStore';

export async function load({ fetch }) {
    const articlesData = getNews(fetch);
    const resourcesOverride = await kvGet('content:resources');
    return {
        articlesData,
        resourcesOverride,
    };
}

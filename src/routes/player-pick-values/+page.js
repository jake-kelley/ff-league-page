import { getPlayerPickValues } from '$lib/utils/helper';

export async function load({ fetch }) {
    const valueData = getPlayerPickValues(fetch);
    return { valueData };
}

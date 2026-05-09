import { json, error } from '@sveltejs/kit';
import { kvGet, kvSet, kvDel } from '$lib/server/contentStore';
import { requireAuth } from '$lib/server/editAuth';

const KEY_PATTERN = /^[a-z0-9_-]+(?::[a-z0-9_-]+)?$/i;

const validateKey = (key) => {
    if (!key || typeof key !== 'string') return false;
    if (key.length > 200) return false;
    return KEY_PATTERN.test(key);
};

export const GET = async ({ url }) => {
    const key = url.searchParams.get('key');
    if (!validateKey(key)) throw error(400, 'Invalid key');
    const value = await kvGet(`content:${key}`);
    return json({ key, value });
};

export const PUT = async ({ request, cookies }) => {
    if (!(await requireAuth(cookies))) throw error(401, 'Not authenticated');
    const { key, value } = await request.json().catch(() => ({}));
    if (!validateKey(key)) throw error(400, 'Invalid key');
    if (value === null || value === undefined) {
        await kvDel(`content:${key}`);
    } else {
        await kvSet(`content:${key}`, value);
    }
    return json({ ok: true });
};

export const DELETE = async ({ url, cookies }) => {
    if (!(await requireAuth(cookies))) throw error(401, 'Not authenticated');
    const key = url.searchParams.get('key');
    if (!validateKey(key)) throw error(400, 'Invalid key');
    await kvDel(`content:${key}`);
    return json({ ok: true });
};

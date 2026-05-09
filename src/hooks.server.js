import { error } from '@sveltejs/kit';

const RATE_MAX = 5;
const RATE_WINDOW_MS = 60_000;
const buckets = new Map(); // ip -> { count, resetAt }

const allowRequest = (ip) => {
    const now = Date.now();
    let b = buckets.get(ip);
    if (!b || b.resetAt < now) {
        b = { count: 0, resetAt: now + RATE_WINDOW_MS };
        buckets.set(ip, b);
    }
    if (b.count >= RATE_MAX) return { ok: false, retryAfterMs: b.resetAt - now };
    b.count++;
    return { ok: true };
};

export const handle = async ({ event, resolve }) => {
    if (event.url.pathname === '/api/assistant/chat') {
        let ip = 'unknown';
        try { ip = event.getClientAddress(); } catch {}
        const r = allowRequest(ip);
        if (!r.ok) {
            throw error(429, `Rate limit exceeded. Try again in ${Math.ceil(r.retryAfterMs / 1000)}s.`);
        }
    }
    return resolve(event);
};

import { Redis } from '@upstash/redis';

let redis = null;
try {
    if (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) {
        // Upstash auto-detects UPSTASH_REDIS_REST_URL/TOKEN; Vercel KV uses KV_*. Map if needed.
        if (!process.env.UPSTASH_REDIS_REST_URL && process.env.KV_REST_API_URL) {
            redis = new Redis({
                url: process.env.KV_REST_API_URL,
                token: process.env.KV_REST_API_TOKEN,
            });
        } else {
            redis = Redis.fromEnv();
        }
    }
} catch (err) {
    console.warn('Upstash Redis unavailable, using in-memory fallback:', err.message);
    redis = null;
}

const memStore = new Map();
const memTimers = new Map();

export const isConfigured = () => !!redis;

export const kvGet = async (key) => {
    if (redis) {
        try { return await redis.get(key); } catch (err) { console.error('kvGet', err); return null; }
    }
    return memStore.get(key) ?? null;
};

export const kvSet = async (key, value, options = {}) => {
    if (redis) {
        try {
            if (options.ex) await redis.set(key, value, { ex: options.ex });
            else await redis.set(key, value);
        } catch (err) { console.error('kvSet', err); }
        return;
    }
    memStore.set(key, value);
    if (memTimers.has(key)) clearTimeout(memTimers.get(key));
    if (options.ex) {
        memTimers.set(
            key,
            setTimeout(() => {
                memStore.delete(key);
                memTimers.delete(key);
            }, options.ex * 1000)
        );
    }
};

export const kvDel = async (key) => {
    if (redis) {
        try { await redis.del(key); } catch (err) { console.error('kvDel', err); }
        return;
    }
    memStore.delete(key);
    if (memTimers.has(key)) {
        clearTimeout(memTimers.get(key));
        memTimers.delete(key);
    }
};

import { env } from '$env/dynamic/private';
import crypto from 'node:crypto';
import { kvGet, kvSet, kvDel } from './contentStore';

const SESSION_TTL = 60 * 60 * 8; // 8 hours

export const isPasswordCorrect = (password) => {
    if (!env.EDIT_PASSWORD) return false;
    return password === env.EDIT_PASSWORD;
};

export const createSession = async () => {
    const token = crypto.randomBytes(32).toString('hex');
    await kvSet(`edit:session:${token}`, '1', { ex: SESSION_TTL });
    return token;
};

export const validateSession = async (token) => {
    if (!token) return false;
    const v = await kvGet(`edit:session:${token}`);
    return v === '1' || v === 1;
};

export const destroySession = async (token) => {
    if (!token) return;
    await kvDel(`edit:session:${token}`);
};

export const requireAuth = async (cookies) => {
    const token = cookies.get('edit_session');
    return await validateSession(token);
};

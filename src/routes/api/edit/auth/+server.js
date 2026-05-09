import { json, error } from '@sveltejs/kit';
import { isPasswordCorrect, createSession, destroySession } from '$lib/server/editAuth';

export const POST = async ({ request, cookies }) => {
    const { password } = await request.json().catch(() => ({}));
    if (!isPasswordCorrect(password)) {
        throw error(401, 'Incorrect password');
    }
    const token = await createSession();
    cookies.set('edit_session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8,
    });
    return json({ ok: true });
};

export const DELETE = async ({ cookies }) => {
    const token = cookies.get('edit_session');
    await destroySession(token);
    cookies.delete('edit_session', { path: '/' });
    return json({ ok: true });
};

export const GET = async ({ cookies }) => {
    const { validateSession } = await import('$lib/server/editAuth');
    const token = cookies.get('edit_session');
    const ok = await validateSession(token);
    return json({ authenticated: !!ok });
};

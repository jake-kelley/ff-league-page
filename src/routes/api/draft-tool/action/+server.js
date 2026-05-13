import { json, error } from '@sveltejs/kit';
import {
    configure,
    claimTeam,
    releaseTeam,
    renameTeam,
    startDraft,
    pauseDraft,
    pickAsset,
    undoLastPick,
    swapPicks,
    clearDraft,
    resetState,
} from '$lib/server/draftStore';

const handlers = {
    configure: (p) => configure(p),
    claim: (p) => claimTeam(p),
    release: (p) => releaseTeam(p),
    rename: (p) => renameTeam(p),
    start: () => startDraft(),
    pause: () => pauseDraft(),
    pick: (p) => pickAsset(p),
    undo: (p) => undoLastPick(p),
    swap: (p) => swapPicks(p),
    clear: () => clearDraft(),
    reset: () => resetState(),
};

export const POST = async ({ request }) => {
    let body;
    try {
        body = await request.json();
    } catch {
        throw error(400, 'invalid json');
    }
    const action = body?.action;
    const handler = handlers[action];
    if (!handler) throw error(400, `unknown action: ${action}`);
    try {
        const state = await handler(body);
        return json(state, { headers: { 'cache-control': 'no-store' } });
    } catch (e) {
        throw error(400, e?.message || 'action failed');
    }
};

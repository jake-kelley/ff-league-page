import { error } from '@sveltejs/kit';
import { runAgent } from '$lib/server/assistant/llmClient';

export const config = { maxDuration: 60 };

export async function POST({ request }) {
    let body;
    try {
        body = await request.json();
    } catch {
        throw error(400, 'Invalid JSON');
    }

    const history = Array.isArray(body?.messages) ? body.messages : [];
    const last = history[history.length - 1];
    if (!last || last.role !== 'user' || typeof last.content !== 'string' || !last.content.trim()) {
        throw error(400, 'Last message must be a non-empty user message');
    }

    // Strip out any non-text fields the client may have sent and keep only role/content.
    const cleanHistory = history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: m.content }));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const ev of runAgent({ messages: cleanHistory, signal: request.signal })) {
                    controller.enqueue(encoder.encode(JSON.stringify(ev) + '\n'));
                }
            } catch (err) {
                const ev = { type: 'error', text: `Agent failed: ${err.message}` };
                controller.enqueue(encoder.encode(JSON.stringify(ev) + '\n'));
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'content-type': 'application/x-ndjson; charset=utf-8',
            'cache-control': 'no-store',
            'x-accel-buffering': 'no',
        },
    });
}

<script>
    import { tick } from 'svelte';

    let messages = $state([]);
    let input = $state('');
    let busy = $state(false);
    let status = $state('');
    let abortController = $state(null);
    let scrollEl = $state();

    const scrollToBottom = async () => {
        await tick();
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
    };

    const send = async () => {
        const text = input.trim();
        if (!text || busy) return;
        input = '';
        busy = true;
        status = '';

        const userMsg = { role: 'user', content: text };
        const assistantMsg = $state({ role: 'assistant', content: '' });
        messages = [...messages, userMsg, assistantMsg];
        scrollToBottom();

        const wireHistory = messages
            .slice(0, -1)
            .map((m) => ({ role: m.role, content: m.content }));

        abortController = new AbortController();
        try {
            const res = await fetch('/api/assistant/chat', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ messages: wireHistory }),
                signal: abortController.signal,
            });

            if (res.status === 429) {
                assistantMsg.content = '[Rate limit reached. Try again in a minute.]';
                return;
            }
            if (!res.ok) {
                assistantMsg.content = `[Error: HTTP ${res.status}]`;
                return;
            }
            if (!res.body) {
                assistantMsg.content = '[Error: empty response]';
                return;
            }

            const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
            let buffer = '';
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (!value) continue;
                buffer += value;
                let idx;
                while ((idx = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, idx).trim();
                    buffer = buffer.slice(idx + 1);
                    if (!line) continue;
                    try {
                        const ev = JSON.parse(line);
                        if (ev.type === 'token') {
                            assistantMsg.content += ev.text;
                            status = '';
                            scrollToBottom();
                        } else if (ev.type === 'status') {
                            status = ev.text;
                            scrollToBottom();
                        } else if (ev.type === 'error') {
                            assistantMsg.content += `\n\n[${ev.text}]`;
                            scrollToBottom();
                        }
                    } catch {
                        // ignore malformed line
                    }
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                assistantMsg.content += `\n\n[Error: ${err.message}]`;
            }
        } finally {
            busy = false;
            status = '';
            abortController = null;
        }
    };

    const stop = () => {
        if (abortController) abortController.abort();
    };

    const onKeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const examples = [
        'How are we doing this week?',
        'Show me the league standings',
        'Recent trades in the league',
        'Compare Drake London and Jahmyr Gibbs',
        'Any trending waiver pickups?',
        'What does GoBills need to win the division?',
    ];
</script>

<style>
    .wrap {
        max-width: 800px;
        margin: 30px auto 0;
        padding: 0 20px;
        display: flex;
        flex-direction: column;
        height: calc(100vh - 200px);
        min-height: 500px;
    }
    header { margin-bottom: 12px; }
    header h2 { margin: 0 0 4px; }
    header p { margin: 0; color: var(--g999); font-size: 0.85em; }
    .badge {
        display: inline-block;
        background: #fff3cd;
        color: #856404;
        font-size: 0.75em;
        padding: 2px 8px;
        border-radius: 4px;
        margin-left: 6px;
    }
    .messages {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        background: var(--f3f3f3);
        border-radius: 8px;
        margin-bottom: 12px;
    }
    .msg {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 14px;
        margin-bottom: 10px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 1.45;
    }
    .msg.user {
        background: #1de9d7;
        color: var(--g000);
        margin-left: auto;
        border-bottom-right-radius: 4px;
    }
    .msg.assistant {
        background: var(--fff);
        color: inherit;
        margin-right: auto;
        border-bottom-left-radius: 4px;
        border: 1px solid var(--eee);
    }
    .status {
        font-size: 0.85em;
        color: var(--g999);
        font-style: italic;
        margin: -4px 0 10px 14px;
    }
    .empty {
        color: var(--g999);
        text-align: center;
        margin: 40px 0;
    }
    .examples { margin-top: 14px; }
    .example {
        display: inline-block;
        margin: 4px;
        padding: 6px 12px;
        background: var(--fff);
        border: 1px solid var(--ccc);
        border-radius: 999px;
        font-size: 0.85em;
        cursor: pointer;
        color: inherit;
    }
    .example:hover { background: var(--eee); }
    .composer {
        display: flex;
        gap: 8px;
        align-items: flex-end;
    }
    textarea {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--ccc);
        border-radius: 8px;
        resize: vertical;
        min-height: 44px;
        max-height: 160px;
        font-family: inherit;
        font-size: 1em;
        background: var(--fff);
        color: inherit;
    }
    button {
        padding: 10px 18px;
        background: #1de9d7;
        color: var(--g000);
        border: 0;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1em;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button.stop { background: #c33; }
</style>

<div class="wrap">
    <header>
        <h2>League Assistant <span class="badge">Beta</span></h2>
        <p>Ask anything about the league — matchups, standings, waivers, trades, players. Powered by Sleeper data via MCP. AI-generated; verify before acting.</p>
    </header>

    <div class="messages" bind:this={scrollEl}>
        {#if messages.length === 0}
            <div class="empty">
                <p>No conversation yet. Try one of these:</p>
                <div class="examples">
                    {#each examples as ex (ex)}
                        <button class="example" type="button" onclick={() => { input = ex; send(); }}>{ex}</button>
                    {/each}
                </div>
            </div>
        {:else}
            {#each messages as m, i (i)}
                <div class="msg {m.role}">{m.content || (busy && i === messages.length - 1 ? '…' : '')}</div>
                {#if busy && i === messages.length - 1 && status}
                    <div class="status">{status}</div>
                {/if}
            {/each}
        {/if}
    </div>

    <div class="composer">
        <textarea
            placeholder="Ask about the league..."
            bind:value={input}
            onkeydown={onKeydown}
            disabled={busy}
        ></textarea>
        {#if busy}
            <button class="stop" type="button" onclick={stop}>Stop</button>
        {:else}
            <button type="button" onclick={send} disabled={!input.trim()}>Send</button>
        {/if}
    </div>
</div>

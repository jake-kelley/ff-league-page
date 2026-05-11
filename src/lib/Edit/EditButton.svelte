<script>
    import { onMount } from 'svelte';

    let { storageKey, initialValue = '', onSaved = () => {}, label = 'Edit page', helpText = '' } = $props();

    let mode = $state('idle'); // idle | auth | edit | saving
    let password = $state('');
    let draft = $state('');
    let error = $state('');
    let authed = $state(false);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/edit/auth');
            if (res.ok) {
                const j = await res.json();
                authed = !!j.authenticated;
            }
        } catch {}
    };

    onMount(checkAuth);

    const open = async () => {
        if (!authed) {
            mode = 'auth';
            password = '';
            error = '';
            return;
        }
        startEdit();
    };

    const startEdit = () => {
        draft = initialValue ?? '';
        mode = 'edit';
        error = '';
    };

    const submitPassword = async () => {
        error = '';
        try {
            const res = await fetch('/api/edit/auth', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) {
                error = 'Wrong password';
                return;
            }
            authed = true;
            password = '';
            startEdit();
        } catch (e) {
            error = e.message ?? 'Auth failed';
        }
    };

    const save = async () => {
        mode = 'saving';
        error = '';
        try {
            const res = await fetch('/api/edit/content', {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ key: storageKey, value: draft.trim() ? draft : null }),
            });
            if (!res.ok) {
                error = `Save failed (${res.status})`;
                mode = 'edit';
                return;
            }
            onSaved(draft.trim() ? draft : null);
            mode = 'idle';
        } catch (e) {
            error = e.message ?? 'Save failed';
            mode = 'edit';
        }
    };

    const reset = async () => {
        if (!confirm('Reset this page to its built-in default? Your override will be deleted.')) return;
        mode = 'saving';
        try {
            const res = await fetch(`/api/edit/content?key=${encodeURIComponent(storageKey)}`, {
                method: 'DELETE',
            });
            if (!res.ok) { error = `Reset failed (${res.status})`; mode = 'edit'; return; }
            onSaved(null);
            mode = 'idle';
            draft = '';
        } catch (e) {
            error = e.message ?? 'Reset failed';
            mode = 'edit';
        }
    };

    const logout = async () => {
        await fetch('/api/edit/auth', { method: 'DELETE' });
        authed = false;
        mode = 'idle';
    };

    const close = () => { mode = 'idle'; error = ''; };
</script>

<style>
    .fab {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 50;
        background: linear-gradient(160deg, #11272f 0%, #0a1d24 100%);
        color: var(--accent);
        border: 1px solid var(--accentBorder);
        border-radius: 999px;
        padding: 10px 16px;
        font-size: 0.9em;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 8px 24px var(--boxShadowOne);
    }
    .fab:hover { color: var(--g000); border-color: var(--accent); background: linear-gradient(160deg, #163036 0%, #0d2329 100%); }

    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1em;
    }
    .panel {
        background: var(--f8f8f8);
        color: var(--g333);
        border: 1px solid var(--accentBorder);
        border-radius: 12px;
        padding: 1.4em 1.6em;
        max-width: 760px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        gap: 0.8em;
        box-shadow: 0 12px 32px var(--boxShadowOne);
    }
    .panel h3 {
        margin: 0;
        color: var(--accent);
        font-size: 1.1em;
    }
    .panel .help {
        color: var(--g555);
        font-size: 0.85em;
        margin: 0;
    }
    .panel input[type="password"] {
        padding: 10px 12px;
        font-size: 1em;
        border: 1px solid var(--ccc);
        border-radius: 6px;
        background: var(--fff);
        color: var(--g000);
    }
    .panel input[type="password"]:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accentSoft);
    }
    .panel textarea {
        width: 100%;
        min-height: 320px;
        padding: 10px 12px;
        font: 0.9em/1.5 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
        border: 1px solid var(--ccc);
        border-radius: 6px;
        resize: vertical;
        box-sizing: border-box;
        background: var(--fff);
        color: var(--g000);
    }
    .panel textarea:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accentSoft);
    }
    .panel .error {
        color: #ff5a6e;
        font-size: 0.85em;
    }
    .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
    }
    .actions button {
        padding: 8px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9em;
        font-weight: 500;
        border: 1px solid transparent;
    }
    .btn-cancel {
        background: var(--f3f3f3);
        color: var(--g111);
        border-color: var(--ccc);
    }
    .btn-cancel:hover { border-color: var(--accent); color: var(--accent); }
    .btn-reset {
        background: transparent;
        color: #ff5a6e;
        border-color: rgba(255, 90, 110, 0.4);
    }
    .btn-reset:hover { background: rgba(255, 90, 110, 0.1); border-color: #ff5a6e; }
    .btn-save {
        background: var(--accent);
        color: #062420;
        border-color: var(--accent);
    }
    .btn-save:hover { background: var(--accentDeep); border-color: var(--accentDeep); }
    .btn-save:disabled { opacity: 0.6; cursor: default; }
    .btn-logout {
        background: none;
        color: var(--g999);
        border-color: transparent;
        font-size: 0.8em;
    }
    .btn-logout:hover { color: var(--accent); }
</style>

<button class="fab" onclick={open} title={authed ? 'Edit (logged in)' : 'Sign in to edit'}>
    {authed ? '✏️' : '🔒'} {label}
</button>

{#if mode === 'auth'}
    <div class="overlay" onclick={(e) => { if (e.target === e.currentTarget) close(); }} role="dialog">
        <form
            class="panel"
            style="max-width: 420px;"
            onsubmit={(e) => { e.preventDefault(); submitPassword(); }}
        >
            <h3>🔒 Editor sign-in</h3>
            <p class="help">Enter the editor password to unlock editing across the site.</p>
            <input type="password" placeholder="Password" bind:value={password} autofocus />
            {#if error}<div class="error">{error}</div>{/if}
            <div class="actions">
                <button type="button" class="btn-cancel" onclick={close}>Cancel</button>
                <button type="submit" class="btn-save">Sign in</button>
            </div>
        </form>
    </div>
{:else if mode === 'edit' || mode === 'saving'}
    <div class="overlay" onclick={(e) => { if (e.target === e.currentTarget) close(); }} role="dialog">
        <div class="panel">
            <h3>✏️ Edit · {storageKey}</h3>
            {#if helpText}<p class="help">{helpText}</p>{/if}
            <textarea bind:value={draft} placeholder="Markdown content. Leave empty to use the page's built-in default." disabled={mode === 'saving'}></textarea>
            {#if error}<div class="error">{error}</div>{/if}
            <div class="actions">
                <button type="button" class="btn-logout" onclick={logout}>Sign out</button>
                <span style="flex: 1"></span>
                <button type="button" class="btn-reset" onclick={reset} disabled={mode === 'saving'}>Reset to default</button>
                <button type="button" class="btn-cancel" onclick={close}>Cancel</button>
                <button type="button" class="btn-save" onclick={save} disabled={mode === 'saving'}>
                    {mode === 'saving' ? 'Saving…' : 'Save'}
                </button>
            </div>
        </div>
    </div>
{/if}

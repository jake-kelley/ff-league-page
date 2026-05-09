<script>
    import { onMount } from 'svelte';
    import { DEFAULT_LINKS } from './defaultLinks';

    let { override } = $props();

    let links = $state(Array.isArray(override) && override.length ? override : DEFAULT_LINKS);

    let mode = $state('idle'); // idle | auth | edit | saving
    let authed = $state(false);
    let password = $state('');
    let error = $state('');
    let draft = $state([]);
    let newName = $state('');
    let newUrl = $state('');
    let newIcon = $state('link');

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/edit/auth');
            if (res.ok) authed = (await res.json()).authenticated === true;
        } catch {}
    };
    onMount(checkAuth);

    const open = () => {
        if (!authed) { mode = 'auth'; password = ''; error = ''; return; }
        startEdit();
    };
    const startEdit = () => {
        draft = JSON.parse(JSON.stringify(links));
        mode = 'edit';
        error = '';
        newName = ''; newUrl = ''; newIcon = 'link';
    };
    const submitPassword = async () => {
        error = '';
        try {
            const res = await fetch('/api/edit/auth', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) { error = 'Wrong password'; return; }
            authed = true;
            password = '';
            startEdit();
        } catch (e) { error = e.message ?? 'Auth failed'; }
    };
    const removeRow = (i) => { draft = draft.filter((_, idx) => idx !== i); };
    const moveUp = (i) => {
        if (i === 0) return;
        const next = [...draft];
        [next[i - 1], next[i]] = [next[i], next[i - 1]];
        draft = next;
    };
    const moveDown = (i) => {
        if (i === draft.length - 1) return;
        const next = [...draft];
        [next[i], next[i + 1]] = [next[i + 1], next[i]];
        draft = next;
    };
    const addRow = () => {
        const name = newName.trim();
        const url = newUrl.trim();
        if (!name || !url) { error = 'Name and URL are required'; return; }
        draft = [...draft, { name, url, icon: newIcon || 'link', premium: false }];
        newName = ''; newUrl = ''; newIcon = 'link'; error = '';
    };
    const save = async () => {
        mode = 'saving';
        error = '';
        try {
            const res = await fetch('/api/edit/content', {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ key: 'resources', value: draft }),
            });
            if (!res.ok) { error = `Save failed (${res.status})`; mode = 'edit'; return; }
            links = draft;
            mode = 'idle';
        } catch (e) { error = e.message ?? 'Save failed'; mode = 'edit'; }
    };
    const reset = async () => {
        if (!confirm('Reset to the default link list?')) return;
        mode = 'saving';
        try {
            const res = await fetch('/api/edit/content?key=resources', { method: 'DELETE' });
            if (!res.ok) { error = `Reset failed (${res.status})`; mode = 'edit'; return; }
            links = DEFAULT_LINKS;
            mode = 'idle';
        } catch (e) { error = e.message ?? 'Reset failed'; mode = 'edit'; }
    };
    const close = () => { mode = 'idle'; error = ''; };
    const logout = async () => { await fetch('/api/edit/auth', { method: 'DELETE' }); authed = false; mode = 'idle'; };
</script>

<style>
    .pageBody { position: relative; z-index: 1; }
    .header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin: 1.4em auto 0.6em;
        flex-wrap: wrap;
    }
    h2 {
        margin: 0;
        font-size: 1.4em;
        background: linear-gradient(90deg, #1976d2 0%, #00316b 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .edit-btn {
        background: linear-gradient(160deg, #1f2a44 0%, #131a2c 100%);
        color: #ffd166;
        border: 0;
        border-radius: 999px;
        padding: 6px 14px;
        font-size: 0.85em;
        font-weight: 600;
        cursor: pointer;
    }
    .edit-btn:hover { color: #fff; }

    .list {
        list-style: none;
        margin: 0.5em auto 2em;
        padding: 0;
        max-width: 720px;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        overflow: hidden;
    }
    .list li { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid #eee; }
    .list li:last-child { border-bottom: 0; }
    .list a { color: #00316b; text-decoration: none; flex: 1; font-weight: 500; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    .list a:hover { text-decoration: underline; }
    .icon { width: 26px; height: 26px; border-radius: 6px; background: #e3f2fd; color: #00316b; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .icon i { font-size: 18px; }
    .premium-tag {
        background: #fff3cd;
        color: #856404;
        font-size: 0.7em;
        padding: 1px 8px;
        border-radius: 10px;
        font-weight: 600;
        flex-shrink: 0;
    }

    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1em; }
    .panel { background: #fff; color: #333; border-radius: 12px; padding: 1.4em 1.6em; max-width: 720px; width: 100%; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: 0.8em; box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
    .panel h3 { margin: 0; color: #00316b; font-size: 1.1em; }
    .panel input { padding: 8px 10px; font-size: 0.95em; border: 1px solid #ccc; border-radius: 6px; }
    .row-grid { display: grid; grid-template-columns: 1fr 2fr 1fr auto; gap: 8px; align-items: center; }
    .draft-list { list-style: none; margin: 0; padding: 0; max-height: 50vh; overflow-y: auto; border: 1px solid #eee; border-radius: 8px; }
    .draft-list li { display: flex; gap: 6px; align-items: center; padding: 8px 10px; border-bottom: 1px solid #f3f3f3; }
    .draft-list li:last-child { border-bottom: 0; }
    .draft-list .row-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .draft-list .row-url { flex: 0 0 auto; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #888; font-size: 0.8em; }
    .small { padding: 4px 8px; font-size: 0.78em; border-radius: 4px; cursor: pointer; border: 1px solid #ddd; background: #fff; }
    .small.danger { background: #fff5f5; color: #c62828; border-color: #f5c6c6; }

    .add-row { display: grid; grid-template-columns: 1fr 2fr 1fr auto; gap: 8px; align-items: end; padding: 8px; background: #fafbfd; border-radius: 8px; }
    .add-row label { display: flex; flex-direction: column; gap: 4px; font-size: 0.78em; color: #666; }

    .actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; margin-top: 0.4em; }
    .btn { padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 0.9em; font-weight: 500; border: 1px solid transparent; }
    .btn-cancel { background: #f3f3f3; color: #333; border-color: #ddd; }
    .btn-reset { background: #fff5f5; color: #c62828; border-color: #f5c6c6; }
    .btn-save { background: linear-gradient(160deg, #1976d2 0%, #00316b 100%); color: #fff; }
    .btn-logout { background: none; color: #888; }
    .err { color: #c62828; font-size: 0.85em; }
</style>

<div class="pageBody">
    <div class="header">
        <h2>📚 Helpful Dynasty Resources</h2>
        <button class="edit-btn" onclick={open}>{authed ? '✏️' : '🔒'} Edit</button>
    </div>

    <ul class="list">
        {#each links as link, i (link.url + i)}
            <li>
                <span class="icon"><i class="material-icons">{link.icon || 'link'}</i></span>
                <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
                {#if link.premium}<span class="premium-tag">Premium</span>{/if}
            </li>
        {/each}
    </ul>
</div>

{#if mode === 'auth'}
    <div class="overlay" onclick={(e) => { if (e.target === e.currentTarget) close(); }} role="dialog">
        <form class="panel" style="max-width: 420px;" onsubmit={(e) => { e.preventDefault(); submitPassword(); }}>
            <h3>🔒 Editor sign-in</h3>
            <input type="password" placeholder="Password" bind:value={password} autofocus />
            {#if error}<div class="err">{error}</div>{/if}
            <div class="actions">
                <button type="button" class="btn btn-cancel" onclick={close}>Cancel</button>
                <button type="submit" class="btn btn-save">Sign in</button>
            </div>
        </form>
    </div>
{:else if mode === 'edit' || mode === 'saving'}
    <div class="overlay" onclick={(e) => { if (e.target === e.currentTarget) close(); }} role="dialog">
        <div class="panel">
            <h3>✏️ Edit Helpful Resources</h3>
            <ul class="draft-list">
                {#each draft as row, i (row.url + i)}
                    <li>
                        <span class="row-name">{row.name}</span>
                        <span class="row-url">{row.url}</span>
                        <button type="button" class="small" onclick={() => moveUp(i)} disabled={i === 0}>↑</button>
                        <button type="button" class="small" onclick={() => moveDown(i)} disabled={i === draft.length - 1}>↓</button>
                        <button type="button" class="small danger" onclick={() => removeRow(i)}>×</button>
                    </li>
                {/each}
                {#if draft.length === 0}<li><em>(no links)</em></li>{/if}
            </ul>

            <div class="add-row">
                <label>Name<input type="text" placeholder="e.g. KeepTradeCut" bind:value={newName} /></label>
                <label>URL<input type="url" placeholder="https://..." bind:value={newUrl} /></label>
                <label>Material icon<input type="text" placeholder="link" bind:value={newIcon} /></label>
                <button type="button" class="btn btn-save" onclick={addRow}>+ Add</button>
            </div>

            {#if error}<div class="err">{error}</div>{/if}
            <div class="actions">
                <button type="button" class="btn btn-logout" onclick={logout}>Sign out</button>
                <span style="flex: 1"></span>
                <button type="button" class="btn btn-reset" onclick={reset}>Reset to default</button>
                <button type="button" class="btn btn-cancel" onclick={close}>Cancel</button>
                <button type="button" class="btn btn-save" onclick={save} disabled={mode === 'saving'}>
                    {mode === 'saving' ? 'Saving…' : 'Save'}
                </button>
            </div>
        </div>
    </div>
{/if}

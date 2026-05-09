<script>
    import LinearProgress from '@smui/linear-progress';

    let { valueData } = $props();

    let players = $state([]);
    let loadError = $state(null);

    valueData
        .then((d) => { players = d.players ?? []; })
        .catch((err) => { loadError = err.message ?? String(err); });

    let sideA = $state([]);
    let sideB = $state([]);
    let queryA = $state('');
    let queryB = $state('');

    const autocomplete = (q, exclude) => {
        const trimmed = q.trim().toLowerCase();
        if (!trimmed) return [];
        const excludeIds = new Set(exclude.map((p) => p.id));
        return players
            .filter((p) => !excludeIds.has(p.id))
            .filter((p) => p.name.toLowerCase().includes(trimmed))
            .slice(0, 8);
    };

    const suggestionsA = $derived(autocomplete(queryA, [...sideA, ...sideB]));
    const suggestionsB = $derived(autocomplete(queryB, [...sideA, ...sideB]));

    const addToSide = (side, player) => {
        if (side === 'A') {
            sideA = [...sideA, player];
            queryA = '';
        } else {
            sideB = [...sideB, player];
            queryB = '';
        }
    };

    const removeFromSide = (side, id) => {
        if (side === 'A') sideA = sideA.filter((p) => p.id !== id);
        else sideB = sideB.filter((p) => p.id !== id);
    };

    const totalA = $derived(sideA.reduce((sum, p) => sum + (p.value ?? 0), 0));
    const totalB = $derived(sideB.reduce((sum, p) => sum + (p.value ?? 0), 0));

    const verdict = $derived.by(() => {
        if (sideA.length === 0 || sideB.length === 0) {
            return { label: 'Add players to both sides to evaluate', tone: 'neutral', diff: 0, pct: 0 };
        }
        const diff = totalA - totalB;
        const max = Math.max(totalA, totalB);
        const pct = max === 0 ? 0 : Math.abs(diff) / max;
        let label;
        let tone;
        if (pct < 0.05) {
            label = 'Even trade';
            tone = 'fair';
        } else if (pct < 0.15) {
            label = `Fair — slight edge ${diff > 0 ? 'Side A' : 'Side B'}`;
            tone = 'fair';
        } else if (pct < 0.30) {
            label = `Favors ${diff > 0 ? 'Side A' : 'Side B'}`;
            tone = 'lean';
        } else {
            label = `Lopsided — heavily favors ${diff > 0 ? 'Side A' : 'Side B'}`;
            tone = 'lopsided';
        }
        return { label, tone, diff, pct };
    });

    const reset = () => {
        sideA = [];
        sideB = [];
        queryA = '';
        queryB = '';
    };
</script>

<style>
    .wrapper {
        max-width: 900px;
        margin: 30px auto 60px;
        padding: 0 20px;
    }
    h2 { margin: 0 0 6px; }
    .meta {
        color: #888;
        font-size: 0.9em;
        margin-bottom: 24px;
    }
    .calc {
        padding: 24px;
        background: var(--f3f3f3);
        border-radius: 10px;
    }
    .sides {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    @media (max-width: 700px) {
        .sides { grid-template-columns: 1fr; }
    }
    .side {
        background: var(--fff);
        border-radius: 8px;
        padding: 16px;
        position: relative;
    }
    .side h4 {
        margin: 0 0 10px;
        font-size: 1.05em;
    }
    .ac-wrap { position: relative; }
    .ac-input {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid var(--ccc);
        border-radius: 6px;
        font-size: 0.95em;
        box-sizing: border-box;
        background: var(--fff);
        color: inherit;
    }
    .ac-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 5;
        background: var(--fff);
        border: 1px solid var(--ccc);
        border-radius: 6px;
        margin-top: 2px;
        max-height: 240px;
        overflow-y: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
    .ac-item {
        padding: 8px 10px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        gap: 10px;
    }
    .ac-item:hover { background: var(--f3f3f3); }
    .ac-meta { color: #888; font-size: 0.85em; }

    .selected {
        list-style: none;
        padding: 0;
        margin: 14px 0 0;
    }
    .selected li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 8px;
        border-radius: 4px;
    }
    .selected li:nth-child(even) { background: var(--f3f3f3); }
    .selected .remove {
        cursor: pointer;
        color: #c33;
        background: none;
        border: none;
        font-size: 1.1em;
        padding: 0 6px;
    }

    .total {
        margin-top: 14px;
        padding-top: 10px;
        border-top: 2px solid var(--ddd);
        display: flex;
        justify-content: space-between;
        font-weight: 600;
    }
    .verdict {
        margin-top: 24px;
        padding: 16px;
        border-radius: 8px;
        text-align: center;
        font-size: 1.1em;
        font-weight: 600;
    }
    .verdict.neutral { background: #eee; color: #555; }
    .verdict.fair { background: #d4edda; color: #155724; }
    .verdict.lean { background: #fff3cd; color: #856404; }
    .verdict.lopsided { background: #f8d7da; color: #721c24; }
    .verdict-detail {
        font-weight: 400;
        font-size: 0.85em;
        margin-top: 6px;
        opacity: 0.85;
    }
    .reset {
        margin-top: 16px;
        text-align: center;
    }
    .reset button {
        padding: 6px 14px;
        border: 1px solid var(--ccc);
        background: var(--fff);
        border-radius: 6px;
        cursor: pointer;
        color: inherit;
    }
    .reset button:hover { background: var(--f3f3f3); }
</style>

<div class="wrapper">
    <h2>Trade Calculator</h2>
    <p class="meta">
        Type a name to autocomplete. Add as many players or picks as you want on each side.
        Values from <a href="https://fantasycalc.com" target="_blank" rel="noreferrer">FantasyCalc</a> (1QB, 10-team, 1.0 PPR dynasty).
    </p>

    {#if loadError}
        <p style="color: #c33;">Couldn't load values: {loadError}</p>
    {:else if players.length === 0}
        <p>Loading values...</p>
        <LinearProgress indeterminate />
    {:else}
        <section class="calc">
            <div class="sides">
                <div class="side">
                    <h4>Side A</h4>
                    <div class="ac-wrap">
                        <input
                            class="ac-input"
                            type="text"
                            placeholder="Add player..."
                            bind:value={queryA}
                        />
                        {#if suggestionsA.length > 0}
                            <div class="ac-list">
                                {#each suggestionsA as s (s.id)}
                                    <div
                                        class="ac-item"
                                        role="button"
                                        tabindex="0"
                                        onclick={() => addToSide('A', s)}
                                        onkeydown={(e) => { if (e.key === 'Enter') addToSide('A', s); }}
                                    >
                                        <span>{s.name} <span class="ac-meta">({s.position}{s.team ? ` · ${s.team}` : ''})</span></span>
                                        <span class="ac-meta">{s.value.toLocaleString()}</span>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                    <ul class="selected">
                        {#each sideA as p (p.id)}
                            <li>
                                <span>{p.name} <span class="ac-meta">({p.position})</span></span>
                                <span>
                                    <span class="ac-meta">{p.value.toLocaleString()}</span>
                                    <button class="remove" aria-label="Remove" onclick={() => removeFromSide('A', p.id)}>×</button>
                                </span>
                            </li>
                        {/each}
                    </ul>
                    <div class="total"><span>Total</span><span>{totalA.toLocaleString()}</span></div>
                </div>

                <div class="side">
                    <h4>Side B</h4>
                    <div class="ac-wrap">
                        <input
                            class="ac-input"
                            type="text"
                            placeholder="Add player..."
                            bind:value={queryB}
                        />
                        {#if suggestionsB.length > 0}
                            <div class="ac-list">
                                {#each suggestionsB as s (s.id)}
                                    <div
                                        class="ac-item"
                                        role="button"
                                        tabindex="0"
                                        onclick={() => addToSide('B', s)}
                                        onkeydown={(e) => { if (e.key === 'Enter') addToSide('B', s); }}
                                    >
                                        <span>{s.name} <span class="ac-meta">({s.position}{s.team ? ` · ${s.team}` : ''})</span></span>
                                        <span class="ac-meta">{s.value.toLocaleString()}</span>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                    <ul class="selected">
                        {#each sideB as p (p.id)}
                            <li>
                                <span>{p.name} <span class="ac-meta">({p.position})</span></span>
                                <span>
                                    <span class="ac-meta">{p.value.toLocaleString()}</span>
                                    <button class="remove" aria-label="Remove" onclick={() => removeFromSide('B', p.id)}>×</button>
                                </span>
                            </li>
                        {/each}
                    </ul>
                    <div class="total"><span>Total</span><span>{totalB.toLocaleString()}</span></div>
                </div>
            </div>

            <div class="verdict {verdict.tone}">
                {verdict.label}
                {#if sideA.length > 0 && sideB.length > 0}
                    <div class="verdict-detail">
                        Difference: {Math.abs(verdict.diff).toLocaleString()} ({(verdict.pct * 100).toFixed(1)}%)
                    </div>
                {/if}
            </div>

            {#if sideA.length > 0 || sideB.length > 0}
                <div class="reset">
                    <button onclick={reset}>Clear trade</button>
                </div>
            {/if}
        </section>
    {/if}
</div>

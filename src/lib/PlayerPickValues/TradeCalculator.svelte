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

    const FAIR_THRESHOLD = 0.05;

    const verdict = $derived.by(() => {
        if (sideA.length === 0 || sideB.length === 0) {
            return { label: 'Add players to both sides to evaluate', tone: 'neutral', diff: 0, pct: 0 };
        }
        const diff = totalA - totalB;
        const max = Math.max(totalA, totalB);
        const pct = max === 0 ? 0 : Math.abs(diff) / max;
        let label;
        let tone;
        if (pct < FAIR_THRESHOLD) {
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

    const positionCounts = (side) => {
        const counts = {};
        for (const p of side) {
            const pos = p.position || '—';
            counts[pos] = (counts[pos] ?? 0) + 1;
        }
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    };

    const breakdownA = $derived(positionCounts(sideA));
    const breakdownB = $derived(positionCounts(sideB));
    const topPieceA = $derived(sideA.length ? sideA.reduce((m, p) => (p.value ?? 0) > (m.value ?? 0) ? p : m) : null);
    const topPieceB = $derived(sideB.length ? sideB.reduce((m, p) => (p.value ?? 0) > (m.value ?? 0) ? p : m) : null);

    const PLAYER_FALLBACK = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
    const isPick = (pos) => pos === 'PICK' || pos === 'RDP';
    const playerThumb = (sleeperId) =>
        sleeperId ? `https://sleepercdn.com/content/nfl/players/thumb/${sleeperId}.jpg` : PLAYER_FALLBACK;
    const onThumbError = (e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLAYER_FALLBACK; };

    const lighterSide = $derived.by(() => {
        if (sideA.length === 0 || sideB.length === 0) return null;
        if (totalA === totalB) return null;
        return totalA < totalB ? 'A' : 'B';
    });
    const gap = $derived(Math.abs(totalA - totalB));
    const heavierTotal = $derived(Math.max(totalA, totalB));

    const projectedPct = (addedValue) => {
        if (!lighterSide) return 0;
        const newLighter = (lighterSide === 'A' ? totalA : totalB) + addedValue;
        const newMax = Math.max(newLighter, heavierTotal);
        if (newMax === 0) return 0;
        return Math.abs(newLighter - heavierTotal) / newMax;
    };

    const findClosestIdx = (sortedValues, target) => {
        let lo = 0;
        let hi = sortedValues.length - 1;
        while (lo < hi) {
            const mid = (lo + hi) >>> 1;
            if (sortedValues[mid] < target) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    };

    const suggestions = $derived.by(() => {
        if (!lighterSide || verdict.pct < FAIR_THRESHOLD || players.length === 0) {
            return { singles: [], pairs: [] };
        }
        const inTrade = new Set([...sideA, ...sideB].map((p) => p.id));
        const pool = players.filter((p) => !inTrade.has(p.id) && (p.value ?? 0) > 0);

        const singles = pool
            .map((p) => ({ player: p, pct: projectedPct(p.value) }))
            .filter((s) => s.pct < FAIR_THRESHOLD)
            .sort((a, b) => Math.abs(a.player.value - gap) - Math.abs(b.player.value - gap))
            .slice(0, 6);

        let pairs = [];
        if (singles.length < 4) {
            const sorted = [...pool].sort((a, b) => a.value - b.value);
            const sortedValues = sorted.map((p) => p.value);
            const sample = [...pool]
                .sort((a, b) => Math.abs(a.value - gap / 2) - Math.abs(b.value - gap / 2))
                .slice(0, 80);
            const seen = new Set();
            for (const p of sample) {
                const partnerTarget = gap - p.value;
                if (partnerTarget <= 0) continue;
                const idx = findClosestIdx(sortedValues, partnerTarget);
                for (const ci of [idx - 1, idx, idx + 1]) {
                    if (ci < 0 || ci >= sorted.length) continue;
                    const q = sorted[ci];
                    if (q.id === p.id) continue;
                    const sum = p.value + q.value;
                    if (projectedPct(sum) >= FAIR_THRESHOLD) continue;
                    const a = p.value <= q.value ? p : q;
                    const b = p.value <= q.value ? q : p;
                    const key = `${a.id}|${b.id}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    pairs.push({ pieces: [a, b], sum, pct: projectedPct(sum) });
                }
            }
            pairs = pairs
                .sort((x, y) => Math.abs(x.sum - gap) - Math.abs(y.sum - gap))
                .slice(0, 4);
        }

        return { singles, pairs };
    });

    const addSuggestion = (player) => {
        if (!lighterSide) return;
        addToSide(lighterSide, player);
    };

    const addPair = (combo) => {
        const side = lighterSide;
        if (!side) return;
        addToSide(side, combo.pieces[0]);
        addToSide(side, combo.pieces[1]);
    };

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
        align-items: center;
        gap: 10px;
    }
    .ac-item:hover { background: var(--f3f3f3); }
    .ac-meta { color: #888; font-size: 0.85em; }

    .ac-name {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
    }

    .thumb {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e8eef7;
        object-fit: cover;
        flex-shrink: 0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .thumb.sm { width: 28px; height: 28px; }
    .thumb.pick {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1em;
    }

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
        gap: 8px;
    }
    .selected .name {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
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

    .analysis {
        margin-top: 20px;
        background: var(--fff);
        padding: 16px;
        border-radius: 8px;
    }
    .analysis h4, .suggestions h4 {
        margin: 0 0 10px;
        font-size: 1em;
    }
    .breakdown-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    @media (max-width: 700px) {
        .breakdown-grid { grid-template-columns: 1fr; }
    }
    .breakdown-col strong {
        display: block;
        margin-bottom: 4px;
    }
    .breakdown-pos {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 6px;
    }
    .pos-chip {
        background: var(--f3f3f3);
        border-radius: 12px;
        padding: 2px 10px;
        font-size: 0.85em;
    }
    .top-piece {
        font-size: 0.85em;
        color: #666;
    }

    .suggestions {
        margin-top: 16px;
        background: var(--fff);
        padding: 16px;
        border-radius: 8px;
    }
    .hint {
        margin: 0 0 10px;
        font-size: 0.9em;
        color: #666;
    }
    .suggestion-section + .suggestion-section {
        margin-top: 12px;
    }
    .suggestion-section strong {
        display: block;
        font-size: 0.9em;
        margin-bottom: 6px;
    }
    .suggestion-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .suggestion-list li + li { margin-top: 4px; }
    .suggestion-btn {
        width: 100%;
        text-align: left;
        background: var(--f3f3f3);
        border: 1px solid transparent;
        border-radius: 6px;
        padding: 8px 10px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        font-size: 0.9em;
        color: inherit;
    }
    .suggestion-btn:hover {
        border-color: var(--ccc);
        background: var(--fff);
    }
    .sugg-name { flex: 1 1 auto; font-weight: 500; display: flex; align-items: center; gap: 8px; min-width: 0; }
    .sugg-value { color: #666; font-variant-numeric: tabular-nums; }
    .sugg-fairness {
        color: #155724;
        background: #d4edda;
        border-radius: 10px;
        padding: 1px 8px;
        font-size: 0.8em;
        white-space: nowrap;
    }
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
                                        <span class="ac-name">
                                            {#if isPick(s.position)}
                                                <span class="thumb sm pick">📅</span>
                                            {:else}
                                                <img class="thumb sm" src={playerThumb(s.sleeperId)} onerror={onThumbError} alt="" />
                                            {/if}
                                            <span>{s.name} <span class="ac-meta">({s.position}{s.team ? ` · ${s.team}` : ''})</span></span>
                                        </span>
                                        <span class="ac-meta">{s.value.toLocaleString()}</span>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                    <ul class="selected">
                        {#each sideA as p (p.id)}
                            <li>
                                <span class="name">
                                    {#if isPick(p.position)}
                                        <span class="thumb sm pick">📅</span>
                                    {:else}
                                        <img class="thumb sm" src={playerThumb(p.sleeperId)} onerror={onThumbError} alt="" />
                                    {/if}
                                    <span>{p.name} <span class="ac-meta">({p.position})</span></span>
                                </span>
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
                                        <span class="ac-name">
                                            {#if isPick(s.position)}
                                                <span class="thumb sm pick">📅</span>
                                            {:else}
                                                <img class="thumb sm" src={playerThumb(s.sleeperId)} onerror={onThumbError} alt="" />
                                            {/if}
                                            <span>{s.name} <span class="ac-meta">({s.position}{s.team ? ` · ${s.team}` : ''})</span></span>
                                        </span>
                                        <span class="ac-meta">{s.value.toLocaleString()}</span>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                    <ul class="selected">
                        {#each sideB as p (p.id)}
                            <li>
                                <span class="name">
                                    {#if isPick(p.position)}
                                        <span class="thumb sm pick">📅</span>
                                    {:else}
                                        <img class="thumb sm" src={playerThumb(p.sleeperId)} onerror={onThumbError} alt="" />
                                    {/if}
                                    <span>{p.name} <span class="ac-meta">({p.position})</span></span>
                                </span>
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

            {#if sideA.length > 0 && sideB.length > 0}
                <div class="analysis">
                    <h4>Trade Analysis</h4>
                    <div class="breakdown-grid">
                        <div class="breakdown-col">
                            <strong>Side A</strong>
                            <div class="breakdown-pos">
                                {#each breakdownA as [pos, count] (pos)}
                                    <span class="pos-chip">{pos} × {count}</span>
                                {/each}
                            </div>
                            {#if topPieceA}
                                <div class="top-piece">Top piece: {topPieceA.name} ({topPieceA.value.toLocaleString()})</div>
                            {/if}
                        </div>
                        <div class="breakdown-col">
                            <strong>Side B</strong>
                            <div class="breakdown-pos">
                                {#each breakdownB as [pos, count] (pos)}
                                    <span class="pos-chip">{pos} × {count}</span>
                                {/each}
                            </div>
                            {#if topPieceB}
                                <div class="top-piece">Top piece: {topPieceB.name} ({topPieceB.value.toLocaleString()})</div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}

            {#if lighterSide && verdict.pct >= FAIR_THRESHOLD}
                <div class="suggestions">
                    <h4>Suggestions to even out (within 5%)</h4>
                    <p class="hint">
                        Side {lighterSide} is short by {gap.toLocaleString()}. Click any option to add it to Side {lighterSide}.
                    </p>
                    {#if suggestions.singles.length > 0}
                        <div class="suggestion-section">
                            <strong>Single-piece options</strong>
                            <ul class="suggestion-list">
                                {#each suggestions.singles as s (s.player.id)}
                                    <li>
                                        <button class="suggestion-btn" onclick={() => addSuggestion(s.player)}>
                                            <span class="sugg-name">
                                                {#if isPick(s.player.position)}
                                                    <span class="thumb sm pick">📅</span>
                                                {:else}
                                                    <img class="thumb sm" src={playerThumb(s.player.sleeperId)} onerror={onThumbError} alt="" />
                                                {/if}
                                                <span>{s.player.name} <span class="ac-meta">({s.player.position}{s.player.team ? ` · ${s.player.team}` : ''})</span></span>
                                            </span>
                                            <span class="sugg-value">{s.player.value.toLocaleString()}</span>
                                            <span class="sugg-fairness">→ {(s.pct * 100).toFixed(1)}% off</span>
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                    {#if suggestions.pairs.length > 0}
                        <div class="suggestion-section">
                            <strong>Two-piece combos</strong>
                            <ul class="suggestion-list">
                                {#each suggestions.pairs as combo (combo.pieces[0].id + '|' + combo.pieces[1].id)}
                                    <li>
                                        <button class="suggestion-btn" onclick={() => addPair(combo)}>
                                            <span class="sugg-name">
                                                {#if isPick(combo.pieces[0].position)}
                                                    <span class="thumb sm pick">📅</span>
                                                {:else}
                                                    <img class="thumb sm" src={playerThumb(combo.pieces[0].sleeperId)} onerror={onThumbError} alt="" />
                                                {/if}
                                                {#if isPick(combo.pieces[1].position)}
                                                    <span class="thumb sm pick">📅</span>
                                                {:else}
                                                    <img class="thumb sm" src={playerThumb(combo.pieces[1].sleeperId)} onerror={onThumbError} alt="" />
                                                {/if}
                                                <span>{combo.pieces[0].name} + {combo.pieces[1].name}</span>
                                            </span>
                                            <span class="sugg-value">{combo.sum.toLocaleString()}</span>
                                            <span class="sugg-fairness">→ {(combo.pct * 100).toFixed(1)}% off</span>
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                    {#if suggestions.singles.length === 0 && suggestions.pairs.length === 0}
                        <p class="hint">No available pieces close this gap within 5%. Try drafting picks or removing a piece from the heavier side.</p>
                    {/if}
                </div>
            {/if}

            {#if sideA.length > 0 || sideB.length > 0}
                <div class="reset">
                    <button onclick={reset}>Clear trade</button>
                </div>
            {/if}
        </section>
    {/if}
</div>

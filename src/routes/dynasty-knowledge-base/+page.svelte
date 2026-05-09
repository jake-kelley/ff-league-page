<script>
    let { data } = $props();

    let query = $state('');
    let selectedSlug = $state(data.articles[0]?.slug ?? '');

    const escapeHtml = (s) =>
        s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const countMatches = (text, q) => {
        if (!q) return 0;
        const re = new RegExp(escapeRegex(q), 'gi');
        const m = text.match(re);
        return m ? m.length : 0;
    };

    const filteredArticles = $derived.by(() => {
        const q = query.trim().toLowerCase();
        if (!q) return data.articles.map((a) => ({ ...a, matchCount: 0 }));
        return data.articles
            .map((a) => {
                const titleHits = countMatches(a.title, q);
                const contentHits = countMatches(a.content, q);
                return { ...a, matchCount: titleHits + contentHits };
            })
            .filter((a) => a.matchCount > 0);
    });

    const grouped = $derived.by(() => {
        const map = new Map();
        for (const a of filteredArticles) {
            if (!map.has(a.category)) map.set(a.category, []);
            map.get(a.category).push(a);
        }
        return data.categoryOrder
            .map((name) => ({ name, articles: map.get(name) ?? [] }))
            .filter((g) => g.articles.length > 0);
    });

    const selected = $derived(
        filteredArticles.find((a) => a.slug === selectedSlug) ??
            data.articles.find((a) => a.slug === selectedSlug) ??
            filteredArticles[0] ??
            data.articles[0]
    );

    const renderedContent = $derived.by(() => {
        if (!selected) return '';
        const text = selected.content;
        const q = query.trim();
        if (!q) return escapeHtml(text);
        const re = new RegExp(`(${escapeRegex(q)})`, 'gi');
        return text
            .split(re)
            .map((part, i) => (i % 2 === 1 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)))
            .join('');
    });

    const selectArticle = (slug) => {
        selectedSlug = slug;
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    let sidebarOpen = $state(false);
</script>

<style>
    .wrap {
        position: relative;
        z-index: 1;
        max-width: 1400px;
        margin: 4em auto 6em;
        padding: 0 20px;
    }
    .header {
        margin-bottom: 1.5em;
    }
    h1 {
        font-size: 2em;
        margin: 0 0 0.2em;
    }
    .subtitle {
        color: #888;
        margin: 0 0 1em;
        font-style: italic;
    }
    .search {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .search input {
        flex: 1;
        padding: 10px 14px;
        font-size: 1em;
        border: 1px solid var(--ccc);
        border-radius: 6px;
        background: var(--fff);
        color: inherit;
    }
    .search-meta {
        color: #888;
        font-size: 0.85em;
        white-space: nowrap;
    }
    .clear {
        padding: 8px 12px;
        border: 1px solid var(--ccc);
        background: var(--fff);
        border-radius: 6px;
        cursor: pointer;
        color: inherit;
    }
    .clear:hover {
        background: var(--f3f3f3);
    }

    .layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 24px;
    }

    .sidebar {
        position: sticky;
        top: 80px;
        align-self: start;
        max-height: calc(100vh - 100px);
        overflow-y: auto;
        background: var(--f3f3f3);
        border-radius: 8px;
        padding: 12px;
    }
    .sidebar h3 {
        margin: 14px 8px 6px;
        font-size: 0.85em;
        text-transform: uppercase;
        color: #666;
        letter-spacing: 0.04em;
    }
    .sidebar h3:first-child { margin-top: 6px; }
    .sidebar ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .sidebar li button {
        width: 100%;
        text-align: left;
        background: none;
        border: 0;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9em;
        color: inherit;
        line-height: 1.3em;
        display: flex;
        justify-content: space-between;
        gap: 6px;
        align-items: center;
    }
    .sidebar li button:hover {
        background: var(--fff);
    }
    .sidebar li button.active {
        background: var(--fff);
        font-weight: 600;
        color: #00316b;
    }
    .matchCount {
        background: #fff3cd;
        color: #856404;
        border-radius: 10px;
        padding: 1px 7px;
        font-size: 0.75em;
        font-weight: 500;
        flex-shrink: 0;
    }
    .empty {
        color: #888;
        font-size: 0.9em;
        padding: 8px 10px;
    }

    .content {
        background: var(--fff);
        border-radius: 8px;
        padding: 24px 28px;
        min-width: 0;
    }
    .article-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 0.85em;
        color: #888;
        margin-bottom: 0.6em;
    }
    .content h2 {
        margin: 0 0 0.6em;
        font-size: 1.4em;
        line-height: 1.25em;
    }
    .article-content {
        font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        font-size: 0.85em;
        line-height: 1.55em;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: #444;
        margin: 0;
    }
    .article-content :global(mark) {
        background: #ffe066;
        color: inherit;
        padding: 0 2px;
        border-radius: 2px;
    }

    .mobile-toggle {
        display: none;
    }

    @media (max-width: 900px) {
        .layout {
            grid-template-columns: 1fr;
        }
        .mobile-toggle {
            display: inline-block;
            padding: 8px 14px;
            border: 1px solid var(--ccc);
            background: var(--fff);
            border-radius: 6px;
            cursor: pointer;
            color: inherit;
            margin-bottom: 12px;
        }
        .sidebar {
            position: static;
            max-height: none;
            display: none;
        }
        .sidebar.open {
            display: block;
        }
    }
</style>

<div class="wrap">
    <div class="header">
        <h1>Dynasty Knowledge Base</h1>
        <p class="subtitle">{data.articles.length} articles · search and browse the full training corpus</p>
        <div class="search">
            <input
                type="search"
                placeholder="Search across all articles..."
                bind:value={query}
            />
            {#if query.trim()}
                <button class="clear" onclick={() => (query = '')}>Clear</button>
                <span class="search-meta">{filteredArticles.length} match{filteredArticles.length === 1 ? '' : 'es'}</span>
            {/if}
        </div>
    </div>

    <button class="mobile-toggle" onclick={() => (sidebarOpen = !sidebarOpen)}>
        {sidebarOpen ? 'Hide' : 'Show'} table of contents
    </button>

    <div class="layout">
        <nav class="sidebar" class:open={sidebarOpen} aria-label="Knowledge base table of contents">
            {#if grouped.length === 0}
                <p class="empty">No articles match "{query}".</p>
            {:else}
                {#each grouped as group (group.name)}
                    <h3>{group.name}</h3>
                    <ul>
                        {#each group.articles as a (a.slug)}
                            <li>
                                <button
                                    class:active={a.slug === selectedSlug}
                                    onclick={() => selectArticle(a.slug)}
                                >
                                    <span>{a.title}</span>
                                    {#if a.matchCount > 0}
                                        <span class="matchCount">{a.matchCount}</span>
                                    {/if}
                                </button>
                            </li>
                        {/each}
                    </ul>
                {/each}
            {/if}
        </nav>

        <article class="content">
            {#if selected}
                <div class="article-meta">
                    <span>{selected.category}</span>
                    <span>{selected.wordCount.toLocaleString()} words · ~{Math.max(1, Math.round(selected.wordCount / 250))} min read</span>
                </div>
                <h2>{selected.title}</h2>
                <pre class="article-content">{@html renderedContent}</pre>
            {:else}
                <p>Select an article from the sidebar.</p>
            {/if}
        </article>
    </div>
</div>

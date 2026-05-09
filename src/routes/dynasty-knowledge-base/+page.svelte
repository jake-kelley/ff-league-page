<script>
    import { marked } from 'marked';
    import EditButton from '$lib/Edit/EditButton.svelte';

    let { data } = $props();
    let articles = $state(data.articles);

    let query = $state('');
    let selectedSlug = $state(data.articles[0]?.slug ?? '');

    const updateArticleContent = (slug, newContent) => {
        articles = articles.map((a) => {
            if (a.slug !== slug) return a;
            const content = newContent ?? a.content;
            return { ...a, content, contentHtml: marked.parse(content), hasOverride: !!newContent };
        });
    };

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
        if (!q) return articles.map((a) => ({ ...a, matchCount: 0 }));
        return articles
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
            articles.find((a) => a.slug === selectedSlug) ??
            filteredArticles[0] ??
            articles[0]
    );

    const renderedContent = $derived.by(() => {
        if (!selected) return '';
        const html = selected.contentHtml ?? '';
        const q = query.trim();
        if (!q) return html;
        const re = new RegExp(`(${escapeRegex(q)})`, 'gi');
        return html.replace(/(<[^>]+>)|([^<]+)/g, (_match, tag, text) => {
            if (tag) return tag;
            return text.replace(re, '<mark>$1</mark>');
        });
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
        background: linear-gradient(90deg, #1976d2 0%, #00316b 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
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
        border-radius: 8px;
        background: var(--fff);
        color: inherit;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .search input:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
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
        background: linear-gradient(160deg, #1f2a44 0%, #131a2c 100%);
        color: #e8eaf3;
        border-radius: 12px;
        padding: 14px 12px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
    }
    .sidebar h3 {
        margin: 14px 8px 6px;
        font-size: 0.78em;
        text-transform: uppercase;
        color: #ffd166;
        letter-spacing: 0.08em;
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
        border-left: 3px solid transparent;
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9em;
        color: #c8cee0;
        line-height: 1.3em;
        display: flex;
        justify-content: space-between;
        gap: 6px;
        align-items: center;
        margin: 1px 0;
        transition: background 0.12s, color 0.12s, border-color 0.12s;
    }
    .sidebar li button:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
    }
    .sidebar li button.active {
        background: rgba(255, 209, 102, 0.14);
        color: #fff;
        border-left-color: #ffd166;
        font-weight: 600;
    }
    .matchCount {
        background: rgba(255, 209, 102, 0.22);
        color: #ffd166;
        border-radius: 10px;
        padding: 1px 7px;
        font-size: 0.75em;
        font-weight: 600;
        flex-shrink: 0;
    }
    .empty {
        color: #c8cee0;
        font-size: 0.9em;
        padding: 8px 10px;
    }

    .content {
        background: #fff;
        color: #333;
        border-radius: 12px;
        padding: 24px 28px;
        min-width: 0;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
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
        color: #00316b;
    }
    .article-content {
        font-size: 0.95em;
        line-height: 1.6em;
        color: #333;
    }
    .article-content :global(h1) {
        font-size: 1.6em;
        margin: 1.5em 0 0.4em;
        line-height: 1.25em;
    }
    .article-content :global(h2) {
        font-size: 1.3em;
        margin: 1.6em 0 0.4em;
        padding-bottom: 0.3em;
        border-bottom: 2px solid #e0e7f3;
        color: #00316b;
        line-height: 1.25em;
    }
    .article-content :global(h3) {
        font-size: 1.1em;
        margin: 1.4em 0 0.3em;
        line-height: 1.3em;
    }
    .article-content :global(h4),
    .article-content :global(h5),
    .article-content :global(h6) {
        font-size: 1em;
        margin: 1.2em 0 0.3em;
    }
    .article-content :global(p) {
        margin: 0.6em 0;
    }
    .article-content :global(ul),
    .article-content :global(ol) {
        padding-left: 1.6em;
        margin: 0.6em 0;
    }
    .article-content :global(li) {
        margin: 0.25em 0;
    }
    .article-content :global(li > p) {
        margin: 0.2em 0;
    }
    .article-content :global(a) {
        color: #00316b;
        text-decoration: underline;
    }
    .article-content :global(strong) {
        color: #1a1a1a;
    }
    .article-content :global(em) {
        color: #555;
    }
    .article-content :global(blockquote) {
        margin: 1em 0;
        padding: 0.4em 1em;
        border-left: 3px solid #ddd;
        color: #666;
        background: #fafafa;
    }
    .article-content :global(code) {
        background: #f3f3f3;
        padding: 0.1em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
        font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
    }
    .article-content :global(pre) {
        background: #f3f3f3;
        padding: 0.8em 1em;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 0.85em;
        line-height: 1.45em;
        margin: 1em 0;
    }
    .article-content :global(pre code) {
        background: transparent;
        padding: 0;
    }
    .article-content :global(table) {
        border-collapse: collapse;
        margin: 1em 0;
        width: 100%;
        font-size: 0.92em;
    }
    .article-content :global(th),
    .article-content :global(td) {
        border: 1px solid #e5e5e5;
        padding: 8px 12px;
        text-align: left;
    }
    .article-content :global(th) {
        background: linear-gradient(180deg, #f5f9ff 0%, #e8f0fb 100%);
        color: #00316b;
        font-weight: 600;
    }
    .article-content :global(tbody tr:hover) {
        background: #fafbfd;
    }
    .article-content :global(hr) {
        border: 0;
        border-top: 1px solid #ddd;
        margin: 1.5em 0;
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
            border: 0;
            background: linear-gradient(160deg, #1f2a44 0%, #131a2c 100%);
            border-radius: 8px;
            cursor: pointer;
            color: #ffd166;
            margin-bottom: 12px;
            font-size: 0.9em;
            font-weight: 600;
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

{#if selected}
    {#key selected.slug}
        <EditButton
            storageKey={`kb:${selected.slug}`}
            initialValue={selected.content ?? ''}
            label={`Edit · ${selected.title}`}
            helpText="Markdown for THIS article. Saves an override that replaces the source .md file. Click Reset to restore the built-in default."
            onSaved={(v) => updateArticleContent(selected.slug, v)}
        />
    {/key}
{/if}

<div class="wrap">
    <div class="header">
        <h1>Dynasty Knowledge Base</h1>
        <p class="subtitle">{articles.length} articles · search and browse the full knowledge base</p>
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
                <div class="article-content">{@html renderedContent}</div>
            {:else}
                <p>Select an article from the sidebar.</p>
            {/if}
        </article>
    </div>
</div>

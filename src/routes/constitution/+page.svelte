<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import EditButton from '$lib/Edit/EditButton.svelte';

    let { data } = $props();
    let override = $state(data.override);

    const current = $derived(override ?? data.defaultMarkdown);
    const slugify = (s) =>
        s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const tocItems = $derived(
        [...current.matchAll(/^##\s+(.+)$/gm)].map((m) => {
            const title = m[1].trim();
            return { title, id: slugify(title) };
        })
    );

    const renderedHtml = $derived.by(() => {
        let html = marked.parse(current);
        html = html.replace(/<h2(\s[^>]*)?>(.+?)<\/h2>/g, (full, attrs, text) => {
            const stripped = text.replace(/<[^>]+>/g, '');
            const id = slugify(stripped);
            return `<h2 id="${id}"${attrs ?? ''}>${text}</h2>`;
        });
        return html;
    });

    let activeId = $state('');
    let mobileTocOpen = $state(false);
    let containerEl;

    const goTo = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.pageYOffset - 20;
        window.scrollTo({ left: 0, top, behavior: 'smooth' });
        mobileTocOpen = false;
    };

    let observer;
    const wireObserver = () => {
        if (observer) observer.disconnect();
        if (!containerEl) return;
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting && entry.target.id) activeId = entry.target.id;
                }
            },
            { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
        );
        for (const h of containerEl.querySelectorAll('h2[id]')) observer.observe(h);
    };

    onMount(() => {
        wireObserver();
        return () => observer && observer.disconnect();
    });

    $effect(() => {
        // re-observe when content changes
        renderedHtml;
        if (typeof window !== 'undefined') {
            queueMicrotask(wireObserver);
        }
    });
</script>

<style>
    .page {
        position: relative;
        z-index: 1;
        max-width: 1180px;
        margin: 4em auto 6em;
        padding: 0 16px;
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 28px;
        align-items: start;
        line-height: 1.55;
    }
    .toc-sidebar {
        position: sticky;
        top: 20px;
        align-self: start;
        max-height: calc(100vh - 40px);
        overflow-y: auto;
        background: linear-gradient(160deg, #1f2a44 0%, #131a2c 100%);
        color: #e8eaf3;
        border-radius: 12px;
        padding: 1.2em 1em;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
    }
    .toc-sidebar h2 {
        margin: 0.2em 0.5em 0.8em;
        font-size: 0.78em;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #ffd166;
    }
    .toc-sidebar ol { list-style: none; margin: 0; padding: 0; }
    .toc-sidebar li {
        font-size: 0.92em;
        padding: 0.55em 0.8em;
        border-radius: 6px;
        cursor: pointer;
        color: #c8cee0;
        line-height: 1.35em;
        margin: 2px 0;
        border-left: 3px solid transparent;
        transition: background 0.12s, color 0.12s, border-color 0.12s;
    }
    .toc-sidebar li:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
    .toc-sidebar li.active { background: rgba(255, 209, 102, 0.14); color: #fff; border-left-color: #ffd166; }

    .mobile-toc-toggle { display: none; }

    .wrap {
        background: #fff;
        color: #333;
        padding: 2em 2.4em 3em;
        border-radius: 12px;
        min-width: 0;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    }

    .wrap :global(h1) {
        font-size: 2.2em;
        text-align: center;
        margin: 0.4em 0 0.2em;
        background: linear-gradient(90deg, #1976d2 0%, #00316b 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .wrap :global(h2) {
        font-size: 1.5em;
        margin-top: 2.2em;
        color: #00316b;
        padding-bottom: 0.3em;
        border-bottom: 2px solid #e0e7f3;
    }
    .wrap :global(h3) {
        font-size: 1.15em;
        margin: 1.4em 0 0.4em;
        color: #1a1a1a;
    }
    .wrap :global(p), .wrap :global(li) { color: #444; }
    .wrap :global(a) { color: #00316b; }
    .wrap :global(strong) { color: #1a1a1a; }
    .wrap :global(em) { color: #555; }

    .wrap :global(blockquote) {
        background: linear-gradient(135deg, #e3f2fd 0%, #cfe5fb 100%);
        border-left: 5px solid #1976d2;
        border-radius: 10px;
        padding: 0.4em 1.4em;
        margin: 1.2em 0;
        box-shadow: 0 4px 14px rgba(25, 118, 210, 0.10);
        color: #0d2440;
    }
    .wrap :global(blockquote p),
    .wrap :global(blockquote li) { color: #0d2440; }
    .wrap :global(blockquote strong) { color: #0d47a1; }

    .wrap :global(table) {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
    }
    .wrap :global(th), .wrap :global(td) {
        text-align: left;
        padding: 8px 12px;
        border-bottom: 1px solid #e5e5e5;
    }
    .wrap :global(th) {
        background: linear-gradient(180deg, #f5f9ff 0%, #e8f0fb 100%);
        color: #00316b;
        font-weight: 600;
    }
    .wrap :global(tbody tr:hover) { background: #fafbfd; }

    .wrap :global(hr) { border: 0; border-top: 1px solid #e0e7f3; margin: 2em 0; }

    @media (max-width: 900px) {
        .page { grid-template-columns: 1fr; gap: 0; }
        .toc-sidebar {
            position: static;
            max-height: none;
            display: none;
            margin-bottom: 16px;
        }
        .toc-sidebar.open { display: block; }
        .mobile-toc-toggle {
            display: inline-block;
            padding: 8px 14px;
            margin-bottom: 12px;
            border: 0;
            background: linear-gradient(160deg, #1f2a44 0%, #131a2c 100%);
            color: #ffd166;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9em;
            font-weight: 600;
        }
        .wrap { padding: 1.6em 1.4em 2.4em; }
    }
</style>

<EditButton
    storageKey="constitution"
    initialValue={current}
    label="Edit constitution"
    helpText="The textarea below is pre-filled with the live page as markdown. Edit only the parts you want; everything else stays. Save to publish, Reset to roll back to the built-in default."
    onSaved={(v) => (override = v)}
/>

<div class="page">
    <button class="mobile-toc-toggle" onclick={() => (mobileTocOpen = !mobileTocOpen)}>
        {mobileTocOpen ? '📕 Hide' : '📖 Contents'}
    </button>

    <aside class="toc-sidebar" class:open={mobileTocOpen} aria-label="Constitution contents">
        <h2>Sections</h2>
        <ol>
            {#each tocItems as item, idx (item.id)}
                <li class:active={activeId === item.id} onclick={() => goTo(item.id)}>
                    {item.title}
                </li>
            {/each}
        </ol>
    </aside>

    <article class="wrap" bind:this={containerEl}>
        {@html renderedHtml}
    </article>
</div>

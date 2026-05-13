<script>
	import { tabs } from '$lib/utils/tabs';
	import Tab, { Icon, Label } from '@smui/tab';
	import List, { Item, Graphic, Text, Separator } from '@smui/list';
	import TabBar from '@smui/tab-bar';
    import { page } from '$app/state';
	import { goto, preloadData } from '$app/navigation';
	import { enableBlog, managers } from '$lib/utils/leagueInfo';

	let active = $state(tabs.find(tab => tab.dest == page.url.pathname || (tab.nest && tab.children.find(subTab => subTab.dest == page.url.pathname))));

	// Which nested tab's submenu is open (null = none)
	let openKey = $state(null);
	let anchors = $state({});      // key -> element ref for each nested tab tile
	let innerWidth = $state();

	const subGoto = (dest) => {
		openKey = null;
		if (typeof dest === 'string' && /^https?:\/\//.test(dest)) {
			window.open(dest, '_blank', 'noopener,noreferrer');
			return;
		}
		goto(dest);
	}

	const toggle = (key) => {
		openKey = openKey === key ? null : key;
	}

	const openTab = $derived(tabs.find(t => t.nest && t.key === openKey));

	const submenuStyle = $derived.by(() => {
		if (!openKey) return 'max-height: 0px; box-shadow: none; border: 0; border-top: none;';
		const el = anchors[openKey];
		if (!el || typeof el.getBoundingClientRect !== 'function') return 'max-height: 0px;';
		const rect = el.getBoundingClientRect();
		const height = rect.bottom - rect.top + 1;
		const width = rect.right - rect.left;
		const children = openTab?.children ?? [];
		// Hide the Managers item when there are no managers, like the original logic.
		const visibleCount = children.filter(c => c.label !== 'Managers' || managers.length).length;
		const maxH = 49 * visibleCount - 1;
		return `max-height: ${maxH}px; width: ${width}px; top: ${height}px; left: ${rect.left}px; box-shadow: 0 0 3px 0 #1de9d7; border: 1px solid #1de9d7; border-top: none;`;
	});
</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    :global(.navBar) {
		display: inline-flex;
		position: relative;
    	justify-content: center;
    }

	:global(.navBar .material-icons) {
		font-size: 1.8em;
		height: 25px;
		width: 22px;
	}

	.parent {
		position: relative;
	}

	.subMenu {
		overflow-y: hidden;
		display: block;
		position: absolute;
		z-index: 5;
		background-color: var(--fff);
		transition: max-height 0.4s;
	}

	.overlay {
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		height: 100vh;
		z-index: 4;
	}

	:global(.mdc-deprecated-list) {
		padding: 0;
	}

	:global(.subText) {
		font-size: 0.8em;
	}

	:global(.dontDisplay) {
		display: none;
	}
</style>

<div tabindex="0" role="button" class="overlay" style="display: {openKey ? 'block' : 'none'};" onclick={() => openKey = null}></div>

<div class="parent">
	<TabBar class="navBar" {tabs} key={(tab) => tab.key} bind:active>
		{#snippet tab(tab)}
			{#if tab.nest}
				<div bind:this={anchors[tab.key]}>
					<Tab
						{tab}
						minWidth
						onclick={() => toggle(tab.key)}
					>
						<Icon class="material-icons">{tab.icon}</Icon>
						<Label>{tab.label}</Label>
					</Tab>
				</div>
			{:else}
				<Tab
					class="{tab.label == 'Blog' && !enableBlog ? 'dontDisplay' : ''}"
					{tab}
					onTouchstart={() => preloadData(tab.dest)}
					onMouseover={() => preloadData(tab.dest)}
					href={tab.dest}
					minWidth
				>
					<Icon class="material-icons">{tab.icon}</Icon>
					<Label>{tab.label}</Label>
				</Tab>
			{/if}
		{/snippet}
	</TabBar>
	<div class="subMenu" style={submenuStyle}>
		{#if openTab}
			<List>
				{#each openTab.children as subTab, ix}
					{#if subTab.label == 'Managers'}
						<Item class="{managers.length ? '' : 'dontDisplay'}" onSMUIAction={() => subGoto(subTab.dest)} ontouchstart={() => preloadData(subTab.dest)} onmouseover={() => preloadData(subTab.dest)}>
							<Graphic class="material-icons">{subTab.icon}</Graphic>
							<Text class="subText">{subTab.label}</Text>
						</Item>
						{#if ix != openTab.children.length - 1}
							<Separator />
						{/if}
					{:else}
						<Item onSMUIAction={() => subGoto(subTab.dest)} ontouchstart={() => {if(subTab.label != 'Go to Sleeper') preloadData(subTab.dest)}} onmouseover={() => {if(subTab.label != 'Go to Sleeper') preloadData(subTab.dest)}}>
							<Graphic class="material-icons">{subTab.icon}</Graphic>
							<Text class="subText">{subTab.label}</Text>
						</Item>
						{#if ix != openTab.children.length - 1}
							<Separator />
						{/if}
					{/if}
				{/each}
			</List>
		{/if}
	</div>
</div>

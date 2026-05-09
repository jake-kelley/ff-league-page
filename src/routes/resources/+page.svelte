<script>
	import LinearProgress from '@smui/linear-progress';
	import { News } from '$lib/components';
	import HelpfulResources from '$lib/HelpfulResources/HelpfulResources.svelte';

	export let data;
	const articlesData = data.articlesData;
	const resourcesOverride = data.resourcesOverride;
</script>

<style>
	.loading {
		position: relative;
		z-index: 1;
        width: 85%;
        margin: 0 auto 60px;
        max-width: 800px;
    }
</style>

<HelpfulResources override={resourcesOverride} />

<hr />

{#await articlesData}
	<div class="loading">
		<p>Retrieving fantasy news...</p>
		<br />
		<LinearProgress indeterminate />
	</div>
{:then news}
	<News {news}/>
{:catch error}
	<p>Something went wrong: {error.message}</p>
{/await}
